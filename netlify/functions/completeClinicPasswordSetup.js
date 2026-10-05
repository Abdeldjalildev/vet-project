// Netlify Function: completeClinicPasswordSetup
// Target: /.netlify/functions/completeClinicPasswordSetup
// Migrated from Firebase Callable: functions/index.js exports.completeClinicPasswordSetup (lines 338-367)
//
// AUTHENTICATED OPERATION: the target user is ALWAYS the verified Firebase ID token's uid.
// The request body is parsed for transport sanity only and is never used to select the user,
// the membership, or the password state. This is not a generic administrative password API.

const { getAuthAdmin, getFirestoreAdmin } = require('./lib/firebaseAdmin')
const { FieldValue } = require('firebase-admin/firestore')
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

    // P08: credential-change proof.
    //
    // The previous implementation compared SHA-256(passwordHash) against a digest stamped at
    // provisioning. That signal does not exist in production: firebase-admin returns
    // `passwordHash: undefined`, and the raw Identity Toolkit `accounts:lookup` returns the
    // literal redaction sentinel (base64 of "REDACTED", 12 chars), which the SDK maps back to
    // `undefined`. The guard could therefore never observe a change and answered 412 forever.
    //
    // The production-available signal is `tokensValidAfterTime` (Auth `validSince`), which
    // advances when the credential is rotated and is compared against the provisioning
    // baseline `passwordSetupIssuedAt` that this same flow already stores.
    //
    // Fail closed whenever either side is missing or unusable. No client-supplied value
    // participates in the decision: the request body is still parsed for transport sanity only.
    const baseline = membership.passwordSetupIssuedAt
    if (typeof baseline !== 'number' || !Number.isFinite(baseline) || baseline <= 0) {
      fail('failed-precondition', 'The permanent password has not been changed yet.')
    }

    const userRecord = await getAuthAdmin().getUser(uid)
    const marker = userRecord.tokensValidAfterTime
    const markerMs = marker instanceof Date
      ? marker.getTime()
      : (typeof marker === 'number' ? marker : Date.parse(marker))
    if (!Number.isFinite(markerMs)) {
      fail('failed-precondition', 'The permanent password has not been changed yet.')
    }

    if (markerMs <= baseline) {
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
