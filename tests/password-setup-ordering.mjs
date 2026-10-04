// Password-setup ordering contract for completeClinicPasswordSetup (P08 repaired).
//
// P08 ROOT CAUSE (proven by narrow Auth-emulator probe, demo-vetlife-p08-probe):
// firebase-admin@13.10.0 UserRecord does NOT expose passwordUpdatedAt, so the old guard
// always evaluated to 0 and completion ALWAYS answered 412. P08 repair: server-side
// credential-inequality via passwordSetupHashDigest = SHA-256(initial passwordHash).
// tokensValidAfterTime is diagnostic only (probe: UNCHANGED across password update).
// No plaintext, hash, digest, token or credential is ever printed by this suite.

import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { execSync } from 'node:child_process'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import os from 'node:os'
import path from 'node:path'

const require = createRequire(import.meta.url)
const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(SCRIPT_DIR, '..')
const OUT_FILE = path.join(REPO_ROOT, 'docs', 'evidence', 'password-setup-ordering-evidence.txt')
const PROJECT_ID = 'demo-vetlife-pso'
const FIRESTORE_PORT = 8086
const AUTH_PORT = 9096

const IN_EMULATORS = Boolean(process.env.FIRESTORE_EMULATOR_HOST && process.env.FIREBASE_AUTH_EMULATOR_HOST)

if (!IN_EMULATORS) {
  console.log('Re-launching the password-setup ordering suite under Firestore + Auth Emulators...')
  const configPath = path.join(os.tmpdir(), 'vlife-password-setup-ordering.json')
  writeFileSync(configPath, JSON.stringify({
    emulators: {
      firestore: { host: '127.0.0.1', port: FIRESTORE_PORT },
      auth: { host: '127.0.0.1', port: AUTH_PORT },
      hub: { host: '127.0.0.1', port: 4400 },
      logging: { host: '127.0.0.1', port: 4500 },
      ui: { enabled: false },
      singleProjectMode: true,
    },
  }, null, 2))
  // Tracked only through docs/evidence/README.md, so create the directory defensively: a
  // fresh checkout must not fail evidence capture with ENOENT before the emulators start.
  mkdirSync(path.dirname(OUT_FILE), { recursive: true })
  writeFileSync(OUT_FILE, '')

  try {
    const captured = execSync(
      `firebase emulators:exec --only firestore,auth --project ${PROJECT_ID} --config "${configPath}" "node tests/password-setup-ordering.mjs"`,
      { encoding: 'utf8' },
    )
    process.stdout.write(captured)
    process.exit(0)
  } catch (err) {
    const stdout = err.stdout || ''
    const stderr = err.stderr || ''
    process.stdout.write(stdout)
    process.stderr.write(stderr)
    writeFileSync(
      OUT_FILE,
      `FATAL: the password-setup ordering suite failed.\n\n${(stdout + stderr).slice(-4000)}\n`,
    )
    process.exit(err.status === null || err.status === undefined ? 1 : err.status)
  }
}

const provisionClinic = require('../netlify/functions/provisionClinic.js')
const completeClinicPasswordSetup = require('../netlify/functions/completeClinicPasswordSetup.js')
const { getFirestoreAdmin, getAuthAdmin } = require('../netlify/functions/lib/firebaseAdmin.js')
const { FieldValue } = require('firebase-admin/firestore')

const db = getFirestoreAdmin()
const authAdmin = getAuthAdmin()
const authEmulatorHost = process.env.FIREBASE_AUTH_EMULATOR_HOST
const sdkVersion = (() => {
  try {
    const entry = require.resolve('firebase-admin')
    return JSON.parse(readFileSync(path.join(path.dirname(entry), '..', 'package.json'), 'utf8')).version
  } catch {
    return 'unknown'
  }
})()

const evidence = []
const record = (line) => {
  evidence.push(line)
  console.log(line)
}

const invoke = (mod, body, token) => mod.handler({
  httpMethod: 'POST',
  headers: { 'Content-Type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
  body: typeof body === 'string' ? body : JSON.stringify(body ?? {}),
})

const json = (res) => JSON.parse(res.body)
const complete = (body, token) => invoke(completeClinicPasswordSetup, body, token)

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
  assert.ok(payload.idToken, `the Auth Emulator must issue an ID token for ${uid}: ${JSON.stringify(payload)}`)
  return payload.idToken
}

const signInWithPassword = async (email, password) => {
  const response = await fetch(
    `http://${authEmulatorHost}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=fake-api-key`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    },
  )
  return { status: response.status, body: await response.json() }
}

record(`password-setup ordering suite (P08 repaired) :: firebase-admin ${sdkVersion} :: project ${PROJECT_ID}`)
record(`started: ${new Date().toISOString()}`)

record('')
record('--- SEEDING: real platform owner identity ---')
const PLATFORM_OWNER = 'pso-platform-owner'
try {
  await authAdmin.deleteUser(PLATFORM_OWNER)
} catch {
  // first run in this emulator
}
await authAdmin.createUser({
  uid: PLATFORM_OWNER,
  email: 'platform-owner@pso.test',
  password: 'Platform-Owner-Password-123!',
})
await authAdmin.setCustomUserClaims(PLATFORM_OWNER, { platformOwner: true })
const platformToken = await mintIdToken(PLATFORM_OWNER)
const platformDecoded = await authAdmin.verifyIdToken(platformToken)
assert.equal(platformDecoded.platformOwner, true, 'the platformOwner custom claim must survive into the ID token')
record('[PASS] platformOwner claim verified from a real emulator ID token')

const provision = async (slug, ownerEmail, temporaryPassword) => {
  const res = await invoke(provisionClinic, {
    name: { ar: 'عيادة التحقق', en: 'Ordering verification clinic', fr: 'Clinique de verification' },
    slug,
    ownerEmail,
    temporaryPassword,
    public: true,
  }, platformToken)
  assert.equal(res.statusCode, 200, `provisionClinic(${slug}) must succeed: ${res.body}`)
  return json(res)
}

record('')
record('--- GROUP 1: real provisioning stamps mustChangePassword=true plus a digest verifier ---')
const first = await provision('pso-ordering-one', 'ordering-owner-one@pso.test', 'Temporary-Password-111!')
const firstRef = db.collection('users').doc(first.ownerUid)
const firstMembership = (await firstRef.get()).data()
const anchor = firstMembership.passwordSetupIssuedAt
{
  assert.equal(firstMembership.uid, first.ownerUid)
  assert.equal(firstMembership.clinicId, first.clinicId)
  assert.equal(firstMembership.role, 'owner')
  assert.equal(firstMembership.status, 'active')
  assert.equal(firstMembership.mustChangePassword, true)

  assert.equal(typeof anchor, 'number', 'passwordSetupIssuedAt must be a number')
  assert.ok(Number.isFinite(anchor) && anchor > 0, 'the real provisioning path must store a positive epoch anchor')

  const digest = firstMembership.passwordSetupHashDigest
  assert.equal(typeof digest, 'string', 'passwordSetupHashDigest must be stored')
  assert.match(digest, /^[0-9a-f]{64}$/, 'the digest must be a SHA-256 hex string')

  const ownerRecord = await authAdmin.getUser(first.ownerUid)
  assert.equal(ownerRecord.passwordUpdatedAt, undefined, 'passwordUpdatedAt stays absent (retired signal)')
  assert.ok(typeof ownerRecord.passwordHash === 'string' && ownerRecord.passwordHash.length > 0,
    'the Admin SDK must expose the live passwordHash for the server-side comparison')

  record('[PASS] real provisioning stores mustChangePassword=true, positive anchor, SHA-256 digest verifier')
}

record('')
record('--- GROUP 2: completing BEFORE the permanent password change is rejected, and writes nothing ---')
const ownerToken = await mintIdToken(first.ownerUid)
{
  const snapshotBefore = (await firstRef.get()).data()
  const before = await complete({}, ownerToken)
  assert.equal(before.statusCode, 412, before.body)
  assert.equal(json(before).error.code, 'failed-precondition')
  assert.equal(json(before).error.message, 'The permanent password has not been changed yet.')
  assert.deepEqual((await firstRef.get()).data(), snapshotBefore, 'a rejected request must not write anything')

  // Body-supplied state must never influence the guard: flags, digests and timestamps alike.
  const spoofed = await complete({ mustChangePassword: false, passwordUpdatedAt: '2999-01-01T00:00:00.000Z', passwordSetupHashDigest: '0'.repeat(64), passwordChanged: true }, ownerToken)
  assert.equal(spoofed.statusCode, 412, spoofed.body)
  assert.deepEqual((await firstRef.get()).data(), snapshotBefore, 'a spoofed body must not write anything')
  record('[PASS] pre-change completion is 412; neither the real nor the spoofed call wrote to Firestore')
}

record('')
record('--- GROUP 3: REAL Auth password update -> fresh sign-in token -> completion -> 200 ---')
{
  const email = 'ordering-owner-one@pso.test'
  const temporarySignIn = await signInWithPassword(email, 'Temporary-Password-111!')
  assert.equal(temporarySignIn.status, 200, 'the temporary password must work before the change')

  await authAdmin.updateUser(first.ownerUid, { password: 'Permanent-Password-222!' })

  const staleSignIn = await signInWithPassword(email, 'Temporary-Password-111!')
  assert.equal(staleSignIn.status, 400, `the temporary password must stop working: ${JSON.stringify(staleSignIn.body)}`)
  const freshSignIn = await signInWithPassword(email, 'Permanent-Password-222!')
  assert.equal(freshSignIn.status, 200, 'the permanent password must work after the change')
  assert.ok(freshSignIn.body.idToken, 'a real sign-in must return a fresh ID token')

  const freshToken = freshSignIn.body.idToken
  const snapshotBefore = (await firstRef.get()).data()
  const after = await complete({}, freshToken)
  assert.equal(after.statusCode, 200, `completion must succeed after a proven change: ${after.body}`)
  assert.deepEqual(json(after), { completed: true })
  const completed = (await firstRef.get()).data()
  assert.equal(completed.mustChangePassword, false, 'mustChangePassword must flip to false')
  assert.ok(completed.passwordSetupCompletedAt, 'passwordSetupCompletedAt must be written on completion')
  assert.ok(completed.updatedAt, 'updatedAt must be written on completion')
  assert.equal(completed.clinicId, snapshotBefore.clinicId, 'unrelated membership fields must be preserved')
  assert.equal(completed.role, 'owner')
  assert.equal(completed.passwordSetupHashDigest, snapshotBefore.passwordSetupHashDigest,
    'the stored digest must be preserved on completion')

  record('[PASS] real password change independently proven: temporary fails 400, permanent succeeds 200')
  record('[PASS] completion after the proven change is 200 with mustChangePassword=false')
}

record('')
record('--- GROUP 4: idempotent repeat after completion writes nothing further ---')
{
  const completedBefore = (await firstRef.get()).data()
  const repeatToken = await mintIdToken(first.ownerUid)
  const repeat = await complete({}, repeatToken)
  assert.equal(repeat.statusCode, 200, repeat.body)
  assert.deepEqual(json(repeat), { completed: true })
  assert.deepEqual((await firstRef.get()).data(), completedBefore, 'the idempotent path must not write')
  record('[PASS] repeat completion is 200 with no further write')
}

record('')
record('--- GROUP 5: fail-closed - a missing digest never completes ---')
{
  const second = await provision('pso-ordering-two', 'ordering-owner-two@pso.test', 'Temporary-Password-333!')
  const secondRef = db.collection('users').doc(second.ownerUid)
  const secondToken = await mintIdToken(second.ownerUid)

  await secondRef.update({ passwordSetupHashDigest: FieldValue.delete() })
  const missing = await complete({}, secondToken)
  assert.equal(missing.statusCode, 412, missing.body)
  assert.equal(json(missing).error.code, 'failed-precondition')
  assert.equal((await secondRef.get()).data().mustChangePassword, true, 'a missing digest must stay pending')
  record('[PASS] a missing passwordSetupHashDigest is 412 with no completion')
}

record('')
record('SUITE VERDICT: PASS (P08 repaired: real provision -> real password change -> 200)')
record(`finished: ${new Date().toISOString()}`)
writeFileSync(OUT_FILE, `${evidence.join('\n')}\n`)

console.log('\n========================================')
console.log('PASSWORD SETUP ORDERING TESTS PASS')
console.log('========================================')
