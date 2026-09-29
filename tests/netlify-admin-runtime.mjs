// Tests for the Phase 16B Blocker Repair: Netlify Firebase Admin runtime.
//
// Proves the declared dependency graph end-to-end:
//   resolution (12A) -> initialization (12B) -> Firestore emulator connectivity (12C)
//   -> Group A functions load against the repaired shared layer (Section 14).
//
// Re-uses Group B's established emulator mechanism: if FIRESTORE_EMULATOR_HOST is
// not set, this file relaunches itself under `firebase emulators:exec`.

import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { execSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const require = createRequire(import.meta.url)
const repoRoot = path.dirname(fileURLToPath(new URL('../package.json', import.meta.url)))

if (!process.env.FIRESTORE_EMULATOR_HOST) {
  console.log('Re-launching under Firestore Emulator...')
  try {
    execSync(
      'firebase emulators:exec --only firestore --project demo-vetlife-poc "node tests/netlify-admin-runtime.mjs"',
      { stdio: 'inherit', env: { ...process.env } },
    )
    process.exit(0)
  } catch (err) {
    process.exit(err.status === null || err.status === undefined ? 1 : err.status)
  }
}

console.log('--- TEST 1: Firebase Admin package resolution from Netlify function context ---')
{
  const resolved = require.resolve('firebase-admin', {
    paths: [path.join(repoRoot, 'netlify', 'functions', 'lib')],
  })
  console.log('  resolved:', resolved)

  // Normalize separators so the assertions hold on Windows and POSIX alike.
  const normalized = resolved.split(path.sep).join('/')

  // Must resolve from the declared root dependency graph...
  assert.ok(
    normalized.includes('node_modules/firebase-admin/'),
    'must resolve firebase-admin from the root node_modules',
  )
  // ...and NEVER from functions/node_modules (Firebase Functions' private tree).
  assert.ok(
    !normalized.includes('functions/node_modules/'),
    'must not resolve from functions/node_modules',
  )

  // Read installed version directly next to the resolved entry point.
  const fs = require('fs')
  const version = JSON.parse(
    fs.readFileSync(path.join(path.dirname(resolved), '..', 'package.json'), 'utf8'),
  ).version
  console.log('  version:', version)
  assert.match(version, /^13\./, 'must be the declared firebase-admin 13.x line')
  console.log('✓ Package resolution: PASS')
}

console.log('\n--- TEST 2: Shared Firebase Admin initialization (real path, no auth gate) ---')
{
  const { admin, getAdminApp, getAuthAdmin, getFirestoreAdmin } =
    require('../netlify/functions/lib/firebaseAdmin.js')

  // Real initialization path — this is the exact call that crashed with the stray 14.x.
  const app = getAdminApp()
  assert.ok(app, 'getAdminApp() must return an app')
  assert.ok(Array.isArray(admin.apps), 'legacy admin.apps must be an array')
  assert.ok(admin.apps.length >= 1, 'legacy admin.apps must contain the initialized app')

  // Legacy namespace API required by the frozen Phase 16A helper.
  assert.equal(typeof admin.credential.cert, 'function')
  assert.equal(typeof admin.auth, 'function')
  assert.equal(typeof admin.firestore, 'function')

  // Singleton: warm invocations must reuse the same app instance.
  const again = getAdminApp()
  assert.strictEqual(again, app, 'getAdminApp() must reuse the initialized app')

  const authAdmin = getAuthAdmin()
  assert.equal(typeof authAdmin.verifyIdToken, 'function')

  const db = getFirestoreAdmin()
  assert.equal(typeof db.collection, 'function')
  assert.equal(typeof db.runTransaction, 'function')

  console.log('✓ Shared initialization + singleton reuse + legacy API surface: PASS')
}

console.log('\n--- TEST 3: Firestore emulator connectivity via getFirestoreAdmin ---')
{
  const { getFirestoreAdmin } = require('../netlify/functions/lib/firebaseAdmin.js')
  const db = getFirestoreAdmin()
  const docRef = db.collection('poc-admin-runtime').doc(`smoke-${Date.now()}`)

  await docRef.set({ kind: 'blocker-repair-smoke', createdAt: new Date().toISOString() })
  const snap = await docRef.get()
  assert.equal(snap.exists, true, 'written doc must be readable back')
  assert.equal(snap.data().kind, 'blocker-repair-smoke')
  await docRef.delete()
  const after = await docRef.get()
  assert.equal(after.exists, false, 'cleanup must remove the doc')

  console.log('✓ Real Firestore write/read/delete through shared layer: PASS')
}

console.log('\n--- TEST 4: Group A functions load against the repaired shared layer ---')
{
  const provisionClinic = require('../netlify/functions/provisionClinic.js')
  const listProvisionedClinics = require('../netlify/functions/listProvisionedClinics.js')

  // Module loading succeeds (proves the firebase-admin require chain resolves).
  assert.equal(typeof provisionClinic.handler, 'function')
  assert.equal(typeof listProvisionedClinics.handler, 'function')

  // Minimal execution smoke through the shared auth/HTTP layer.
  const pre = await listProvisionedClinics.handler({ httpMethod: 'OPTIONS' })
  assert.equal(pre.statusCode, 204)
  const unauth = await listProvisionedClinics.handler({ httpMethod: 'POST', headers: {} })
  assert.equal(unauth.statusCode, 401)
  assert.equal(JSON.parse(unauth.body).error.code, 'unauthenticated')

  const pre2 = await provisionClinic.handler({ httpMethod: 'OPTIONS' })
  assert.equal(pre2.statusCode, 204)
  const unauth2 = await provisionClinic.handler({ httpMethod: 'POST', headers: {} })
  assert.equal(unauth2.statusCode, 401)

  console.log('✓ Group A handlers load + execute through repaired layer: PASS')
}

console.log('\n========================================')
console.log('NETLIFY FIREBASE ADMIN RUNTIME REPAIR: ALL TESTS PASS')
console.log('========================================')

