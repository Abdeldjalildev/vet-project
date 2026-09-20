const { onCall, HttpsError } = require('firebase-functions/v2/https')
const { logger } = require('firebase-functions')
const { initializeApp } = require('firebase-admin/app')
const { getAuth } = require('firebase-admin/auth')
const { getFirestore, FieldValue } = require('firebase-admin/firestore')

initializeApp()

const db = getFirestore()
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

  const clinicId = requireString(data.clinicId, 'clinicId', 128)
  const petName = requireString(data.petName, 'petName', 120)
  const ownerName = requireString(data.ownerName, 'ownerName', 160)
  const ownerPhone = requireString(data.ownerPhone, 'ownerPhone', 40)
  const serviceId = requireString(data.serviceId, 'serviceId', 128)
  const petType = requireString(data.petType, 'petType', 20)
  const ownerEmail = typeof data.ownerEmail === 'string' ? data.ownerEmail.trim() : ''
  const notes = typeof data.notes === 'string' ? data.notes.trim() : ''

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

exports.transitionAppointment = onCall({ region: 'us-central1' }, async (request) => {
  if (!request.auth) fail('unauthenticated', 'Authentication is required.')

  const membership = await getActiveMembership(request.auth.uid)
  const clinicId = requireString(request.data?.clinicId, 'clinicId', 128)
  const appointmentId = requireString(request.data?.appointmentId, 'appointmentId', 128)
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
  })

  return { appointmentId, status: nextStatus }
})
