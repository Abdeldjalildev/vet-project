import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = (path) => readFileSync(new URL('../' + path, import.meta.url), 'utf8')
const packageJson = JSON.parse(read('package.json'))
const packageLock = JSON.parse(read('package-lock.json'))
const firebaseJson = JSON.parse(read('firebase.json'))
const functionsPackage = JSON.parse(read('functions/package.json'))
const rules = read('firestore.rules')
const functions = read('functions/index.js')
const app = read('src/App.jsx')
const main = read('src/main.jsx')
const analyticsAdmin = read('src/components/ClinicAnalyticsAdmin.jsx')
const bookingForm = read('src/components/BookingForm.jsx')
const i18nConfig = read('src/i18n/config.js')

assert.equal(typeof packageJson.scripts.build, 'string')
assert.equal(packageJson.scripts['test:contract'], 'node tests/contract-smoke.mjs')
assert.equal(firebaseJson.firestore.rules, 'firestore.rules')
assert.equal(firebaseJson.firestore.indexes, 'firestore.indexes.json')
assert.equal(firebaseJson.functions.source, 'functions')
assert.equal(functionsPackage.engines.node, '20')
assert.deepEqual(packageLock.packages[''].dependencies, packageJson.dependencies)
assert.deepEqual(packageLock.packages[''].devDependencies, packageJson.devDependencies)
assert.equal(packageLock.packages['node_modules/@emnapi/core'].version, '1.11.3')
assert.equal(packageLock.packages['node_modules/@emnapi/runtime'].version, '1.11.3')

assert.match(app, /path === '\/clinic\/login'/)
assert.match(app, /path === '\/clinic\/dashboard'/)
assert.match(app, /const validSections = \['dashboard', 'appointments', 'services', 'content', 'analytics', 'settings'\]/)

assert.match(main, /AppErrorBoundary/)
for (const exportName of ['createPublicAppointment', 'recordAnalyticsEvent', 'transitionAppointment', 'deleteClinicService']) {
  assert.match(functions, new RegExp(`exports\\.${exportName}`))
}

assert.match(rules, /match \/appointments\/{appointmentId}/)
assert.match(rules, /allow create: if false;/)
assert.match(rules, /allow update, delete: if false;/)
assert.match(rules, /match \/users\/{uid}/)
assert.match(rules, /match \/\{document=\*\*\}/)
assert.match(rules, /function memberOf\(clinicId\).*membership\(\)\.role == 'owner'/)
assert.match(rules, /allow read, write: if false;/)
assert.match(rules, /currency\.matches\('\^\[A-Z\]\{3\}\$'/)

assert.ok(!rules.includes(');\n    }\n\n    function existingServiceValueIsValidOrAbsent'))
assert.ok(!rules.includes('^[A-Z]{3}\n'))


assert.match(rules, /'description'/)
assert.match(rules, /validHttpsUrl/)
assert.match(rules, /validManagedContent/)
assert.match(rules, /validFaq/)
assert.match(rules, /primaryColor\.matches/)
assert.match(rules, /socialLinks/)
assert.match(rules, /validFeature/)
assert.match(rules, /features\.size\(\) <= 12/)
assert.match(i18nConfig, /vetlife_public_lang/)
assert.match(i18nConfig, /vetlife_admin_lang/)
assert.match(functions, /uuidPattern/)
assert.match(functions, /sessionId is invalid/)
assert.match(functions, /estimatedCompletedServiceValueByCurrency/)
assert.match(analyticsAdmin, /estimatedCompletedServiceValueByCurrency/)

console.log('VetLife contract smoke tests: PASS')

assert.match(bookingForm, /trackPublicEvent.*booking_completed/)
assert.match(bookingForm, /createPublicAppointment/)