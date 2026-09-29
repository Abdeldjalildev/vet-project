// Tests for Phase 16B Group D: deleteClinicService (trusted service deletion)
//
// Part 1: HTTP boundary, authentication, authorization, validation (no Firestore required).
// Part 2: Behavioral contract against real Firestore + real Firebase Auth emulators.
//
// Group D is an authenticated operation, so the Firestore emulator alone is not enough:
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

const IN_EMULATORS = Boolean(process.env.FIRESTORE_EMULATOR_HOST && process.env.FIREBASE_AUTH_EMULATOR_HOST)

if (!IN_EMULATORS) {
  console.log('Re-launching under Firestore + Auth Emulators for behavioral tests...')
  const configPath = path.join(os.tmpdir(), 'vlife-phase16b-groupd-emulators.json')
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
      `firebase emulators:exec --only firestore,auth --project demo-vetlife-poc --config "${configPath}" "node tests/phase16b-groupD.mjs"`,
      { stdio: 'inherit', env: { ...process.env, PHASE16B_GROUPD_CHILD: '1' } },
    )
    process.exit(0)
  } catch (err) {
    process.exit(err.status === null || err.status === undefined ? 1 : err.status)
  }
}

const deleteClinicService = require('../netlify/functions/deleteClinicService.js')
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

const postDelete = (body, token) => invoke(deleteClinicService, body, bearer(token))

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
    email: `${uid}@phase16b-groupd.test`,
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
const seedService = (clinicId, serviceId, data) =>
  db.collection('clinics').doc(clinicId).collection('services').doc(serviceId).set(data, { merge: true })
const seedAppointment = (clinicId, appointmentId, data) =>
  db.collection('clinics').doc(clinicId).collection('appointments').doc(appointmentId).set(data, { merge: true })

const serviceRef = (clinicId, serviceId) =>
  db.collection('clinics').doc(clinicId).collection('services').doc(serviceId)

const serviceIds = async (clinicId) => {
  const snapshot = await db.collection('clinics').doc(clinicId).collection('services').get()
  return snapshot.docs.map((document) => document.id).sort()
}


console.log('--- SEEDING: real Auth users + Firestore fixtures ---')

const CLINIC_A = 'gcd-clinic-a'
const CLINIC_B = 'gcd-clinic-b'

const OWNER_A = 'gcd-user-owner-a'
const ADMIN_A = 'gcd-user-admin-a'
const SUSPENDED_A = 'gcd-user-suspended-a'
const STAFF_A = 'gcd-user-staff-a'
const OUTSIDER = 'gcd-user-outsider'
const OWNER_B = 'gcd-user-owner-b'

await seedClinic(CLINIC_A, {
  clinicId: CLINIC_A, slug: 'gcd-clinic-a', public: true, active: true, lifecycle: 'active',
  name: { ar: 'عيادة أ', en: 'Clinic A', fr: 'Clinique A' },
})
await seedClinic(CLINIC_B, {
  clinicId: CLINIC_B, slug: 'gcd-clinic-b', public: true, active: true, lifecycle: 'active',
  name: { ar: 'عيادة ب', en: 'Clinic B', fr: 'Clinique B' },
})

await seedMembership(OWNER_A, { clinicId: CLINIC_A, role: 'owner', status: 'active' })
await seedMembership(ADMIN_A, { clinicId: CLINIC_A, role: 'admin', status: 'active' })
await seedMembership(SUSPENDED_A, { clinicId: CLINIC_A, role: 'owner', status: 'suspended' })
await seedMembership(STAFF_A, { clinicId: CLINIC_A, role: 'staff', status: 'active' })
await seedMembership(OWNER_B, { clinicId: CLINIC_B, role: 'owner', status: 'active' })
// No membership document for OUTSIDER: authorization must reject it.

await seedService(CLINIC_A, 'gcd-svc-deletable', { name: { ar: '', en: 'Deletable', fr: '' }, active: true, order: 1 })
await seedService(CLINIC_A, 'gcd-svc-referenced', { name: { ar: '', en: 'Referenced', fr: '' }, active: true, order: 2 })
await seedService(CLINIC_A, 'gcd-svc-sibling', { name: { ar: '', en: 'Sibling', fr: '' }, active: true, order: 3 })
await seedService(CLINIC_A, 'gcd-svc-other', { name: { ar: '', en: 'Other', fr: '' }, active: true, order: 4 })
await seedService(CLINIC_A, 'gcd-svc-admin', { name: { ar: '', en: 'Admin deleted', fr: '' }, active: true, order: 5 })
await seedService(CLINIC_A, 'gcd-svc-retry', { name: { ar: '', en: 'Retry', fr: '' }, active: true, order: 6 })
await seedService(CLINIC_B, 'gcd-svc-b', { name: { ar: '', en: 'Clinic B service', fr: '' }, active: true, order: 1 })

// A saved (here cancelled) appointment in CLINIC_A blocks deletion of the referenced service.
await seedAppointment(CLINIC_A, 'gcd-appt-ref', {
  clinicId: CLINIC_A, serviceId: 'gcd-svc-referenced', status: 'cancelled', date: '2030-01-01', time: '09:00',
})
// An appointment for another service must not block deleting a different service.
await seedAppointment(CLINIC_A, 'gcd-appt-other', {
  clinicId: CLINIC_A, serviceId: 'gcd-svc-other', status: 'pending', date: '2030-01-02', time: '10:00',
})
// CLINIC_B references the same serviceId value as CLINIC_A's deletable service: the dependency
// check is clinic-scoped, so this must NOT block CLINIC_A deletion.
await seedAppointment(CLINIC_B, 'gcd-appt-b-ref', {
  clinicId: CLINIC_B, serviceId: 'gcd-svc-deletable', status: 'pending', date: '2030-01-03', time: '11:00',
})
await seedAppointment(CLINIC_A, 'gcd-appt-retry', {
  clinicId: CLINIC_A, serviceId: 'gcd-svc-retry', status: 'pending', date: '2030-01-04', time: '12:00',
})

const OWNER_A_TOKEN = await seedIdentity(OWNER_A)
const ADMIN_A_TOKEN = await seedIdentity(ADMIN_A)
const SUSPENDED_A_TOKEN = await seedIdentity(SUSPENDED_A)
const STAFF_A_TOKEN = await seedIdentity(STAFF_A)
const OUTSIDER_TOKEN = await seedIdentity(OUTSIDER)
const OWNER_B_TOKEN = await seedIdentity(OWNER_B)

const validDelete = (overrides = {}) => ({
  clinicId: CLINIC_A,
  serviceId: 'gcd-svc-sibling',
  ...overrides,
})

console.log('✓ Fixtures seeded (clinics 2, memberships 5, services 7, appointments 4, auth users 6)')

console.log('\n--- TEST GROUP 1: deleteClinicService HTTP boundary & authentication ---')
{
  const preflight = await deleteClinicService.handler({ httpMethod: 'OPTIONS' })
  assert.equal(preflight.statusCode, 204)
  assert.equal(preflight.body, '')
  assert.equal(preflight.headers['Access-Control-Allow-Origin'], '*')
  assert.equal(preflight.headers['Access-Control-Allow-Methods'], 'POST, OPTIONS')
  assert.ok(preflight.headers['Access-Control-Allow-Headers'].includes('Authorization'))

  for (const method of ['GET', 'PUT', 'DELETE']) {
    const res = await deleteClinicService.handler({ httpMethod: method })
    assert.equal(res.statusCode, 405, `${method} must be rejected`)
    assert.equal(json(res).error.code, 'invalid-argument')
    assert.equal(json(res).error.message, 'Method Not Allowed. Only POST is supported.')
  }

  const noAuth = await postDelete(validDelete())
  assert.equal(noAuth.statusCode, 401)
  assert.equal(json(noAuth).error.code, 'unauthenticated')
  assert.equal(json(noAuth).error.message, 'Authentication is required.')
  assert.equal(noAuth.headers['Access-Control-Allow-Origin'], '*')

  for (const header of ['Basic 12345', 'Bearer   ', 'Bearer not-a-real-token', 'Token abc', '']) {
    const res = await invoke(deleteClinicService, validDelete(), { authorization: header })
    assert.equal(res.statusCode, 401, `malformed/invalid Authorization "${header}" must map to 401`)
    assert.equal(json(res).error.code, 'unauthenticated')
  }

  // The server is authoritative: an unauthenticated caller can never delete anything.
  assert.equal((await serviceRef(CLINIC_A, 'gcd-svc-sibling').get()).exists, true)

  console.log('✓ OPTIONS 204 + CORS, non-POST 405, missing/malformed/invalid token 401: PASS')
}

console.log('\n--- TEST GROUP 2: deleteClinicService authorization & body spoof resistance ---')
{
  // Authenticated but no membership document
  const outsider = await postDelete(validDelete(), OUTSIDER_TOKEN)
  assert.equal(outsider.statusCode, 403)
  assert.equal(json(outsider).error.code, 'permission-denied')
  assert.equal(json(outsider).error.message, 'Clinic membership was not found.')

  // Inactive membership
  const suspended = await postDelete(validDelete(), SUSPENDED_A_TOKEN)
  assert.equal(suspended.statusCode, 403)
  assert.equal(json(suspended).error.message, 'Active clinic membership is required.')

  // Active membership with a non-authorized role
  const staff = await postDelete(validDelete(), STAFF_A_TOKEN)
  assert.equal(staff.statusCode, 403)
  assert.equal(json(staff).error.message, 'Active clinic membership is required.')

  // Body-supplied authorization claims cannot authorize: membership is evaluated first,
  // so these are rejected as authorization failures, never as accepted claims.
  for (const spoofField of ['platformOwner', 'role', 'uid', 'mustChangePassword']) {
    const spoofed = await postDelete(validDelete({ [spoofField]: 'owner' }), OUTSIDER_TOKEN)
    assert.equal(spoofed.statusCode, 403, `spoofed ${spoofField} must not change authorization`)
    assert.equal(json(spoofed).error.message, 'Clinic membership was not found.')
  }
  // For a genuine member the same claim is rejected by the strict allowlist (input, not authority).
  const allowedMemberSpoof = await postDelete(validDelete({ platformOwner: true }), OWNER_A_TOKEN)
  assert.equal(allowedMemberSpoof.statusCode, 400)
  assert.equal(json(allowedMemberSpoof).error.message, 'Unsupported service deletion field: platformOwner')

  // Clinic scope comes from the verified membership, never from the body clinicId
  const foreignClinic = await postDelete({ clinicId: CLINIC_B, serviceId: 'gcd-svc-b' }, OWNER_A_TOKEN)
  assert.equal(foreignClinic.statusCode, 403)
  assert.equal(json(foreignClinic).error.message, 'The service does not belong to your clinic.')

  const foreignMember = await postDelete(validDelete(), OWNER_B_TOKEN)
  assert.equal(foreignMember.statusCode, 403)
  assert.equal(json(foreignMember).error.message, 'The service does not belong to your clinic.')

  // No rejected request may have deleted anything on either side of the boundary
  assert.deepEqual(await serviceIds(CLINIC_A), [
    'gcd-svc-admin', 'gcd-svc-deletable', 'gcd-svc-other', 'gcd-svc-referenced', 'gcd-svc-retry', 'gcd-svc-sibling',
  ])
  assert.deepEqual(await serviceIds(CLINIC_B), ['gcd-svc-b'])

  console.log('✓ Membership/role/clinic-scope enforcement, spoof rejection, no side effects: PASS')
}


console.log('\n--- TEST GROUP 3: deleteClinicService validation contract ---')
{
  const cases = [
    { label: 'unexpected field', body: validDelete({ hackedRole: 'owner' }), message: 'Unsupported service deletion field: hackedRole' },
    { label: 'missing serviceId', body: { clinicId: CLINIC_A }, message: 'serviceId must be a string.' },
    { label: 'missing clinicId', body: { serviceId: 'gcd-svc-sibling' }, message: 'clinicId must be a string.' },
    { label: 'slash in serviceId', body: validDelete({ serviceId: 'a/b' }), message: 'serviceId is invalid.' },
    { label: 'slash in clinicId', body: validDelete({ clinicId: 'a/b' }), message: 'clinicId is invalid.' },
    { label: 'blank serviceId', body: validDelete({ serviceId: '   ' }), message: 'serviceId is invalid.' },
    { label: 'over-long serviceId', body: validDelete({ serviceId: 'x'.repeat(129) }), message: 'serviceId is invalid.' },
    { label: 'over-long clinicId', body: validDelete({ clinicId: 'x'.repeat(129) }), message: 'clinicId is invalid.' },
    { label: 'non-string clinicId', body: validDelete({ clinicId: 42 }), message: 'clinicId must be a string.' },
    { label: 'non-string serviceId', body: validDelete({ serviceId: { id: 'x' } }), message: 'serviceId must be a string.' },
  ]

  for (const testCase of cases) {
    const res = await postDelete(testCase.body, OWNER_A_TOKEN)
    assert.equal(res.statusCode, 400, `${testCase.label} must be 400 (got ${res.statusCode}: ${res.body})`)
    assert.equal(json(res).error.code, 'invalid-argument')
    assert.equal(json(res).error.message, testCase.message, testCase.label)
  }

  // Transport-level body handling (shared Phase 16A layer)
  const malformed = await invoke(deleteClinicService, '{not-json', bearer(OWNER_A_TOKEN))
  assert.equal(malformed.statusCode, 400)
  assert.equal(json(malformed).error.message, 'Malformed JSON in request body.')

  const arrayBody = await invoke(deleteClinicService, [1, 2, 3], bearer(OWNER_A_TOKEN))
  assert.equal(arrayBody.statusCode, 400)
  assert.equal(json(arrayBody).error.message, 'Request body must be a JSON object.')

  const nullBody = await invoke(deleteClinicService, null, bearer(OWNER_A_TOKEN))
  assert.equal(nullBody.statusCode, 400)
  assert.equal(json(nullBody).error.message, 'Request body must be a JSON object.')

  const emptyBody = await invoke(deleteClinicService, '', bearer(OWNER_A_TOKEN))
  assert.equal(emptyBody.statusCode, 400)
  assert.equal(json(emptyBody).error.message, 'clinicId must be a string.')

  // Documented transport ordering (identical to every other Group B/C/D handler): the JSON body is
  // parsed at the transport boundary before identity is established, so a malformed body is a 400
  // even when unauthenticated. No authorization decision is made by the parse step, and a
  // well-formed unauthenticated request is still rejected with 401 (Group 1).
  const malformedNoAuth = await deleteClinicService.handler({
    httpMethod: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{not-json',
  })
  assert.equal(malformedNoAuth.statusCode, 400)
  assert.equal(json(malformedNoAuth).error.message, 'Malformed JSON in request body.')

  // None of the rejected requests may have deleted anything
  assert.deepEqual(await serviceIds(CLINIC_A), [
    'gcd-svc-admin', 'gcd-svc-deletable', 'gcd-svc-other', 'gcd-svc-referenced', 'gcd-svc-retry', 'gcd-svc-sibling',
  ])

  console.log('✓ Strict allowlist, field validation, malformed body handling, no mutation: PASS')
}

console.log('\n--- TEST GROUP 4: service existence & appointment dependency protection ---')
{
  // 1. Missing service → 404, exact canonical error
  const missing = await postDelete({ clinicId: CLINIC_A, serviceId: 'gcd-svc-missing' }, OWNER_A_TOKEN)
  assert.equal(missing.statusCode, 404)
  assert.equal(json(missing).error.code, 'not-found')
  assert.equal(json(missing).error.message, 'Service was not found.')

  // 2. A saved appointment referencing the service blocks deletion (412), for ANY status:
  //    gcd-appt-ref is a *cancelled* appointment and still protects the service, exactly as the
  //    original callable's unfiltered `where('serviceId', '==', serviceId).limit(1)` query did.
  const referencedRef = serviceRef(CLINIC_A, 'gcd-svc-referenced')
  const appointmentRef = db.collection('clinics').doc(CLINIC_A).collection('appointments').doc('gcd-appt-ref')
  const serviceBefore = await referencedRef.get()
  const appointmentBefore = await appointmentRef.get()

  const blocked = await postDelete({ clinicId: CLINIC_A, serviceId: 'gcd-svc-referenced' }, OWNER_A_TOKEN)
  assert.equal(blocked.statusCode, 412, blocked.body)
  assert.equal(json(blocked).error.code, 'failed-precondition')
  assert.equal(json(blocked).error.message, 'The service is referenced by a saved appointment and cannot be deleted.')

  // 3. The rejected operation must not partially mutate anything
  const serviceAfter = await referencedRef.get()
  assert.equal(serviceAfter.exists, true, 'a rejected deletion must not remove the service')
  assert.deepEqual(serviceAfter.data(), serviceBefore.data(), 'the rejected service must be byte-identical')
  const appointmentAfter = await appointmentRef.get()
  assert.deepEqual(appointmentAfter.data(), appointmentBefore.data(), 'the referencing appointment must be untouched')

  // 4. Retrying the same blocked deletion stays a 412 (no state drift)
  const retried = await postDelete({ clinicId: CLINIC_A, serviceId: 'gcd-svc-referenced' }, OWNER_A_TOKEN)
  assert.equal(retried.statusCode, 412)
  assert.equal(json(retried).error.message, 'The service is referenced by a saved appointment and cannot be deleted.')

  // 5. The dependency check is clinic-scoped: CLINIC_B has a saved appointment whose serviceId
  //    matches CLINIC_A's deletable service, and it must NOT block CLINIC_A deletion.
  const bRefDoc = await db.collection('clinics').doc(CLINIC_B).collection('appointments').doc('gcd-appt-b-ref').get()
  assert.equal(bRefDoc.data().serviceId, 'gcd-svc-deletable', 'fixture: clinic B references that serviceId')

  const deletable = await postDelete({ clinicId: CLINIC_A, serviceId: 'gcd-svc-deletable' }, OWNER_A_TOKEN)
  assert.equal(deletable.statusCode, 200, deletable.body)
  assert.deepEqual(json(deletable), { serviceId: 'gcd-svc-deletable', deleted: true })
  assert.equal((await serviceRef(CLINIC_A, 'gcd-svc-deletable').get()).exists, false)
  const bAppointmentStillThere = await db.collection('clinics').doc(CLINIC_B)
    .collection('appointments').doc('gcd-appt-b-ref').get()
  assert.equal(bAppointmentStillThere.exists, true, 'another clinic appointment must be untouched')

  console.log('✓ 404 missing service, 412 dependency protection (any status), clinic-scoped dependency: PASS')
}

console.log('\n--- TEST GROUP 5: successful deletion semantics & rejection atomicity ---')
{
  const clinicARef = db.collection('clinics').doc(CLINIC_A)

  // 1. An appointment for a DIFFERENT service must not block deletion of an unreferenced service
  const sibling = await postDelete({ clinicId: CLINIC_A, serviceId: 'gcd-svc-sibling' }, OWNER_A_TOKEN)
  assert.equal(sibling.statusCode, 200, sibling.body)
  assert.deepEqual(json(sibling), { serviceId: 'gcd-svc-sibling', deleted: true })
  assert.equal((await serviceRef(CLINIC_A, 'gcd-svc-sibling').get()).exists, false, 'the service document must be gone')
  assert.equal((await clinicARef.collection('appointments').doc('gcd-appt-other').get()).exists, true,
    'unrelated appointments must be untouched')

  // 2. Exactly one document is removed: every other service and appointment survives
  assert.deepEqual(await serviceIds(CLINIC_A), ['gcd-svc-admin', 'gcd-svc-other', 'gcd-svc-referenced', 'gcd-svc-retry'])
  const appointmentIds = (await clinicARef.collection('appointments').get()).docs.map((d) => d.id).sort()
  assert.deepEqual(appointmentIds, ['gcd-appt-other', 'gcd-appt-ref', 'gcd-appt-retry'])

  // 3. Repeating the same deletion is now a 404 (the service no longer exists)
  const again = await postDelete({ clinicId: CLINIC_A, serviceId: 'gcd-svc-sibling' }, OWNER_A_TOKEN)
  assert.equal(again.statusCode, 404)
  assert.equal(json(again).error.message, 'Service was not found.')

  // 4. Active clinic admin passes the same boundary (role parity with the callable)
  const byAdmin = await postDelete({ clinicId: CLINIC_A, serviceId: 'gcd-svc-admin' }, ADMIN_A_TOKEN)
  assert.equal(byAdmin.statusCode, 200, byAdmin.body)
  assert.deepEqual(json(byAdmin), { serviceId: 'gcd-svc-admin', deleted: true })

  // 5. Reject-then-succeed: the blocked attempt leaves the service intact and a later attempt with
  //    no blocker succeeds against that same, unmodified document.
  const retryRef = serviceRef(CLINIC_A, 'gcd-svc-retry')
  const beforeRetry = await retryRef.get()
  const stillBlocked = await postDelete({ clinicId: CLINIC_A, serviceId: 'gcd-svc-retry' }, OWNER_A_TOKEN)
  assert.equal(stillBlocked.statusCode, 412, stillBlocked.body)
  const afterBlocked = await retryRef.get()
  assert.equal(afterBlocked.exists, true)
  assert.deepEqual(afterBlocked.data(), beforeRetry.data(), 'the blocked service must be unchanged')

  await clinicARef.collection('appointments').doc('gcd-appt-retry').delete()
  const afterUnblock = await postDelete({ clinicId: CLINIC_A, serviceId: 'gcd-svc-retry' }, OWNER_A_TOKEN)
  assert.equal(afterUnblock.statusCode, 200, afterUnblock.body)
  assert.deepEqual(json(afterUnblock), { serviceId: 'gcd-svc-retry', deleted: true })
  assert.equal((await retryRef.get()).exists, false)

  console.log('✓ Scoped deletion, sibling preservation, 404 on repeat, admin parity, atomic rejections: PASS')
}

console.log('\n--- TEST GROUP 6: tenant isolation across clinics ---')
{
  const ownerMembershipBefore = await db.collection('users').doc(OWNER_A).get()
  const clinicAServicesBefore = await serviceIds(CLINIC_A)

  // A clinic-B owner cannot delete clinic-A services, and vice versa.
  const bOnA = await postDelete({ clinicId: CLINIC_A, serviceId: 'gcd-svc-other' }, OWNER_B_TOKEN)
  assert.equal(bOnA.statusCode, 403)
  assert.equal(json(bOnA).error.message, 'The service does not belong to your clinic.')

  const aOnB = await postDelete({ clinicId: CLINIC_B, serviceId: 'gcd-svc-b' }, OWNER_A_TOKEN)
  assert.equal(aOnB.statusCode, 403)
  assert.equal(json(aOnB).error.message, 'The service does not belong to your clinic.')

  assert.deepEqual(await serviceIds(CLINIC_A), clinicAServicesBefore, 'clinic A services must be unchanged')
  assert.deepEqual(await serviceIds(CLINIC_B), ['gcd-svc-b'], 'clinic B services must be unchanged')

  // A clinic-B owner CAN delete its own service (the scope check is membership-derived, not global)
  const bOwnDelete = await postDelete({ clinicId: CLINIC_B, serviceId: 'gcd-svc-b' }, OWNER_B_TOKEN)
  assert.equal(bOwnDelete.statusCode, 200, bOwnDelete.body)
  assert.deepEqual(json(bOwnDelete), { serviceId: 'gcd-svc-b', deleted: true })
  assert.deepEqual(await serviceIds(CLINIC_B), [])

  // Service deletion never touches membership documents or another clinic's data
  const ownerMembershipAfter = await db.collection('users').doc(OWNER_A).get()
  assert.deepEqual(ownerMembershipAfter.data(), ownerMembershipBefore.data())
  assert.deepEqual(await serviceIds(CLINIC_A), clinicAServicesBefore)

  console.log('✓ Cross-clinic rejection, self-clinic deletion, membership/clinic isolation: PASS')
}

console.log('\n--- TEST GROUP 7: preserved operation contract (source parity) ---')
{
  const read = (relativePath) => readFileSync(new URL('../' + relativePath, import.meta.url), 'utf8')
  const source = read('netlify/functions/deleteClinicService.js')

  // Authentication + membership are derived from the verified token only
  assert.match(source, /requireAuth\(event\)/)
  assert.match(source, /requireClinicMembership\(decodedToken\)/)
  assert.ok(!source.includes('requirePlatformOwner'), 'service deletion is not a platform-owner operation')

  // Strict allowlist + document-id validation, preserved verbatim
  assert.match(source, /new Set\(\['clinicId', 'serviceId'\]\)/)
  assert.match(source, /'service deletion'/)
  assert.match(source, /requireDocumentId\(data\?\.clinicId, 'clinicId'\)/)
  assert.match(source, /requireDocumentId\(data\?\.serviceId, 'serviceId'\)/)

  // Clinic ownership comes from the verified membership document
  assert.match(source, /membership\.clinicId !== clinicId/)
  assert.match(source, /'The service does not belong to your clinic\.'/)

  // Transactional existence + dependency protection + deletion
  assert.match(source, /db\.runTransaction/)
  assert.match(source, /if \(!serviceSnapshot\.exists\) fail\('not-found', 'Service was not found\.'\)/)
  assert.match(source, /\.where\('serviceId', '==', serviceId\)/)
  assert.match(source, /\.limit\(1\)/)
  assert.match(source, /'The service is referenced by a saved appointment and cannot be deleted\.'/)
  assert.match(source, /transaction\.delete\(serviceRef\)/)

  // Response shape and canonical error envelope
  assert.match(source, /successResponse\(\{ serviceId, deleted: true \}\)/)
  assert.match(source, /return errorResponse\(err\)/)

  // The Firebase implementation this handler replaced was decommissioned in the same milestone.
  // Its absence from functions/index.js is asserted by tests/phase16-netlify-cutover.mjs, which
  // owns the post-decommission contract so that this behavior suite stays transport-neutral.

  console.log('✓ Preserved contract present in the Netlify implementation: PASS')
}

console.log('\n--- CLEANUP ---')
{
  for (const clinicId of [CLINIC_A, CLINIC_B]) {
    for (const collectionName of ['services', 'appointments', 'analyticsEvents', 'analyticsAggregates', 'analyticsVisitors']) {
      const snapshot = await db.collection('clinics').doc(clinicId).collection(collectionName).get()
      for (const document of snapshot.docs) await document.ref.delete()
    }
    await db.collection('clinics').doc(clinicId).delete()
  }

  for (const uid of [OWNER_A, ADMIN_A, SUSPENDED_A, STAFF_A, OUTSIDER, OWNER_B]) {
    await db.collection('users').doc(uid).delete()
    try {
      await authAdmin.deleteUser(uid)
    } catch {
      // Auth record already removed
    }
  }

  console.log('✓ Emulator fixtures removed')
}

console.log('\n========================================')
console.log('ALL PHASE 16B GROUP D TESTS PASS')
console.log('========================================')

