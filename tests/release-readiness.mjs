import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

const read = (path) => readFileSync(new URL('../' + path, import.meta.url), 'utf8')
const agent = read('agent.md')
const ci = read('.github/workflows/ci.yml')
const firebase = JSON.parse(read('firebase.json'))
const functionsPackage = JSON.parse(read('functions/package.json'))
const packageJson = JSON.parse(read('package.json'))

assert.equal(firebase.firestore.rules, 'firestore.rules')
assert.equal(firebase.functions.source, 'functions')
assert.equal(functionsPackage.engines.node, '20')
assert.equal(typeof packageJson.scripts.build, 'string')
assert.equal(typeof packageJson.scripts['test:contract'], 'string')

assert.ok(ci.includes('actions/checkout@v5'))
assert.ok(ci.includes('actions/setup-node@v5'))
assert.match(ci, /npm ci/)
assert.match(ci, /npm run test:contract/)
assert.match(ci, /npm run build/)

// Deliberate release blockers must stay visible. A blocker that has been RESOLVED is
// asserted as resolved, so that a silent regression (deleting the lockfile, or reverting
// CI to an unpinned install) fails this check instead of passing quietly.
const knownReleaseBlockers = {
  functionsLockfile: !existsSync(new URL('../functions/package-lock.json', import.meta.url)),
  appCheckEnforcement: !/enforceAppCheck\s*:\s*true/.test(read('functions/index.js')),
  dependencyAudit: 'not-yet-verified',
  firebaseRuntime: 'not-yet-verified',
  browserRuntime: 'not-yet-verified',
}

assert.equal(
  knownReleaseBlockers.functionsLockfile,
  false,
  'functions/package-lock.json must exist: it removes the unpinned Functions install blocker',
)
assert.match(
  ci,
  /working-directory: functions[\s\S]{0,120}npm ci --ignore-scripts/,
  'CI must install Functions dependencies from the committed lockfile',
)
assert.equal(knownReleaseBlockers.appCheckEnforcement, true)

console.log('VetLife Phase 14 repository release-readiness checks: PASS')
console.log(JSON.stringify({
  repositoryContracts: 'verified',
  ciContract: 'verified',
  knownReleaseBlockers: {
    ...knownReleaseBlockers,
    functionsLockfile: 'RESOLVED - pinned by functions/package-lock.json and CI npm ci --ignore-scripts',
  },
  runtimeVerification: 'NOT_VERIFIED — requires deployed Firebase/browser evidence',
}, null, 2))
