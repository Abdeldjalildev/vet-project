// Phase 16 cutover verification: Firebase callables -> Netlify Functions.
//
// This suite owns the *post-migration repository contract* for the seven trusted operations:
//
//   1. the Netlify implementation exists for every operation
//   2. every production caller reaches the Netlify endpoint through the shared adapter
//   3. no active production caller still uses the Firebase callable transport
//   4. the seven legacy Firebase callable implementations are decommissioned
//   5. unrelated Firebase-side responsibilities are preserved
//   6. the endpoints are behaviorally reachable and still authenticate before acting
//
// The behavioral checks deliberately need no Firestore/Auth credentials: they exercise only
// boundary paths (CORS preflight, method guard, transport parse, missing token), which requires no
// data and no mocks. Full emulator-backed behavior for each operation is owned by
// tests/phase16b-groupA.mjs ... tests/phase16b-groupD.mjs.

import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const require = createRequire(import.meta.url)
const root = path.dirname(fileURLToPath(new URL('../package.json', import.meta.url)))
const read = (relativePath) => readFileSync(path.join(root, relativePath), 'utf8')

const { ERROR_STATUS_MAP } = require('../netlify/functions/lib/http.js')

// --- the migration contract ----------------------------------------------------------------

const OPERATIONS = [
  {
    name: 'provisionClinic',
    authentication: 'authenticated',
    callers: [{ file: 'src/lib/platform.js' }],
    malformedJsonStatus: 401, // this handler authenticates before parsing the body
  },
  {
    name: 'listProvisionedClinics',
    authentication: 'authenticated',
    callers: [{ file: 'src/lib/platform.js' }],
    malformedJsonStatus: 401,
  },
  {
    name: 'createPublicAppointment',
    authentication: 'public',
    callers: [{ file: 'src/lib/appointments.js' }],
    malformedJsonStatus: 400,
  },
  {
    name: 'transitionAppointment',
    authentication: 'authenticated',
    callers: [{ file: 'src/lib/appointments.js' }],
    malformedJsonStatus: 400,
  },
  {
    name: 'completeClinicPasswordSetup',
    authentication: 'authenticated',
    callers: [{ file: 'src/lib/auth.js' }],
    malformedJsonStatus: 400,
  },
  {
    name: 'recordAnalyticsEvent',
    authentication: 'public',
    callers: [{ file: 'src/lib/analytics.js' }],
    malformedJsonStatus: 400,
  },
  {
    name: 'deleteClinicService',
    authentication: 'authenticated',
    callers: [{ file: 'src/lib/clinicServices.js' }],
    malformedJsonStatus: 400,
  },
]

// --- repository scanning helpers ------------------------------------------------------------

const toPosix = (value) => value.split(path.sep).join('/')

const listFiles = (directory, extensions) => {
  const entries = readdirSync(path.join(root, directory), { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const relative = path.join(directory, entry.name)
    if (entry.isDirectory()) files.push(...listFiles(relative, extensions))
    else if (extensions.some((extension) => entry.name.endsWith(extension))) files.push(toPosix(relative))
  }
  return files.sort()
}

const stripComments = (source) => source
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/(^|[^:])\/\/[^\n]*/g, '$1')

const sourceFiles = listFiles('src', ['.js', '.jsx'])
const sources = new Map(sourceFiles.map((file) => [file, read(file)]))

const handlerFor = (operationName) => require(`../netlify/functions/${operationName}.js`)

const json = (response) => JSON.parse(response.body)

const request = (operationName, { method = 'POST', body = '', headers = {} } = {}) =>
  handlerFor(operationName).handler({
    httpMethod: method,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })

console.log('--- TEST GROUP 1: Netlify implementation exists for all seven operations ---')
{
  assert.equal(OPERATIONS.length, 7, 'exactly seven trusted operations are in scope')

  for (const operation of OPERATIONS) {
    const source = read(`netlify/functions/${operation.name}.js`)

    assert.match(source, /exports\.handler = async \(event\) => \{/, `${operation.name} must export a Netlify handler`)
    assert.ok(
      source.includes(`/.netlify/functions/${operation.name}`),
      `${operation.name} must declare its canonical endpoint path`,
    )
    assert.ok(source.includes("require('./lib/http')"), `${operation.name} must use the shared HTTP layer`)
    assert.ok(source.includes("require('./lib/firebaseAdmin')"), `${operation.name} must use the shared Admin layer`)

    if (operation.authentication === 'authenticated') {
      assert.ok(
        source.includes('requireAuth(event)'),
        `${operation.name} is authenticated and must verify the ID token`,
      )
    } else {
      assert.ok(
        !source.includes('requireAuth'),
        `${operation.name} stays public and must not require authentication`,
      )
      assert.ok(
        !source.includes('requirePlatformOwner') && !source.includes('requireClinicMembership'),
        `${operation.name} must not add an authorization gate`,
      )
    }
  }
  console.log('✓ seven Netlify handlers present, shared layer used, auth gates preserved: PASS')
}


console.log('\n--- TEST GROUP 2: frontend callers use the shared Netlify adapter ---')
{
  for (const operation of OPERATIONS) {
    for (const caller of operation.callers) {
      const source = sources.get(caller.file)
      assert.ok(source, caller.file + ' must exist')

      assert.ok(
        source.includes("callNetlifyFunction('" + operation.name + "'"),
        caller.file + ' must call ' + operation.name + ' through the shared Netlify adapter',
      )
      assert.ok(
        source.includes("from './apiClient'"),
        caller.file + ' must import the shared adapter instead of a transport of its own',
      )

      const call = new RegExp(
        "callNetlifyFunction\\('" + operation.name + "'[\\s\\S]*?(?=\\n\\}|\\nexport|\\nconst|\\nlet)",
      ).exec(source)
      assert.ok(call, caller.file + ' must contain the ' + operation.name + ' call site')

      if (operation.authentication === 'authenticated') {
        assert.match(call[0], /authRequired:\s*true/, operation.name + ' must request a verified ID token')
      } else {
        assert.ok(
          !/authRequired:\s*true/.test(call[0]),
          operation.name + ' is public and must not require a token',
        )
      }
    }
  }

  // The adapter itself: endpoint, method, token handling and canonical error mapping.
  const adapter = read('src/lib/apiClient.js')
  assert.ok(adapter.includes('`/.netlify/functions/${operationName}`'), 'the adapter must own the endpoint path')
  assert.match(adapter, /method: 'POST'/)
  assert.match(adapter, /await currentUser\.getIdToken\(\)/)
  assert.match(adapter, /headers\.Authorization = `Bearer \$\{idToken\}`/)
  assert.match(adapter, /err\.code = body\?\.error\?\.code \|\| 'internal'/)

  console.log('✓ seven caller paths migrated, token handling centralized, public calls stay public: PASS')
}

console.log('\n--- TEST GROUP 3: no active caller uses the Firebase callable transport ---')
{
  const callablePatterns = [
    { pattern: /httpsCallable/, label: 'httpsCallable' },
    { pattern: /httpsCallableFromURL/, label: 'httpsCallableFromURL' },
    { pattern: /getFunctions/, label: 'getFunctions' },
    { pattern: /from 'firebase\/functions'/, label: 'a firebase/functions import' },
  ]

  for (const [file, source] of sources) {
    const code = stripComments(source)
    for (const { pattern, label } of callablePatterns) {
      assert.ok(!pattern.test(code), file + ' must not use ' + label + ' for a migrated operation')
    }
  }

  // Every adapter call in production code must target one of the seven migrated operations.
  const knownOperations = new Set(OPERATIONS.map((operation) => operation.name))
  let migratedCalls = 0
  for (const [file, source] of sources) {
    if (file.endsWith('lib/apiClient.js')) continue
    for (const match of source.matchAll(/callNetlifyFunction\(\s*'([^']+)'/g)) {
      migratedCalls += 1
      assert.ok(knownOperations.has(match[1]), file + ' calls the unknown Netlify operation "' + match[1] + '"')
    }
  }
  assert.equal(migratedCalls, 7, 'every one of the seven operations must have exactly one migrated call site')

  // Only the shared adapter may construct the endpoint URL.
  for (const [file, source] of sources) {
    if (file.endsWith('lib/apiClient.js')) continue
    assert.ok(!source.includes('.netlify/functions/'), file + ' must not build Netlify endpoints directly')
  }

  console.log('✓ no callable transport remains, all adapter calls map to the seven operations: PASS')
}

console.log('\n--- TEST GROUP 4: legacy Firebase callables are decommissioned ---')
{
  const functionsSource = read('functions/index.js')

  assert.ok(!/onCall\(/.test(functionsSource), 'functions/index.js must not declare any HTTPS callable')
  assert.ok(!/firebase-functions/.test(functionsSource), 'functions/index.js must not require firebase-functions')
  for (const operation of OPERATIONS) {
    assert.ok(
      !new RegExp('exports\\.' + operation.name + '\\b').test(functionsSource),
      operation.name + ' must no longer be implemented as a Firebase callable',
    )
  }

  // The functions/ deployment unit declared by firebase.json stays valid for CI (`node --check`).
  const functionsPackage = JSON.parse(read('functions/package.json'))
  assert.equal(functionsPackage.engines.node, '20')
  const firebaseJson = JSON.parse(read('firebase.json'))
  assert.equal(firebaseJson.functions.source, 'functions')
  assert.equal(firebaseJson.firestore.rules, 'firestore.rules')

  // Unrelated Firebase-side responsibilities are preserved: the platform-owner claim bootstrap
  // (which is why firebase-admin stays a functions/ dependency) and the Netlify function routing.
  const claimScript = read('functions/scripts/set-platform-owner.js')
  assert.match(claimScript, /setCustomUserClaims/)
  assert.match(claimScript, /platformOwner: true/)
  assert.match(read('netlify.toml'), /directory = "netlify\/functions"/)

  console.log('✓ seven callables removed, deployment unit and claim bootstrap preserved: PASS')
}

console.log('\n--- TEST GROUP 5: endpoints are behaviorally reachable and guarded ---')
{
  for (const operation of OPERATIONS) {
    const preflight = await request(operation.name, { method: 'OPTIONS' })
    assert.equal(preflight.statusCode, 204, operation.name + ' preflight')
    assert.equal(preflight.body, '')
    assert.equal(preflight.headers['Access-Control-Allow-Origin'], '*')
    assert.equal(preflight.headers['Access-Control-Allow-Methods'], 'POST, OPTIONS')

    for (const method of ['GET', 'PUT', 'DELETE']) {
      const res = await request(operation.name, { method })
      assert.equal(res.statusCode, 405, operation.name + ' must reject ' + method)
      assert.equal(json(res).error.code, 'invalid-argument')
      // requirePostMethod emits this 405 directly rather than through ERROR_STATUS_MAP, so it is
      // asserted literally here (the map itself is pinned by phase16a-infrastructure).
      assert.equal(json(res).error.message, 'Method Not Allowed. Only POST is supported.')
      assert.equal(res.headers['Access-Control-Allow-Origin'], '*')
    }

    // Transport-body handling, including each handler's real ordering relative to authentication.
    const malformed = await request(operation.name, { body: '{not-json' })
    assert.equal(malformed.statusCode, operation.malformedJsonStatus, operation.name + ' malformed body')
    const malformedCode = json(malformed).error.code
    assert.equal(malformed.statusCode, ERROR_STATUS_MAP[malformedCode])
    if (operation.malformedJsonStatus === 400) {
      assert.equal(malformedCode, 'invalid-argument')
      assert.equal(json(malformed).error.message, 'Malformed JSON in request body.')
    } else {
      assert.equal(malformedCode, 'unauthenticated')
      assert.equal(json(malformed).error.message, 'Authentication is required.')
    }

    if (operation.authentication === 'authenticated') {
      // Missing/empty/malformed Authorization is always 401 and never reaches Firestore.
      const anonymous = await request(operation.name, { body: {} })
      assert.equal(anonymous.statusCode, 401, operation.name + ' anonymous request')
      assert.equal(json(anonymous).error.code, 'unauthenticated')
      assert.equal(json(anonymous).error.message, 'Authentication is required.')

      // Header shapes rejected by the shared layer without any credential lookup. (A well-formed
      // but invalid bearer token is exercised under the Auth emulator by groups A/C/D, where
      // verifyIdToken can be resolved deterministically.)
      for (const header of ['Basic 12345', 'Bearer ', 'Token abc', 'bearer lowercase']) {
        const res = await request(operation.name, { body: {}, headers: { authorization: header } })
        assert.equal(res.statusCode, 401, operation.name + ' must reject "' + header + '"')
        assert.equal(json(res).error.code, 'unauthenticated')
      }
    } else {
      // Public operations stay public: no 401, no optional credential verification, and the
      // canonical validation error is returned instead.
      const anonymous = await request(operation.name, { body: {} })
      assert.equal(anonymous.statusCode, 400, operation.name + ' anonymous request')
      assert.equal(json(anonymous).error.code, 'invalid-argument')
      assert.equal(anonymous.statusCode, ERROR_STATUS_MAP[json(anonymous).error.code])

      const strayToken = await request(operation.name, {
        body: {},
        headers: { authorization: 'Bearer not-a-real-token' },
      })
      assert.equal(strayToken.statusCode, 400, operation.name + ' must not verify optional credentials')
      assert.notEqual(strayToken.statusCode, 401)
    }

    // Canonical error envelope: never a stack trace or internal detail.
    const envelope = json(await request(operation.name, { body: '{}' }))
    assert.equal(typeof envelope.error.code, 'string')
    assert.equal(typeof envelope.error.message, 'string')
    assert.ok(!/\bat\s+\w+.*:\d+:\d+/.test(envelope.error.message), 'error messages must not leak stack traces')
  }

  console.log('✓ preflight, method guard, transport parse, auth/public boundaries, error envelope: PASS')
}

console.log('\n--- TEST GROUP 6: migration summary ---')
{
  const functionsSource = read('functions/index.js')
  const rows = []

  for (const operation of OPERATIONS) {
    const netlifySource = read('netlify/functions/' + operation.name + '.js')
    const legacy = new RegExp('exports\\.' + operation.name + '\\b').test(functionsSource)

    rows.push({
      operation: operation.name,
      access: operation.authentication,
      netlifyHandler: netlifySource.includes('exports.handler') ? 'PRESENT' : 'MISSING',
      legacyCallable: legacy ? 'PRESENT' : 'ABSENT',
      callers: operation.callers.map((caller) => caller.file).join(', '),
    })
  }

  for (const row of rows) {
    assert.equal(row.netlifyHandler, 'PRESENT', row.operation + ' must have a Netlify handler')
    assert.equal(row.legacyCallable, 'ABSENT', row.operation + ' legacy callable must be gone')
    console.log(
      '  ' + row.operation.padEnd(30)
      + row.access.padEnd(15)
      + 'netlify=PRESENT  legacyCallable=ABSENT'
      + '  callers=' + row.callers,
    )
  }

  assert.equal(new Set(rows.map((row) => row.operation)).size, 7, 'the seven operations must be distinct')
  assert.equal(rows.filter((row) => row.access === 'public').length, 2, 'two operations remain public')
  assert.equal(rows.filter((row) => row.access === 'authenticated').length, 5, 'five operations are authenticated')

  console.log('✓ seven operations: Netlify implementation present, legacy callable absent, caller migrated: PASS')
}

console.log('\n========================================')
console.log('PHASE 16 NETLIFY MIGRATION + CUTOVER VERIFICATION: ALL TESTS PASS')
console.log('========================================')
