# MT-1 production evidence record (Step 2 verification)

Per-test record for Master Test Plan section 5 (`docs/master-tests.md`, "MT-1 - Firebase Foundation
+ Public Data + Appointment System"), written from machine-captured raw material as required by
`docs/master-tests.md` section 3 (Test Evidence Standard). This file is the tracked artifact; the raw
captures it is derived from live outside the repository (`%TEMP%\mt1run\`, listed in section 1).

No password, temporary credential, ID token, refresh token, private API key, service-account key,
password hash or digest value appears in this file. Credential material was read by the probes and
compared inside the probe process only; every value below is a code, status, count, identifier or
boolean.

## 0. Environment and provenance

| Item | Value |
|---|---|
| Verification date | 2026-10-04 (this session), building on the recorded gate runs of 2026-10-01/02/03 |
| Repository state | `main` = `origin/main` = `3388d150239c7278d1bcc5506f9d7aef30cc5c4c` |
| Commits under test | `8dd4936` (Step 1 + P08 password-setup work), `3388d15` (CI emulator JDK 21) |
| CI | GitHub Actions run `37217039059` - PASS (Java 21 emulator job) |
| Web deployment | Vercel alias `https://vet-project-qc3h.vercel.app`, deployment `dpl_5kRVSzmV8CPtQmmV5hLjYRHRKE2Z` (commit-bound to `3388d15`) |
| Backend | Trusted Netlify Functions reached through the Vercel bridge `/.netlify/functions/<operation>` (`vercel.json`) |
| Firebase project | `vet-life` (production), production Firestore rules (191 lines, sha256-verified against the repository during Phase D) and both declared composite indexes READY |
| Browser | Headless Microsoft Edge `Edg/154.0.4258.48` driven over CDP (`Runtime`/`Network`/`Page` domains) |
| Auth | Email/Password provider enabled; authorised domains verified |

## 1. Method and raw evidence sources

Four probe families were run against the deployed topology (no emulator is involved in any row below):

1. **Rules / client-SDK parity** - the application's own `firebase` client SDK against production
   Firestore, so authorization decisions come from the deployed rules.
2. **Trusted boundary** - HTTP calls to the deployed functions through the Vercel bridge, with and
   without a real Firebase ID token.
3. **Browser UI** - the deployed SPA in a real browser over CDP (login form typed and submitted, real
   reload, the application's own sign-out control).
4. **Admin-equivalent bookkeeping** - read-only Firebase Admin access (operator-authorised service
   account, outside the repository) used only to observe fixture state and to perform the two
   explicitly bounded fixture writes recorded in sections 4 and 6.

| Raw capture (outside the repository) | Produces | Mutating? |
|---|---|---|
| `%TEMP%\mt1run\evidence.jsonl` - **293 recorded rows** | every gate below, including the 2026-10-01/02/03 runs and the MT-1.6 probe of 2026-10-04 | mixed (see rows) |
| `%TEMP%\mt1run\mt11-ui-evidence.json` (+ `-2026-10-04` copy) | the MT-1.1 browser run re-executed in this session | browser session only |
| `%TEMP%\mt1run\p08http1.log` | P08 boundary + anti-bypass probes | no |
| `%TEMP%\mt1run\p08stamp2.log` | P08 causal isolation (three stored verifier states) | one membership field |
| `%TEMP%\mt1run\p08provision.log` | platform-owner boundary + real provisioning attempt | one throwaway Auth identity, created and deleted |
| `%TEMP%\mt1run\p08keys.log`, `p08lookup.log` | Admin SDK vs raw Admin API credential-field comparison | no |
| `%TEMP%\mt1run\mt17b0c.log` | public-window re-check (MT-1.5 / MT-1.7 B0c) | no |
| `%TEMP%\mt1run\mt16.log` | MT-1.6 dynamic-content probe (clinic write, public read, browser render) | no net change (see MT-1.6 P8) |
| `%TEMP%\mt1run\phaseJ.log`, `phaseJ.json` | fixture preservation + net impact (Phase J) | no |

Raw-capture timestamps are the row timestamps inside `evidence.jsonl`; each row carries
`gate, id, action, expected, actual, status, evidence, at`. Statuses are `PASS`, `FAIL` and `NOTE`
(`NOTE` rows are contract rationales, not assertions). Where a gate was re-executed after a harness
defect was found, the superseding rows are marked `R` and both the superseded `FAIL` and the
corrected `PASS` are retained here.

Two captures that the record relies on are promoted into the repository, because their raw content
is what the claims in sections 0 and 2.1 stand on:

| Tracked copy | Raw source | Supports |
|---|---|---|
| `docs/evidence/mt1-deployed-rules-parity-2026-10-04.txt` | `tests/mt1-deployed-read.mjs` output of the same run | section 0: deployed rules == local `firestore.rules` (191 lines, sha256 match) and both composite indexes READY |
| `docs/evidence/mt11-ui-evidence-2026-10-04.json` | `%TEMP%\mt1run\mt11-ui-evidence.json` (same run) | section 2.1: the DOM text behind every MT-1.1U row |

## 2. MT-1 per-test records

Rows are cited by the `action` text they carry in `evidence.jsonl` (the ledger is line-oriented and
append-only; every row also carries `gate`, `id`, `expected`, `actual`, `status`, `evidence`, `at`).
Where a gate was re-run after a harness defect, the superseded rows are retained and the corrected
run is marked `R`.

### 2.1 MT-1.1 - Firebase foundation: authentication and protected access

Actor: fixture clinic owner A (`mt1-clinic-alpha`) and an unauthenticated visitor. Backend: production
Firestore rules via the client SDK + the Identity Toolkit REST endpoints.

| # | Action | Expected | Actual | Status |
|---|---|---|---|---|
| 1 | Unauth `getDoc clinics/{A}/appointments/{id}` (client SDK, production rules) | denied | denied | PASS |
| 2 | `firebase/client signInWithEmailAndPassword` (fixture owner A) | session established | session established | PASS |
| 3 | `POST accounts:signInWithPassword` with the same credentials | HTTP 200, uid matches | HTTP 200, uid matches | PASS |
| 4 | `POST accounts:refresh` with the returned refresh token | new ID token (session persistence contract) | new ID token issued | PASS |
| 5 | Authenticated (owner A) `getDoc clinics/{A}/appointments/{id}` | allowed | allowed | PASS |
| 6 | `firebase/auth signOut()` then inspect `currentUser` | `null` | `null` | PASS |
| 7 | Unauth `getDoc appointments` AFTER logout | denied | denied | PASS |
| 8 | (NOTE) fixture context | - | clinicA/clinicB/serviceId/slugA recorded | NOTE |

**Additional UI-level rows - MT-1.1U (headless Edge against the deployed origin, 2026-10-04):**

| Row | Action | Expected | Actual | Status |
|---|---|---|---|---|
| ENV | browser environment (first attempt) | headless Edge over CDP | `bodyText: ""` - harness artifact, superseded by the run below | FAIL (superseded) |
| UI-1 | application opens and the SPA hydrates | real application DOM, not an HTML shell | `VETLIFE ... سجّل الدخول ...` rendered | PASS |
| UI-2 | unauthenticated `/clinic/dashboard` | redirected away, no workspace chrome | path `/`, no chrome | PASS |
| UI-3 | authentication through the real login UI | login form used, no token injected, app routes the session | form submitted, routed to `/clinic/first-password`, `loginError: null` | PASS |
| SETUP | first-password setup completed through the existing UI | `changePasswordAndCompleteSetup` -> 200 -> `/clinic/dashboard` | `completeClinicPasswordSetup -> HTTP 412 failed-precondition`, stayed on `/clinic/first-password` | **FAIL** |
| UI-4 | authenticated owner enters the protected workspace | workspace DOM (clinic name, nav) | 0 nav items, still on the setup screen | **FAIL** |
| UI-5 | session persistence across a real `Page.reload` | `/clinic/dashboard` still rendered | stayed on `/clinic/first-password` | **FAIL** |
| UI-6 | application sign-out control | chrome removed, route leaves the workspace | returned to `/` | PASS |
| UI-7 | workspace inaccessible after UI logout | no workspace | path `/`, no chrome | PASS |

The UI recorder appended this run's rows twice (identical content, 18 rows = 2 x 9); the table above is
the deduplicated set. Verdict: **MT-1.1 FAIL** - the authentication foundation itself is verified end
to end (rows 1-7, UI-1/2/3/6/7), but the mandatory first-password step of the same flow cannot
complete (SETUP), which also makes the "authenticated owner reaches the protected workspace" and
"session persists across reload" assertions unobservable (UI-4, UI-5) rather than failed on their own
merit. Root cause: P0-B1.

### 2.2 MT-1.2 - Membership resolution and clinic identity

| Action | Expected | Actual | Status |
|---|---|---|---|
| Authenticated owner A `getDoc users/{uidA}` | own membership readable (uid, clinicId, role owner, status active) | matches | PASS |
| Authenticated owner B `getDoc users/{uidB}` | own membership readable | matches | PASS |
| Owner A `getDoc users/{uidB}` (cross-membership probe) | denied | denied | PASS |
| Owner A `idToken` + body `clinicId=clinicB` -> `transitionAppointment` (client-selected clinic identity) | the server ignores the body identity and uses the token membership | server used clinic A / rejected - no mutation of clinic B | PASS |
| Owner A `idToken` + body `clinicId=clinicA`, non-existent appointment | no mutation possible | rejected, no write | PASS |
| Same operation with no `Authorization` header | 401 | 401 | PASS |

Verdict: **MT-1.2 PASS**.

### 2.3 MT-1.3 - Cross-clinic isolation (production rules, both directions)

27 rows across three personas (`NONE`, owner A, owner B). Representative coverage: direct-path reads
of the other clinic (`getDoc clinics/{B}` from A and vice versa), cross-membership reads
(`getDoc users/{ownerB}`), query manipulation (`query clinics {public,active,slug=slugB}` from A), and
every clinic-A/B child collection (`appointments`, `faqs`, `services`, `analyticsAggregates`) from both
owners. Publicly designated reads (active services/FAQs of a published clinic) are allowed by design;
everything else is denied. All 27 rows PASS. Verdict: **MT-1.3 PASS**.


### 2.4 MT-1.4 - Protected client writes are rejected (production rules)

Actor: fixture owner A (authenticated through the production rules with the client SDK). 14 PASS rows.

| Action | Expected | Actual | Status |
|---|---|---|---|
| Owner A `setDoc clinics/{A}/appointments/{probe}` (direct client create) | denied - the trusted booking path is `createPublicAppointment` | denied | PASS |
| Owner A `setDoc clinics/{A}/analyticsEvents/{probe}` (direct analytics create) | denied - `recordAnalyticsEvent` is the trusted path | denied | PASS |
| Owner A `updateDoc users/{uidA} {role:"admin"}` (membership spoof) | denied | denied | PASS |
| Owner A `updateDoc clinics/{A} {public:false}` (platform lifecycle field) | denied | denied | PASS |
| Owner A `updateDoc clinics/{A} {active:false}` (platform lifecycle field) | denied | denied | PASS |
| Owner A `updateDoc clinics/{B} {name}` (cross-clinic write) | denied | denied | PASS |
| Owner A `setDoc clinics/{B}/faqs/{probe}` (cross-clinic child write) | denied | denied | PASS |
| UNAUTH `updateDoc clinics/{A} {name}` | denied | denied | PASS |
| UNAUTH `setDoc clinics/{A}/appointments/{probe}` | denied | denied | PASS |
| UNAUTH `getDoc clinics/{A}/faqs/{probe}` (probe `active:false`) | denied - inactive child never leaks publicly | denied | PASS |
| Owner A `setDoc clinics/{A}/faqs/{probe}` (permitted own-clinic write, valid FAQ shape) | **allowed** | allowed | PASS |
| Owner A `getDoc clinics/{A}/faqs/{probe}` after create | `exists=true` (persisted, not optimistic-only) | `exists=true` | PASS |
| Owner A `deleteDoc clinics/{A}/faqs/{probe}` (contract cleanup) | allowed | allowed | PASS |
| FAQ count of clinic A after cleanup vs baseline | restored | before=0 after=0 | PASS |

Two caveats recorded for accuracy: (a) the clinic-document denials (`{public:false}`, `{active:false}`,
cross-clinic `{name}`) attest the *intended* outcome, and P0-B3 later showed that **every**
clinic-document update is currently denied - these rows are therefore correct for a broader reason
than the rule's affected-key gate; (b) the only *positive* write asserted in this gate is the FAQ
subcollection create/persist/delete, which is exactly where a clinic owner is meant to be able to
write. Verdict: **MT-1.4 PASS** (all asserted denials and the one authorized write behaved as
specified).

### 2.5 MT-1.5 - Public visibility contract (unauthenticated client SDK)

Actor: unauthenticated visitor, production rules, app-exact query shapes. 8 PASS rows.

| Action | Expected | Actual | Status |
|---|---|---|---|
| UNAUTH `getDoc clinics/{A}` (published: `public:true`, `active:true`) | allowed | allowed | PASS |
| UNAUTH `getDoc clinics/{B}` (direct path to the unpublished clinic) | denied | denied | PASS |
| UNAUTH `query clinics {public:true, active:true, slug:"mt1-clinic-alpha"}` | exactly 1 document | 1 document | PASS |
| UNAUTH `query clinics {public:true, active:true, slug:"mt1-clinic-beta"}` | 0 documents | 0 documents | PASS |
| UNAUTH `query clinics/{A}/faqs {active:true}` | allowed (active child of a published clinic) | allowed | PASS |
| UNAUTH `query clinics/{A}/services {active:true}` | allowed | allowed | PASS |
| UNAUTH `query clinics/{B}/faqs {active:true}` | denied (child of an unpublished clinic) | denied | PASS |
| UNAUTH `query clinics/{B}/services {active:true}` | denied | denied | PASS |

Verdict: **MT-1.5 PASS**.



### 2.6 MT-1.6 - Dynamic clinic data (workspace write -> public surface read)

This gate closes the last coverage gap and is the only gate in this pack whose *write* half fails.
The first probe attempt stopped at `[MT-1.6 ERR] FAIL | FirebaseError: 7 PERMISSION_DENIED` (the
clinic-document update); the probe was then restructured into the isolation matrix below and re-run.

Actor: fixture owner A (client SDK, real ID token) and an unauthenticated visitor. Browser:
headless Edge 154 over CDP against `https://vet-project-qc3h.vercel.app/c/mt1-clinic-alpha`.

| Row | Action | Expected | Actual | Status |
|---|---|---|---|---|
| A1 | UNAUTH baseline of the public data path (`getPublicClinicBySlug` query shape) | clinic resolves; content/children enumerate | `resolved=true`, `contact=absent`, `faqs=0`, `services=[LeDrehdvBPiXy43o21XV]` | PASS |
| A2 | owner authenticates through the client SDK against production rules | session established, uid matches the fixture membership | `signedIn=true`, `uidMatchesFixture=true` | PASS |
| C1 | owner saves clinic-managed content with the **exact payload of `updateClinicProfile()`** (the clinic settings editor) | accepted (every affected key is permitted and the resulting document satisfies the key whitelist) | `writeDenied=true code=permission-denied` | **FAIL** |
| C2 | owner writes a **single explicitly whitelisted key** (`description`) | accepted | `writeDenied=true code=permission-denied` | **FAIL** |
| C3 | **control:** same actor writes `clinics/{A}/services/{sid}` (value unchanged) | accepted | `writeAccepted=true` | PASS |
| R0 | PUBLIC PAGE rendered for an unauthenticated visitor shows persisted Firestore content | the clinic name stored in Firestore is rendered (no hard-coded demo value) | Edge 154, 1573 chars rendered, 3 localized name candidates, name visible | PASS |
| P4 | owner creates a managed-content record (FAQ) through the rules | accepted by `faqFieldsAreAllowed()` + `validFaq()`, receives an id | accepted, id returned | PASS |
| P5 | UNAUTH public child query of the published clinic includes the new FAQ | the new id is returned | present | PASS |
| P6 | PUBLIC PAGE rendered after the write contains the new FAQ question | question text rendered in the active language (or its `en` fallback) | text present (language-agnostic assertion) | PASS |
| P7 | owner deletes the probe FAQ | the id disappears from the unauthenticated active-FAQ query; set equals baseline | `equalsBaseline=true` | PASS |
| P8 | read-back of the clinic document after the denied writes | a denied write persists nothing; document identical to its pre-probe state | `clinicFields=active,createdAt,lifecycle,name,public,slug,updatedAt`, `contactPathWritten=false` | PASS |
| Z1 | net impact of the MT-1.6 probe | FAQ created and deleted; no other document touched | `servicesUnchanged=true`, `faqRegistrationNetZero=true` | PASS |

Reading of the result: the **public read half of MT-1.6 is verified in production** - Firestore is the
source of truth for the published surface (R0), a managed-content record written by the tenant owner
becomes visible through the unauthenticated data path (P5) *and* on the rendered public page (P6),
and the write is fully reversible (P7, Z1). The **workspace write half fails**: C1 (the product's own
editor payload) and C2 (a single whitelisted key) are both denied while C3 proves the actor and the
rules engine accept that same owner elsewhere. P8 supplies the field list that explains why, and the
result is registered as P0-B3. Verdict: **MT-1.6 FAIL** (C1, C2), with all read-side and
reversibility assertions PASS.

### 2.7 MT-1.7 - Public booking through the deployed path (and MT-1.7B re-check)

Actor: unauthenticated public visitor via `client -> Vercel -> vercel.json bridge -> Netlify
createPublicAppointment`.

MT-1.7 (9 PASS rows): the published clinic resolves for an unauthenticated visitor (`docs=1`,
`public=true`, `active=true`); its active service is readable (`active=true`, `price=1500`,
`currency=DZD`); the owner's baseline read of clinic A appointments and of the target slot
(`2026-10-08 23:30`) showed the slot free (`slotOccupied=false`); exactly one valid booking was
submitted with the app-exact payload and returned `HTTP 200` with `status=pending`; the owner's
server-side read of the created document (`gG5rbavGZpI4xZFfo3lE`) found every approved G3.1 field,
matching `clinicId`/`serviceId`/`date`/`time`/`petName`/`notes`, `createdAt` as a server timestamp and
`status=pending`; the same document was visible through the approved membership read path
(`ClinicDashboard`) as exactly one new document; the response envelope and the persisted state agreed
(checked twice); and the public window `{public==true && active==true}` contained only
`mt1-clinic-alpha` (`betaInPublicWindow=0`).

Two MT-1.7 rows recorded FAIL and are superseded: the first public-window checks read the unauthorized
`clinics` query *without* the `public==true` constraint, so the harness turned `permission-denied`
into a false "exposure" reading. The corrected row above (`publicSlugs=[mt1-clinic-alpha]`) and MT-1.7B
both contradict them, and the ledger retains the correction row plus an explicit NOTE that the earlier
lines were harness artifacts.

MT-1.7B (7 PASS rows, read-only): the unpublished clinic is denied on a direct path read; enumerating
every publicly visible clinic returns only the published one; the published clinic is resolvable by its
canonical slug; the unpublished clinic is absent from the window; a child collection of the unpublished
clinic is denied while the child services of the published clinic are readable. Verdict: **MT-1.7 PASS**
(with the fixture appointment retained - see section 6).

### 2.8 MT-1.8 - Public booking hardening (deployed rejection matrix)

Actor: unauthenticated; URL `https://vet-project-qc3h.vercel.app/.netlify/functions/createPublicAppointment`;
deployed-chain evidence recorded (`server=Vercel`, `x-nf-request-id`, `x-vercel-id`). No FAIL rows.

Rejection categories, each row asserted the operation is refused with the correct error code and that a
follow-up appointment inventory shows no write:

- **Clinic gate:** `clinicId` omitted / `""` / `null` / non-string / containing `/` / well-formed but
  non-existent / the unpublished clinic (`public:false`) / the unpublished clinic paired with a clinic-A
  service / a foreign tenant's own active service.
- **Service gate:** `serviceId` omitted / `""` / containing `/` / well-formed but non-existent in clinic A
  / a foreign tenant's service id / an inactive service under clinic A / the temp cross-tenant pair.
- **Date and time:** `2020-01-01` (past), `2026-02-30` (impossible), `2026/10/09` (format), `25:99`
  and `9:5` (invalid/malformed time), omitted time.
- **Field bounds:** `ownerEmail` invalid / non-string / over 254 chars; `ownerName` over 161;
  `ownerPhone` over 41; `petName` over 121; `notes` over 2001; `petType` blank / invalid value / omitted.
- **Mass assignment:** injected `status`, `estimatedServiceValue`, `platformOwner` claim.
- **Protocol:** `GET` instead of `POST` (method enforcement), empty body, malformed JSON `{bad json`,
  JSON array `[]` as the payload (non-object).

Verdict: **MT-1.8 PASS**.

### 2.9 MT-1.9 - Booking conflict prevention and the real race window

Actor: unauthenticated public visitor through `client -> Vercel -> vercel.json bridge -> Netlify`.
Two **independent** client processes were used for the race (`pid1=11424`, `pid2=10156`, distinct, fire
gap = 6 ms). 11 PASS rows + 3 NOTE rows.

| Assertion | Expected | Actual | Status |
|---|---|---|---|
| Baseline (MT-1.7 fixture + service) | readable, no writes | read-only, unchanged | PASS |
| First valid booking on the free slot `2026-10-15 10:00` | accepted | accepted | PASS |
| Valid booking on the **already-occupied** slot `2026-10-08 23:30` (held by the MT-1.7 pending appointment) | rejected as a conflict | rejected | PASS |
| Concurrent request #1 on the free slot `2026-10-16 10:30` | one winner | winner | PASS |
| Concurrent request #2 on the SAME slot, fired simultaneously | conflict rejection | rejected | PASS |
| Race invariant: exactly one winner and exactly one rejection | true | true | PASS |
| Race invariant: Firestore prevented a race-created duplicate | true | true | PASS |
| No duplicate slot anywhere in clinic A | true | true | PASS |
| Service document unchanged | true | true | PASS |
| MT-1.7 fixture unchanged for the whole gate | true | true | PASS |
| Net production impact accounted exactly | true | true | PASS |

Verdict: **MT-1.9 PASS**.

### 2.10 MT-1.10 - Appointment lifecycle state machine (deployed trusted boundary)

Actor: authenticated clinic-A owner via a verified ID token, through
`client -> Vercel -> vercel.json bridge -> Netlify transitionAppointment`. 31 PASS, 2 FAIL (both
superseded by MT-1.10R), 4 NOTE.

- Fixture inventory before execution; a **new clinic-A fixture created through the real product path**
  (no Admin SDK) and persisted with the Phase 8 value snapshot.
- Cross-clinic protection: the clinic-A owner attempting to transition the clinic-B appointment via a
  body `clinicId` (clinic B) and by targeting the clinic-B document id inside clinic A - both rejected;
  the clinic-B appointment unchanged.
- Valid transitions: `X pending -> confirmed -> completed`, `Y pending -> confirmed -> cancelled`,
  `Z pending -> cancelled`, each accepted with the expected end state.
- Invalid transitions rejected: `cancelled -> completed`, `cancelled -> confirmed`,
  `completed -> cancelled`, `completed -> completed`, `completed -> confirmed`, `X confirmed -> pending`,
  `Y confirmed -> pending`, `Z pending -> completed` (skips `confirmed`), and a status outside the
  approved set (`"archived"`).
- Boundary hardening: forged/invalid ID token, unauthenticated request (no `Authorization` header),
  `GET` on the lifecycle operation (method enforcement), mass-assignment probe injecting `role`, a
  non-existent appointment id.
- Preservation: the protected MT-1.7 artifact `gG5rbavGZpI4xZFfo3lE` was never transitioned or deleted
  (asserted at baseline and at the end); the MT-1.9 artifacts were preserved and reused, not deleted;
  the Phase 8 completed-service revenue aggregate held.
- Final lifecycle end-states match the approved state machine; the temporary clinic-B fixture was
  removed by exact document id; the final inventory and net impact were accounted.

The two FAIL rows of the first run (`F4`, `C3`) returned `undefined` for every field because the
harness mis-parsed the creation response, so they could not verify the temporary clinic-B fixture or
its "unchanged after the cross-clinic attempts" assertion. MT-1.10R re-ran those bounded checks
against a confirmed-existing document: 5 PASS + 1 NOTE. Verdict: **MT-1.10 PASS**.

### 2.11 MT-1.11 - Realtime synchronization across independent clients (and MT-1.11R re-check)

Contract: `docs/master-tests.md:358-365` + `docs/phase-2-gate-2.5-synchronization.md`. Actors: two
**independent** authorized client sessions plus one differently authorized session (clinic-B owner).
9 PASS, 2 FAIL (superseded), 4 NOTE; MT-1.11R: 4 PASS + 2 NOTE.

- A first authorized client session was established independently, and a second, independently
  authorized client read the SAME persisted state.
- A customer-facing booking was submitted through the real deployed path, and the authoritative
  Firestore state was captured before synchronization testing.
- One lifecycle transition (`pending -> confirmed`) was performed through the trusted boundary, and
  **both already-connected clients received the committed change** (no stale state) - the realtime
  contract of the gate.
- Each client was then torn down and rebuilt (whole-client refresh); the persisted state survived in
  both, including the independently authorized one.
- A differently authorized client (clinic-B owner) could not surface clinic-A data.
- Noted: a new appointment had to be created because every retained fixture was already terminal; the
  created document is `FuN5qwWu8C9WCvgEwi2y` (created through the public product path) and it is part of
  the recorded net impact.

The two FAIL rows (`A2`, `C2`) were caused by a wrong document-id constant in the harness (the
protected MT-1.7 id was mistyped), so the "protected/preserved fixtures intact" and "dashboard reflects
the persisted appointments" checks could not match their expectation even though the observed inventory
was correct. MT-1.11R corrected the constant and re-verified: the final Firestore read-back of all
synchronized state, the dashboard reflecting **all** persisted appointments including the protected one,
and the protected/preserved evidence intact after the gate (4 PASS + 2 NOTE). Verdict:
**MT-1.11 PASS**.

### 2.12 Record summary

Every row of the ledger is accounted for below. `FAIL` rows are of two kinds, and the distinction
matters when reading the pack: rows marked **superseded** were harness/parse artifacts that a corrected
run replaced (their expectations are contradicted by later PASS rows), while the remaining rows are the
production evidence for the three open defects.

| Gate | Rows | PASS | FAIL | NOTE | Verdict |
|---|---|---|---|---|---|
| MT-1.1 (rules/auth layer) | 8 | 7 | 0 | 1 | PASS |
| MT-1.1U (same gate through the real UI) | 18 | 10 | 8 | 0 | **FAIL** - P0-B1 |
| MT-1.2 | 8 | 6 | 0 | 2 | PASS |
| MT-1.3 | 28 | 27 | 0 | 1 | PASS |
| MT-1.4 | 15 | 14 | 0 | 1 | PASS |
| MT-1.5 | 9 | 8 | 0 | 1 | PASS |
| MT-1.6 | 17 | 12 | 3 | 2 | **FAIL** - P0-B3 |
| MT-1.7 | 23 | 9 | 2 | 12 | PASS (2 FAIL superseded) |
| MT-1.7B | 8 | 7 | 0 | 1 | PASS |
| MT-1.8 | 42 | 39 | 0 | 3 | PASS |
| MT-1.9 | 14 | 11 | 0 | 3 | PASS |
| MT-1.10 | 37 | 31 | 2 | 4 | PASS (2 FAIL superseded) |
| MT-1.10R | 6 | 5 | 0 | 1 | PASS |
| MT-1.11 | 15 | 9 | 2 | 4 | PASS (2 FAIL superseded) |
| MT-1.11R | 6 | 4 | 0 | 2 | PASS |
| P08-1 (password-setup operation) | 11 | 8 | 2 | 1 | **FAIL** - P0-B1 |
| P08-3 (causal isolation) | 7 | 5 | 1 | 1 | **FAIL** - P0-B1, fail-closed proof |
| P08-4 (provisioning boundary) | 12 | 10 | 1 | 1 | **FAIL** - P0-B2 |
| PHASE-J (post-run preservation) | 9 | 8 | 0 | 1 | PASS |
| **Total** | **293** | **230** | **21** | **42** | 19 gates/phases: 14 PASS / 5 FAIL (MT-1.1U, MT-1.6, P08-1, P08-3, P08-4) |

Of the 21 FAIL rows: **8 are superseded harness artifacts** (MT-1.1U `ENV` x2, MT-1.7 x2 - the
unauthorized public-window query shape, MT-1.10 `F4`/`C3` - response parse, MT-1.11 `A2`/`C2` - wrong
document-id constant) and **13 attest the three open production defects** (MT-1.1U `SETUP`/`UI-4`/`UI-5`
x2 runs = 6, MT-1.6 `ERR`/`C1`/`C2` = 3, P08-1 `B1`/`B2` = 2, P08-3 `P2` = 1, P08-4 `F1` = 1).



## 3. Defect register (production)

### P0-B1 - Clinic-owner first-password onboarding cannot complete in production (OPEN)

- **Symptom:** `POST /.netlify/functions/completeClinicPasswordSetup` answers
  `HTTP 412 failed-precondition "The permanent password has not been changed yet."` in *every*
  reachable production case, so `users/{uid}.mustChangePassword` can never become `false` and the
  application keeps the owner on `/clinic/first-password` indefinitely.
- **Contract:** `netlify/functions/completeClinicPasswordSetup.js:49-66`; `docs/master-tests.md`
  MT-1.1; the phase-8 onboarding flow.
- **Root cause (isolated in production):** the guard derives the live credential material from
  firebase-admin's `UserRecord`:
  - `userRecord.passwordHash` is `undefined` for real project users with firebase-admin `13.10.0`
    (the version pinned in `package.json` and installed in the workspace).
  - Evidence (`p08keys.log`): the SDK `UserRecord` *declares* `passwordHash`/`passwordSalt` (both
    appear in `Object.keys(...)` and `toJSON()`), but the runtime values are `undefined`, and
    `passwordUpdatedAt` is absent from the record entirely; the **raw** Admin API
    (`identitytoolkit .../accounts:lookup`) returns `passwordHash` (12 chars) and
    `passwordUpdatedAt` (number, `2026-10-01T16:30:09.913Z`) for the same uid using the same
    service account.
  - The guard fails closed on an unreadable hash (lines 60-62), so it returns 412 before any
    comparison can succeed.
- **Causal isolation (P08-3)** - one live credential held constant, only the stored verifier varied:

  | # | Stored verifier on `users/{alphaUid}` | Credential state | Expected | Actual | Status |
  |---|---|---|---|---|---|
  | P0 | absent | unchanged | 412 | `HTTP 412 failed-precondition` | PASS |
  | P1 | `SHA-256(live passwordHash)` | provably unchanged | 412 | `HTTP 412 failed-precondition` | PASS |
  | P2 | sentinel `'0'*64` (never equal to the live hash) | provably changed | `HTTP 200 {"completed":true}` | `HTTP 412 failed-precondition` | **FAIL** |
  | S3 | restored to `SHA-256(live passwordHash)` | unchanged | 64-hex verifier present | present, length 64 | PASS |

  P2 is the discriminator: a stored verifier that cannot equal the live hash must yield 200, and it
  yields 412. The missing verifier (hypothesis A) is therefore not the cause; the unreadable live
  credential (hypothesis B) is.
- **Consequence:** the repair shipped in `8dd4936` is green only against the **Auth emulator**
  (`docs/evidence/password-setup-ordering-evidence.txt`: suite VERDICT PASS, emulator project
  `demo-vetlife-pso`), because the emulator does return `passwordHash` through the SDK. Its premise -
  `provisionClinic.js:98-101` "The Admin SDK exposes passwordHash (firebase-admin@13.10.0, Auth
  emulator PROBE PASS)" - does not hold in production.
- **Blast radius:** every membership with `mustChangePassword === true`, including both MT-1 clinic
  owners (see section 6, J2).

### P0-B2 - Real clinic provisioning fails in production (OPEN)

- **Symptom:** `POST /.netlify/functions/provisionClinic` ->
  `HTTP 500 {"error":{"code":"internal","message":"An internal error occurred."}}`.
- **Actor:** a real identity carrying the `platformOwner` claim (minted for this probe through the
  service account, then deleted; see P08-4 P0/Z1).
- **Contract:** `netlify/functions/provisionClinic.js:97-151`.
- **Root cause:** the same SDK blindness - lines 102-111 read `freshOwnerUser.passwordHash`, receive
  `undefined`, delete the just-created Auth account and `fail('internal', ...)`.
- **Verified side-effects (P08-4 F2/F3):** the would-be owner email is not registered
  (`auth/user-not-found`), no clinic document carries the probe slug, and the clinic set,
  membership count and root collections are identical before and after the attempt.
- **Consequence:** the platform-owner-controlled provisioning path - the only supported way to
  create a clinic - cannot create a clinic in production at all.

### P0-B3 - No clinic document can be updated by anyone in production (OPEN)

- **Symptom:** every update to a `clinics/{clinicId}` document is rejected with
  `code=permission-denied`, so the clinic settings, branding and content editors
  (`/clinic/settings`, `/clinic/branding`, `/clinic/content`) cannot save anything for any tenant.
- **Contract:** `firestore.rules:137-143` (the clinic document update rule);
  `src/lib/clinicConfig.js:10-58`; `src/components/ClinicSettingsAdmin.jsx:33,47`;
  `src/components/ClinicContentAdmin.jsx:71`; `docs/master-tests.md` MT-1.6.
- **Production proof (MT-1.6 rows, 2026-10-04):**

  | Row | Actor | Write | Expected | Actual |
  |---|---|---|---|---|
  | C1 | fixture clinic owner (real ID token, client SDK) | the exact payload of `updateClinicProfile()` | accepted | `permission-denied` |
  | C2 | same | one explicitly whitelisted key (`description`) | accepted | `permission-denied` |
  | C3 | same | control: `clinics/{id}/services/{sid}` (`active`) | accepted | **accepted** |
  | P8 | read-back | clinic document fields after the denials | unchanged | `active,createdAt,lifecycle,name,public,slug,updatedAt` |

- **Root cause:** rule line 141 requires
  `request.resource.data.keys().hasOnly(['slug','public','active','name','description','logoUrl','branding','contact','openingHours','emergencyInformation','hero','about','footer','socialLinks'])`,
  but the document produced by the trusted provisioning path contains three further keys -
  `lifecycle: 'provisioned'`, `createdAt`, `updatedAt` (`provisionClinic.js:122-130`). `hasOnly` is
  evaluated over the **whole resulting document**, so it is false for every update, for every actor,
  in every tenant, regardless of which fields the write touches. `clinicUpdateFieldsAreAllowed()`
  (line 109) is *not* the cause: C2 writes a single key that it explicitly permits.
- **Why CI and the emulator suites missed it:** `allow create: if false` (line 139) makes the
  provisioning function the only writer of clinic documents, and that function runs with the Admin
  SDK and therefore **bypasses rules**. The emulator rules suite builds its own fixture documents,
  which do not carry the provisioning field set, so the two contract halves were never
  cross-checked. The mismatch is only observable by a *client* update of a *provisioned* document -
  exactly the intersection this session tested.
- **Blast radius:** every clinic ever provisioned (public profile, branding, content and FAQ section
  edits by the clinic's own owner). Combined with P0-B1 (owners are stuck on
  `/clinic/first-password`) and P0-B2 (no new clinic can be provisioned), the tenant-facing
  administration surface is currently non-functional in production.
- **Recommended fix direction (not applied in this session):** add `lifecycle`, `createdAt` and
  `updatedAt` to the `hasOnly` list on line 141 (they are already absent from
  `clinicUpdateFieldsAreAllowed()` on line 109, so they remain immutable to clients), then extend
  the emulator rules tests with (a) a document seeded in the provisioning field shape and (b) the
  assertions "owner update of `description` is allowed" / "`lifecycle`, `createdAt`, `updatedAt`
  mutations are denied", and re-run the end-to-end provisioning probe.

### Scope note

All three defects are production-only: they are invisible to the emulator suites and to CI, which is
why they survived Step 1. The P0 recorded earlier in `docs/evidence/README.md` (a `passwordUpdatedAt`
value that is always `undefined` on `UserRecord`) was addressed in source in `8dd4936`, but the
observable production outcome is unchanged, so the tracked P0 remains open in the form of P0-B1. P0-B3
is a different failure mode of the same property - the two halves of the Firestore contract (the
provisioning schema and the rules whitelist) agree with each other, but the rules never see the
documents that provisioning actually produces.

## 4. P08 gate records (password-setup operation and the provisioning boundary)

P08 is not part of MT-1; it is the recorded verification of the two Step-1 production defects. It is
part of this pack because the same deployed surface carries P0-B1 and P0-B2, and because P08 produced
the causal diagnosis that MT-1.1U then reproduced through the real UI.

### 4.1 Operations under test

- `completeClinicPasswordSetup` (Netlify, reached through the Vercel bridge). Guard contract:
  `completeClinicPasswordSetup.js:49-66` - it derives a digest from the subject user's **live** Auth
  credential material and compares it with the stored `passwordSetupHashDigest` on the membership. The
  guard's inputs are server-side only: the request body can never select the user, the membership or
  the credential.
- `provisionClinic` (Netlify). Contract: `provisionClinic.js:97-143` - creates the owner Auth account,
  the clinic document (`slug, public, active, lifecycle:'provisioned', name, createdAt, updatedAt`) and
  the owner membership (`mustChangePassword`, `passwordSetupIssuedAt`, `passwordSetupHashDigest`).

### 4.2 Causal isolation on a live subject (P08-3)

Subject: `mt1-clinic-alpha` (one live credential, only the stored verifier varied). Control:
`mt1-clinic-beta`, untouched throughout.

| Row | Stored verifier state | Expected | Observed | What it proves |
|---|---|---|---|---|
| S0 | read-only: is the live credential material retrievable? | non-empty `passwordHash` from the raw Admin API | `passwordHashAvailable=true` | the raw Identity Toolkit path **does** expose the material |
| P0 | no stored verifier (the state the pre-repair fixture replica left behind) | 412 `failed-precondition` | 412 | contract-correct |
| P1 | verifier = SHA-256 of the live credential hash (credential provably **unchanged**) | 412 | 412 | contract-correct, and the digest comparison itself works |
| P2 | verifier = sentinel (credential provably **changed**) | 200 `{completed:true}` | 412 | **decisive**: the deployed function cannot read the live material, so its guard can only ever answer "not changed" - fail-closed |
| S3 | restore the semantically correct verifier (SHA-256 of the live hash) | verifier present, 64 hex chars, product state left honestly un-completed | restored | the subject is returned to the correct state |
| Z1 | control + net impact | control untouched; subject: one membership field written (`passwordSetupHashDigest` x3, plus `updatedAt`), **0 credential rotations** | as expected | the isolation changed exactly one field |

Supporting field-surface comparison (`p08keys.log`, `p08lookup.log`): the Admin **SDK** `UserRecord`
exposes no `passwordHash`/`passwordSalt` (both `undefined`) and no `passwordUpdatedAt` in this project,
while the **raw** Identity Toolkit `accounts:lookup` call returns the credential fields. A guard built
on the SDK surface therefore cannot observe a credential change.

### 4.3 Boundary and anti-bypass rows (P08-1)

| Row | Action | Expected | Observed | Status |
|---|---|---|---|---|
| A1 | read-only membership facts of the **unchanged** clinic-B owner | `mustChangePassword=true`, verifier state recorded (names + booleans only) | `mustChangePassword=true`, `digestPresent=false`, `issuedAtPresent=true`, `fieldNames` captured | PASS |
| A2 | read-only membership facts of clinic A (credential already replaced once) | the rotated credential authenticates and the own-membership read succeeds | `fixtureCredentialSignIn=true`, read ok, `mustChangePassword=true` | PASS |
| C1 | clinic-B owner authenticates with the unchanged (temporary) credential | HTTP 200, uid matches | HTTP 200 | PASS |
| C2 | **before change:** call with an EMPTY body while the temporary credential is live | 412 `failed-precondition` | 412 | PASS |
| C3 | anti-bypass: same call with a body asserting completion (flag, digest, `updatedAt`, proof, spoofed uid/clinic/role) | byte-identical 412 | byte-identical 412 | PASS |
| B1 | **decisive:** call for clinic A whose credential provably changed and whose flag is still set | 200 `{completed:true}` under the repaired digest guard | 412 `failed-precondition` | **FAIL** |
| B2 | membership read-back after completion | `mustChangePassword=false`, `passwordSetupCompletedAt` present | both unchanged | **FAIL** |

B1/B2 are the rows MT-1.1U reproduces end to end through the product UI (there: `SETUP`, `UI-4`,
`UI-5`). The expectation in B1 encoded the *intent* of the Step-1 repair; P08-3 P2 then showed that the
intent cannot be met by the deployed code at all. Verdict: **P08-1 FAIL** (P0-B1 confirmed).

### 4.4 Provisioning boundary rows (P08-4)

| Row | Action | Expected | Observed | Status |
|---|---|---|---|---|
| N1 | `provisionClinic` with a real clinic-owner ID token that lacks the platform claim | 403 `permission-denied` | 403 "Platform Owner authorization is required." | PASS |
| N2 | `listProvisionedClinics` with the same clinic-owner token (a **read**) | 403 | 403 | PASS |
| P0 | mint a throwaway platform-owner identity and authenticate it | claim set server-side, real ID token | `claimSet=true`, `signedIn=true` | PASS |
| P1 | `listProvisionedClinics` with the platform claim | 200 with the provisioned clinics | 200: `mt1-clinic-alpha` (`public:true`) and `mt1-clinic-beta` (`public:false`), both `lifecycle:'provisioned'` | PASS |
| P2 | anti-bypass: valid platform token **plus** a body field asserting the claim | 400 `invalid-argument` | 400 "Unsupported clinic provisioning field: platformOwner" | PASS |
| F1 | **real provisioning of a fresh clinic through the deployed boundary** | 200 `{clinicId, slug, ownerUid, ownerEmail}` + a membership stamped must-change with a verifier | **HTTP 500 `internal`** (elapsed 2320 ms) | **FAIL** |
| F2 | rollback: the would-be owner account and the clinic by the probe slug | no orphan Auth user, no clinic | `ownerAccount.exists=false` (`auth/user-not-found`), clinics by slug = 0 | PASS |
| F3 | production data integrity after the attempt | no net change | clinic set, membership count and root collections identical before/after | PASS |
| Z1 | cleanup: the throwaway platform identity | deleted and verified absent | `deleted=true`, `verifiedAbsent=true` | PASS |
| Z3 | final net impact of the provisioning probe | root collections and clinic set unchanged, no probe slug, owner email unregistered | confirmed | PASS |

F1 is the evidence for **P0-B2**: the trusted path fails at the point where it must read the freshly
created owner's credential material (the function needs it to stamp the setup verifier), and the same
SDK-surface gap diagnosed in section 4.2 applies - so the failure is a 500 rather than a controlled
rejection. F2 shows the failure branch behaves correctly: no orphan Auth account, no orphan clinic.
Verdict: **P08-4 FAIL** (P0-B2 confirmed; the authorization half of the boundary is PASS on every
row).

The source records the underlying premise verbatim in its own comment: *"The Admin SDK exposes
passwordHash (firebase-admin@13.10.0, Auth emulator PROBE PASS), so the fresh record is read
immediately after creation"* (`provisionClinic.js:98-101`), and the empty-read branch at 104-110 fails
with `internal` after deleting the user it just created - exactly the behaviour F1 and F2 observed. So
the premise behind **both** P0-B1 and P0-B2 was validated against the Auth **emulator**
(`PROBE PASS`) and does not hold for the production backend.

### 4.5 Conclusion of the P08 records

- **P0-B1 is a fail-closed availability defect, not an authorization defect.** The guard never grants
  access it should not (C3, P2: request bodies cannot influence the decision, and every bypass attempt
  is refused identically), but it can never grant access it should either, because the credential
  material it needs is not reachable through the SDK surface the deployed function uses. The repair is
  therefore not a re-verification but a code change: read the live credential material through the raw
  Identity Toolkit path (section 4.2 S0 proves it is available) or replace the "has the credential
  changed?" premise with evidence the SDK does expose.
- **P0-B2 shares that root capability gap.** Provisioning 500s exactly where it must build the setup
  verifier from the new credential, and rolls back cleanly.
- **P0-B3 (section 3) is independent of both.** It is a Firestore contract mismatch, proven by client
  writes alone (MT-1.6 C1/C2/C3/P8), and it will remain a blocker even after P0-B1 and P0-B2 are fixed,
  because the clinic document shape written by the fixed provisioning path is the same shape the rules
  reject today.

## 5. Requirement-to-gate mapping

Every MT-1 requirement in `docs/master-tests.md` section 5 maps onto the gates recorded in section 2.

| MT-1 requirement (master test plan) | Gate(s) | Verdict |
|---|---|---|
| Firebase foundation: authentication and protected access | MT-1.1 (rows) + MT-1.1U (real UI) | **FAIL** - P0-B1 (backend rows all PASS) |
| Membership resolution and clinic identity | MT-1.2 | PASS |
| Cross-clinic isolation | MT-1.3 | PASS |
| Protected client writes are rejected | MT-1.4 | PASS |
| Public visibility contract | MT-1.5 | PASS |
| Dynamic clinic data (workspace write -> public surface) | MT-1.6 | **FAIL** - P0-B3 (read half PASS) |
| Public booking through the deployed path | MT-1.7 + MT-1.7B | PASS |
| Public booking input hardening | MT-1.8 | PASS |
| Booking conflict prevention (real race) | MT-1.9 | PASS |
| Appointment lifecycle state machine | MT-1.10 + MT-1.10R | PASS |
| Realtime synchronization across independent clients | MT-1.11 + MT-1.11R | PASS |
| Step-1 P0 repair verification (deployed surface) | P08-1, P08-3, P08-4 | **FAIL** - P0-B1, P0-B2 |

Step 2 outcome: **9 of the 11 MT-1 requirements PASS in production; 2 FAIL** on defects that are only
observable against the deployed topology. The failures are concentrated in one connected area - the
lifecycle of a freshly provisioned clinic owner: provisioning (P0-B2) leaves the owner unable to
complete the mandatory first password step (P0-B1, reproduced in the real UI), and the workspace that
opens after it could not save its own clinic document anyway (P0-B3).

## 6. Net production impact and fixture preservation

Phase J was run after the whole verification session as a read-only accounting pass against the live
project (`phaseJ.log`, `phaseJ.json`): 8 PASS + 1 NOTE. Its observations:

| Row | Subject | Observed |
|---|---|---|
| J1 | clinic fixtures and lifecycle | ids `[mt1-clinic-alpha, mt1-clinic-beta]`; alpha `{public:true, active:true, lifecycle:'provisioned'}`; beta `{public:false, active:true, lifecycle:'provisioned'}` |
| J2 | the two owner memberships | count=2; alpha `{role:owner, status:active, mustChangePassword:true, verifierPresent:true}`; beta `{role:owner, status:active, mustChangePassword:true, verifierPresent:false}` |
| J3 | tenancy integrity of `users/*` | `unexpected=none` |
| J4 | appointment fixtures with gate-end status | alpha = `9u1JRYpTiyKvJkcBjpyL: cancelled`, `FuN5qwWu8C9WCvgEwi2y: confirmed`, `OQ0oZRuajr7S774f4QzE: completed`, `PidMP5NnRDm2zJeF0JUu: cancelled`, `gG5rbavGZpI4xZFfo3lE: pending` |
| J5 | service fixture + clinic-B emptiness | alpha services = `[{id:LeDrehdvBPiXy43o21XV, active:true, price:1500, currency:DZD}]`; alpha subcollections `{services:1, faqs:0, appointments:5, analyticsEvents:0, analyticsAggregates:1}`; beta `{services:0, faqs:0, appointments:0, analyticsEvents:0, analyticsAggregates:0}` |
| J6 | root collections | `[clinics, users]` |
| J7 | Auth accounts | total=4; both fixture owners present; **no probe identity remaining**; the other two are pre-existing operator accounts (probe printed them redacted) |
| Z1 | net objects created/removed by the session | clinics=2, memberships=2, alpha appointments=5, alpha services=1, authUsersTotal=4 |

Interpretation: the session left **no new object behind except the appointment/service documents the
master test plan requires to be preserved**, and removed everything it created that was not a required
artifact:

- the temporary clinic-B appointment fixture (MT-1.10) was deleted by exact document id;
- the MT-1.10R/MT-1.11 probes reused existing artifacts instead of adding new ones where possible;
- the throwaway platform-owner Auth identity (P08-4) was deleted and verified absent;
- the MT-1.6 probe's FAQ was deleted (P7) and its clinic-document writes were denied, so nothing was
  written at all (P8);
- no probe account remains in Auth and no probe slug exists in `clinics`.

The two **explicitly bounded fixture writes** announced in section 1 were:

1. **The password-setup verifier stamp** on the clinic-A membership (section 4.2, `S3`/`Z1`): one field
   (`passwordSetupHashDigest`) written three times while the three causal states were exercised, plus the
   automatic `updatedAt`. The final stored value is the **semantically correct** verifier (SHA-256 of
   the live credential hash, 64 hex chars), the credential itself was **never rotated**
   (`credentialRotations=0`) and `mustChangePassword` was deliberately left `true`, i.e. the product
   state remains honestly un-completed rather than being faked into a completed state.
2. **The MT-1.6 probe**: no net change - the clinic-document writes were denied (`permission-denied`),
   and the FAQ record it created was deleted again, returning the FAQ set to its baseline
   (`faqRegistrationNetZero=true`, `servicesUnchanged=true`).

Deliberately **not** removed: the five clinic-A appointments (they are the MT-1.7/1.9/1.10/1.11 gate
artifacts, one of them - `gG5rbavGZpI4xZFfo3lE` - explicitly protected and never transitioned), the
service fixture, the analytics aggregate, and the two owner credentials. The MT-1.7 record explains
why: the contract defines no cleanup path and no authorized production delete exists for appointments.

## 7. Limitations, exclusions and the re-verification path

**What this pack does not claim.** MT-1 does not pass in production. Nine of its eleven requirements
were verified against the deployed topology in this session; two fail on defects that the emulator
suites cannot observe (sections 3 and 4). No row in this pack is derived from an emulator, a mock or a
local build.

**What must be fixed, and how each fix is re-verified.**

| Defect | Fix direction | Re-verification required |
|---|---|---|
| P0-B1 | read the live credential material through the raw Identity Toolkit path (section 4.2 `S0` proves it is reachable) or replace the "has the credential changed?" premise with evidence the SDK does expose for this project | the P08-3 three-state matrix (`P0`/`P1`/`P2`), P08-1 `B1`/`B2`, and the real-UI rows MT-1.1U `SETUP`/`UI-4`/`UI-5` |
| P0-B2 | same root capability (the setup verifier is built from the new credential at `provisionClinic.js:98-112`) | P08-4 `F1`/`F2`/`F3` plus the new clinic's lifecycle state - note that a fixed provisioning path still produces a clinic document the rules currently reject (P0-B3) |
| P0-B3 | add `lifecycle`, `createdAt`, `updatedAt` to the `hasOnly` list at `firestore.rules:141` (they stay immutable because `clinicUpdateFieldsAreAllowed()` at line 109 does not list them), add emulator rules tests seeded in the provisioning shape, then deploy the rules | MT-1.6 `C1`/`C2` (currently `permission-denied`) and a completed owner-write -> public-read round trip: MT-1.6 rows equivalent to the probe's P2/P3, i.e. persist managed content, read it back through the unauthenticated data path, then render `/c/<slug>` and find it |

The three fixes belong to one change set (they meet in the same provisioning/onboarding area), and the
re-verification is bounded: P08-3, P08-1, P08-4, MT-1.1U, MT-1.6 and a Phase-J preservation pass.

**Explicitly out of scope of this pack.** The emulator test suites and CI (green for this commit -
run `37217039059`), every phase after Phase 2, the platform-owner dashboard, and any requirement that
is not MT-1. Also out of scope: production performance and load behaviour, which no row here measures.

**Evidence hygiene.** Raw captures live outside the repository (`%TEMP%\mt1run\`, listed in section 1)
because they are machine-local and some of them were produced with an operator-authorised service
account; the tracked artifact is this file. The ledger is append-only, one JSON object per line, with
the columns `gate, id, action, expected, actual, status, evidence, at`. No password, temporary
credential, ID token, refresh token, API key, service-account key, password hash or digest **value**
appears in this pack or in any captured log summary quoted here - credential material was compared
inside the probe processes only, and every quoted value is a code, status, count, identifier or boolean
(membership dumps record field **names** and booleans; Auth accounts are listed redacted).

**Freshness.** Every row is bound to the artefacts in section 0: deployment
`dpl_5kRVSzmV8CPtQmmV5hLjYRHRKE2Z` (commit `3388d15`, `origin/main` = `3388d150239c7278d1bcc5506f9d7aef30cc5c4c`),
project `vet-life`, the 191-line production rules and the two READY composite indexes. A redeploy, a
rules change or a new index invalidates the affected rows and requires a re-run before this pack is
cited as current.

**Limitations of this pack itself.** (a) The MT-1.1U browser run was appended to the ledger twice by its
recorder and is deduplicated in section 2.1; (b) the eight superseded harness `FAIL` rows are retained
in the ledger on purpose, so the ledger's raw `FAIL` count (21) is larger than the number of assertion
failures (13); (c) the clinic-A appointment fixtures and the clinic-A service fixture remain in the
production project by contract (section 6), so a future run must account for them rather than expect a
clean tenant; (d) the `ENV` rows of MT-1.1U record the browser harness's own first attempt and are not
assertions about the product.





