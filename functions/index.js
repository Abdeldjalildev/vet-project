const { onCall, HttpsError } = require('firebase-functions/v2/https')
const { logger } = require('firebase-functions')
const { initializeApp } = require('firebase-admin/app')
const { getAuth } = require('firebase-admin/auth')
const { getFirestore, FieldValue } = require('firebase-admin/firestore')

initializeApp()

const db = getFirestore()
const auth = getAuth()
const clinics = db.collection('clinics')
const users = db.collection('users')

const APPOINTMENT_STATUSES = new Set(['pending', 'confirmed', 'completed', 'cancelled'])
const TRANSITIONS = {
  pending: new Set(['confirmed', 'cancelled']),
  confirmed: new Set(['completed', 'cancelled']),
  completed: new Set(),
  cancelled: new Set(),
}

function fail(code, message) {
  throw new HttpsError(code, message)
}

function requireString(value, field, maxLength) {
  if (typeof value !== 'string') fail('invalid-argument', `${field} must be a string.`)
  const normalized = value.trim()
  if (!normalized || normalized.length > maxLength) {
    fail('invalid-argument', `${field} is invalid.`)
  }
  return normalized
}

function requireDocumentId(value, field) {
  const normalized = requireString(value, field, 128)
  if (normalized.includes('/')) fail('invalid-argument', `${field} is invalid.`)
  return normalized
}

function rejectUnknownFields(data, allowed, operation) {
  for (const key of Object.keys(data || {})) {
    if (!allowed.has(key)) fail('invalid-argument', 'Unsupported ' + operation + ' field: ' + key)
  }
}

function validateOptionalEmail(value) {
  if (!value) return ''
  if (value.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    fail('invalid-argument', 'ownerEmail is invalid.')
  }
  return value
}

function validateDate(date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) fail('invalid-argument', 'date must use YYYY-MM-DD.')
  const parsed = new Date(`${date}T00:00:00Z`)
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) {
    fail('invalid-argument', 'date is invalid.')
  }

  const today = new Date()
  const todayKey = today.toISOString().slice(0, 10)
  if (date < todayKey) fail('invalid-argument', 'Appointments cannot be booked in the past.')
}

function validateTime(time) {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
    fail('invalid-argument', 'time must use HH:MM.')
  }
}

function normalizeBooking(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    fail('invalid-argument', 'Booking payload is invalid.')
  }

  const allowed = new Set([
    'clinicId',
    'petName',
    'petType',
    'ownerName',
    'ownerPhone',
    'ownerEmail',
    'serviceId',
    'date',
    'time',
    'notes',
  ])

  for (const key of Object.keys(data)) {
    if (!allowed.has(key)) fail('invalid-argument', `Unsupported booking field: ${key}`)
  }

  const clinicId = requireDocumentId(data.clinicId, 'clinicId')
  const petName = requireString(data.petName, 'petName', 120)
  const ownerName = requireString(data.ownerName, 'ownerName', 160)
  const ownerPhone = requireString(data.ownerPhone, 'ownerPhone', 40)
  const serviceId = requireDocumentId(data.serviceId, 'serviceId')
  const petType = requireString(data.petType, 'petType', 20)
  if ('ownerEmail' in data && typeof data.ownerEmail !== 'string') {
    fail('invalid-argument', 'ownerEmail must be a string when provided.')
  }
  if ('notes' in data && typeof data.notes !== 'string') {
    fail('invalid-argument', 'notes must be a string when provided.')
  }

  const ownerEmail = typeof data.ownerEmail === 'string' ? data.ownerEmail.trim() : ''
  const notes = typeof data.notes === 'string' ? data.notes.trim() : ''

  validateOptionalEmail(ownerEmail)

  if (!['cat', 'dog', 'bird', 'other'].includes(petType)) {
    fail('invalid-argument', 'petType is invalid.')
  }
  if (ownerEmail.length > 254 || notes.length > 2000) {
    fail('invalid-argument', 'Booking contact data is invalid.')
  }

  const date = requireString(data.date, 'date', 10)
  const time = requireString(data.time, 'time', 5)
  validateDate(date)
  validateTime(time)

  return {
    clinicId,
    petName,
    petType,
    ownerName,
    ownerPhone,
    ownerEmail,
    serviceId,
    date,
    time,
    notes,
  }
}

async function getActiveMembership(uid) {
  const snapshot = await users.doc(uid).get()
  if (!snapshot.exists) fail('permission-denied', 'Clinic membership was not found.')

  const membership = snapshot.data()
  if (membership.status !== 'active' || !['owner', 'admin'].includes(membership.role)) {
    fail('permission-denied', 'Active clinic membership is required.')
  }

  return membership
}

exports.createPublicAppointment = onCall({ region: 'us-central1' }, async (request) => {
  const booking = normalizeBooking(request.data)

  const clinicRef = clinics.doc(booking.clinicId)
  const serviceRef = clinicRef.collection('services').doc(booking.serviceId)
  const appointmentRef = clinicRef.collection('appointments').doc()

  const result = await db.runTransaction(async (transaction) => {
    const [clinicSnapshot, serviceSnapshot] = await Promise.all([
      transaction.get(clinicRef),
      transaction.get(serviceRef),
    ])

    if (!clinicSnapshot.exists) fail('not-found', 'Clinic was not found.')
    const clinic = clinicSnapshot.data()
    if (clinic.public !== true || clinic.active !== true) {
      fail('failed-precondition', 'Clinic is not accepting public bookings.')
    }

    if (!serviceSnapshot.exists || serviceSnapshot.data().active !== true) {
      fail('failed-precondition', 'Selected service is not available.')
    }

    const service = serviceSnapshot.data()
    const servicePrice = typeof service.price === 'number' && Number.isFinite(service.price) && service.price >= 0 ? service.price : 0
    const serviceCurrency = typeof service.currency === 'string' && /^[A-Z]{3}$/.test(service.currency) ? service.currency : 'DZD'

    const existing = await transaction.get(
      clinicRef
        .collection('appointments')
        .where('date', '==', booking.date)
        .where('time', '==', booking.time)
        .where('status', 'in', ['pending', 'confirmed'])
        .limit(1),
    )

    if (!existing.empty) {
      fail('already-exists', 'The selected appointment time is no longer available.')
    }

    const now = FieldValue.serverTimestamp()
    transaction.create(appointmentRef, {
      clinicId: booking.clinicId,
      petName: booking.petName,
      petType: booking.petType,
      ownerName: booking.ownerName,
      ownerPhone: booking.ownerPhone,
      ownerEmail: booking.ownerEmail,
      serviceId: booking.serviceId,
      date: booking.date,
      time: booking.time,
      notes: booking.notes,
      estimatedServiceValue: servicePrice,
      serviceCurrency,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    })

    return appointmentRef.id
  })

  logger.info('Public appointment created', {
    clinicId: booking.clinicId,
    appointmentId: result,
  })

  return { appointmentId: result, status: 'pending' }
})



function requirePlatformOwner(request) {
  if (!request.auth) fail('unauthenticated', 'Authentication is required.')
  if (request.auth.token?.platformOwner !== true) {
    fail('permission-denied', 'Platform Owner authorization is required.')
  }
}

function normalizeSlug(value) {
  const slug = requireString(value, 'slug', 63).toLowerCase()
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length < 3) {
    fail('invalid-argument', 'slug must contain only lowercase letters, numbers, and single hyphens.')
  }
  return slug
}

function normalizeLocalizedMap(value, field) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    fail('invalid-argument', field + ' must contain ar, en, and fr strings.')
  }
  for (const language of ['ar', 'en', 'fr']) {
    if (typeof value[language] !== 'string' || value[language].trim().length > 160) {
      fail('invalid-argument', field + ' is invalid.')
    }
  }
  return { ar: value.ar.trim(), en: value.en.trim(), fr: value.fr.trim() }
}

function validateOwnerEmail(value) {
  const email = requireString(value, 'ownerEmail', 254).toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail('invalid-argument', 'ownerEmail is invalid.')
  return email
}

function validateTemporaryPassword(value) {
  if (typeof value !== 'string' || value.length < 12 || value.length > 128) {
    fail('invalid-argument', 'temporaryPassword must be between 12 and 128 characters.')
  }
  return value
}

async function createOwnerUser(email, temporaryPassword) {
  try {
    await auth.getUserByEmail(email)
    fail('already-exists', 'The selected owner email is already registered.')
  } catch (error) {
    if (error?.code !== 'auth/user-not-found') throw error
  }

  const user = await auth.createUser({
    email,
    emailVerified: false,
    disabled: false,
    password: temporaryPassword,
  })
  return user
}

exports.provisionClinic = onCall({ region: 'us-central1' }, async (request) => {
  requirePlatformOwner(request)
  rejectUnknownFields(request.data, new Set(['name', 'slug', 'ownerEmail', 'temporaryPassword', 'public']), 'clinic provisioning')

  const name = normalizeLocalizedMap(request.data?.name, 'name')
  const slug = normalizeSlug(request.data?.slug)
  const ownerEmail = validateOwnerEmail(request.data?.ownerEmail)
  const temporaryPassword = validateTemporaryPassword(request.data?.temporaryPassword)
  const publish = request.data?.public === true

  const existingSlug = await clinics.where('slug', '==', slug).limit(1).get()
  if (!existingSlug.empty) fail('already-exists', 'That clinic slug is already in use.')

  const ownerUser = await createOwnerUser(ownerEmail, temporaryPassword)
  const clinicRef = clinics.doc()
  const now = FieldValue.serverTimestamp()

  try {
    await db.runTransaction(async (transaction) => {
      const slugCheck = await transaction.get(clinics.where('slug', '==', slug).limit(1))
      if (!slugCheck.empty) fail('already-exists', 'That clinic slug is already in use.')

      transaction.create(clinicRef, {
        slug,
        public: publish,
        active: true,
        lifecycle: 'provisioned',
        name,
        createdAt: now,
        updatedAt: now,
      })

      transaction.create(users.doc(ownerUser.uid), {
        uid: ownerUser.uid,
        clinicId: clinicRef.id,
        role: 'owner',
        status: 'active',
        mustChangePassword: true,
        createdAt: now,
        updatedAt: now,
      })
    })
  } catch (error) {
    if (ownerCreated) {
      try { await auth.deleteUser(ownerUser.uid) } catch (cleanupError) {
        logger.error('Provisioning cleanup failed', { uid: ownerUser.uid, error: cleanupError })
      }
    }
    throw error
  }

  logger.info('Clinic provisioned', { clinicId: clinicRef.id, slug, ownerUid: ownerUser.uid })
  return { clinicId: clinicRef.id, slug, ownerUid: ownerUser.uid, ownerEmail }
})

exports.completeClinicPasswordSetup = onCall({ region: 'us-central1' }, async (request) => {
  if (!request.auth) fail('unauthenticated', 'Authentication is required.')

  const uid = request.auth.uid
  const membershipRef = users.doc(uid)
  const membershipSnapshot = await membershipRef.get()
  if (!membershipSnapshot.exists) fail('permission-denied', 'Clinic membership was not found.')

  const membership = membershipSnapshot.data()
  if (membership.status !== 'active' || !['owner', 'admin'].includes(membership.role)) {
    fail('permission-denied', 'Active clinic membership is required.')
  }
  if (membership.mustChangePassword !== true) {
    return { completed: true }
  }

  await membershipRef.update({
    mustChangePassword: false,
    updatedAt: FieldValue.serverTimestamp(),
  })

  return { completed: true }
})

exports.listProvisionedClinics = onCall({ region: 'us-central1' }, async (request) => {
  requirePlatformOwner(request)
  const snapshot = await clinics.orderBy('createdAt', 'desc').limit(100).get()
  return {
    clinics: snapshot.docs.map((document) => {
      const data = document.data()
      return {
        clinicId: document.id,
        slug: data.slug || '',
        name: data.name || { ar: '', en: '', fr: '' },
        public: data.public === true,
        active: data.active === true,
        lifecycle: data.lifecycle || 'unknown',
      }
    }),
  }
})


const ANALYTICS_EVENT_TYPES = new Set([
  'page_view',
  'session_start',
  'booking_started',
  'booking_completed',
  'service_view',
])

const ANALYTICS_ALLOWED_PAGES = new Set([
  'home',
  'services',
  'faq',
  'booking',
])

const safeDimensionKey = (value) =>
  Buffer.from(String(value || ''), 'utf8').toString('base64url').slice(0, 120)

function validateAnalyticsPayload(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    fail('invalid-argument', 'Analytics payload is invalid.')
  }

  const clinicId = requireString(data.clinicId, 'clinicId', 128)
  const eventType = requireString(data.eventType, 'eventType', 40)
  const page = requireString(data.page, 'page', 80)
  const sessionId = requireString(data.sessionId, 'sessionId', 128)
  const visitorId = requireString(data.visitorId, 'visitorId', 128)
  if (visitorId.includes('/')) fail('invalid-argument', 'visitorId is invalid.')
  const language = requireString(data.language, 'language', 10)
  const deviceType = requireString(data.deviceType || 'unknown', 'deviceType', 20)
  const eventId = requireDocumentId(data.eventId, 'eventId')
  const serviceId = typeof data.serviceId === 'string' ? data.serviceId.trim() : ''
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

  if (!ANALYTICS_EVENT_TYPES.has(eventType)) fail('invalid-argument', 'Analytics event type is invalid.')
  if (!ANALYTICS_ALLOWED_PAGES.has(page)) fail('invalid-argument', 'Analytics page is invalid.')
  if (!/^[a-z]{2}$/.test(language)) fail('invalid-argument', 'Analytics language is invalid.')
  if (!uuidPattern.test(sessionId)) fail('invalid-argument', 'sessionId is invalid.')
  if (!uuidPattern.test(visitorId)) fail('invalid-argument', 'visitorId is invalid.')
  if (!uuidPattern.test(eventId)) fail('invalid-argument', 'eventId is invalid.')
  if (serviceId.length > 128 || serviceId.includes('/')) fail('invalid-argument', 'Analytics service identifier is invalid.')

  return { clinicId, eventType, page, sessionId, visitorId, language, deviceType, serviceId, eventId }
}

exports.recordAnalyticsEvent = onCall({ region: 'us-central1' }, async (request) => {
  rejectUnknownFields(request.data, new Set(['clinicId', 'eventType', 'page', 'sessionId', 'visitorId', 'language', 'deviceType', 'eventId', 'serviceId']), 'analytics')
  const event = validateAnalyticsPayload(request.data)
  const clinicRef = clinics.doc(event.clinicId)
  const date = new Date().toISOString().slice(0, 10)
  const eventRef = clinicRef.collection('analyticsEvents').doc(event.eventId)
  const aggregateRef = clinicRef.collection('analyticsAggregates').doc(date)
  const visitorRef = clinicRef.collection('analyticsVisitors').doc(
    `${date}_${safeDimensionKey(event.visitorId)}`,
  )

  await db.runTransaction(async (transaction) => {
    const [clinicSnapshot, visitorSnapshot, eventSnapshot] = await Promise.all([
      transaction.get(clinicRef),
      transaction.get(visitorRef),
      transaction.get(eventRef),
    ])

    if (eventSnapshot.exists) return

    if (!clinicSnapshot.exists || clinicSnapshot.data().public !== true || clinicSnapshot.data().active !== true) {
      fail('failed-precondition', 'Clinic is not available for analytics.')
    }

    transaction.create(eventRef, {
      clinicId: event.clinicId,
      eventType: event.eventType,
      page: event.page,
      serviceId: event.serviceId,
      timestamp: FieldValue.serverTimestamp(),
      sessionId: event.sessionId,
      language: event.language,
      deviceType: event.deviceType,
    })

    const aggregateUpdate = {
      clinicId: event.clinicId,
      date,
      updatedAt: FieldValue.serverTimestamp(),
    }

    if (event.eventType === 'page_view') {
      aggregateUpdate.pageViews = FieldValue.increment(1)
      aggregateUpdate[`pages.${safeDimensionKey(event.page)}`] = FieldValue.increment(1)
    }

    if (event.eventType === 'session_start') {
      aggregateUpdate.sessions = FieldValue.increment(1)
    }

    if (event.eventType === 'booking_started') {
      aggregateUpdate.bookingsStarted = FieldValue.increment(1)
    }

    if (event.eventType === 'service_view' && event.serviceId) {
      aggregateUpdate[`services.${safeDimensionKey(event.serviceId)}`] = FieldValue.increment(1)
    }

    if (event.eventType === 'booking_completed') {
      aggregateUpdate.bookingsCompleted = FieldValue.increment(1)
    }

    if (!visitorSnapshot.exists) {
      transaction.create(visitorRef, {
        visitorId: event.visitorId,
        date,
        createdAt: FieldValue.serverTimestamp(),
      })
      aggregateUpdate.uniqueVisitors = FieldValue.increment(1)
    }

    transaction.set(aggregateRef, aggregateUpdate, { merge: true })
  })

  return { recorded: true }
})

exports.deleteClinicService = onCall({ region: 'us-central1' }, async (request) => {
  if (!request.auth) fail('unauthenticated', 'Authentication is required.')

  const membership = await getActiveMembership(request.auth.uid)
  rejectUnknownFields(request.data, new Set(['clinicId', 'serviceId']), 'service deletion')
  const clinicId = requireDocumentId(request.data?.clinicId, 'clinicId')
  const serviceId = requireDocumentId(request.data?.serviceId, 'serviceId')

  if (membership.clinicId !== clinicId) {
    fail('permission-denied', 'The service does not belong to your clinic.')
  }

  const clinicRef = clinics.doc(clinicId)
  const serviceRef = clinicRef.collection('services').doc(serviceId)

  await db.runTransaction(async (transaction) => {
    const serviceSnapshot = await transaction.get(serviceRef)
    if (!serviceSnapshot.exists) fail('not-found', 'Service was not found.')

    const appointments = await transaction.get(
      clinicRef.collection('appointments')
        .where('serviceId', '==', serviceId)
        .limit(1),
    )

    if (!appointments.empty) {
      fail('failed-precondition', 'The service is referenced by a saved appointment and cannot be deleted.')
    }

    transaction.delete(serviceRef)
  })

  return { serviceId, deleted: true }
})

exports.transitionAppointment = onCall({ region: 'us-central1' }, async (request) => {
  if (!request.auth) fail('unauthenticated', 'Authentication is required.')

  const membership = await getActiveMembership(request.auth.uid)
  rejectUnknownFields(request.data, new Set(['clinicId', 'appointmentId', 'status']), 'appointment transition')
  const clinicId = requireDocumentId(request.data?.clinicId, 'clinicId')
  const appointmentId = requireDocumentId(request.data?.appointmentId, 'appointmentId')
  const nextStatus = requireString(request.data?.status, 'status', 20)

  if (membership.clinicId !== clinicId) {
    fail('permission-denied', 'The appointment does not belong to your clinic.')
  }
  if (!APPOINTMENT_STATUSES.has(nextStatus)) {
    fail('invalid-argument', 'Appointment status is invalid.')
  }

  const appointmentRef = clinics.doc(clinicId).collection('appointments').doc(appointmentId)

  await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(appointmentRef)
    if (!snapshot.exists) fail('not-found', 'Appointment was not found.')

    const appointment = snapshot.data()
    const allowedNextStatuses = TRANSITIONS[appointment.status] || new Set()

    if (!allowedNextStatuses.has(nextStatus)) {
      fail('failed-precondition', 'This appointment status transition is not allowed.')
    }

    transaction.update(appointmentRef, {
      status: nextStatus,
      updatedAt: FieldValue.serverTimestamp(),
    })

    if (nextStatus === 'completed') {
      const revenueAggregateRef = clinics
        .doc(clinicId)
        .collection('analyticsAggregates')
        .doc(new Date().toISOString().slice(0, 10))
      const value = typeof appointment.estimatedServiceValue === 'number'
        && Number.isFinite(appointment.estimatedServiceValue)
        && appointment.estimatedServiceValue >= 0
        ? appointment.estimatedServiceValue
        : 0
      const currency = typeof appointment.serviceCurrency === 'string'
        && /^[A-Z]{3}$/.test(appointment.serviceCurrency)
        ? appointment.serviceCurrency
        : 'DZD'

      transaction.set(revenueAggregateRef, {
        clinicId,
        date: new Date().toISOString().slice(0, 10),
        completedServices: FieldValue.increment(1),
        estimatedCompletedServiceValueByCurrency: {
          [currency]: FieldValue.increment(value),
        },
        revenueUpdatedAt: FieldValue.serverTimestamp(),
      }, { merge: true })
    }
  })

  return { appointmentId, status: nextStatus }
})
