// MT-1 Firestore Rules MATRIX probe (temporary verification harness).
// Purpose: prove the documented Firestore Rules allow/deny matrix with REAL
// authenticated client sessions, using ONLY dependencies already present in this
// repository (firebase SDK for the client, firebase-admin for fixtures and token
// minting). No @firebase/rules-unit-testing, no rules changes, no product changes.
// Writes only inside the Firestore/Auth emulators (demo project). Evidence is
// written to mt1-matrix-evidence.txt; the file is deleted after evidence capture.
import { createRequire } from 'node:module'
import { writeFileSync, appendFileSync, mkdirSync } from 'node:fs'
import { execSync } from 'node:child_process'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(SCRIPT_DIR, '..')
const OUT_FILE = path.join(REPO_ROOT, 'docs', 'evidence', 'mt1-matrix-evidence.txt')
const PROJECT_ID = 'demo-vetlife-mt1'
const FIRESTORE_PORT = 8085
const AUTH_PORT = 9095

if (!process.env.FIRESTORE_EMULATOR_HOST) {
  console.log('Re-launching MT-1 Rules MATRIX under Firestore+Auth emulators...')
  const configPath = path.join(os.tmpdir(), 'vlife-mt1-matrix.json')
  writeFileSync(configPath, JSON.stringify({
    firestore: { rules: path.join(REPO_ROOT, 'firestore.rules') },
    emulators: {
      firestore: { host: '127.0.0.1', port: FIRESTORE_PORT },
      auth: { host: '127.0.0.1', port: AUTH_PORT },
      hub: { host: '127.0.0.1', port: 4400 },
      logging: { host: '127.0.0.1', port: 4500 },
      ui: { enabled: false },
      singleProjectMode: true,
    },
  }, null, 2))
  // The evidence directory is tracked only through docs/evidence/README.md, so never rely
  // on it existing: a fresh checkout (or a pruned docs tree) must not turn evidence capture
  // into an ENOENT crash before the emulators even start.
  mkdirSync(path.dirname(OUT_FILE), { recursive: true })
  writeFileSync(OUT_FILE, '')
  try {
    const captured = execSync(
      `firebase emulators:exec --only firestore,auth --project ${PROJECT_ID} --config "${configPath}" "node tests/mt1-rules-matrix.mjs"`,
      { env: { ...process.env }, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 },
    )
    writeFileSync(path.join(REPO_ROOT, 'mt1-matrix-run.log'), captured)
    process.exit(0)
  } catch (err) {
    const captured = `${err.stdout || ''}${err.stderr || ''}`
    writeFileSync(path.join(REPO_ROOT, 'mt1-matrix-run.log'), captured)
    appendFileSync(OUT_FILE, `FATAL: ${err.message}\n${captured.slice(-3000)}\n`)
    console.error(captured.slice(-3000))
    process.exit(typeof err.status === 'number' ? err.status : 1)
  }
}
// ---------- child process: emulators are running ----------
const admin = require('firebase-admin')
const { initializeApp } = require('firebase/app')
const {
  getFirestore, connectFirestoreEmulator, doc, getDoc, setDoc, updateDoc, deleteDoc,
  collection, getDocs, addDoc, query, where, limit, serverTimestamp, deleteField,
} = require('firebase/firestore')
const {
  getAuth, connectAuthEmulator, createUserWithEmailAndPassword, signInWithEmailAndPassword,
} = require('firebase/auth')

const FIREBASE_CFG = {
  apiKey: 'demo-api-key',
  authDomain: `${PROJECT_ID}.firebaseapp.com`,
  projectId: PROJECT_ID,
  appId: '1:1:web:1',
}

const adminApp = admin.initializeApp({ projectId: PROJECT_ID }, 'mt1-admin')
const adb = adminApp.firestore()

const OUT_PATH = OUT_FILE
const log = (line) => {
  console.log(line)
  appendFileSync(OUT_PATH, `${line}\n`)
}

const results = []
const run = async (label, persona, expectation, op) => {
  let outcome = 'ALLOW'
  let detail = 'allowed'
  try {
    await op(clients[persona])
  } catch (err) {
    const code = (err && (err.code || err.message)) || 'unknown'
    if (String(code).includes('permission-denied')) {
      outcome = 'DENY'
      detail = 'permission-denied'
    } else {
      outcome = 'ERROR'
      detail = String(code)
    }
  }
  const pass = outcome === expectation
  results.push({ label, persona, expectation, outcome, pass })
  log(`${pass ? 'PASS' : 'FAIL'} [${outcome}/${expectation}] ${persona} :: ${label}${pass ? '' : ` (${detail})`}`)
}

const READ = (p) => async (c) => { await getDoc(doc(c.db, p)) }
const READ_ALL = (p) => async (c) => { await getDocs(collection(c.db, p)) }
const WRITE = (p, data) => async (c) => { await setDoc(doc(c.db, p), data) }
const UPDATE = (p, data) => async (c) => { await updateDoc(doc(c.db, p), data) }
const DELETE = (p) => async (c) => { await deleteDoc(doc(c.db, p)) }
const ADD = (p, data) => async (c) => { await addDoc(collection(c.db, p), data) }
const QUERY = (...args) => async (c) => { await getDocs(query(...args)) }

const clients = {}
const PROBE_PASSWORD = 'Mt1-Probe-Passw0rd!'
const emailOf = (name) => `${name}@mt1-probe.test`

// Real authenticated sessions against the Auth emulator (no service-account
// credentials needed: the emulator issues genuine ID tokens that the Firestore
// emulator accepts). uids are generated by the emulator, so membership fixtures
// are seeded from the resulting uids.
const makeClient = async (name) => {
  const app = initializeApp(FIREBASE_CFG, `mt1-${name}`)
  const db = getFirestore(app)
  connectFirestoreEmulator(db, '127.0.0.1', FIRESTORE_PORT)
  const auth = getAuth(app)
  connectAuthEmulator(auth, `http://127.0.0.1:${AUTH_PORT}`, { disableWarnings: true })
  if (name !== 'anon') {
    try {
      await createUserWithEmailAndPassword(auth, emailOf(name), PROBE_PASSWORD)
    } catch (err) {
      if (!String(err && err.code).includes('email-already-in-use')) throw err
      await signInWithEmailAndPassword(auth, emailOf(name), PROBE_PASSWORD)
    }
    await auth.currentUser.getIdToken(true)
  }
  clients[name] = { app, db, auth, uid: auth.currentUser ? auth.currentUser.uid : null }
  return clients[name]
}

const uidOf = (persona) => {
  const c = clients[persona]
  if (!c || !c.uid) throw new Error(`no authenticated uid for persona ${persona}`)
  return c.uid
}
const UP = (persona) => `users/${uidOf(persona)}`

// Membership documents written by the trusted path (admin SDK), keyed by the real
// emulator uids. noMembership intentionally has no document.
const roster = {
  memberA: { clinicId: 'clinicA', role: 'owner', status: 'active' },
  memberB: { clinicId: 'clinicB', role: 'owner', status: 'active' },
  adminA: { clinicId: 'clinicA', role: 'admin', status: 'active' },
  inactiveA: { clinicId: 'clinicA', role: 'owner', status: 'inactive' },
  staffA: { clinicId: 'clinicA', role: 'staff', status: 'active' },
  noMembership: { unrelated: true },
  // Owner of a clinic seeded in the EXACT shape the trusted provisioning path produces
  // (provisionClinic.js transaction.create). P0-B3 regression: the resulting-document
  // key whitelist must accept that server-owned shape, while every client mutation of
  // it stays denied through the affected-key gate.
  ownerProv: { clinicId: 'clinicProvisioned', role: 'owner', status: 'active' },
}

async function seedMemberships(personas) {
  const w = adb.batch()
  for (const persona of personas) {
    if (roster[persona]) w.set(adb.doc(UP(persona)), roster[persona])
  }
  await w.commit()
}
// ---------- fixtures (admin SDK: bypasses rules on purpose) ----------
const localized = (t) => ({ ar: t, en: t, fr: t })
const svc = (label, order) => ({
  name: localized(label), description: localized('desc'), icon: 'stethoscope',
  price: 25, currency: 'EUR', order, active: true,
})
const faq = (order) => ({ question: localized('Q'), answer: localized('A'), order, active: true })

async function seed() {
  const w = adb.batch()
  w.set(adb.doc('clinics/clinicA'), { slug: 'clinic-a', public: true, active: true, name: localized('Clinic A'), description: localized('Desc A') })
  w.set(adb.doc('clinics/clinicB'), { slug: 'clinic-b', public: true, active: true, name: localized('Clinic B'), description: localized('Desc B') })
  w.set(adb.doc('clinics/clinicHidden'), { slug: 'clinic-hidden', public: false, active: true, name: localized('Hidden'), description: localized('Hidden') })
  w.set(adb.doc('clinics/clinicInactive'), { slug: 'clinic-inactive', public: true, active: false, name: localized('Inactive'), description: localized('Inactive') })
  // P0-B3 regression fixture: the exact clinic root document shape produced by the trusted
  // provisioning transaction (netlify/functions/provisionClinic.js:122-130). Before the
  // rules fix this shape made EVERY client update fail the resulting-document key
  // whitelist, which is the production defect. lifecycle/createdAt/updatedAt are the
  // server-owned fields whose presence is legitimate but whose mutation must stay denied.
  w.set(adb.doc('clinics/clinicProvisioned'), {
    slug: 'clinic-provisioned',
    public: true,
    active: true,
    lifecycle: 'provisioned',
    name: localized('Provisioned clinic'),
    createdAt: admin.firestore.Timestamp.fromMillis(1767225600000),
    updatedAt: admin.firestore.Timestamp.fromMillis(1767225600000),
  })
  w.set(adb.doc('clinics/clinicA/services/svcA1'), svc('Service A1', 1))
  w.set(adb.doc('clinics/clinicA/services/svcA2'), { ...svc('Service A2', 2), active: false })
  w.set(adb.doc('clinics/clinicB/services/svcB1'), svc('Service B1', 1))
  w.set(adb.doc('clinics/clinicB/services/svcBHidden'), { ...svc('Service B Hidden', 2), active: false })
  w.set(adb.doc('clinics/clinicInactive/services/svcI1'), svc('Service I1', 1))
  w.set(adb.doc('clinics/clinicA/faqs/faqA1'), faq(1))
  w.set(adb.doc('clinics/clinicA/faqs/faqA2'), { ...faq(2), active: false })
  w.set(adb.doc('clinics/clinicA/appointments/aptA1'), { patientName: 'P', status: 'pending', preferredDate: '2026-01-05' })
  w.set(adb.doc('clinics/clinicB/appointments/aptB1'), { patientName: 'P', status: 'pending', preferredDate: '2026-01-06' })
  w.set(adb.doc('clinics/clinicA/analyticsAggregates/aggA1'), { views: 3 })
  w.set(adb.doc('clinics/clinicA/analyticsEvents/evA1'), { type: 'view' })
  w.set(adb.doc('clinics/clinicB/analyticsAggregates/aggB1'), { views: 1 })
  w.set(adb.doc('unlisted/doc1'), { secret: true })
  await w.commit()
}

await seed()
// Order matters: authenticate first (emulator-generated uids), then seed memberships.
await Promise.all(Object.keys(roster).map((name) => makeClient(name)))
await makeClient('anon')
await seedMemberships(Object.keys(roster))
log(`PERSONAS: ${Object.keys(roster).join(', ')} (uid-keyed membership docs) + anon (unauthenticated)`)
log(`CLIENTS READY: ${Object.keys(clients).length} (1 unauthenticated + ${Object.keys(roster).length} Auth-emulator sessions)`)

// Enforcement guard: if rules were not actually loaded, the hidden clinic would be readable.
try {
  await getDoc(doc(clients.anon.db, 'clinics/clinicHidden'))
  log('ABORT: firestore.rules NOT enforced (clinics/clinicHidden readable by anonymous client).')
  process.exit(1)
} catch (err) {
  const code = String((err && (err.code || err.message)) || '')
  if (!code.includes('permission-denied')) {
    log(`ABORT: unexpected guard error: ${code}`)
    process.exit(1)
  }
  log('GUARD OK: anonymous read of clinics/clinicHidden denied => firestore.rules is enforced by the emulator.')
}
// ================= GROUP 1: unauthenticated visitor (public site) =================
log('--- GROUP 1: unauthenticated (public visitor) ---')
await run('public clinic (public=true,active=true) read', 'anon', 'ALLOW', READ('clinics/clinicA'))
await run('non-public clinic read', 'anon', 'DENY', READ('clinics/clinicHidden'))
await run('public clinic with active=false read', 'anon', 'DENY', READ('clinics/clinicInactive'))
await run('public clinic listing query (public==true,active==true)', 'anon', 'ALLOW',
  QUERY(collection(clients.anon.db, 'clinics'), where('public', '==', true), where('active', '==', true)))
await run('active service of public clinic read', 'anon', 'ALLOW', READ('clinics/clinicA/services/svcA1'))
await run('inactive service read', 'anon', 'DENY', READ('clinics/clinicA/services/svcA2'))
await run('active faq of public clinic read', 'anon', 'ALLOW', READ('clinics/clinicA/faqs/faqA1'))
await run('inactive faq read', 'anon', 'DENY', READ('clinics/clinicA/faqs/faqA2'))
await run('member profile read', 'anon', 'DENY', READ(UP('memberA')))
await run('appointments read (even on public clinic)', 'anon', 'DENY', READ('clinics/clinicA/appointments/aptA1'))
await run('analytics aggregate read', 'anon', 'DENY', READ('clinics/clinicA/analyticsAggregates/aggA1'))
await run('unlisted collection read (catch-all deny)', 'anon', 'DENY', READ('unlisted/doc1'))
await run('clinic update attempt', 'anon', 'DENY', UPDATE('clinics/clinicA', { name: localized('Hacked') }))
await run('service create attempt', 'anon', 'DENY', WRITE('clinics/clinicA/services/svcAnon', svc('Anon', 9)))
await run('unlisted collection write attempt', 'anon', 'DENY', WRITE('unlisted/doc2', { secret: false }))

// ================= GROUP 2: own-clinic member (owner, active) =================
log('--- GROUP 2: memberA (owner of clinicA, status=active) ---')
await run('own clinic read', 'memberA', 'ALLOW', READ('clinics/clinicA'))
await run('non-member non-public clinic read (clinicHidden)', 'memberA', 'DENY', READ('clinics/clinicHidden'))
await run('own clinic inactive service read', 'memberA', 'ALLOW', READ('clinics/clinicA/services/svcA2'))
await run('own clinic appointments read', 'memberA', 'ALLOW', READ('clinics/clinicA/appointments/aptA1'))
await run('own clinic appointments collection query', 'memberA', 'ALLOW', READ_ALL('clinics/clinicA/appointments'))
await run('own clinic analytics aggregate read', 'memberA', 'ALLOW', READ('clinics/clinicA/analyticsAggregates/aggA1'))
await run('own clinic analytics event read', 'memberA', 'ALLOW', READ('clinics/clinicA/analyticsEvents/evA1'))
await run('own member profile read', 'memberA', 'ALLOW', READ(UP('memberA')))
await run('own clinic name update (allowed field, valid payload)', 'memberA', 'ALLOW', UPDATE('clinics/clinicA', { name: localized('Clinic A renamed') }))
await run('own clinic service create (valid)', 'memberA', 'ALLOW', WRITE('clinics/clinicA/services/svcNew', { ...svc('New service', 5), name: localized('New service') }))
await run('own clinic service update (valid)', 'memberA', 'ALLOW', UPDATE('clinics/clinicA/services/svcA1', { price: 30 }))
await run('own clinic faq create (valid)', 'memberA', 'ALLOW', WRITE('clinics/clinicA/faqs/faqNew', faq(3)))
await run('own clinic faq update', 'memberA', 'ALLOW', UPDATE('clinics/clinicA/faqs/faqA1', { order: 4 }))
await run('own clinic faq delete', 'memberA', 'ALLOW', DELETE('clinics/clinicA/faqs/faqA2'))
await run('own clinic public-visibility toggle (public flag)', 'memberA', 'DENY', UPDATE('clinics/clinicA', { public: false }))
await run('own clinic active toggle (active flag)', 'memberA', 'DENY', UPDATE('clinics/clinicA', { active: false }))
await run('own clinic slug rewrite', 'memberA', 'DENY', UPDATE('clinics/clinicA', { slug: 'clinic-a-2' }))
await run('service create with extra field (field allow-list)', 'memberA', 'DENY', WRITE('clinics/clinicA/services/svcBad', { ...svc('Bad', 6), name: localized('Bad'), secret: 'x' }))
await run('service create with invalid payload (negative price)', 'memberA', 'DENY', WRITE('clinics/clinicA/services/svcBad2', { ...svc('Bad2', 7), name: localized('Bad2'), price: -1 }))
await run('service create with non-localized name', 'memberA', 'DENY', WRITE('clinics/clinicA/services/svcBad3', { ...svc('Bad3', 8), name: 'plain string' }))
await run('service delete', 'memberA', 'DENY', DELETE('clinics/clinicA/services/svcA1'))
await run('appointment create from client', 'memberA', 'DENY', ADD('clinics/clinicA/appointments', { status: 'pending' }))
await run('appointment update from client', 'memberA', 'DENY', UPDATE('clinics/clinicA/appointments/aptA1', { status: 'confirmed' }))
await run('analytics event create from client', 'memberA', 'DENY', ADD('clinics/clinicA/analyticsEvents', { type: 'view' }))
await run('clinic create', 'memberA', 'DENY', WRITE('clinics/clinicC', { slug: 'clinic-c', public: true, active: true, name: localized('C'), description: localized('C') }))
await run('own membership write (status)', 'memberA', 'DENY', WRITE(UP('memberA'), { clinicId: 'clinicA', role: 'owner', status: 'active' }))
await run('unlisted collection write', 'memberA', 'DENY', WRITE('unlisted/doc2', { secret: false }))
// ================= GROUP 3: cross-clinic isolation =================
log('--- GROUP 3: cross-clinic isolation (memberA -> clinicB and reverse) ---')
await run('other public clinic read (memberA -> clinicB, public by design)', 'memberA', 'ALLOW', READ('clinics/clinicB'))
await run('other clinic non-public read (memberA -> clinicHidden)', 'memberA', 'DENY', READ('clinics/clinicHidden'))
await run('other public clinic active service read (memberA -> svcB1, public by design)', 'memberA', 'ALLOW', READ('clinics/clinicB/services/svcB1'))
await run('other clinic inactive service read (memberA -> svcBHidden)', 'memberA', 'DENY', READ('clinics/clinicB/services/svcBHidden'))
await run('other clinic appointments read (memberA -> aptB1)', 'memberA', 'DENY', READ('clinics/clinicB/appointments/aptB1'))
await run('other clinic analytics read (memberA -> aggB1)', 'memberA', 'DENY', READ('clinics/clinicB/analyticsAggregates/aggB1'))
await run('other member profile read (memberA -> users/memberB)', 'memberA', 'DENY', READ('users/memberB'))
await run('other clinic update (memberA -> clinicB)', 'memberA', 'DENY', UPDATE('clinics/clinicB', { name: localized('Taken over') }))
await run('other clinic service create (memberA -> clinicB)', 'memberA', 'DENY', WRITE('clinics/clinicB/services/svcInjected', svc('Injected', 9)))
await run('other clinic faq delete (memberA -> clinicB faq)', 'memberA', 'DENY', DELETE('clinics/clinicB/faqs/faqB1'))
await run('other clinic write attempt (memberB -> clinicA service)', 'memberB', 'DENY', WRITE('clinics/clinicA/services/svcInjectedByB', svc('Injected B', 9)))
await run('other clinic update attempt (memberB -> clinicA)', 'memberB', 'DENY', UPDATE('clinics/clinicA', { name: localized('Taken over by B') }))
await run('own clinic read still allowed (memberB -> clinicB)', 'memberB', 'ALLOW', READ('clinics/clinicB'))
await run('own clinic write still allowed (memberB -> create service)', 'memberB', 'ALLOW', WRITE('clinics/clinicB/services/svcB2', { ...svc('Service B2', 2), name: localized('Service B2') }))

// ================= GROUP 4: trusted-operation bypass (server-side writer) =================
log('--- GROUP 4: trusted operations (admin SDK / server path) on clinicA ---')
const trusted = async (label, expectation, op) => {
  let outcome = 'ALLOW'
  let detail = 'allowed'
  try { await op() } catch (err) {
    outcome = 'ERROR'
    detail = String((err && (err.code || err.message)) || 'unknown')
  }
  const pass = outcome === expectation
  results.push({ label, persona: 'admin-sdk', expectation, outcome, pass })
  log(`${pass ? 'PASS' : 'FAIL'} [${outcome}/${expectation}] admin-sdk :: ${label}${pass ? '' : ` (${detail})`}`)
}
await trusted('server creates appointment', 'ALLOW', () => adb.doc('clinics/clinicA/appointments/aptTrusted').set({ patientName: 'T', status: 'pending', preferredDate: '2026-02-01' }))
await trusted('server updates appointment status', 'ALLOW', () => adb.doc('clinics/clinicA/appointments/aptTrusted').update({ status: 'confirmed' }))
await trusted('server writes analytics event', 'ALLOW', () => adb.doc('clinics/clinicA/analyticsEvents/evTrusted').set({ type: 'booking_submitted' }))
await trusted('server writes analytics aggregate', 'ALLOW', () => adb.doc('clinics/clinicA/analyticsAggregates/aggTrusted').set({ views: 9 }))
await makeClient('trustedNew')
await trusted('server provisions membership (status=active)', 'ALLOW', () => adb.doc(UP('trustedNew')).set({ clinicId: 'clinicA', role: 'admin', status: 'active' }))
await trusted('server suspends membership (status=inactive)', 'ALLOW', () => adb.doc(UP('trustedNew')).update({ status: 'inactive' }))
await trusted('server flips clinic public flag', 'ALLOW', () => adb.doc('clinics/clinicInactive').update({ public: false }))
await run('member reads server-created appointment', 'memberA', 'ALLOW', READ('clinics/clinicA/appointments/aptTrusted'))
await run('member reads server-created analytics aggregate', 'memberA', 'ALLOW', READ('clinics/clinicA/analyticsAggregates/aggTrusted'))
await run('anonymous reads server-created appointment', 'anon', 'DENY', READ('clinics/clinicA/appointments/aptTrusted'))
await run('anonymous reads server-created analytics aggregate', 'anon', 'DENY', READ('clinics/clinicA/analyticsAggregates/aggTrusted'))
await run('suspended membership cannot read own clinic appointments', 'trustedNew', 'DENY', READ('clinics/clinicA/appointments/aptTrusted'))
// ================= GROUP 5: membership self-write / privilege escalation =================
log('--- GROUP 5: membership self-write and privilege escalation attempts ---')
await run('self role escalation (owner -> role=admin write)', 'memberA', 'DENY', UPDATE(UP('memberA'), { role: 'admin' }))
await run('self status change (active -> inactive)', 'memberA', 'DENY', UPDATE(UP('memberA'), { status: 'suspended' }))
await run('self clinic reassignment (clinicA -> clinicB)', 'memberA', 'DENY', UPDATE(UP('memberA'), { clinicId: 'clinicB' }))
await run('self membership document create', 'memberA', 'DENY', WRITE('users/mt1ProbeNewMember', { clinicId: 'clinicA', role: 'owner', status: 'active' }))
await run('self membership document delete', 'memberA', 'DENY', DELETE(UP('memberA')))
await run('staff self role escalation', 'staffA', 'DENY', UPDATE(UP('staffA'), { role: 'admin' }))
await run('read another membership document (adminA)', 'memberA', 'DENY', READ(UP('adminA')))
await run('read membership document of own clinic peer (memberB -> adminA)', 'memberB', 'DENY', READ(UP('adminA')))

// ================= GROUP 6: inactive membership and non-privileged roles =================
log('--- GROUP 6: inactive membership (inactiveA) and staff role (staffA) ---')
await run('inactive: public clinic read', 'inactiveA', 'ALLOW', READ('clinics/clinicA'))
await run('inactive: non-public clinic read', 'inactiveA', 'DENY', READ('clinics/clinicHidden'))
await run('inactive: own clinic appointments read', 'inactiveA', 'DENY', READ('clinics/clinicA/appointments/aptA1'))
await run('inactive: own clinic inactive service read', 'inactiveA', 'DENY', READ('clinics/clinicA/services/svcA2'))
await run('inactive: own clinic analytics read', 'inactiveA', 'DENY', READ('clinics/clinicA/analyticsAggregates/aggA1'))
await run('inactive: service create', 'inactiveA', 'DENY', WRITE('clinics/clinicA/services/svcInactive', svc('Inactive', 9)))
await run('inactive: clinic update', 'inactiveA', 'DENY', UPDATE('clinics/clinicA', { name: localized('Inactive') }))
await run('inactive: own profile read (self only)', 'inactiveA', 'ALLOW', READ(UP('inactiveA')))
await run('inactive: peer profile read', 'inactiveA', 'DENY', READ(UP('memberA')))
await run('staff: non-member non-public clinic read (clinicHidden)', 'staffA', 'DENY', READ('clinics/clinicHidden'))
await run('staff: own clinic inactive service read (memberOf = owner/admin only)', 'staffA', 'DENY', READ('clinics/clinicA/services/svcA2'))
await run('staff: own clinic active service read (public branch of public clinic)', 'staffA', 'ALLOW', READ('clinics/clinicA/services/svcA1'))
await run('staff: own clinic appointments read (memberOf = owner/admin only)', 'staffA', 'DENY', READ('clinics/clinicA/appointments/aptA1'))
await run('staff: own clinic analytics read (owner/admin only)', 'staffA', 'DENY', READ('clinics/clinicA/analyticsAggregates/aggA1'))
await run('staff: service create (owner/admin only)', 'staffA', 'DENY', WRITE('clinics/clinicA/services/svcStaff', svc('Staff', 9)))
await run('staff: clinic update (owner/admin only)', 'staffA', 'DENY', UPDATE('clinics/clinicA', { name: localized('Staff edit') }))
await run('staff: faq update (owner/admin only)', 'staffA', 'DENY', UPDATE('clinics/clinicA/faqs/faqA1', { order: 2 }))
await run('staff: faq delete (owner/admin only)', 'staffA', 'DENY', DELETE('clinics/clinicA/faqs/faqA1'))
await run('staff: other public clinic read (clinicB, public by design)', 'staffA', 'ALLOW', READ('clinics/clinicB'))
await run('staff: own profile read', 'staffA', 'ALLOW', READ(UP('staffA')))
await run('admin-role: own clinic analytics read', 'adminA', 'ALLOW', READ('clinics/clinicA/analyticsAggregates/aggA1'))
await run('admin-role: service create', 'adminA', 'ALLOW', WRITE('clinics/clinicA/services/svcAdmin', { ...svc('Admin', 6), name: localized('Admin') }))
await run('admin-role: clinic name update', 'adminA', 'ALLOW', UPDATE('clinics/clinicA', { description: localized('Updated by admin') }))
await run('admin-role: clinic public flag toggle (still denied)', 'adminA', 'DENY', UPDATE('clinics/clinicA', { public: false }))
await run('admin-role: other membership read', 'adminA', 'DENY', READ(UP('memberA')))
// ================= GROUP 7: authenticated user with no membership =================
log('--- GROUP 7: authenticated user with no membership document (noMembership) ---')
await run('no-membership: public clinic read', 'noMembership', 'ALLOW', READ('clinics/clinicA'))
await run('no-membership: non-public clinic read', 'noMembership', 'DENY', READ('clinics/clinicHidden'))
await run('no-membership: active service read on public clinic', 'noMembership', 'ALLOW', READ('clinics/clinicA/services/svcA1'))
await run('no-membership: inactive service read', 'noMembership', 'DENY', READ('clinics/clinicA/services/svcA2'))
await run('no-membership: appointments read', 'noMembership', 'DENY', READ('clinics/clinicA/appointments/aptA1'))
await run('no-membership: analytics read', 'noMembership', 'DENY', READ('clinics/clinicA/analyticsAggregates/aggA1'))
await run('no-membership: own profile read', 'noMembership', 'ALLOW', READ(UP('noMembership')))
await run('no-membership: peer profile read', 'noMembership', 'DENY', READ(UP('memberA')))
await run('no-membership: service create', 'noMembership', 'DENY', WRITE('clinics/clinicA/services/svcNoMem', svc('NoMem', 9)))
await run('no-membership: clinic update', 'noMembership', 'DENY', UPDATE('clinics/clinicA', { name: localized('NoMem') }))
await run('no-membership: membership document create', 'noMembership', 'DENY', WRITE('users/mt1ProbeNoMem2', { clinicId: 'clinicA', role: 'owner', status: 'active' }))
await run('no-membership: unlisted write', 'noMembership', 'DENY', WRITE('unlisted/doc3', { secret: false }))

// ============ GROUP 8: P0-B3 - updates on a PROVISIONED-SHAPE clinic document ============
// Regression for the production defect where every clinic-document update was denied.
// The fixture clinics above predate the provisioning schema, which is exactly why the
// defect survived CI. This group updates a clinic seeded in the producer's own shape.
log('--- GROUP 8: P0-B3 provisioned-shape clinic document (ownerProv owns clinicProvisioned) ---')
// Legitimate clinic-editable writes must be ACCEPTED against the provisioned shape.
await run('provisioned clinic: owner update name (editable)', 'ownerProv', 'ALLOW', UPDATE('clinics/clinicProvisioned', { name: localized('Renamed by owner') }))
await run('provisioned clinic: owner update description (editable)', 'ownerProv', 'ALLOW', UPDATE('clinics/clinicProvisioned', { description: localized('Owner description') }))
await run('provisioned clinic: owner update contact (editable, valid shape)', 'ownerProv', 'ALLOW', UPDATE('clinics/clinicProvisioned', {
  contact: { address: localized('1 Owner Street'), phone: '+213000000000', email: '' },
}))
// Server-owned and identity fields must stay immutable to the client, even though they
// are legitimately present in the resulting document.
await run('provisioned clinic: owner change lifecycle (immutable)', 'ownerProv', 'DENY', UPDATE('clinics/clinicProvisioned', { lifecycle: 'suspended' }))
// Removing the field entirely is a distinct bypass from changing its value, so it needs its
// own case: an owner must not be able to strip lifecycle off the document by deleting it.
await run('provisioned clinic: owner delete lifecycle field (immutable)', 'ownerProv', 'DENY', UPDATE('clinics/clinicProvisioned', { lifecycle: deleteField() }))
await run('provisioned clinic: owner change createdAt (immutable)', 'ownerProv', 'DENY', UPDATE('clinics/clinicProvisioned', { createdAt: deleteField() }))
await run('provisioned clinic: owner change updatedAt (immutable)', 'ownerProv', 'DENY', UPDATE('clinics/clinicProvisioned', { updatedAt: deleteField() }))
await run('provisioned clinic: owner change slug (identity, immutable)', 'ownerProv', 'DENY', UPDATE('clinics/clinicProvisioned', { slug: 'clinic-provisioned-2' }))
await run('provisioned clinic: owner toggle public (platform-only)', 'ownerProv', 'DENY', UPDATE('clinics/clinicProvisioned', { public: false }))
await run('provisioned clinic: owner toggle active (platform-only)', 'ownerProv', 'DENY', UPDATE('clinics/clinicProvisioned', { active: false }))
// The resulting-document key whitelist must stay closed: no arbitrary field injection.
await run('provisioned clinic: owner inject unknown field', 'ownerProv', 'DENY', UPDATE('clinics/clinicProvisioned', { injected: 'x' }))
// Tenant isolation must hold on the provisioned shape too.
await run('provisioned clinic: FOREIGN member update (cross-clinic)', 'memberB', 'DENY', UPDATE('clinics/clinicProvisioned', { name: localized('Taken over by B') }))
await run('provisioned clinic: anonymous update', 'anon', 'DENY', UPDATE('clinics/clinicProvisioned', { name: localized('Anon') }))
// The read side of the same document must remain public for a published clinic.
await run('provisioned clinic: anonymous read (public+active)', 'anon', 'ALLOW', READ('clinics/clinicProvisioned'))
// ================= SUMMARY =================
const failures = results.filter((r) => !r.pass)
const errors = results.filter((r) => r.outcome === 'ERROR')
const denies = results.filter((r) => r.outcome === 'DENY')
const allows = results.filter((r) => r.outcome === 'ALLOW')
log('')
log('================ MT-1 RULES MATRIX SUMMARY ================')
log(`TOTAL CASES     : ${results.length}`)
log(`PASS            : ${results.length - failures.length}`)
log(`FAIL            : ${failures.length}`)
log(`observed ALLOW  : ${allows.length}`)
log(`observed DENY   : ${denies.length}`)
log(`observed ERROR  : ${errors.length}`)
if (failures.length) {
  log('--- FAILED CASES ---')
  for (const f of failures) log(`FAILED: [${f.outcome}/${f.expectation}] ${f.persona} :: ${f.label}`)
}
log(`MATRIX RESULT   : ${failures.length === 0 ? 'ALL PASS' : 'FAILURES PRESENT'}`)
log(`RULES SOURCE    : ${path.join(REPO_ROOT, 'firestore.rules')}`)
process.exit(failures.length === 0 ? 0 : 1)
