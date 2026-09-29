// Netlify Function: transitionAppointment
// Target: /.netlify/functions/transitionAppointment
// Migrated from Firebase Callable: functions/index.js exports.transitionAppointment (lines 546-608)
//
// AUTHENTICATED OPERATION: identity is derived exclusively from the verified Firebase ID token.
// Body-supplied clinicId / role / platformOwner / uid values are input only and are never
// treated as proof of authorization.

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
const { requireString, requireDocumentId, rejectUnknownFields } = require('./lib/validation')
const { requireAuth, requireClinicMembership } = require('./lib/auth')

// --- Appointment lifecycle state machine (preserved verbatim from functions/index.js) ---

const APPOINTMENT_STATUSES = new Set(['pending', 'confirmed', 'completed', 'cancelled'])
const TRANSITIONS = {
  pending: new Set(['confirmed', 'cancelled']),
  confirmed: new Set(['completed', 'cancelled']),
  completed: new Set(),
  cancelled: new Set(),
}

// --- HTTP handler ---

exports.handler = async (event) => {
  const preflight = handleCorsPreflight(event)
  if (preflight) return preflight

  const methodError = requirePostMethod(event)
  if (methodError) return methodError

  try {
    // Transport-level parse: equivalent to the callable framework parsing request.data.
    const data = parseJsonBody(event)

    // 1. Authentication + active clinic membership.
    //    requireClinicMembership(token) with no clinicId performs exactly the original
    //    getActiveMembership(uid) checks (existence, active status, owner/admin role).
    const decodedToken = await requireAuth(event)
    const membership = await requireClinicMembership(decodedToken)

    // 2. Strict allowlist + field validation (original order preserved).
    rejectUnknownFields(data, new Set(['clinicId', 'appointmentId', 'status']), 'appointment transition')
    const clinicId = requireDocumentId(data?.clinicId, 'clinicId')
    const appointmentId = requireDocumentId(data?.appointmentId, 'appointmentId')
    const nextStatus = requireString(data?.status, 'status', 20)

    // 3. Clinic scope is derived from the verified membership, never from the body claim.
    if (membership.clinicId !== clinicId) {
      fail('permission-denied', 'The appointment does not belong to your clinic.')
    }
    if (!APPOINTMENT_STATUSES.has(nextStatus)) {
      fail('invalid-argument', 'Appointment status is invalid.')
    }

    const db = getFirestoreAdmin()
    const appointmentRef = db
      .collection('clinics')
      .doc(clinicId)
      .collection('appointments')
      .doc(appointmentId)

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
        const revenueAggregateRef = db
          .collection('clinics')
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

    return successResponse({ appointmentId, status: nextStatus })
  } catch (err) {
    return errorResponse(err)
  }
}
