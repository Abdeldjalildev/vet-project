// Netlify Function: completeClinicPasswordSetup
// Target: /.netlify/functions/completeClinicPasswordSetup
// Migrated from Firebase Callable: functions/index.js exports.completeClinicPasswordSetup (lines 338-367)
//
// AUTHENTICATED OPERATION: the target user is ALWAYS the verified Firebase ID token's uid.
// The request body is parsed for transport sanity only and is never used to select the user,
// the membership, or the password state. This is not a generic administrative password API.

const { getAuthAdmin, getFirestoreAdmin } = require('./lib/firebaseAdmin')
const { FieldValue } = require('firebase-admin/firestore')
const crypto = require('node:crypto')
const {
  handleCorsPreflight,
  requirePostMethod,
  parseJsonBody,
  successResponse,
  errorResponse,
  fail,
} = require('./lib/http')
const { requireAuth, requireClinicMembership } = require('./lib/auth')

// --- HTTP handler ---

exports.handler = async (event) => {
  const preflight = handleCorsPreflight(event)
  if (preflight) return preflight

  const methodError = requirePostMethod(event)
  if (methodError) return methodError

  try {
    // Transport-level parse only. The callable accepted an empty-object payload and had no
    // allowlist, so no field of the body influences behavior below.
    parseJsonBody(event)

    // 1. Authentication + active clinic membership.
    //    requireClinicMembership(token) with no clinicId performs exactly the original
    //    checks (existence, active status, owner/admin role) in the original order.
    const decodedToken = await requireAuth(event)
    const membership = await requireClinicMembership(decodedToken)
    const uid = decodedToken.uid
    const membershipRef = getFirestoreAdmin().collection('users').doc(uid)

    // 2. Already completed: no Auth lookup and no write, exactly as the callable.
    if (membership.mustChangePassword !== true) {
      return successResponse({ completed: true })
    }

    // P08: credential-inequality proof. firebase-admin@13.10.0 does not expose
    // passwordUpdatedAt on UserRecord (proven absent), so the guard compares the
    // SHA-256 digest of the live Auth passwordHash against the digest stamped at
    // provisioning. All proof inputs are server-side; the request body is ignored.
    // Fail closed whenever either side is unavailable.
    const storedDigest = membership.passwordSetupHashDigest
    if (typeof storedDigest !== 'string' || storedDigest.length === 0) {
      fail('failed-precondition', 'The permanent password has not been changed yet.')
    }
    const userRecord = await getAuthAdmin().getUser(uid)
    const livePasswordHash = userRecord.passwordHash
    if (typeof livePasswordHash !== 'string' || livePasswordHash.length === 0) {
      fail('failed-precondition', 'The permanent password has not been changed yet.')
    }
    const liveDigest = crypto.createHash('sha256').update(livePasswordHash, 'utf8').digest('hex')
    if (liveDigest === storedDigest) {
      fail('failed-precondition', 'The permanent password has not been changed yet.')
    }

    await membershipRef.update({
      mustChangePassword: false,
      passwordSetupCompletedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    })

    return successResponse({ completed: true })
  } catch (err) {
    return errorResponse(err)
  }
}
