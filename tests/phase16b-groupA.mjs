// Tests for Phase 16B Group A: Platform Owner Operations (provisionClinic, listProvisionedClinics)

import assert from 'node:assert/strict'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

const provisionClinicModule = require('../netlify/functions/provisionClinic.js')
const listProvisionedClinicsModule = require('../netlify/functions/listProvisionedClinics.js')

console.log('--- TEST GROUP 1: provisionClinic HTTP & Auth Boundaries ---')
{
  // 1. OPTIONS Preflight returns 204
  const preflightRes = await provisionClinicModule.handler({ httpMethod: 'OPTIONS' })
  assert.equal(preflightRes.statusCode, 204)
  assert.equal(preflightRes.body, '')
  assert.equal(preflightRes.headers['Access-Control-Allow-Origin'], '*')

  // 2. Non-POST method rejected with 405
  const getRes = await provisionClinicModule.handler({ httpMethod: 'GET' })
  assert.equal(getRes.statusCode, 405)
  const getBody = JSON.parse(getRes.body)
  assert.equal(getBody.error.code, 'invalid-argument')

  // 3. Missing Authorization header rejected with 401 unauthenticated
  const unauthRes = await provisionClinicModule.handler({
    httpMethod: 'POST',
    headers: {},
    body: JSON.stringify({ name: { ar: 'عيادة', en: 'Clinic', fr: 'Clinique' } }),
  })
  assert.equal(unauthRes.statusCode, 401)
  const unauthBody = JSON.parse(unauthRes.body)
  assert.equal(unauthBody.error.code, 'unauthenticated')

  // 4. Malformed Authorization header rejected with 401 unauthenticated
  const malformedRes = await provisionClinicModule.handler({
    httpMethod: 'POST',
    headers: { authorization: 'Basic 12345' },
    body: JSON.stringify({}),
  })
  assert.equal(malformedRes.statusCode, 401)
  const malformedBody = JSON.parse(malformedRes.body)
  assert.equal(malformedBody.error.code, 'unauthenticated')

  console.log('✓ provisionClinic HTTP preflight, method, and auth rejection: PASS')
}

console.log('\n--- TEST GROUP 2: listProvisionedClinics HTTP & Auth Boundaries ---')
{
  // 1. OPTIONS Preflight returns 204
  const preflightRes = await listProvisionedClinicsModule.handler({ httpMethod: 'OPTIONS' })
  assert.equal(preflightRes.statusCode, 204)
  assert.equal(preflightRes.body, '')

  // 2. Non-POST method rejected with 405
  const getRes = await listProvisionedClinicsModule.handler({ httpMethod: 'GET' })
  assert.equal(getRes.statusCode, 405)

  // 3. Missing Authorization header rejected with 401 unauthenticated
  const unauthRes = await listProvisionedClinicsModule.handler({
    httpMethod: 'POST',
    headers: {},
  })
  assert.equal(unauthRes.statusCode, 401)
  const unauthBody = JSON.parse(unauthRes.body)
  assert.equal(unauthBody.error.code, 'unauthenticated')

  console.log('✓ listProvisionedClinics HTTP preflight, method, and auth rejection: PASS')
}

console.log('\n--- TEST GROUP 3: Platform Owner Authorization & Body Spoofing Invariant ---')
{
  // Test authorization helper directly with provisionClinic payload
  const { requirePlatformOwner } = require('../netlify/functions/lib/auth.js')

  // Standard user without claim rejects
  assert.throws(
    () => requirePlatformOwner({ uid: 'standard-user', platformOwner: false }),
    (err) => err.code === 'permission-denied',
  )

  // Body spoof invariant: payload claiming platformOwner: true MUST NOT satisfy authorization
  const clientPayload = {
    name: { ar: 'عيادة', en: 'Clinic', fr: 'Clinique' },
    slug: 'clinic-spoof',
    platformOwner: true,
  }
  const decodedTokenFromNormalUser = { uid: 'standard-user-1', email: 'vet@vet.com' }
  assert.throws(
    () => requirePlatformOwner(decodedTokenFromNormalUser),
    (err) => err.code === 'permission-denied',
  )

  // Genuine platform owner claim succeeds
  assert.doesNotThrow(
    () => requirePlatformOwner({ uid: 'owner-admin', platformOwner: true }),
  )

  console.log('✓ Platform Owner claim enforcement and body spoof rejection: PASS')
}

console.log('\n--- TEST GROUP 4: provisionClinic Validation Invariants ---')
{
  const { parseJsonBody } = require('../netlify/functions/lib/http.js')
  const { requireString, rejectUnknownFields } = require('../netlify/functions/lib/validation.js')

  // Reject unsupported fields
  const payloadWithExtra = {
    name: { ar: 'عيادة', en: 'Clinic', fr: 'Clinique' },
    slug: 'clinic-alpha',
    ownerEmail: 'owner@clinic.com',
    temporaryPassword: 'Password123456!',
    hackedRole: 'admin',
  }
  assert.throws(
    () => rejectUnknownFields(payloadWithExtra, new Set(['name', 'slug', 'ownerEmail', 'temporaryPassword', 'public']), 'clinic provisioning'),
    (err) => err.code === 'invalid-argument' && err.message.includes('hackedRole'),
  )

  console.log('✓ provisionClinic strict allowlist validation: PASS')
}

console.log('\n========================================')
console.log('ALL PHASE 16B GROUP A TESTS PASS')
console.log('========================================')
