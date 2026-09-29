// Netlify Function: deleteClinicService
// Target: /.netlify/functions/deleteClinicService
// Migrated from Firebase Callable: functions/index.js exports.deleteClinicService (lines 511-544)
//
// AUTHENTICATED OPERATION: identity is derived exclusively from the verified Firebase ID token.
// Body-supplied clinicId / serviceId / role / platformOwner / uid values are input only and are
// never treated as proof of authorization. The owning clinic is always taken from the verified
// membership document, exactly as the original callable did.

const { getFirestoreAdmin } = require('./lib/firebaseAdmin')
const {
  handleCorsPreflight,
  requirePostMethod,
  parseJsonBody,
  successResponse,
  errorResponse,
  fail,
} = require('./lib/http')
const { requireDocumentId, rejectUnknownFields } = require('./lib/validation')
const { requireAuth, requireClinicMembership } = require('./lib/auth')

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
    rejectUnknownFields(data, new Set(['clinicId', 'serviceId']), 'service deletion')
    const clinicId = requireDocumentId(data?.clinicId, 'clinicId')
    const serviceId = requireDocumentId(data?.serviceId, 'serviceId')

    // 3. Clinic scope is derived from the verified membership, never from the body claim.
    if (membership.clinicId !== clinicId) {
      fail('permission-denied', 'The service does not belong to your clinic.')
    }

    const db = getFirestoreAdmin()
    const clinicRef = db.collection('clinics').doc(clinicId)
    const serviceRef = clinicRef.collection('services').doc(serviceId)

    await db.runTransaction(async (transaction) => {
      const serviceSnapshot = await transaction.get(serviceRef)
      if (!serviceSnapshot.exists) fail('not-found', 'Service was not found.')

      // Dependency protection: any appointment in this clinic that references the service
      // blocks the deletion, regardless of the appointment status (preserved exactly).
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

    return successResponse({ serviceId, deleted: true })
  } catch (err) {
    return errorResponse(err)
  }
}
