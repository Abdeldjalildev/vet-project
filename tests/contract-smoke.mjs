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

// ---------------------------------------------------------------------------
// P0-B3 drift guard: producer schema vs Firestore Rules resulting-key whitelist.
//
// The production defect was that provisionClinic writes `lifecycle`, `createdAt`
// and `updatedAt` onto the clinic document while the clinic-update rule's
// `hasOnly(...)` whitelist did not list them. Because an update is evaluated over
// the WHOLE resulting document, that denied every clinic update for every actor.
//
// This guard parses BOTH sides and compares them as sets, so a future field added
// to the producer without a matching rules entry fails here rather than in
// production. It is intentionally a semantic comparison, not a text overlap.
// ---------------------------------------------------------------------------
{
  const producerSource = netlifyFunctions.provisionClinic

  // 1. The keys the trusted provisioning transaction writes to clinics/{clinicId}.
  const clinicCreate = producerSource.match(/transaction\.create\(clinicRef,\s*\{([\s\S]*?)\}\)/)
  assert.ok(clinicCreate, 'provisionClinic must create the clinic document via transaction.create(clinicRef, {...})')
  const producedKeys = new Set(
    [...clinicCreate[1].matchAll(/^\s*([A-Za-z][A-Za-z0-9_]*)\s*[:,}]/gm)].map((m) => m[1]),
  )
  assert.ok(producedKeys.size >= 5, `expected the clinic document to be created with several keys, parsed: ${[...producedKeys]}`)
  for (const key of ['slug', 'public', 'active', 'lifecycle', 'createdAt', 'updatedAt']) {
    assert.ok(producedKeys.has(key), `provisionClinic must produce the clinic field "${key}" (parsed: ${[...producedKeys]})`)
  }

  // 2. The resulting-document key whitelist of the clinic update rule.
  const clinicUpdate = rules.match(/match \/clinics\/\{clinicId\} \{[\s\S]*?allow update: if[\s\S]*?hasOnly\(\[([^\]]*)\]\)/)
  assert.ok(clinicUpdate, 'firestore.rules must declare a hasOnly(...) resulting-key whitelist for clinic updates')
  const whitelistedKeys = new Set(
    [...clinicUpdate[1].matchAll(/'([A-Za-z][A-Za-z0-9_]*)'/g)].map((m) => m[1]),
  )

  // 3. THE GUARD: every produced key must be present in the whitelist.
  const missing = [...producedKeys].filter((key) => !whitelistedKeys.has(key))
  assert.deepEqual(missing, [],
    `clinic document fields produced by provisionClinic but absent from the firestore.rules ` +
    `resulting-key whitelist (they would make EVERY clinic update fail): ${missing.join(', ')}`)

  // 4. The server-owned fields must NOT be client-editable: they must stay out of the
  //    affected-key gate, otherwise the whitelist addition would have opened a write hole.
  const affectedGate = rules.match(/function clinicUpdateFieldsAreAllowed\(\) \{[\s\S]*?hasOnly\(\[([^\]]*)\]\)/)
  assert.ok(affectedGate, 'firestore.rules must declare clinicUpdateFieldsAreAllowed()')
  const affectedKeys = new Set(
    [...affectedGate[1].matchAll(/'([A-Za-z][A-Za-z0-9_]*)'/g)].map((m) => m[1]),
  )
  for (const immutable of ['lifecycle', 'createdAt', 'updatedAt', 'slug', 'public', 'active']) {
    assert.ok(!affectedKeys.has(immutable),
      `"${immutable}" is server-owned and must never be client-editable via clinicUpdateFieldsAreAllowed()`)
  }
  // ...while the genuinely clinic-managed fields stay editable.
  for (const editable of ['name', 'description', 'contact', 'branding', 'hero', 'about', 'footer', 'socialLinks']) {
    assert.ok(affectedKeys.has(editable), `"${editable}" must remain clinic-editable`)
  }

  // 5. The resulting-key whitelist must stay CLOSED (defence in depth against field injection).
  assert.ok(rules.includes('request.resource.data.keys().hasOnly('),
    'the clinic update rule must keep a closed hasOnly(...) resulting-key whitelist')
  assert.ok(!/match \/clinics\/\{clinicId\}[\s\S]*?allow update: if[\s\S]*?keys\(\)\.hasAny\(/.test(rules),
    'the clinic update rule must not use hasAny(...)')
}
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

// P08 repaired: the completion proof is the Auth `tokensValidAfterTime` marker compared against
// the provisioning baseline. The retired password-hash digest architecture must not return.
assert.match(netlifyFunctions.provisionClinic, /passwordSetupIssuedAt/)
// Comments must not be able to satisfy or break these guards: compare executable code only.
const codeOnlySource = netlifyFunctions.provisionClinic
  .replace(/\/\*[\s\S]*?\*\//g, ' ')
  .replace(/(^|[^:])\/\/[^\n]*/g, '$1 ')

assert.ok(!codeOnlySource.includes('passwordSetupHashDigest'),
  'provisioning must no longer persist a credential digest')
assert.ok(!codeOnlySource.includes('createHash'),
  'provisioning must no longer derive a credential digest')
assert.ok(!codeOnlySource.includes('.passwordHash'),
  'provisioning must no longer read passwordHash (redacted in production)')
assert.match(netlifyFunctions.completeClinicPasswordSetup, /tokensValidAfterTime/)
assert.match(netlifyFunctions.completeClinicPasswordSetup, /passwordSetupIssuedAt/)
assert.match(netlifyFunctions.completeClinicPasswordSetup, /markerMs <= baseline/)
// Comments must not be able to satisfy or break these guards: compare executable code only.
const codeOnly = (source) => source
  .replace(/\/\*[\s\S]*?\*\//g, ' ')
  .replace(/(^|[^:])\/\/[^\n]*/g, '$1 ')

assert.ok(!codeOnly(netlifyFunctions.completeClinicPasswordSetup).includes('passwordHash'),
  'completion must no longer read passwordHash (redacted in production)')
assert.ok(!codeOnly(netlifyFunctions.completeClinicPasswordSetup).includes('createHash'),
  'completion must no longer derive a credential digest')
assert.ok(!codeOnly(netlifyFunctions.completeClinicPasswordSetup).includes('passwordSetupHashDigest'),
  'completion must no longer read a credential digest verifier')
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
