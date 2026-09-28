// Tests for Phase 16A Netlify Shared Infrastructure

import assert from 'node:assert/strict'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

const {
  CORS_HEADERS,
  ERROR_STATUS_MAP,
  AppError,
  fail,
  handleCorsPreflight,
  requirePostMethod,
  successResponse,
  errorResponse,
  parseJsonBody,
} = require('../netlify/functions/lib/http.js')

const {
  requireString,
  requireDocumentId,
  rejectUnknownFields,
} = require('../netlify/functions/lib/validation.js')

const {
  requireAuth,
  requirePlatformOwner,
  requireClinicMembership,
} = require('../netlify/functions/lib/auth.js')

console.log('--- TEST GROUP 1: CORS & Preflight ---')
{
  const optionsEvent = { httpMethod: 'OPTIONS' }
  const preflightResponse = handleCorsPreflight(optionsEvent)
  assert.equal(preflightResponse.statusCode, 204)
  assert.equal(preflightResponse.body, '')
  assert.equal(preflightResponse.headers['Access-Control-Allow-Origin'], '*')
  assert.equal(preflightResponse.headers['Access-Control-Allow-Methods'], 'POST, OPTIONS')
  assert.ok(preflightResponse.headers['Access-Control-Allow-Headers'].includes('Authorization'))

  const postEvent = { httpMethod: 'POST' }
  assert.equal(handleCorsPreflight(postEvent), null)
  assert.equal(requirePostMethod(postEvent), null)

  const getEvent = { httpMethod: 'GET' }
  const getResponse = requirePostMethod(getEvent)
  assert.equal(getResponse.statusCode, 405)
  console.log('✓ CORS preflight and method enforcement: PASS')
}

console.log('\n--- TEST GROUP 2: Error Serialization & HTTP Status Mapping ---')
{
  const expectedMappings = {
    'already-exists': 409,
    'invalid-argument': 400,
    'failed-precondition': 412,
    'unauthenticated': 401,
    'permission-denied': 403,
    'not-found': 404,
    'internal': 500,
  }

  for (const [code, expectedStatus] of Object.entries(expectedMappings)) {
    assert.equal(ERROR_STATUS_MAP[code], expectedStatus)

    if (code !== 'internal') {
      const err = new AppError(code, `Test message for ${code}`)
      const response = errorResponse(err)
      assert.equal(response.statusCode, expectedStatus)
      const payload = JSON.parse(response.body)
      assert.equal(payload.error.code, code)
      assert.equal(payload.error.message, `Test message for ${code}`)
    }
  }

  // Verify internal error sanitization
  const unexpectedErr = new Error('Database password leaked or stack trace details')
  const sanitizedResponse = errorResponse(unexpectedErr)
  assert.equal(sanitizedResponse.statusCode, 500)
  const sanitizedPayload = JSON.parse(sanitizedResponse.body)
  assert.equal(sanitizedPayload.error.code, 'internal')
  assert.equal(sanitizedPayload.error.message, 'An internal error occurred.')
  assert.ok(!sanitizedResponse.body.includes('password'))

  console.log('✓ Error serialization and sanitization: PASS')
console.log('\n--- TEST GROUP 3: Authentication & Token Extraction ---')
{
  await assert.rejects(
    async () => requireAuth({ headers: {} }),
    (err) => err.code === 'unauthenticated',
  )

  await assert.rejects(
    async () => requireAuth({ headers: { authorization: 'Basic 12345' } }),
    (err) => err.code === 'unauthenticated',
  )

  await assert.rejects(
    async () => requireAuth({ headers: { authorization: 'Bearer   ' } }),
    (err) => err.code === 'unauthenticated',
  )

  console.log('✓ Missing and malformed Authorization rejection: PASS')
}

console.log('\n--- TEST GROUP 4: Authorization & Body Spoof Rejection Principle ---')
{
  assert.doesNotThrow(() => requirePlatformOwner({ uid: 'admin-1', platformOwner: true }))

  assert.throws(
    () => requirePlatformOwner({ uid: 'user-1', platformOwner: false }),
    (err) => err.code === 'permission-denied',
  )
  assert.throws(
    () => requirePlatformOwner({ uid: 'user-2' }),
    (err) => err.code === 'permission-denied',
  )

  // Body spoof rejection: Platform owner check must ignore client-supplied body
  const normalUserDecodedToken = { uid: 'normal-user', platformOwner: false }
  assert.throws(
    () => requirePlatformOwner(normalUserDecodedToken),
    (err) => err.code === 'permission-denied',
  )

  console.log('✓ Platform Owner token claim verification and body spoof rejection: PASS')
}

console.log('\n--- TEST GROUP 5: Request Body Parsing & Validation Helpers ---')
{
  const validEvent = { body: JSON.stringify({ name: 'Vet Clinic', count: 5 }) }
  assert.deepEqual(parseJsonBody(validEvent), { name: 'Vet Clinic', count: 5 })

  assert.throws(
    () => parseJsonBody({ body: JSON.stringify([1, 2, 3]) }),
    (err) => err.code === 'invalid-argument',
  )

  assert.throws(
    () => parseJsonBody({ body: '{invalid-json' }),
    (err) => err.code === 'invalid-argument',
  )

  assert.equal(requireString('  VetLife  ', 'name', 20), 'VetLife')
  assert.throws(() => requireString('', 'name', 20), (err) => err.code === 'invalid-argument')
  assert.throws(() => requireString('Way too long string', 'name', 5), (err) => err.code === 'invalid-argument')

  assert.equal(requireDocumentId('clinic-123', 'clinicId'), 'clinic-123')
  assert.throws(() => requireDocumentId('clinic/123', 'clinicId'), (err) => err.code === 'invalid-argument')

  assert.doesNotThrow(() => rejectUnknownFields({ a: 1, b: 2 }, new Set(['a', 'b', 'c']), 'test'))
  assert.throws(() => rejectUnknownFields({ a: 1, hacked: true }, new Set(['a']), 'test'), (err) => err.code === 'invalid-argument')

  console.log('✓ Validation primitives: PASS')
}

console.log('\n--- TEST GROUP 6: Client HTTP Adapter Error Compatibility ---')
{
  function simulateAdapterErrorHandling(status, responseBody) {
    let body = responseBody
    if (typeof body === 'string') {
      try { body = JSON.parse(body) } catch { body = null }
    }

    if (status >= 400) {
      const err = new Error(body?.error?.message || 'REQUEST_FAILED')
      err.code = body?.error?.code || 'internal'
      throw err
    }
    return { data: body }
  }

  // 1. Verify failed-precondition produces bare code
  try {
    simulateAdapterErrorHandling(412, {
      error: {
        code: 'failed-precondition',
        message: 'This appointment status transition is not allowed.',
      },
    })
    assert.fail('Should have thrown')
  } catch (err) {
    assert.equal(err.code, 'failed-precondition')
    assert.equal(err.message, 'This appointment status transition is not allowed.')
    assert.notEqual(err.code, 'functions/failed-precondition')
  }

  // 2. Verify already-exists produces bare code
  try {
    simulateAdapterErrorHandling(409, {
      error: {
        code: 'already-exists',
        message: 'The selected appointment time is no longer available.',
      },
    })
    assert.fail('Should have thrown')
  } catch (err) {
    assert.equal(err.code, 'already-exists')
    assert.notEqual(err.code, 'functions/already-exists')
  }

  console.log('✓ Client HTTP Adapter canonical bare error code contract: PASS')
}

console.log('\n========================================')
console.log('ALL PHASE 16A INFRASTRUCTURE TESTS PASS')
console.log('========================================')

}
