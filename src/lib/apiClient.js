import { firebaseAuth } from './auth'

/**
 * Shared Client HTTP Adapter for Netlify Functions.
 * Replaces `httpsCallable` with standard HTTPS fetch invocations.
 * Canonical endpoint: `/.netlify/functions/<operation>`
 *
 * Requirements:
 * 1. Sends HTTP POST with Content-Type: application/json.
 * 2. Injects Authorization: Bearer <idToken> when authRequired is true or user is logged in.
 * 3. Converts backend error response ({ error: { code, message } }) into standard JS Error.
 * 4. Exposes canonical bare `err.code` and `err.message`.
 * 5. Does NOT add any 'functions/' prefix.
 */
export async function callNetlifyFunction(operationName, payload = {}, options = {}) {
  const { authRequired = false } = options

  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }

  const currentUser = firebaseAuth.currentUser
  if (currentUser) {
    const idToken = await currentUser.getIdToken()
    headers.Authorization = `Bearer ${idToken}`
  } else if (authRequired) {
    const err = new Error('Authentication is required.')
    err.code = 'unauthenticated'
    throw err
  }

  const response = await fetch(`/.netlify/functions/${operationName}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  })

  let body
  try {
    body = await response.json()
  } catch {
    body = null
  }

  if (!response.ok) {
    const err = new Error(body?.error?.message || 'REQUEST_FAILED')
    err.code = body?.error?.code || 'internal'
    throw err
  }

  return { data: body }
}
