// Password-setup ordering contract for completeClinicPasswordSetup (P08 repaired).
//
// P08 ROOT CAUSE (proven by a production read-only probe, and re-proven in the Auth emulator):
// neither surface exposes credential material in production. firebase-admin maps the Identity
// Toolkit redaction sentinel (base64 of "REDACTED", 12 chars) to `passwordHash: undefined`, and
// `passwordUpdatedAt` is not mapped by the SDK at all. The previous digest architecture
// (passwordSetupHashDigest = SHA-256(initial passwordHash)) therefore could never observe a
// change in production and answered 412 forever (P0-B1), while provisioning failed closed with
// HTTP 500 whenever the same read returned empty (P0-B2).
//
// P08 REPAIR: the production-available signal is `tokensValidAfterTime` (Auth `validSince`),
// compared against the provisioning baseline `passwordSetupIssuedAt`. The marker advances when
// the credential rotates and does NOT advance on an ordinary sign-in (both verified).
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
record('--- GROUP 1: real provisioning stamps mustChangePassword=true plus the completion baseline ---')
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

  // The retired digest verifier must NOT be stored any more: it depended on a credential
  // signal (passwordHash) that production redacts, which is what made P0-B2 fail closed.
  assert.equal('passwordSetupHashDigest' in firstMembership, false,
    'passwordSetupHashDigest must no longer be written by provisioning')

  // The production-available signal, recorded as safe metadata only.
  const ownerRecord = await authAdmin.getUser(first.ownerUid)
  const marker = ownerRecord.tokensValidAfterTime
  const markerMs = marker ? (typeof marker === 'number' ? marker : Date.parse(marker)) : NaN
  assert.ok(Number.isFinite(markerMs), 'tokensValidAfterTime must be a parseable marker for the comparison')
  assert.ok(markerMs <= anchor + 2000,
    'the Auth marker must not already exceed the provisioning baseline before any change')

  record('[PASS] real provisioning stores mustChangePassword=true, a positive baseline anchor, and no digest verifier')
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

  // Body-supplied state must never influence the guard: flags, markers and timestamps alike.
  // The marker value itself is not accepted from a client under any spelling.
  const spoofed = await complete({
    mustChangePassword: false,
    passwordUpdatedAt: '2999-01-01T00:00:00.000Z',
    passwordSetupHashDigest: '0'.repeat(64),
    passwordChanged: true,
    passwordSetupIssuedAt: 1,
    tokensValidAfterTime: '2999-01-01T00:00:00.000Z',
    uid: 'someone-else',
    clinicId: 'other-clinic',
  }, ownerToken)
  assert.equal(spoofed.statusCode, 412, spoofed.body)
  assert.deepEqual((await firstRef.get()).data(), snapshotBefore, 'a spoofed body must not write anything')
  record('[PASS] pre-change completion is 412; neither the real nor the spoofed call wrote to Firestore')
}

record('')
record('--- GROUP 3: REAL Auth password update -> token marker advances -> completion -> 200 ---')
{
  const email = 'ordering-owner-one@pso.test'
  const temporarySignIn = await signInWithPassword(email, 'Temporary-Password-111!')
  assert.equal(temporarySignIn.status, 200, 'the temporary password must work before the change')

  // The Auth marker has ONE-SECOND granularity: a rotation inside the same wall-clock second
  // as account creation is indistinguishable from "unchanged". Cross a second boundary first,
  // exactly as a real owner does (they cannot type a password within one second).
  await new Promise((r) => setTimeout(r, 1500))

  await authAdmin.updateUser(first.ownerUid, { password: 'Permanent-Password-222!' })

  const staleSignIn = await signInWithPassword(email, 'Temporary-Password-111!')
  assert.equal(staleSignIn.status, 400, `the temporary password must stop working: ${JSON.stringify(staleSignIn.body)}`)
  const freshSignIn = await signInWithPassword(email, 'Permanent-Password-222!')
  assert.equal(freshSignIn.status, 200, 'the permanent password must work after the change')
  assert.ok(freshSignIn.body.idToken, 'a real sign-in must return a fresh ID token')

  // The credential actually rotated, AND the production proof signal advanced past baseline.
  const rotated = await authAdmin.getUser(first.ownerUid)
  const rotatedMarker = rotated.tokensValidAfterTime
  const rotatedMarkerMs = rotatedMarker ? (typeof rotatedMarker === 'number' ? rotatedMarker : Date.parse(rotatedMarker)) : NaN
  assert.ok(Number.isFinite(rotatedMarkerMs), 'tokensValidAfterTime must remain parseable after the change')
  assert.ok(rotatedMarkerMs > anchor,
    `tokensValidAfterTime (${new Date(rotatedMarkerMs).toISOString()}) must be strictly greater than ` +
    `passwordSetupIssuedAt (${new Date(anchor).toISOString()}) after a real rotation`)

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
  assert.equal(completed.passwordSetupIssuedAt, snapshotBefore.passwordSetupIssuedAt,
    'the baseline must be preserved on completion')

  record('[PASS] real password change independently proven: temporary fails 400, permanent succeeds 200')
  record('[PASS] tokensValidAfterTime advanced beyond passwordSetupIssuedAt after the real change')
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
record('--- GROUP 5: fail-closed - an unusable baseline or an unadvanced marker never completes ---')
{
  const second = await provision('pso-ordering-two', 'ordering-owner-two@pso.test', 'Temporary-Password-333!')
  const secondRef = db.collection('users').doc(second.ownerUid)
  const secondToken = await mintIdToken(second.ownerUid)

  // 5a. Missing baseline: the guard must refuse rather than trust an unverifiable state.
  await secondRef.update({ passwordSetupIssuedAt: FieldValue.delete() })
  const missing = await complete({}, secondToken)
  assert.equal(missing.statusCode, 412, missing.body)
  assert.equal(json(missing).error.code, 'failed-precondition')
  assert.equal((await secondRef.get()).data().mustChangePassword, true, 'a missing baseline must stay pending')
  record('[PASS] a missing passwordSetupIssuedAt is 412 with no completion')

  // 5b. A non-numeric baseline is equally unverifiable and must fail closed.
  await secondRef.update({ passwordSetupIssuedAt: 'not-a-number' })
  const invalid = await complete({}, secondToken)
  assert.equal(invalid.statusCode, 412, invalid.body)
  assert.equal((await secondRef.get()).data().mustChangePassword, true, 'an invalid baseline must stay pending')
  record('[PASS] a non-numeric passwordSetupIssuedAt is 412 with no completion')

  // 5c. The password was never rotated on this account, so the marker is NOT beyond the
  //     baseline. No credential is changed and no fake "advanced" marker is ever created:
  //     the guard must stay closed purely on the real comparison.
  const secondMarker = (await authAdmin.getUser(second.ownerUid)).tokensValidAfterTime
  const secondMarkerMs = secondMarker ? (typeof secondMarker === 'number' ? secondMarker : Date.parse(secondMarker)) : NaN
  await secondRef.update({ passwordSetupIssuedAt: Math.max(anchor, secondMarkerMs) + 60_000 })
  const notAdvanced = await complete({}, secondToken)
  assert.equal(notAdvanced.statusCode, 412, notAdvanced.body)
  assert.equal(json(notAdvanced).error.code, 'failed-precondition')
  const pendingAfter = (await secondRef.get()).data()
  assert.equal(pendingAfter.mustChangePassword, true, 'a marker that has not advanced must stay pending')
  assert.equal(pendingAfter.passwordSetupCompletedAt, undefined, 'no completion timestamp may be written')
  record('[PASS] a marker that has not advanced beyond the baseline is 412 with no completion')
}

record('')
record('SUITE VERDICT: PASS (P08 repaired: real provision -> real password change -> 200)')
record(`finished: ${new Date().toISOString()}`)
writeFileSync(OUT_FILE, `${evidence.join('\n')}\n`)

console.log('\n========================================')
console.log('PASSWORD SETUP ORDERING TESTS PASS')
console.log('========================================')
