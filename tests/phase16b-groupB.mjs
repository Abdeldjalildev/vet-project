// Tests for Phase 16B Group B: createPublicAppointment (public Netlify endpoint)
//
// Part 1: HTTP boundary + validation contract (no Firestore required).
// Part 2: Behavioral contract against a real Firestore Emulator.
//         If FIRESTORE_EMULATOR_HOST is not set, this file re-executes itself
//         under `firebase emulators:exec` so the behavior tests always run
//         against real Firestore transaction semantics.

import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { execSync } from 'node:child_process'

const require = createRequire(import.meta.url)

const IN_EMULATOR = Boolean(process.env.FIRESTORE_EMULATOR_HOST)

if (!IN_EMULATOR) {
  console.log('Re-launching under Firestore Emulator for behavioral tests...')
  try {
    execSync(
      'firebase emulators:exec --only firestore --project demo-vetlife-poc "node tests/phase16b-groupB.mjs"',
      {
        stdio: 'inherit',
        env: { ...process.env, PHASE16B_GROUPB_CHILD: '1' },
      },
    )
    process.exit(0)
  } catch (err) {
    process.exit(err.status === null || err.status === undefined ? 1 : err.status)
  }
}

const createPublicAppointment = require('../netlify/functions/createPublicAppointment.js')

const post = (body, headers = {}) => {
  const payload = typeof body === 'string' ? body : JSON.stringify(body)
  return createPublicAppointment.handler({
    httpMethod: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: payload,
  })
}

const validBooking = (overrides = {}) => ({
  clinicId: 'gbc-clinic',
  petName: 'Rex',
  petType: 'dog',
  ownerName: 'Test Owner',
  ownerPhone: '0550123456',
  ownerEmail: 'owner@example.com',
  serviceId: 'svc-1',
  date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
  time: '10:00',
  notes: '',
  ...overrides,
})

console.log('--- TEST GROUP 1: HTTP Boundary ---')
{
  const preflight = await createPublicAppointment.handler({ httpMethod: 'OPTIONS' })
  assert.equal(preflight.statusCode, 204)
  assert.equal(preflight.body, '')
  assert.equal(preflight.headers['Access-Control-Allow-Origin'], '*')
  assert.equal(preflight.headers['Access-Control-Allow-Methods'], 'POST, OPTIONS')

  const get = await createPublicAppointment.handler({ httpMethod: 'GET' })
  assert.equal(get.statusCode, 405)
  const getBody = JSON.parse(get.body)
  assert.equal(getBody.error.code, 'invalid-argument')

  const put = await createPublicAppointment.handler({ httpMethod: 'PUT' })
  assert.equal(put.statusCode, 405)

  console.log('✓ OPTIONS 204 + CORS, non-POST 405: PASS')
}

console.log('\n--- TEST GROUP 2: Public Access (no authentication required) ---')
{
  // No Authorization header. The endpoint is public, so it must NOT return 401;
  // it must reach business validation and return a validation error instead.
  const res = await post({ clinicId: 'gbc-clinic' })
  assert.notEqual(res.statusCode, 401)
  assert.equal(res.statusCode, 400)
  const body = JSON.parse(res.body)
  assert.equal(body.error.code, 'invalid-argument')

  console.log('✓ Public endpoint does not require Authorization: PASS')
}


console.log('\n--- TEST GROUP 3: Input Validation Contract (preserved from callable) ---')
{
  // Missing required fields
  const missing = await post(validBooking({ petName: '' }))
  assert.equal(missing.statusCode, 400)
  assert.equal(JSON.parse(missing.body).error.code, 'invalid-argument')

  // Unexpected/extra field rejected by strict allowlist
  const extra = await post(validBooking({ platformOwner: true }))
  assert.equal(extra.statusCode, 400)
  assert.equal(
    JSON.parse(extra.body).error.message,
    'Unsupported booking field: platformOwner',
  )

  // Invalid petType
  const petType = await post(validBooking({ petType: 'dragon' }))
  assert.equal(petType.statusCode, 400)
  assert.equal(JSON.parse(petType.body).error.message, 'petType is invalid.')

  // Past date rejected
  const past = await post(validBooking({ date: '2020-01-01' }))
  assert.equal(past.statusCode, 400)
  assert.equal(JSON.parse(past.body).error.message, 'Appointments cannot be booked in the past.')

  // Malformed time rejected
  const time = await post(validBooking({ time: '25:99' }))
  assert.equal(time.statusCode, 400)
  assert.equal(JSON.parse(time.body).error.message, 'time must use HH:MM.')

  // Non-object payload rejected by the frozen Phase 16A shared parser
  // (canonical code/status preserved: invalid-argument / 400)
  const arrayPayload = await post('[1,2,3]')
  assert.equal(arrayPayload.statusCode, 400)
  assert.equal(JSON.parse(arrayPayload.body).error.code, 'invalid-argument')

  // Malformed JSON body rejected
  const malformed = await post('{not-json')
  assert.equal(malformed.statusCode, 400)
  assert.equal(JSON.parse(malformed.body).error.code, 'invalid-argument')

  // Body-supplied claims are never trusted (rejected by allowlist)
  const spoof = await post(validBooking({ role: 'admin' }))
  assert.equal(spoof.statusCode, 400)

  console.log('✓ Validation, allowlist, and spoof rejection: PASS')
}


console.log('\n--- TEST GROUP 4: Business Behavior against real Firestore Emulator ---')
{
  const { getFirestoreAdmin } = require('../netlify/functions/lib/firebaseAdmin.js')
  const db = getFirestoreAdmin()
  const suffix = Date.now().toString(36)
  const publicClinic = `gbc-pub-${suffix}`
  const privateClinic = `gbc-priv-${suffix}`
  const date = new Date(Date.now() + 86400000).toISOString().slice(0, 10)

  const localized = { ar: 'x', en: 'x', fr: 'x' }
  await db.collection('clinics').doc(publicClinic).set({
    slug: publicClinic, public: true, active: true, name: localized,
  })
  await db.collection('clinics').doc(publicClinic).collection('services').doc('svc-1').set({
    name: localized, description: localized, icon: 'stethoscope',
    price: 2500, currency: 'DZD', order: 1, active: true,
  })
  await db.collection('clinics').doc(publicClinic).collection('services').doc('svc-off').set({
    name: localized, description: localized, icon: 'stethoscope',
    price: 1000, currency: 'DZD', order: 2, active: false,
  })
  await db.collection('clinics').doc(privateClinic).set({
    slug: privateClinic, public: false, active: true, name: localized,
  })

  // 1. Successful creation → 200 { appointmentId, status: 'pending' }
  const ok = await post(validBooking({ clinicId: publicClinic, date, time: '10:00' }))
  assert.equal(ok.statusCode, 200, ok.body)
  const okBody = JSON.parse(ok.body)
  assert.equal(okBody.status, 'pending')
  assert.equal(typeof okBody.appointmentId, 'string')
  assert.ok(okBody.appointmentId.length > 0)

  // Persisted document fields (status, snapshot values, timestamps)
  const doc = await db.collection('clinics').doc(publicClinic)
    .collection('appointments').doc(okBody.appointmentId).get()
  assert.equal(doc.exists, true)
  const d = doc.data()
  assert.equal(d.status, 'pending')
  assert.equal(d.clinicId, publicClinic)
  assert.equal(d.serviceId, 'svc-1')
  assert.equal(d.estimatedServiceValue, 2500)
  assert.equal(d.serviceCurrency, 'DZD')
  assert.equal(d.petType, 'dog')
  assert.ok(d.createdAt, 'createdAt timestamp must be present')
  assert.ok(d.updatedAt, 'updatedAt timestamp must be present')

  // 2. Collision on same slot → 409 already-exists
  const collision = await post(validBooking({ clinicId: publicClinic, date, time: '10:00' }))
  assert.equal(collision.statusCode, 409)
  const collisionBody = JSON.parse(collision.body)
  assert.equal(collisionBody.error.code, 'already-exists')
  assert.equal(collisionBody.error.message, 'The selected appointment time is no longer available.')


  // 3. Missing clinic → 404 not-found
  const missingClinic = await post(validBooking({ clinicId: `gbc-none-${suffix}`, date, time: '11:00' }))
  assert.equal(missingClinic.statusCode, 404)
  assert.equal(JSON.parse(missingClinic.body).error.code, 'not-found')

  // 4. Non-public clinic → 412 failed-precondition
  const privateRes = await post(validBooking({ clinicId: privateClinic, date, time: '11:00' }))
  assert.equal(privateRes.statusCode, 412)
  assert.equal(
    JSON.parse(privateRes.body).error.message,
    'Clinic is not accepting public bookings.',
  )

  // 5. Inactive service → 412 failed-precondition
  const inactive = await post(validBooking({ clinicId: publicClinic, serviceId: 'svc-off', date, time: '12:00' }))
  assert.equal(inactive.statusCode, 412)
  assert.equal(JSON.parse(inactive.body).error.message, 'Selected service is not available.')

  // 6. Missing service → 412 failed-precondition
  const noService = await post(validBooking({ clinicId: publicClinic, serviceId: 'svc-missing', date, time: '13:00' }))
  assert.equal(noService.statusCode, 412)
  assert.equal(JSON.parse(noService.body).error.message, 'Selected service is not available.')

  // 7. Failed attempts must not create appointment documents (atomicity preserved)
  const apptSnapshot = await db.collection('clinics').doc(publicClinic)
    .collection('appointments').get()
  assert.equal(apptSnapshot.size, 1, 'only the single successful booking may exist')

  // Cleanup seeded emulator data
  for (const docSnap of apptSnapshot.docs) await docSnap.ref.delete()
  for (const svcId of ['svc-1', 'svc-off']) {
    await db.collection('clinics').doc(publicClinic).collection('services').doc(svcId).delete()
  }
  await db.collection('clinics').doc(publicClinic).delete()
  await db.collection('clinics').doc(privateClinic).delete()

  console.log('✓ Success creation, collision, clinic/service state, atomicity: PASS')
}

console.log('\n========================================')
console.log('ALL PHASE 16B GROUP B TESTS PASS')
console.log('========================================')

