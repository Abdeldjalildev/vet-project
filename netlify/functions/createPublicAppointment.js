// Netlify Function: createPublicAppointment
// Target: /.netlify/functions/createPublicAppointment
// Migrated from Firebase Callable: functions/index.js exports.createPublicAppointment (lines 151-219)
//
// PUBLIC OPERATION: intentionally unauthenticated, matching the original callable.
// No Authorization header is required. No body-supplied value is trusted as authorization.

const { getFirestoreAdmin } = require('./lib/firebaseAdmin')
const { FieldValue } = require('firebase-admin/firestore')
const {
  handleCorsPreflight,
  requirePostMethod,
  parseJsonBody,
  successResponse,
  errorResponse,
  fail,
} = require('./lib/http')
const { requireString, requireDocumentId } = require('./lib/validation')

// --- Booking validation helpers (behavior preserved from functions/index.js) ---

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

// --- HTTP handler ---

exports.handler = async (event) => {
  const preflight = handleCorsPreflight(event)
  if (preflight) return preflight

  const methodError = requirePostMethod(event)
  if (methodError) return methodError

  try {
    const data = parseJsonBody(event)
    const booking = normalizeBooking(data)

    const db = getFirestoreAdmin()
    const clinics = db.collection('clinics')
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

    console.log('Public appointment created', {
      clinicId: booking.clinicId,
      appointmentId: result,
    })

    return successResponse({ appointmentId: result, status: 'pending' })
  } catch (err) {
    return errorResponse(err)
  }
}

