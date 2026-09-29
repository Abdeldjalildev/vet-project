// Tests for Phase 16B Group C: trusted clinic operations
//   transitionAppointment, completeClinicPasswordSetup, recordAnalyticsEvent
//
// Part 1: HTTP boundary, authentication and authorization.
// Part 2: Behavioral contract against real Firestore + real Firebase Auth emulators.
//
// Group C contains authenticated operations, so the Firestore emulator alone is not enough:
// this suite also runs the Auth emulator and mints REAL ID tokens through the emulator's
// identitytoolkit endpoint, which the shared layer validates server-side via verifyIdToken.
//
// The repository firebase.json intentionally has no `emulators` block (this migration does not
// modify it), and firebase-tools refuses to start the Auth emulator without one. The suite
// therefore generates an equivalent emulator-only config in the OS temp directory.

import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { execSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import os from 'node:os'
import path from 'node:path'

const require = createRequire(import.meta.url)
const repoRoot = path.dirname(fileURLToPath(new URL('../package.json', import.meta.url)))

const IN_EMULATORS = Boolean(process.env.FIRESTORE_EMULATOR_HOST && process.env.FIREBASE_AUTH_EMULATOR_HOST)

if (!IN_EMULATORS) {
  console.log('Re-launching under Firestore + Auth Emulators for behavioral tests...')
  const configPath = path.join(os.tmpdir(), 'vlife-phase16b-groupc-emulators.json')
  writeFileSync(configPath, JSON.stringify({
    emulators: {
      firestore: { host: '127.0.0.1', port: 8080 },
      auth: { host: '127.0.0.1', port: 9099 },
      hub: { host: '127.0.0.1', port: 4400 },
      logging: { host: '127.0.0.1', port: 4500 },
      ui: { enabled: false },
      singleProjectMode: true,
    },
  }, null, 2))

  try {
    execSync(
      `firebase emulators:exec --only firestore,auth --project demo-vetlife-poc --config "${configPath}" "node tests/phase16b-groupC.mjs"`,
      { stdio: 'inherit', env: { ...process.env, PHASE16B_GROUPC_CHILD: '1' } },
    )
    process.exit(0)
  } catch (err) {
    process.exit(err.status === null || err.status === undefined ? 1 : err.status)
  }
}

const transitionAppointment = require('../netlify/functions/transitionAppointment.js')
const completeClinicPasswordSetup = require('../netlify/functions/completeClinicPasswordSetup.js')
const recordAnalyticsEvent = require('../netlify/functions/recordAnalyticsEvent.js')
const { getFirestoreAdmin, getAuthAdmin } = require('../netlify/functions/lib/firebaseAdmin.js')

const db = getFirestoreAdmin()
const authAdmin = getAuthAdmin()
const authEmulatorHost = process.env.FIREBASE_AUTH_EMULATOR_HOST

// --- request helpers ---

const invoke = (mod, body, headers = {}) => {
  const payload = typeof body === 'string' ? body : JSON.stringify(body)
  return mod.handler({
    httpMethod: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: payload,
  })
}

const bearer = (token) => (token ? { authorization: `Bearer ${token}` } : {})

const postTransition = (body, token) => invoke(transitionAppointment, body, bearer(token))
const postPassword = (body, token) => invoke(completeClinicPasswordSetup, body, bearer(token))
const postAnalytics = (body) => invoke(recordAnalyticsEvent, body)

const json = (res) => JSON.parse(res.body)

// --- identity helpers (real Auth emulator tokens) ---

const seedAuthUser = async (uid) => {
  try {
    await authAdmin.deleteUser(uid)
  } catch {
    // user does not exist yet
  }
  await authAdmin.createUser({
    uid,
    email: `${uid}@phase16b-groupc.test`,
    password: 'Temporary-Password-123!',
  })
}

const mintIdToken = async (uid) => {
  const customToken = await authAdmin.createCustomToken(uid)
  const response = await fetch(
    `http://${authEmulatorHost}/identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=fake-api-key`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: customToken, returnSecureToken: true }),
    },
  )
  const payload = await response.json()
  assert.ok(payload.idToken, `Auth Emulator must issue an ID token for ${uid}: ${JSON.stringify(payload)}`)
  const decoded = await authAdmin.verifyIdToken(payload.idToken)
  assert.equal(decoded.uid, uid, 'server-side verifyIdToken must resolve the minted uid')
  return payload.idToken
}

const seedIdentity = async (uid) => {
  await seedAuthUser(uid)
  return mintIdToken(uid)
}

// --- data helpers ---

const seedClinic = (clinicId, data) => db.collection('clinics').doc(clinicId).set(data, { merge: true })
const seedMembership = (uid, data) => db.collection('users').doc(uid).set(data, { merge: true })
const seedAppointment = (clinicId, appointmentId, data) =>
  db.collection('clinics').doc(clinicId).collection('appointments').doc(appointmentId).set(data, { merge: true })

const todayKey = new Date().toISOString().slice(0, 10)
const base64url = (value) => Buffer.from(String(value), 'utf8').toString('base64url').slice(0, 120)

const CLINIC_A = 'gcc-clinic-a'
const CLINIC_B = 'gcc-clinic-b'
const CLINIC_PRIVATE = 'gcc-clinic-private'
const CLINIC_ANALYTICS = 'gcc-analytics'
const CLINIC_ANALYTICS_OFF = 'gcc-analytics-off'

const UUID_SESSION = '3f2a9c14-5b7e-4d21-8c6f-2a1b7d9e4f01'
const UUID_VISITOR = '7d1e4b62-9c3a-4f58-a1d2-6b8c0e5f2a93'
const UUID_EVENT_1 = 'a4c6e8f0-1b2d-4e3f-9a5b-7c8d9e0f1a2b'
const UUID_EVENT_2 = 'b5d7f9a1-2c3e-4f40-8b6c-9d0e1f2a3b4c'
const UUID_EVENT_3 = 'c6e8a0b2-3d4f-4a51-9c7d-0e1f2a3b4c5d'
const UUID_EVENT_4 = 'd7f9b1c3-4e5a-4b62-8d8e-1f2a3b4c5d6e'
const UUID_EVENT_5 = 'e8a0c2d4-5f6b-4c73-9e9f-2a3b4c5d6e7f'
const UUID_EVENT_6 = 'f9b1d3e5-6a7c-4d84-8f0a-3b4c5d6e7f80'
const UUID_EVENT_7 = '0ac2e4f6-7b8d-4e95-9a1b-4c5d6e7f8091'

const validAnalytics = (overrides = {}) => ({
  clinicId: CLINIC_ANALYTICS,
  eventType: 'page_view',
  page: 'home',
  sessionId: UUID_SESSION,
  visitorId: UUID_VISITOR,
  language: 'ar',
  eventId: UUID_EVENT_1,
  ...overrides,
})

console.log('--- SEEDING: real Auth users + Firestore fixtures ---')

const OWNER_A = 'gcc-user-owner-a'
const ADMIN_A = 'gcc-user-admin-a'
const SUSPENDED_A = 'gcc-user-suspended-a'
const STAFF_A = 'gcc-user-staff-a'
const OUTSIDER = 'gcc-user-outsider'
const OWNER_B = 'gcc-user-owner-b'
const PWD_PENDING = 'gcc-user-pwd-pending'
const PWD_FUTURE = 'gcc-user-pwd-future'
const PWD_NOSETUP = 'gcc-user-pwd-nosetup'
const PWD_DONE = 'gcc-user-pwd-done'
const PWD_TARGET = 'gcc-user-pwd-target'
const VANISHING = 'gcc-user-vanishing'

await seedClinic(CLINIC_A, {
  clinicId: CLINIC_A, slug: 'gcc-clinic-a', public: true, active: true, lifecycle: 'active',
  name: { ar: 'عيادة أ', en: 'Clinic A', fr: 'Clinique A' },
})
await seedClinic(CLINIC_B, {
  clinicId: CLINIC_B, slug: 'gcc-clinic-b', public: true, active: true, lifecycle: 'active',
  name: { ar: 'عيادة ب', en: 'Clinic B', fr: 'Clinique B' },
})
await seedClinic(CLINIC_PRIVATE, {
  clinicId: CLINIC_PRIVATE, slug: 'gcc-clinic-private', public: false, active: false, lifecycle: 'active',
  name: { ar: 'عيادة', en: 'Private clinic', fr: 'Clinique privee' },
})
await seedClinic(CLINIC_ANALYTICS, {
  clinicId: CLINIC_ANALYTICS, slug: 'gcc-analytics', public: true, active: true, lifecycle: 'active',
  name: { ar: 'تحليلات', en: 'Analytics clinic', fr: 'Clinique analytics' },
})
await seedClinic(CLINIC_ANALYTICS_OFF, {
  clinicId: CLINIC_ANALYTICS_OFF, slug: 'gcc-analytics-off', public: false, active: true, lifecycle: 'active',
  name: { ar: 'متوقفة', en: 'Inactive clinic', fr: 'Clinique inactive' },
})

await seedMembership(OWNER_A, { clinicId: CLINIC_A, role: 'owner', status: 'active' })
await seedMembership(ADMIN_A, { clinicId: CLINIC_A, role: 'admin', status: 'active' })
await seedMembership(SUSPENDED_A, { clinicId: CLINIC_A, role: 'owner', status: 'suspended' })
await seedMembership(STAFF_A, { clinicId: CLINIC_A, role: 'staff', status: 'active' })
await seedMembership(OWNER_B, { clinicId: CLINIC_B, role: 'owner', status: 'active' })
await seedMembership(PWD_PENDING, { clinicId: CLINIC_A, role: 'owner', status: 'active', mustChangePassword: true, passwordSetupIssuedAt: -1 })
await seedMembership(PWD_FUTURE, { clinicId: CLINIC_A, role: 'owner', status: 'active', mustChangePassword: true, passwordSetupIssuedAt: Date.now() + 3600000 })
await seedMembership(PWD_NOSETUP, { clinicId: CLINIC_A, role: 'owner', status: 'active', mustChangePassword: true })
await seedMembership(PWD_DONE, { clinicId: CLINIC_A, role: 'admin', status: 'active', mustChangePassword: false })
await seedMembership(PWD_TARGET, { clinicId: CLINIC_A, role: 'owner', status: 'active', mustChangePassword: true, passwordSetupIssuedAt: -1 })
await seedMembership(VANISHING, { clinicId: CLINIC_A, role: 'owner', status: 'active', mustChangePassword: true, passwordSetupIssuedAt: -1 })
// No membership document for OUTSIDER: authorization must reject it.

await seedAppointment(CLINIC_A, 'gcc-appt-pending', { clinicId: CLINIC_A, status: 'pending', estimatedServiceValue: 2500, serviceCurrency: 'DZD', date: todayKey, time: '09:00' })
await seedAppointment(CLINIC_A, 'gcc-appt-pending-2', { clinicId: CLINIC_A, status: 'pending', estimatedServiceValue: 2500, serviceCurrency: 'DZD', date: todayKey, time: '09:15' })
await seedAppointment(CLINIC_A, 'gcc-appt-confirmed', { clinicId: CLINIC_A, status: 'confirmed', estimatedServiceValue: 1234.5, serviceCurrency: 'EUR', date: todayKey, time: '09:30' })
await seedAppointment(CLINIC_A, 'gcc-appt-confirmed-novalue', { clinicId: CLINIC_A, status: 'confirmed', date: todayKey, time: '10:00' })
await seedAppointment(CLINIC_A, 'gcc-appt-completed', { clinicId: CLINIC_A, status: 'completed', estimatedServiceValue: 500, serviceCurrency: 'DZD', date: todayKey, time: '10:30' })
await seedAppointment(CLINIC_A, 'gcc-appt-cancelled', { clinicId: CLINIC_A, status: 'cancelled', estimatedServiceValue: 500, serviceCurrency: 'DZD', date: todayKey, time: '11:00' })
await seedAppointment(CLINIC_B, 'gcc-appt-b-pending', { clinicId: CLINIC_B, status: 'pending', estimatedServiceValue: 999, serviceCurrency: 'DZD', date: todayKey, time: '09:00' })

const OWNER_A_TOKEN = await seedIdentity(OWNER_A)
const ADMIN_A_TOKEN = await seedIdentity(ADMIN_A)
const SUSPENDED_A_TOKEN = await seedIdentity(SUSPENDED_A)
const STAFF_A_TOKEN = await seedIdentity(STAFF_A)
const OUTSIDER_TOKEN = await seedIdentity(OUTSIDER)
const OWNER_B_TOKEN = await seedIdentity(OWNER_B)
const PWD_PENDING_TOKEN = await seedIdentity(PWD_PENDING)
const PWD_FUTURE_TOKEN = await seedIdentity(PWD_FUTURE)
const PWD_NOSETUP_TOKEN = await seedIdentity(PWD_NOSETUP)
const PWD_DONE_TOKEN = await seedIdentity(PWD_DONE)
const PWD_TARGET_TOKEN = await seedIdentity(PWD_TARGET)
const VANISHING_TOKEN = await seedIdentity(VANISHING)
// Simulates an Auth account removed after token issuance (getUser must then throw).
await authAdmin.deleteUser(VANISHING)

const validTransition = (overrides = {}) => ({
  clinicId: CLINIC_A,
  appointmentId: 'gcc-appt-pending',
  status: 'confirmed',
  ...overrides,
})

console.log('✓ Fixtures seeded (clinics 5, memberships 10, appointments 6, auth users 12)')

console.log('\n--- TEST GROUP 1: transitionAppointment HTTP boundary & authentication ---')
{
  const preflight = await transitionAppointment.handler({ httpMethod: 'OPTIONS' })
  assert.equal(preflight.statusCode, 204)
  assert.equal(preflight.body, '')
  assert.equal(preflight.headers['Access-Control-Allow-Origin'], '*')
  assert.equal(preflight.headers['Access-Control-Allow-Methods'], 'POST, OPTIONS')

  for (const method of ['GET', 'PUT', 'DELETE']) {
    const res = await transitionAppointment.handler({ httpMethod: method })
    assert.equal(res.statusCode, 405, `${method} must be rejected`)
    assert.equal(json(res).error.code, 'invalid-argument')
  }

  const noAuth = await postTransition(validTransition())
  assert.equal(noAuth.statusCode, 401)
  assert.equal(json(noAuth).error.code, 'unauthenticated')
  assert.equal(json(noAuth).error.message, 'Authentication is required.')
  assert.equal(noAuth.headers['Access-Control-Allow-Origin'], '*')

  for (const header of ['Basic 12345', 'Bearer   ', 'Bearer not-a-real-token', 'Token abc', '']) {
    const res = await invoke(transitionAppointment, validTransition(), { authorization: header })
    assert.equal(res.statusCode, 401, `malformed/invalid Authorization "${header}" must map to 401`)
    assert.equal(json(res).error.code, 'unauthenticated')
  }

  console.log('✓ OPTIONS 204 + CORS, non-POST 405, missing/malformed/invalid token 401: PASS')
}

console.log('\n--- TEST GROUP 2: transitionAppointment authorization & body spoof resistance ---')
{
  // Authenticated but no membership document
  const outsider = await postTransition(validTransition(), OUTSIDER_TOKEN)
  assert.equal(outsider.statusCode, 403)
  assert.equal(json(outsider).error.code, 'permission-denied')
  assert.equal(json(outsider).error.message, 'Clinic membership was not found.')

  // Inactive membership
  const suspended = await postTransition(validTransition(), SUSPENDED_A_TOKEN)
  assert.equal(suspended.statusCode, 403)
  assert.equal(json(suspended).error.message, 'Active clinic membership is required.')

  // Active membership with a non-authorized role
  const staff = await postTransition(validTransition(), STAFF_A_TOKEN)
  assert.equal(staff.statusCode, 403)
  assert.equal(json(staff).error.message, 'Active clinic membership is required.')

  // Body-supplied authorization claims cannot authorize: membership is evaluated first,
  // so these are rejected as authorization failures, never as accepted claims.
  for (const spoofField of ['platformOwner', 'role', 'uid', 'mustChangePassword']) {
    const spoofed = await postTransition(validTransition({ [spoofField]: 'owner' }), OUTSIDER_TOKEN)
    assert.equal(spoofed.statusCode, 403, `spoofed ${spoofField} must not change authorization`)
    assert.equal(json(spoofed).error.message, 'Clinic membership was not found.')
  }
  // For a genuine member the same claim is rejected by the strict allowlist (input, not authority).
  const allowedMemberSpoof = await postTransition(validTransition({ platformOwner: true }), OWNER_A_TOKEN)
  assert.equal(allowedMemberSpoof.statusCode, 400)
  assert.equal(json(allowedMemberSpoof).error.message, 'Unsupported appointment transition field: platformOwner')

  // Clinic scope comes from the verified membership, never from the body clinicId
  const foreignClinic = await postTransition(
    { clinicId: CLINIC_B, appointmentId: 'gcc-appt-b-pending', status: 'confirmed' }, OWNER_A_TOKEN)
  assert.equal(foreignClinic.statusCode, 403)
  assert.equal(json(foreignClinic).error.message, 'The appointment does not belong to your clinic.')

  const foreignMember = await postTransition(validTransition(), OWNER_B_TOKEN)
  assert.equal(foreignMember.statusCode, 403)
  assert.equal(json(foreignMember).error.message, 'The appointment does not belong to your clinic.')

  // Active clinic admin passes the same boundary (role parity with the callable)
  const byAdmin = await postTransition(
    { clinicId: CLINIC_A, appointmentId: 'gcc-appt-pending', status: 'confirmed' }, ADMIN_A_TOKEN)
  assert.equal(byAdmin.statusCode, 200, byAdmin.body)
  assert.deepEqual(json(byAdmin), { appointmentId: 'gcc-appt-pending', status: 'confirmed' })
  const updated = await db.collection('clinics').doc(CLINIC_A)
    .collection('appointments').doc('gcc-appt-pending').get()
  assert.equal(updated.data().status, 'confirmed')
  assert.ok(updated.data().updatedAt, 'updatedAt must be written by the transaction')

  console.log('✓ Membership/role/clinic-scope enforcement, spoof rejection, admin parity: PASS')
}

console.log('\n--- TEST GROUP 3: transitionAppointment validation contract ---')
{
  const cases = [
    { label: 'unexpected field', body: validTransition({ hackedRole: 'owner' }), message: 'Unsupported appointment transition field: hackedRole' },
    { label: 'missing appointmentId', body: { clinicId: CLINIC_A, status: 'confirmed' }, message: 'appointmentId must be a string.' },
    { label: 'missing clinicId', body: { appointmentId: 'gcc-appt-pending-2', status: 'confirmed' }, message: 'clinicId must be a string.' },
    { label: 'missing status', body: { clinicId: CLINIC_A, appointmentId: 'gcc-appt-pending-2' }, message: 'status must be a string.' },
    { label: 'slash in appointmentId', body: validTransition({ appointmentId: 'a/b' }), message: 'appointmentId is invalid.' },
    { label: 'slash in clinicId', body: validTransition({ clinicId: 'a/b' }), message: 'clinicId is invalid.' },
    { label: 'empty status', body: validTransition({ status: '   ' }), message: 'status is invalid.' },
    { label: 'over-long status', body: validTransition({ status: 'x'.repeat(25) }), message: 'status is invalid.' },
    { label: 'non-string status', body: validTransition({ status: 42 }), message: 'status must be a string.' },
    { label: 'unknown status', body: validTransition({ status: 'in_progress' }), message: 'Appointment status is invalid.' },
  ]

  for (const testCase of cases) {
    const res = await postTransition(testCase.body, OWNER_A_TOKEN)
    assert.equal(res.statusCode, 400, `${testCase.label} must be 400 (got ${res.statusCode}: ${res.body})`)
    assert.equal(json(res).error.code, 'invalid-argument')
    assert.equal(json(res).error.message, testCase.message, testCase.label)
  }

  const malformed = await invoke(transitionAppointment, '{not-json', bearer(OWNER_A_TOKEN))
  assert.equal(malformed.statusCode, 400)
  assert.equal(json(malformed).error.message, 'Malformed JSON in request body.')

  const arrayBody = await invoke(transitionAppointment, [1, 2, 3], bearer(OWNER_A_TOKEN))
  assert.equal(arrayBody.statusCode, 400)
  assert.equal(json(arrayBody).error.message, 'Request body must be a JSON object.')

  const emptyBody = await invoke(transitionAppointment, '', bearer(OWNER_A_TOKEN))
  assert.equal(emptyBody.statusCode, 400)
  assert.equal(json(emptyBody).error.message, 'clinicId must be a string.')

  console.log('✓ Strict allowlist, field validation, status enum, malformed body handling: PASS')
}

console.log('\n--- TEST GROUP 4: transitionAppointment state machine & revenue aggregation ---')
{
  const clinicARef = db.collection('clinics').doc(CLINIC_A)
  const aggregateRef = clinicARef.collection('analyticsAggregates').doc(todayKey)

  // 1. Missing appointment → 404
  const missing = await postTransition(validTransition({ appointmentId: 'gcc-appt-missing' }), OWNER_A_TOKEN)
  assert.equal(missing.statusCode, 404)
  assert.equal(json(missing).error.message, 'Appointment was not found.')

  // 2. Invalid transition pending → completed → 412 and no write at all
  const pendingRef = clinicARef.collection('appointments').doc('gcc-appt-pending-2')
  const beforeReject = await pendingRef.get()
  const invalid = await postTransition(
    validTransition({ appointmentId: 'gcc-appt-pending-2', status: 'completed' }), OWNER_A_TOKEN)
  assert.equal(invalid.statusCode, 412)
  assert.equal(json(invalid).error.code, 'failed-precondition')
  assert.equal(json(invalid).error.message, 'This appointment status transition is not allowed.')
  const afterReject = await pendingRef.get()
  assert.equal(afterReject.data().status, 'pending', 'a rejected transition must not modify the appointment')
  assert.deepEqual(afterReject.data().updatedAt, beforeReject.data().updatedAt, 'a rejected transition must not touch updatedAt')
  assert.equal((await aggregateRef.get()).exists, false, 'a rejected transition must not create a revenue aggregate')

  // 3. Valid pending → confirmed, exact response
  const ok = await postTransition(
    validTransition({ appointmentId: 'gcc-appt-pending-2', status: 'confirmed' }), OWNER_A_TOKEN)
  assert.equal(ok.statusCode, 200, ok.body)
  assert.deepEqual(json(ok), { appointmentId: 'gcc-appt-pending-2', status: 'confirmed' })

  // 4. Terminal statuses reject every transition (TRANSITIONS map preserved verbatim)
  for (const [appointmentId, status] of [
    ['gcc-appt-completed', 'cancelled'],
    ['gcc-appt-completed', 'confirmed'],
    ['gcc-appt-cancelled', 'confirmed'],
    ['gcc-appt-cancelled', 'pending'],
  ]) {
    const res = await postTransition({ clinicId: CLINIC_A, appointmentId, status }, OWNER_A_TOKEN)
    assert.equal(res.statusCode, 412, `${appointmentId} → ${status} must be rejected`)
    assert.equal(json(res).error.message, 'This appointment status transition is not allowed.')
  }

  // 5. confirmed → cancelled is allowed and must not create revenue
  const cancelled = await postTransition(
    validTransition({ appointmentId: 'gcc-appt-pending', status: 'cancelled' }), OWNER_A_TOKEN)
  assert.equal(cancelled.statusCode, 200, cancelled.body)
  assert.deepEqual(json(cancelled), { appointmentId: 'gcc-appt-pending', status: 'cancelled' })
  assert.equal((await aggregateRef.get()).exists, false, 'only completion may create the revenue aggregate')

  console.log('✓ 404, 412 state machine, terminal states, exact responses: PASS')
}

console.log('\n--- TEST GROUP 5: transitionAppointment completion revenue aggregation ---')
{
  const aggregateRef = db.collection('clinics').doc(CLINIC_A).collection('analyticsAggregates').doc(todayKey)

  // 1. confirmed → completed aggregates revenue from the appointment snapshot
  const completed = await postTransition(
    validTransition({ appointmentId: 'gcc-appt-confirmed', status: 'completed' }), OWNER_A_TOKEN)
  assert.equal(completed.statusCode, 200, completed.body)
  assert.deepEqual(json(completed), { appointmentId: 'gcc-appt-confirmed', status: 'completed' })

  const firstAggregate = await aggregateRef.get()
  assert.equal(firstAggregate.exists, true, 'completion must create the daily revenue aggregate')
  const first = firstAggregate.data()
  assert.equal(first.clinicId, CLINIC_A)
  assert.equal(first.date, todayKey)
  assert.equal(first.completedServices, 1)
  assert.deepEqual(first.estimatedCompletedServiceValueByCurrency, { EUR: 1234.5 })
  assert.ok(first.revenueUpdatedAt, 'revenueUpdatedAt must be written')

  // 2. Missing/invalid snapshot values fall back to 0 / DZD exactly as the callable
  const noValue = await postTransition(
    validTransition({ appointmentId: 'gcc-appt-confirmed-novalue', status: 'completed' }), OWNER_A_TOKEN)
  assert.equal(noValue.statusCode, 200, noValue.body)
  assert.deepEqual(json(noValue), { appointmentId: 'gcc-appt-confirmed-novalue', status: 'completed' })

  const second = (await aggregateRef.get()).data()
  assert.equal(second.completedServices, 2)
  assert.deepEqual(second.estimatedCompletedServiceValueByCurrency, { EUR: 1234.5, DZD: 0 })

  // 3. A repeated completion is rejected and must not double-increment revenue
  const duplicate = await postTransition(
    validTransition({ appointmentId: 'gcc-appt-confirmed', status: 'completed' }), OWNER_A_TOKEN)
  assert.equal(duplicate.statusCode, 412)
  assert.equal(json(duplicate).error.message, 'This appointment status transition is not allowed.')
  const third = (await aggregateRef.get()).data()
  assert.equal(third.completedServices, 2, 'duplicate completion must not increment again')
  assert.deepEqual(third.estimatedCompletedServiceValueByCurrency, { EUR: 1234.5, DZD: 0 })

  // 4. Aggregation is clinic-scoped: clinic B must remain untouched
  const clinicBAggregate = await db.collection('clinics').doc(CLINIC_B)
    .collection('analyticsAggregates').doc(todayKey).get()
  assert.equal(clinicBAggregate.exists, false, 'clinic A completion must not touch clinic B')

  console.log('✓ Completion revenue aggregation, fallbacks, no double increment, clinic scoping: PASS')
}

console.log('\n--- TEST GROUP 6: completeClinicPasswordSetup HTTP boundary, auth & authorization ---')
{
  const preflight = await completeClinicPasswordSetup.handler({ httpMethod: 'OPTIONS' })
  assert.equal(preflight.statusCode, 204)
  assert.equal(preflight.body, '')
  assert.equal(preflight.headers['Access-Control-Allow-Origin'], '*')
  assert.equal(preflight.headers['Access-Control-Allow-Methods'], 'POST, OPTIONS')

  const get = await completeClinicPasswordSetup.handler({ httpMethod: 'GET' })
  assert.equal(get.statusCode, 405)
  assert.equal(json(get).error.code, 'invalid-argument')

  const noAuth = await postPassword({})
  assert.equal(noAuth.statusCode, 401)
  assert.equal(json(noAuth).error.code, 'unauthenticated')
  assert.equal(json(noAuth).error.message, 'Authentication is required.')

  for (const header of ['Basic 12345', 'Bearer', 'Bearer not-a-real-token']) {
    const res = await invoke(completeClinicPasswordSetup, {}, { authorization: header })
    assert.equal(res.statusCode, 401, `malformed/invalid Authorization "${header}" must map to 401`)
    assert.equal(json(res).error.code, 'unauthenticated')
  }

  // Authenticated without a membership document
  const outsider = await postPassword({}, OUTSIDER_TOKEN)
  assert.equal(outsider.statusCode, 403)
  assert.equal(json(outsider).error.code, 'permission-denied')
  assert.equal(json(outsider).error.message, 'Clinic membership was not found.')

  // Inactive membership and non-authorized role
  const suspended = await postPassword({}, SUSPENDED_A_TOKEN)
  assert.equal(suspended.statusCode, 403)
  assert.equal(json(suspended).error.message, 'Active clinic membership is required.')

  const staff = await postPassword({}, STAFF_A_TOKEN)
  assert.equal(staff.statusCode, 403)
  assert.equal(json(staff).error.message, 'Active clinic membership is required.')

  // Body handling: canonical transport parse error, no payload allowlist (empty-object contract)
  const malformed = await invoke(completeClinicPasswordSetup, '{oops', bearer(PWD_PENDING_TOKEN))
  assert.equal(malformed.statusCode, 400)
  assert.equal(json(malformed).error.message, 'Malformed JSON in request body.')

  console.log('✓ OPTIONS 204, non-POST 405, 401/403 boundaries, canonical malformed body: PASS')
}

console.log('\n--- TEST GROUP 7: completeClinicPasswordSetup state semantics & spoof resistance ---')
{
  // 1. Body-supplied identity/state must not retarget another user or satisfy the precondition.
  const targetBefore = await db.collection('users').doc(PWD_TARGET).get()
  const spoof = await postPassword({
    uid: PWD_TARGET,
    userId: PWD_TARGET,
    clinicId: CLINIC_B,
    mustChangePassword: false,
    passwordUpdatedAt: '2999-01-01T00:00:00.000Z',
    setupIssuedAt: 0,
    passwordSetupIssuedAt: -1,
  }, PWD_FUTURE_TOKEN)
  assert.equal(spoof.statusCode, 412, spoof.body)
  assert.equal(json(spoof).error.code, 'failed-precondition')
  assert.equal(json(spoof).error.message, 'The permanent password has not been changed yet.')
  const targetAfter = await db.collection('users').doc(PWD_TARGET).get()
  assert.equal(targetAfter.data().mustChangePassword, true, 'another user must never be modified')
  assert.deepEqual(targetAfter.data(), targetBefore.data(), 'the spoofed target document must be untouched')

  // 2. Precondition failures (setupIssuedAt in the future / not issued at all)
  const future = await postPassword({}, PWD_FUTURE_TOKEN)
  assert.equal(future.statusCode, 412)
  assert.equal(json(future).error.code, 'failed-precondition')
  assert.equal(json(future).error.message, 'The permanent password has not been changed yet.')

  const noSetup = await postPassword({}, PWD_NOSETUP_TOKEN)
  assert.equal(noSetup.statusCode, 412)
  assert.equal(json(noSetup).error.message, 'The permanent password has not been changed yet.')

  const futureDoc = await db.collection('users').doc(PWD_FUTURE).get()
  assert.equal(futureDoc.data().mustChangePassword, true)
  assert.equal(futureDoc.data().updatedAt, undefined, 'a failed precondition must not write anything')

  // 3. A membership that is not in password setup short-circuits without touching Auth or Firestore
  const doneBefore = await db.collection('users').doc(PWD_DONE).get()
  const done = await postPassword({}, PWD_DONE_TOKEN)
  assert.equal(done.statusCode, 200, done.body)
  assert.deepEqual(json(done), { completed: true })
  const doneAfter = await db.collection('users').doc(PWD_DONE).get()
  assert.deepEqual(doneAfter.data(), doneBefore.data(), 'the short-circuit path must not write')

  // 4. Genuine completion flips mustChangePassword and writes updatedAt only
  const valid = await postPassword({}, PWD_PENDING_TOKEN)
  assert.equal(valid.statusCode, 200, valid.body)
  assert.deepEqual(json(valid), { completed: true })
  const pendingDoc = await db.collection('users').doc(PWD_PENDING).get()
  assert.equal(pendingDoc.data().mustChangePassword, false)
  assert.ok(pendingDoc.data().updatedAt, 'updatedAt must be written on completion')
  assert.equal(pendingDoc.data().clinicId, CLINIC_A, 'unrelated membership fields must be preserved')
  assert.equal(pendingDoc.data().role, 'owner')
  assert.equal(pendingDoc.data().passwordSetupIssuedAt, -1, 'the issued timestamp must be preserved')

  // 5. Repeating the call after completion is idempotent
  const second = await postPassword({}, PWD_PENDING_TOKEN)
  assert.equal(second.statusCode, 200)
  assert.deepEqual(json(second), { completed: true })

  // 6. An Auth account removed after token issuance can no longer act: the token no longer
  //    verifies, so the request is rejected at the authentication boundary and nothing is written.
  //    (The callable's `auth.getUser` failure branch is therefore unreachable through HTTP.)
  const vanished = await postPassword({}, VANISHING_TOKEN)
  assert.equal(vanished.statusCode, 401, `orphaned Auth token must be rejected, got ${vanished.statusCode}: ${vanished.body}`)
  assert.equal(json(vanished).error.code, 'unauthenticated')
  assert.equal(json(vanished).error.message, 'Invalid or expired authentication token.')
  assert.ok(!vanished.body.includes('auth/user-not-found'), 'internal Auth details must never leak')
  const vanishedDoc = await db.collection('users').doc(VANISHING).get()
  assert.equal(vanishedDoc.data().mustChangePassword, true, 'a rejected request must not write')

  console.log('✓ Spoof resistance, 412 preconditions, short-circuit, completion write, idempotency: PASS')
}

console.log('\n--- TEST GROUP 8: recordAnalyticsEvent HTTP boundary, public access & validation ---')
{
  const preflight = await recordAnalyticsEvent.handler({ httpMethod: 'OPTIONS' })
  assert.equal(preflight.statusCode, 204)
  assert.equal(preflight.body, '')
  assert.equal(preflight.headers['Access-Control-Allow-Origin'], '*')
  assert.equal(preflight.headers['Access-Control-Allow-Methods'], 'POST, OPTIONS')

  const get = await recordAnalyticsEvent.handler({ httpMethod: 'GET' })
  assert.equal(get.statusCode, 405)
  assert.equal(json(get).error.code, 'invalid-argument')

  // PUBLIC ENDPOINT: no Authorization header must reach validation, never 401
  const anonymous = await postAnalytics({ clinicId: CLINIC_ANALYTICS })
  assert.equal(anonymous.statusCode, 400, anonymous.body)
  assert.equal(json(anonymous).error.code, 'invalid-argument')
  assert.notEqual(anonymous.statusCode, 401)

  // A stray/optional Authorization header must not change the public behavior either
  const withStrayHeader = await invoke(
    recordAnalyticsEvent, { clinicId: CLINIC_ANALYTICS }, { authorization: 'Bearer not-a-real-token' })
  assert.equal(withStrayHeader.statusCode, 400, 'a public endpoint must not verify optional credentials')
  assert.notEqual(withStrayHeader.statusCode, 401)

  const cases = [
    { label: 'missing clinicId', body: validAnalytics({ clinicId: undefined }), message: 'clinicId must be a string.' },
    { label: 'missing eventType', body: validAnalytics({ eventType: undefined }), message: 'eventType must be a string.' },
    { label: 'invalid eventType', body: validAnalytics({ eventType: 'purchase' }), message: 'Analytics event type is invalid.' },
    { label: 'invalid page', body: validAnalytics({ page: 'admin' }), message: 'Analytics page is invalid.' },
    { label: 'invalid language', body: validAnalytics({ language: 'ara' }), message: 'Analytics language is invalid.' },
    { label: 'uppercase language', body: validAnalytics({ language: 'AR' }), message: 'Analytics language is invalid.' },
    { label: 'missing sessionId', body: validAnalytics({ sessionId: undefined }), message: 'sessionId must be a string.' },
    { label: 'non-uuid sessionId', body: validAnalytics({ sessionId: 'session-1' }), message: 'sessionId is invalid.' },
    { label: 'non-uuid visitorId', body: validAnalytics({ visitorId: 'visitor-1' }), message: 'visitorId is invalid.' },
    { label: 'slash visitorId', body: validAnalytics({ visitorId: `${UUID_VISITOR}/x` }), message: 'visitorId is invalid.' },
    { label: 'non-uuid eventId', body: validAnalytics({ eventId: 'event-1' }), message: 'eventId is invalid.' },
    { label: 'non-v4 eventId', body: validAnalytics({ eventId: 'a4c6e8f0-1b2d-1e3f-9a5b-7c8d9e0f1a2b' }), message: 'eventId is invalid.' },
    { label: 'over-long serviceId', body: validAnalytics({ eventType: 'service_view', serviceId: 'a'.repeat(129) }), message: 'Analytics service identifier is invalid.' },
    { label: 'slash serviceId', body: validAnalytics({ eventType: 'service_view', serviceId: 'svc/1' }), message: 'Analytics service identifier is invalid.' },
    { label: 'unexpected field', body: validAnalytics({ injected: true }), message: 'Unsupported analytics field: injected' },
  ]

  for (const testCase of cases) {
    const res = await postAnalytics(testCase.body)
    assert.equal(res.statusCode, 400, `${testCase.label} must be 400 (got ${res.statusCode}: ${res.body})`)
    assert.equal(json(res).error.code, 'invalid-argument')
    assert.equal(json(res).error.message, testCase.message, testCase.label)
  }

  const malformed = await invoke(recordAnalyticsEvent, '{nope')
  assert.equal(malformed.statusCode, 400)
  assert.equal(json(malformed).error.message, 'Malformed JSON in request body.')

  const arrayBody = await invoke(recordAnalyticsEvent, [1, 2, 3])
  assert.equal(arrayBody.statusCode, 400)
  assert.equal(json(arrayBody).error.message, 'Request body must be a JSON object.')

  // A slash-containing clinicId reaches reference construction exactly as in the callable,
  // where it also faulted before any Firestore work. It must stay a sanitized internal error.
  const badClinicRef = await postAnalytics(validAnalytics({ clinicId: 'gcc/bad' }))
  assert.equal(badClinicRef.statusCode, 500, badClinicRef.body)
  assert.equal(json(badClinicRef).error.code, 'internal')
  assert.equal(json(badClinicRef).error.message, 'An internal error occurred.')

  console.log('✓ OPTIONS 204, non-POST 405, public access, validation matrix, sanitized internal: PASS')
}

console.log('\n--- TEST GROUP 9: recordAnalyticsEvent persistence, aggregates & idempotency ---')
{
  const clinicRef = db.collection('clinics').doc(CLINIC_ANALYTICS)
  const aggregateRef = clinicRef.collection('analyticsAggregates').doc(todayKey)
  const visitorRef = clinicRef.collection('analyticsVisitors').doc(`${todayKey}_${base64url(UUID_VISITOR)}`)

  // 1. page_view creates the event document, daily aggregate and visitor document
  const pageView = await postAnalytics(validAnalytics())
  assert.equal(pageView.statusCode, 200, pageView.body)
  assert.deepEqual(json(pageView), { recorded: true })

  const eventDoc = await clinicRef.collection('analyticsEvents').doc(UUID_EVENT_1).get()
  assert.equal(eventDoc.exists, true, 'the event document must be persisted at analyticsEvents/{eventId}')
  const stored = eventDoc.data()
  assert.deepEqual(
    Object.keys(stored).sort(),
    ['clinicId', 'deviceType', 'eventType', 'language', 'page', 'serviceId', 'sessionId', 'timestamp'].sort(),
  )
  assert.equal(stored.clinicId, CLINIC_ANALYTICS)
  assert.equal(stored.eventType, 'page_view')
  assert.equal(stored.page, 'home')
  assert.equal(stored.serviceId, '')
  assert.equal(stored.sessionId, UUID_SESSION)
  assert.equal(stored.language, 'ar')
  assert.equal(stored.deviceType, 'unknown', 'the defaulted deviceType is stored')
  assert.ok(stored.timestamp, 'timestamp must be a server timestamp')

  const aggregate1 = (await aggregateRef.get()).data()
  assert.equal(aggregate1.clinicId, CLINIC_ANALYTICS)
  assert.equal(aggregate1.date, todayKey)
  assert.equal(aggregate1.pageViews, 1)
  assert.equal(aggregate1[`pages.${base64url('home')}`], 1, 'the page dimension must be base64url encoded')
  assert.equal(aggregate1.uniqueVisitors, 1)
  assert.equal(aggregate1.sessions, undefined)
  assert.ok(aggregate1.updatedAt, 'updatedAt must be written on the aggregate')

  const visitorDoc = await visitorRef.get()
  assert.equal(visitorDoc.exists, true, 'the visitor document must be persisted at analyticsVisitors/{date}_{key}')
  assert.equal(visitorDoc.data().visitorId, UUID_VISITOR)
  assert.equal(visitorDoc.data().date, todayKey)
  assert.ok(visitorDoc.data().createdAt)

  // 2. Duplicate eventId is a silent no-op success (no error, no extra writes)
  const duplicate = await postAnalytics(validAnalytics())
  assert.equal(duplicate.statusCode, 200, duplicate.body)
  assert.deepEqual(json(duplicate), { recorded: true })
  assert.equal((await clinicRef.collection('analyticsEvents').get()).size, 1, 'no duplicate event document')
  const aggregate2 = (await aggregateRef.get()).data()
  assert.equal(aggregate2.pageViews, 1, 'a duplicate must not double-increment pageViews')
  assert.equal(aggregate2.uniqueVisitors, 1, 'a duplicate must not double-increment uniqueVisitors')

  // 3. session_start for the same visitor increments sessions but not uniqueVisitors
  const sessionStart = await postAnalytics(validAnalytics({ eventType: 'session_start', eventId: UUID_EVENT_2 }))
  assert.equal(sessionStart.statusCode, 200, sessionStart.body)
  const aggregate3 = (await aggregateRef.get()).data()
  assert.equal(aggregate3.sessions, 1)
  assert.equal(aggregate3.uniqueVisitors, 1)

  // 4. service_view without serviceId adds no service dimension
  const serviceViewNoId = await postAnalytics(validAnalytics({ eventType: 'service_view', eventId: UUID_EVENT_3 }))
  assert.equal(serviceViewNoId.statusCode, 200, serviceViewNoId.body)
  const aggregate4 = (await aggregateRef.get()).data()
  assert.equal(aggregate4.services, undefined, 'service_view without serviceId must not add a dimension')

  // 5. service_view with serviceId increments the encoded service dimension
  const serviceView = await postAnalytics(
    validAnalytics({ eventType: 'service_view', serviceId: 'svc-9', eventId: UUID_EVENT_4 }))
  assert.equal(serviceView.statusCode, 200, serviceView.body)
  const aggregate5 = (await aggregateRef.get()).data()
  assert.equal(aggregate5[`services.${base64url('svc-9')}`], 1)

  // 6. booking_started / booking_completed counters
  const bookingStarted = await postAnalytics(
    validAnalytics({ eventType: 'booking_started', page: 'booking', eventId: UUID_EVENT_5 }))
  const bookingCompleted = await postAnalytics(
    validAnalytics({ eventType: 'booking_completed', page: 'booking', eventId: UUID_EVENT_6 }))
  assert.equal(bookingStarted.statusCode, 200, bookingStarted.body)
  assert.equal(bookingCompleted.statusCode, 200, bookingCompleted.body)
  const aggregate6 = (await aggregateRef.get()).data()
  assert.equal(aggregate6.bookingsStarted, 1)
  assert.equal(aggregate6.bookingsCompleted, 1)
  assert.equal(aggregate6.pageViews, 1, 'non page_view events must not change pageViews')
  assert.equal(aggregate6.uniqueVisitors, 1)

  // 7. A different visitor increments uniqueVisitors exactly once
  const otherVisitor = '9e5c3a71-4f2b-4d68-b0c1-8a7f6e5d4c3b'
  const newVisitor = await postAnalytics(
    validAnalytics({ visitorId: otherVisitor, eventId: UUID_EVENT_7, page: 'faq' }))
  assert.equal(newVisitor.statusCode, 200, newVisitor.body)
  const aggregate7 = (await aggregateRef.get()).data()
  assert.equal(aggregate7.uniqueVisitors, 2)
  assert.equal(aggregate7.pageViews, 2)
  assert.equal(aggregate7.bookingsStarted, 1, 'existing counters must be preserved by merge writes')

  const visitorCount = await clinicRef.collection('analyticsVisitors').get()
  assert.equal(visitorCount.size, 2, 'one visitor document per visitor per day')

  console.log('✓ Event documents, aggregate counters, visitor documents, idempotency: PASS')
}

console.log('\n--- TEST GROUP 10: recordAnalyticsEvent clinic availability & atomicity ---')
{
  const offRef = db.collection('clinics').doc(CLINIC_ANALYTICS_OFF)
  const missingClinic = 'gcc-analytics-missing'

  // Non-public / inactive clinic → 412 and no write of any kind
  const inactive = await postAnalytics(validAnalytics({ clinicId: CLINIC_ANALYTICS_OFF }))
  assert.equal(inactive.statusCode, 412, inactive.body)
  assert.equal(json(inactive).error.code, 'failed-precondition')
  assert.equal(json(inactive).error.message, 'Clinic is not available for analytics.')
  assert.equal((await offRef.collection('analyticsEvents').get()).size, 0, 'no event document may be written')
  assert.equal((await offRef.collection('analyticsAggregates').get()).size, 0, 'no aggregate may be written')
  assert.equal((await offRef.collection('analyticsVisitors').get()).size, 0, 'no visitor may be written')

  // Missing clinic → the same 412
  const unknown = await postAnalytics(validAnalytics({ clinicId: missingClinic }))
  assert.equal(unknown.statusCode, 412)
  assert.equal(json(unknown).error.message, 'Clinic is not available for analytics.')

  // Idempotency is evaluated BEFORE clinic availability (preserved order): an already-recorded
  // eventId succeeds even when the clinic is no longer public, and writes nothing.
  await offRef.collection('analyticsEvents').doc(UUID_EVENT_1).set({
    clinicId: CLINIC_ANALYTICS_OFF,
    eventType: 'page_view',
    page: 'home',
    serviceId: '',
    sessionId: UUID_SESSION,
    language: 'ar',
    deviceType: 'unknown',
  })
  const replay = await postAnalytics(validAnalytics({ clinicId: CLINIC_ANALYTICS_OFF }))
  assert.equal(replay.statusCode, 200, replay.body)
  assert.deepEqual(json(replay), { recorded: true })
  assert.equal((await offRef.collection('analyticsAggregates').get()).size, 0, 'a replay must not write aggregates')
  assert.equal((await offRef.collection('analyticsVisitors').get()).size, 0, 'a replay must not write visitors')

  // The private clinic used by Group B semantics remains untouched by analytics
  const privateRef = db.collection('clinics').doc(CLINIC_PRIVATE)
  const privateAttempt = await postAnalytics(validAnalytics({ clinicId: CLINIC_PRIVATE, eventId: UUID_EVENT_2 }))
  assert.equal(privateAttempt.statusCode, 412)
  assert.equal((await privateRef.collection('analyticsEvents').get()).size, 0)

  console.log('✓ 412 availability, atomicity, replay-before-availability ordering: PASS')
}

console.log('\n--- TEST GROUP 11: preserved callable contract (source parity) ---')
{
  const read = (relativePath) => readFileSync(new URL('../' + relativePath, import.meta.url), 'utf8')

  const transitionSource = read('netlify/functions/transitionAppointment.js')
  assert.match(transitionSource, /new Set\(\['pending', 'confirmed', 'completed', 'cancelled'\]\)/)
  assert.match(transitionSource, /pending: new Set\(\['confirmed', 'cancelled'\]\)/)
  assert.match(transitionSource, /confirmed: new Set\(\['completed', 'cancelled'\]\)/)
  assert.match(transitionSource, /completed: new Set\(\)/)
  assert.match(transitionSource, /cancelled: new Set\(\)/)
  assert.match(transitionSource, /estimatedCompletedServiceValueByCurrency/)
  assert.match(transitionSource, /FieldValue\.increment\(1\)/)
  assert.match(transitionSource, /FieldValue\.increment\(value\)/)
  assert.match(transitionSource, /'The appointment does not belong to your clinic\.'/)
  assert.match(transitionSource, /requireClinicMembership\(decodedToken\)/)

  const passwordSource = read('netlify/functions/completeClinicPasswordSetup.js')
  assert.match(passwordSource, /Date\.parse\(userRecord\.passwordUpdatedAt \|\| ''\) \|\| 0/)
  assert.match(passwordSource, /Number\(membership\.passwordSetupIssuedAt\) \|\| 0/)
  assert.match(passwordSource, /!setupIssuedAt \|\| passwordUpdatedAt <= setupIssuedAt/)
  assert.match(passwordSource, /mustChangePassword !== true/)
  assert.match(passwordSource, /mustChangePassword: false/)
  assert.match(passwordSource, /decodedToken\.uid/)

  const analyticsSource = read('netlify/functions/recordAnalyticsEvent.js')
  assert.match(analyticsSource, /uuidPattern/)
  assert.match(analyticsSource, /safeDimensionKey/)
  assert.match(analyticsSource, /if \(eventSnapshot\.exists\) return/)
  assert.match(analyticsSource, /uniqueVisitors/)
  assert.match(analyticsSource, /bookingsCompleted/)

  // The original callables stay present and untouched: this migration is strictly additive.
  const functionsSource = read('functions/index.js')
  for (const exportName of ['transitionAppointment', 'completeClinicPasswordSetup', 'recordAnalyticsEvent', 'deleteClinicService']) {
    assert.match(functionsSource, new RegExp(`exports\\.${exportName} = onCall`))
  }

  // Environment limitation (documented, not worked around by changing production behavior):
  // firebase-admin 13.10.0's UserRecord maps uid/email/emailVerified/displayName/photoURL/
  // phoneNumber/disabled/metadata/providerData/passwordHash/passwordSalt/tokensValidAfterTime/
  // customClaims/tenantId/multiFactor and never exposes `passwordUpdatedAt`, so the preserved
  // callable expression `Date.parse(userRecord.passwordUpdatedAt || '') || 0` evaluates to 0 both
  // here and in production on the same SDK line. The success branch is therefore driven with a
  // `passwordSetupIssuedAt` below that value (a truthy negative bound), which executes the real
  // comparison, the real Auth lookup and the real Firestore update without mocking anything.

  console.log('✓ Source parity with the preserved Firebase callables: PASS')
}

console.log('\n--- CLEANUP ---')
{
  const clinicsToRemove = [CLINIC_A, CLINIC_B, CLINIC_PRIVATE, CLINIC_ANALYTICS, CLINIC_ANALYTICS_OFF]
  for (const clinicId of clinicsToRemove) {
    for (const collectionName of ['appointments', 'analyticsEvents', 'analyticsAggregates', 'analyticsVisitors', 'services']) {
      const snapshot = await db.collection('clinics').doc(clinicId).collection(collectionName).get()
      for (const document of snapshot.docs) await document.ref.delete()
    }
    await db.collection('clinics').doc(clinicId).delete()
  }

  const uidsToRemove = [OWNER_A, ADMIN_A, SUSPENDED_A, STAFF_A, OUTSIDER, OWNER_B,
    PWD_PENDING, PWD_FUTURE, PWD_NOSETUP, PWD_DONE, PWD_TARGET, VANISHING]
  for (const uid of uidsToRemove) {
    await db.collection('users').doc(uid).delete()
    try {
      await authAdmin.deleteUser(uid)
    } catch {
      // already removed by the missing-Auth-record test
    }
  }

  console.log('✓ Emulator fixtures removed')
}

console.log('\n========================================')
console.log('ALL PHASE 16B GROUP C TESTS PASS')
console.log('========================================')
