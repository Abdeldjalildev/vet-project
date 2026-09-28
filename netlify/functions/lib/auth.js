// Shared Authentication and Authorization Middleware for Netlify Functions

const { getAuthAdmin, getFirestoreAdmin } = require('./firebaseAdmin')
const { fail } = require('./http')

/**
 * Extracts and verifies the Firebase ID token from the Authorization header.
 * Canonical input: `Authorization: Bearer <token>`
 * Returns the decoded token.
 * Rejects missing, malformed, or invalid tokens with `unauthenticated` (HTTP 401).
 */
async function requireAuth(event) {
  const headers = event.headers || {}
  const authHeader = headers.authorization || headers.Authorization || ''

  if (!authHeader.startsWith('Bearer ')) {
    fail('unauthenticated', 'Authentication is required.')
  }

  const token = authHeader.slice('Bearer '.length).trim()
  if (!token) {
    fail('unauthenticated', 'Authentication is required.')
  }

  try {
    const authAdmin = getAuthAdmin()
    const decodedToken = await authAdmin.verifyIdToken(token)
    return decodedToken
  } catch (err) {
    fail('unauthenticated', 'Invalid or expired authentication token.')
  }
}

/**
 * Ensures caller has the verified platformOwner claim.
 * MUST be derived strictly from the verified Firebase ID token claims.
 * Client body parameters are never trusted.
 * Rejects with `permission-denied` (HTTP 403).
 */
function requirePlatformOwner(decodedToken) {
  if (!decodedToken || decodedToken.platformOwner !== true) {
    fail('permission-denied', 'Platform Owner authorization is required.')
  }
}

/**
 * Ensures caller has an active owner or admin membership in the requested clinic.
 * Steps:
 * 1. Read /users/{uid} from Firestore.
 * 2. Verify membership exists.
 * 3. Verify status === 'active'.
 * 4. Verify role === 'owner' || role === 'admin'.
 * 5. Verify membership.clinicId matches the requested clinicId.
 * Rejects with `permission-denied` (HTTP 403) if any check fails.
 */
async function requireClinicMembership(decodedToken, clinicId) {
  if (!decodedToken || !decodedToken.uid) {
    fail('unauthenticated', 'Authentication is required.')
  }

  const db = getFirestoreAdmin()
  const snapshot = await db.collection('users').doc(decodedToken.uid).get()

  if (!snapshot.exists) {
    fail('permission-denied', 'Clinic membership was not found.')
  }

  const membership = snapshot.data()
  if (membership.status !== 'active' || !['owner', 'admin'].includes(membership.role)) {
    fail('permission-denied', 'Active clinic membership is required.')
  }

  if (clinicId && membership.clinicId !== clinicId) {
    fail('permission-denied', 'The requested resource does not belong to your clinic.')
  }

  return membership
}

module.exports = {
  requireAuth,
  requirePlatformOwner,
  requireClinicMembership,
}
