import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = (path) => readFileSync(new URL('../' + path, import.meta.url), 'utf8')
const packageJson = JSON.parse(read('package.json'))
const packageLock = JSON.parse(read('package-lock.json'))
const firebaseJson = JSON.parse(read('firebase.json'))
const functionsPackage = JSON.parse(read('functions/package.json'))
const rules = read('firestore.rules')
const functions = read('functions/index.js')
const netlifyFunctions = {
  provisionClinic: read('netlify/functions/provisionClinic.js'),
  listProvisionedClinics: read('netlify/functions/listProvisionedClinics.js'),
  createPublicAppointment: read('netlify/functions/createPublicAppointment.js'),
  transitionAppointment: read('netlify/functions/transitionAppointment.js'),
  completeClinicPasswordSetup: read('netlify/functions/completeClinicPasswordSetup.js'),
  recordAnalyticsEvent: read('netlify/functions/recordAnalyticsEvent.js'),
  deleteClinicService: read('netlify/functions/deleteClinicService.js'),
}
const netlifyAuthLib = read('netlify/functions/lib/auth.js')
const app = read('src/App.jsx')
const main = read('src/main.jsx')
const analyticsAdmin = read('src/components/ClinicAnalyticsAdmin.jsx')
const bookingForm = read('src/components/BookingForm.jsx')
const i18nConfig = read('src/i18n/config.js')
const phase12I18n = read('src/i18n/phase12.js')
const phase13I18n = read('src/i18n/phase13.js')
const navbar = read('src/components/Navbar.jsx')
const hero = read('src/components/Hero.jsx')
const services = read('src/components/Services.jsx')
const about = read('src/components/About.jsx')
const faq = read('src/components/Faq.jsx')
const footer = read('src/components/Footer.jsx')
const publicClinic = read('src/components/PublicClinicPage.jsx')
const platformClient = read('src/lib/platform.js')
const platformDashboard = read('src/components/PlatformOwnerDashboard.jsx')
const publicAccess = read('src/components/ClinicPublicAccessAdmin.jsx')
const auth = read('src/lib/auth.js')
const functionsScript = read('functions/scripts/set-platform-owner.js')

assert.equal(typeof packageJson.scripts.build, 'string')
assert.equal(packageJson.scripts['test:contract'], 'node tests/contract-smoke.mjs')
assert.equal(firebaseJson.firestore.rules, 'firestore.rules')
assert.equal(firebaseJson.firestore.indexes, 'firestore.indexes.json')
assert.equal(firebaseJson.functions.source, 'functions')
assert.equal(functionsPackage.engines.node, '20')
assert.deepEqual(packageLock.packages[''].dependencies, packageJson.dependencies)
assert.deepEqual(packageLock.packages[''].devDependencies, packageJson.devDependencies)
assert.equal(packageJson.dependencies['qrcode-generator'], '^2.0.4')
assert.equal(packageLock.packages['node_modules/qrcode-generator'].version, '2.0.4')
assert.equal(packageLock.packages['node_modules/@emnapi/core'].version, '1.11.3')
assert.equal(packageLock.packages['node_modules/@emnapi/runtime'].version, '1.11.3')

assert.match(app, /path === '\/clinic\/login'/)
assert.match(app, /path === '\/clinic\/dashboard'/)
assert.match(app, /const validSections = \['dashboard', 'appointments', 'services', 'content', 'analytics', 'settings', 'public'\]/)
assert.match(app, /path === '\/'/)
assert.match(app, /path.startsWith\('\/platform\/'\)/)
assert.match(app, /path.startsWith\('\/c\/'\)/)

assert.match(main, /AppErrorBoundary/)
// Phase 16: all seven trusted operations are implemented as Netlify Functions...
for (const [operationName, source] of Object.entries(netlifyFunctions)) {
  assert.match(source, /exports\.handler = async \(event\) => \{/, operationName + ' must export a Netlify handler')
}
// ...and the legacy Firebase callable implementations are decommissioned.
assert.ok(!/exports\.\w+ = onCall\(/.test(functions), 'no Firebase callable may remain in functions/index.js')
for (const operationName of Object.keys(netlifyFunctions)) {
  assert.ok(
    !new RegExp('exports\\.' + operationName + '\\b').test(functions),
    operationName + ' must no longer be exported as a Firebase callable',
  )
}

assert.match(rules, /match \/appointments\/{appointmentId}/)
assert.match(rules, /allow create: if false;/)
assert.match(rules, /allow update, delete: if false;/)
assert.match(rules, /match \/users\/{uid}/)
assert.match(rules, /match \/{document=\*\*}/)
assert.match(rules, /function memberOf\(clinicId\).*membership\(\)\.role == 'owner'/)
assert.match(rules, /allow read, write: if false;/)
assert.match(rules, /currency\.matches\('\^\[A-Z\]\{3\}\$'/)

assert.ok(!rules.includes('existingServiceValueIsValidOrAbsent'))
assert.ok(!rules.includes('^[A-Z]{3}\\n'))

assert.match(rules, /'description'/)
assert.match(rules, /validHttpsUrl/)
assert.match(rules, /validManagedContent/)
assert.match(rules, /validFaq/)
assert.match(rules, /primaryColor\.matches/)
assert.match(rules, /socialLinks/)
assert.match(rules, /validFeature/)
assert.match(rules, /openingHours\.keys\(\)\.hasOnly\(\['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'\]\)/)
assert.match(rules, /openingHours\.monday is string/)
assert.match(rules, /openingHours\.sunday is string/)
assert.match(rules, /function validService\(\)/)
assert.match(rules, /request\.resource\.data\.icon is string/)
assert.match(rules, /request\.resource\.data\.currency\.matches\('\^\[A-Z\]\{3\}\$'/)
assert.match(rules, /request\.resource\.data\.order is number/)
assert.match(rules, /request\.resource\.data\.active is bool/)
assert.match(rules, /resource\.data\.active == true &&\s*get\(\/databases\/\$\(database\)\/documents\/clinics\/\$\(clinicId\)\)/)
assert.match(rules, /features\.size\(\) <= 12/)

assert.match(i18nConfig, /vetlife_public_lang/)
assert.match(i18nConfig, /vetlife_admin_lang/)
assert.match(netlifyFunctions.recordAnalyticsEvent, /uuidPattern/)
assert.match(netlifyFunctions.recordAnalyticsEvent, /sessionId is invalid/)
assert.match(netlifyFunctions.transitionAppointment, /estimatedCompletedServiceValueByCurrency/)
assert.match(analyticsAdmin, /estimatedCompletedServiceValueByCurrency/)

assert.match(bookingForm, /trackPublicEvent.*booking_completed/)
assert.match(bookingForm, /createPublicAppointment/)

console.log('VetLife contract smoke tests: PASS')

assert.match(netlifyAuthLib, /decodedToken\.platformOwner !== true/)
assert.match(netlifyAuthLib, /verifyIdToken\(token\)/)
assert.match(netlifyFunctions.provisionClinic, /transaction\.create\(users\.doc\(ownerUser\.uid\)/)
for (const source of [functions, ...Object.values(netlifyFunctions)]) {
  assert.ok(!source.includes('generatePasswordResetLink'))
}
assert.match(functionsScript, /setCustomUserClaims/)
assert.match(functionsScript, /platformOwner: true/)
assert.match(auth, /getIdTokenResult/)
assert.match(auth, /claims\.platformOwner === true/)
assert.match(platformClient, /callNetlifyFunction\('provisionClinic'/)
assert.match(platformClient, /callNetlifyFunction\('listProvisionedClinics'/)
assert.match(platformDashboard, /provisionClinic/)
assert.match(publicAccess, /qrcode-generator/)
assert.match(publicAccess, /encodeURIComponent\(clinic\.slug\)/)
assert.match(publicAccess, /createDataURL/)
assert.match(phase12I18n, /platformOwnerTitle/)
assert.ok(!publicAccess.includes('/admin/'))


assert.match(phase13I18n, /serviceFallbackName/)
assert.match(navbar, /Vet.*Life/)
assert.match(navbar, /navContact/)
assert.match(hero, /from-sky-600 to-emerald-500/)
assert.match(services, /bg-emerald-100/)
assert.match(services, /bg-sky-100/)
assert.match(services, /bg-amber-100/)
assert.match(services, /bg-rose-100/)
assert.match(about, /about.features/)
assert.match(faq, /AnimatePresence/)
assert.match(footer, /Vet.*Life/)
assert.match(publicClinic, /<VetTips \/>/)
assert.match(publicClinic, /<BookingForm[^>]+clinic=/)
assert.match(publicClinic, /<Footer clinic=/)

assert.match(netlifyFunctions.provisionClinic, /passwordSetupHashDigest/)
assert.match(netlifyFunctions.provisionClinic, /createHash\('sha256'\)/)
assert.match(netlifyFunctions.completeClinicPasswordSetup, /passwordSetupHashDigest/)
assert.match(netlifyFunctions.completeClinicPasswordSetup, /createHash\('sha256'\)/)
assert.ok(!netlifyFunctions.completeClinicPasswordSetup.includes('userRecord.passwordUpdatedAt'),
  'completion must no longer depend on passwordUpdatedAt')
assert.ok(!netlifyFunctions.provisionClinic.includes('ownerUser.passwordUpdatedAt'),
  'provisioning must no longer depend on passwordUpdatedAt')
assert.match(netlifyFunctions.provisionClinic, /temporaryPassword/)
assert.match(netlifyFunctions.provisionClinic, /mustChangePassword: true/)
assert.match(netlifyFunctions.completeClinicPasswordSetup, /mustChangePassword !== true/)
assert.match(netlifyFunctions.completeClinicPasswordSetup, /successResponse\(\{ completed: true \}\)/)
assert.match(auth, /updatePassword/)
assert.match(auth, /getClinicMembership/)
assert.match(platformDashboard, /temporaryPassword/)
assert.match(app, /\/clinic\/first-password/)
assert.match(phase12I18n, /firstPasswordTitle/)
console.log('VetLife first-login password setup contract: PASS')
