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

assert.match(ci, /actions/checkout@v5/)
assert.match(ci, /actions/setup-node@v5/)
assert.match(ci, /npm ci/)
assert.match(ci, /npm run test:contract/)
assert.match(ci, /npm run build/)

const knownReleaseBlockers = {
  functionsLockfile: !existsSync(new URL('../functions/package-lock.json', import.meta.url)),
  appCheckEnforcement: !/enforceAppCheck\s*:\s*true/.test(read('functions/index.js')),
  dependencyAudit: 'not-yet-verified',
  firebaseRuntime: 'not-yet-verified',
  browserRuntime: 'not-yet-verified',
}

assert.equal(knownReleaseBlockers.functionsLockfile, true)
assert.equal(knownReleaseBlockers.appCheckEnforcement, true)

console.log('VetLife Phase 14 repository release-readiness checks: PASS')
console.log(JSON.stringify({
  repositoryContracts: 'verified',
  ciContract: 'verified',
  knownReleaseBlockers,
  runtimeVerification: 'NOT_VERIFIED — requires deployed Firebase/browser evidence',
}, null, 2))
