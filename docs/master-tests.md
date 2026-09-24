# VetLife — Master Test Plan

> **Purpose:** One evidence-first master test pack per major verification group, derived directly from `agent.md`, the Phase 0 architecture freeze, the Phase 1–14 contracts, the current Firebase/Auth/Firestore/Functions boundaries, and the implemented product architecture.
>
> **Repository:** `Abdeldjalildev/vet-project`
>
> **Status:** Test plan only. No runtime test has been performed by this document.
>
> **Core rule:** A major test pack is executed as one continuous run. The result is reported once at the end. Individual Gates are mapped from the evidence collected during that run. If one or more Gates fail, the failure is diagnosed and repaired first; then the **entire affected master test pack is rerun from the beginning**. A Gate is never closed from partial evidence.

---

## 1. Verification Philosophy

VetLife has many historical phases, but several phases share the same runtime dependencies.

Running every Gate as an isolated manual test would duplicate the same Firebase/Auth/Firestore/browser actions and create unnecessary copy/paste loops.

The approved verification model is therefore:

```
Master Test Pack
      ↓
single integrated execution
      ↓
evidence collected
      ↓
map evidence → Gates
      ↓
PASS / FAIL / NOT VERIFIED
      ↓
if failure → diagnose + repair
      ↓
rerun the entire affected Master Test Pack
      ↓
all required Gates PASS
      ↓
close the corresponding phases
```

### Non-negotiable rules

1. **No random testing.**
2. **No Gate is closed because code looks correct.**
3. **No test is weakened because it fails.**
4. **Do not skip a failed prerequisite and continue as if it passed.**
5. **Do not invent Firebase behavior.**
6. **Client-side validation is not security evidence.**
7. **A route guard is not authorization evidence.**
8. **A successful UI operation is not sufficient when the backend boundary is the contract.**
9. **For every denied operation, the denial must come from the intended Firebase/Auth/Rules/Functions boundary, not merely from hidden UI.**
10. **Runtime evidence must be recorded with the environment, test identity/role, expected result, actual result, and relevant Firebase/browser evidence.**
11. **Sensitive credentials must never be pasted into the report.**
12. **If a check cannot be executed, mark it `NOT VERIFIED`.**

---

# 2. Master Test Groups

The historical phases are verified through these integrated packs:

| Master Pack | Covers | Primary evidence |
|---|---|---|
| **MT-0** | Phase 0 contract sanity + test environment | Repository/configuration + environment readiness |
| **MT-1** | Phases 1–3 | Auth + Firestore + Rules + public data + booking + appointment lifecycle |
| **MT-2** | Phases 4–6 | Clinic admin + configuration/content + public synchronization + i18n/RTL |
| **MT-3** | Phases 7–8 | Analytics + sessions/visitors + aggregation + estimated service value |
| **MT-4** | Phases 9–10 | Reliability + accessibility/responsive behavior + security/isolation |
| **MT-5** | Phase 11 | Automated checks + build + deployment + regression prerequisites |
| **MT-6** | Phases 12–13 | Entry/auth architecture + Platform Owner provisioning + first-login password + public link/QR + restored VetLife identity |
| **MT-7** | Phase 14 | Combined Firebase/security/browser/deployment verification + progressive closure |
| **FINAL** | Release | Full commercial end-to-end acceptance |

### Dependency order

```
MT-0
  ↓
MT-1
  ↓
MT-2
  ↓
MT-3
  ↓
MT-4
  ↓
MT-5
  ↓
MT-6
  ↓
MT-7
  ↓
FINAL
```

A later pack may repeat a small critical behavior when that repetition is necessary to prove an integration contract. Repetition is intentional when it proves a later Gate.

---

# 3. Test Evidence Standard

For every numbered test, record:

- **ID**
- **Environment**
  - local development / Firebase Emulator
  - deployed environment
  - browser/device
- **Actor**
  - unauthenticated visitor
  - clinic owner/admin
  - Platform Owner
  - Clinic A / Clinic B
- **Action**
- **Expected backend behavior**
- **Expected UI behavior**
- **Actual result**
- **Evidence**
- **PASS / FAIL / NOT VERIFIED**

Do not record passwords, reset tokens, session tokens, private API keys, or other secrets.

For Firebase failures, preserve the useful non-sensitive evidence:
- Firebase error code/message;
- affected document/function/path;
- actor/role;
- timestamp;
- screenshot if useful.

---

# 4. MT-0 — Contract & Environment Readiness

## Objective

Confirm that the repository and selected Firebase environment are the exact subjects of the runtime verification.

This pack does not close application phases by itself. It prevents testing against the wrong project or stale local code.

## MT-0.1 — Repository synchronization

Verify:

- branch is `main`;
- working tree is clean;
- local HEAD equals `origin/main`;
- current commit is the commit intended for verification.

**PASS condition:** local source exactly matches the GitHub commit being tested.

## MT-0.2 — Configuration identity

Verify the local Firebase configuration points to the intended Firebase project.

Do not expose credentials in evidence.

**PASS condition:** Auth/Firestore/Functions are all exercised against the intended project/environment.

## MT-0.3 — Automated repository gate

Run the repository's required non-browser checks:

```powershell
npm ci
npm run build
npm run test:contract
npm run test:release-readiness
```

If a script is intentionally environment-dependent, record that fact rather than bypassing it.

**PASS condition:** every required command passes.

## MT-0.4 — Test data isolation

Use dedicated test identities and clearly identifiable test clinics/data.

Do not use an existing real clinic's production records for destructive tests.

**PASS condition:** all destructive/mutation tests can be identified and reversed/cleaned without affecting unrelated data.

---

# 5. MT-1 — Firebase Foundation + Public Data + Appointment System

**Covers:** Phases 1, 2, 3.

**Primary Gates:** G1.2–G1.5, G2.1–G2.5, G3.1–G3.5.

## MT-1.1 — Authentication foundation

As an unauthenticated user:

1. Open the application.
2. Verify protected clinic workspace cannot be entered without authentication.
3. Authenticate with a valid clinic test account.
4. Refresh the browser.
5. Verify the authenticated state persists according to the configured Firebase Auth persistence.
6. Log out.
7. Refresh.
8. Verify protected access is gone.

**Firebase contract:** Firebase Authentication is authoritative. React route guards are UX only.

**PASS:** Auth state and protected access behave correctly at both UI and backend boundaries.

## MT-1.2 — Clinic membership resolution

As an authenticated clinic user:

1. Verify the authenticated UID resolves to `users/{uid}`.
2. Verify the membership contains the intended `clinicId`.
3. Verify the approved role is `owner` or `admin`.
4. Verify clinic-owned operations resolve from authenticated membership rather than a client-selected clinic identity.

**PASS:** the clinic identity used for authorization is membership-derived.

## MT-1.3 — Cross-clinic read isolation

Prepare Clinic A and Clinic B with visibly different test data.

As Clinic A:

1. Read Clinic A profile/services/FAQs/appointments allowed to the role.
2. Attempt to read Clinic B protected data by direct Firestore access/query/path manipulation.
3. Attempt the same using any client-visible clinic identifier or public route parameter where applicable.

Expected:

- Clinic A data succeeds where authorized.
- Clinic B protected data is denied.
- Changing a URL/document ID does not grant access.

Repeat from Clinic B against Clinic A.

**PASS:** denial is enforced by Firestore Rules/backend authorization, not merely by UI routing.

## MT-1.4 — Protected client writes

As a clinic user, test the protected collections covered by the current Rules contract.

Attempt:

- unauthorized clinic update;
- client modification of membership;
- direct appointment write where the Rules deny it;
- direct analytics write where the Rules deny it;
- platform-controlled lifecycle-field mutation;
- cross-clinic write.

Expected: denied by Firestore Rules.

**Important:** do not replace a denied write with a trusted Function merely to make the UI pass. The test is specifically proving the intended boundary.

## MT-1.5 — Public clinic visibility contract

For an intentionally public + active clinic:

1. Open the canonical public clinic route without authentication.
2. Verify only approved public data is visible.

For a clinic that is inactive or unpublished:

1. Open the corresponding public route.
2. Attempt the public Firestore lookup directly where practical.

Expected:

- public + active clinic is discoverable;
- inactive/unpublished clinic is not exposed through public lookup;
- protected clinic data is not leaked.

Child services/FAQs must not become publicly readable merely because their own `active` flag is true when the parent clinic is not public/active.

## MT-1.6 — Dynamic clinic data

Modify approved clinic-managed data through the authenticated clinic workspace:

- profile;
- approved branding;
- contact/hours;
- services;
- FAQs;
- approved public content.

Verify the public page reflects the persisted data.

**PASS:** Firestore is the source of truth for approved managed content; no stale hard-coded demo value overrides persisted data.

## MT-1.7 — Public booking creation

As an unauthenticated customer:

1. Open a public + active clinic.
2. Select an active service.
3. Enter valid owner/pet information.
4. Select a valid future date/time.
5. Submit exactly one booking.

Expected:

- appointment is durably created by the authoritative trusted booking path;
- the appointment belongs to the intended clinic;
- approved fields are persisted;
- clinic users can see the appointment.

The booking must not depend on a direct client Firestore appointment write if the current contract delegates creation to the trusted callable.

## MT-1.8 — Server-side booking validation

Repeat booking attempts with invalid values covering the implemented contract:

- invalid/missing clinic identity;
- invalid/missing service;
- invalid email;
- invalid pet type;
- invalid date;
- invalid time;
- over-limit text;
- malformed identifiers;
- service from another clinic;
- inactive service;
- inactive/unpublished clinic.

Expected: trusted server rejects invalid requests.

Client-side validation passing/failing is not sufficient evidence.

## MT-1.9 — Booking conflict protection

Submit two valid bookings for the same clinic/service/date/time combination where the contract requires conflict prevention.

Expected:

- first valid booking succeeds;
- conflicting second booking is rejected according to the current availability contract;
- Firestore transaction behavior prevents a race-created duplicate.

If concurrency is tested, use two independent clients/sessions rather than relying on a single tab.

## MT-1.10 — Appointment lifecycle

From the clinic workspace:

```
pending → confirmed → completed
pending/confirmed → cancelled
```

Verify:

- allowed transitions succeed;
- invalid transitions fail;
- clinic A cannot transition clinic B's appointment;
- lifecycle operation uses the trusted boundary;
- completed state produces the Phase 8 value behavior later verified by MT-3.

## MT-1.11 — Synchronization evidence

After appointment creation and lifecycle changes:

- customer-facing booking result is correct;
- clinic dashboard reflects the persisted appointment;
- refresh does not lose data;
- a second authorized client sees the same persisted state.

### MT-1 closure

Map evidence to:

- G1.2–G1.5
- G2.1–G2.5
- G3.1–G3.5

A single failed backend contract can leave multiple Gates open. Do not mark individual Gates closed merely because their UI appears functional.

---

# 6. MT-2 — Clinic Admin + Content + Multilingual System

**Covers:** Phases 4, 5, 6.

## MT-2.1 — Admin shell and navigation

As Clinic A owner/admin:

Verify access to:

- Dashboard
- Appointments
- Services
- Content
- Analytics
- Settings
- Public access/QR where present
- Logout

Verify unauthorized users cannot use these protected surfaces.

## MT-2.2 — Dashboard correctness

Create test appointments spanning relevant statuses/dates.

Verify dashboard:

- counts the correct records;
- does not label past appointments as upcoming incorrectly;
- orders appointments according to the implemented date/time behavior;
- shows useful empty/loading/error states.

## MT-2.3 — Appointment management

From the admin UI:

- inspect appointment;
- confirm;
- cancel where allowed;
- complete.

Verify every operation persists after refresh and obeys the lifecycle contract.

## MT-2.4 — Services CRUD

As Clinic A:

1. Create a valid service.
2. Verify it appears in admin.
3. Verify it appears publicly when active.
4. Edit it.
5. Verify public synchronization.
6. Deactivate/archive it.
7. Verify public behavior.
8. Attempt unauthorized/cross-clinic service mutation.

Verify ordering and approved localized fields.

## MT-2.5 — Profile/content management

Modify:

- clinic name;
- description;
- logo if configured;
- contact;
- hours;
- approved hero/about/footer fields;
- approved branding;
- social links.

Verify:

- Firestore persistence;
- public rendering;
- refresh persistence;
- constrained values remain within the documented schema.

No arbitrary HTML/CSS must become executable/rendered content.

## MT-2.6 — FAQ management

Create/edit/reorder/activate/deactivate a multilingual FAQ.

Verify:

- admin preview uses the active admin language with the documented fallback behavior;
- public page uses public language;
- inactive FAQ is not exposed publicly;
- malformed/unauthorized document writes are rejected by Rules.

## MT-2.7 — Public/admin synchronization

Perform a sequence of changes and verify the public page after each persisted change.

This proves the real data path:

```
Admin UI
→ Firebase
→ persisted document
→ public read
→ VetLife UI
```

## MT-2.8 — Independent language contexts

Use separate public and admin contexts.

Example:

- Admin = Arabic
- Public = English

Change public language.

Expected:

- public direction/UI changes;
- admin language does not change.

Change admin language.

Expected:

- admin direction/UI changes;
- public language does not change.

Repeat with French.

## MT-2.9 — RTL/LTR

Verify Arabic:

- correct document direction;
- navigation/menu alignment;
- forms;
- cards;
- buttons;
- FAQ;
- dashboard/sidebar;
- focus order remains logical.

Verify English/French restore LTR behavior.

## MT-2.10 — Persistence

Refresh and reopen each context.

Verify language persistence follows the implemented independent persistence contract.

### MT-2 closure

Map evidence to G4.1–G4.5, G5.1–G5.5, G6.1–G6.5.

---

# 7. MT-3 — Analytics + Revenue/Business Analytics

**Covers:** Phases 7, 8.

## MT-3.1 — Page-view/session behavior

For a test clinic:

1. Open the public clinic.
2. Navigate across multiple pages/sections according to the implemented analytics model.
3. Reload where appropriate.
4. Start an independent browser/session.

Verify event semantics distinguish:

- page views;
- sessions;
- unique visitors.

Do not assume every page load is a new unique visitor.

## MT-3.2 — Clinic-scoped analytics

Generate analytics for Clinic A.

Verify Clinic A analytics do not appear in Clinic B analytics.

Attempt unauthorized direct analytics reads/writes where the Rules contract denies them.

## MT-3.3 — Event validation and idempotency

Exercise supported events:

- `page_view`
- `session_start`
- `booking_started`
- `booking_completed`
- `service_view`

Use valid identifiers and at least one malformed/invalid identifier where the trusted function validates it.

Verify:

- malformed event payload is rejected;
- duplicate/idempotent event behavior follows the contract;
- client cannot directly write protected analytics documents.

## MT-3.4 — Analytics failure must not create false booking failure

Create a valid public booking.

If the post-booking analytics operation is unavailable/fails, verify:

- appointment remains durably created;
- customer flow does not falsely report that booking creation failed merely because non-critical analytics delivery failed.

This is a critical Phase 9 regression boundary even though analytics belongs to Phase 7.

## MT-3.5 — Aggregate correctness

Generate controlled events and verify dashboard aggregates for the implemented windows.

Verify the dashboard does not read every raw event merely to render a summary.

## MT-3.6 — Estimated service value

Create services with approved currencies/values.

Create appointments using the approved service-value snapshot behavior.

Complete appointments.

Verify:

- only approved completed service values contribute;
- historical appointment value is not silently rewritten when service price later changes;
- estimated service value is not presented as actual payment revenue.

## MT-3.7 — Multi-currency separation

Complete test appointments using at least two supported currencies.

Verify:

- each currency is aggregated independently;
- numeric values are not summed across different currencies;
- changing one currency does not overwrite another currency's aggregate label/value.

### MT-3 closure

Map evidence to G7.1–G7.5 and G8.1–G8.5.

---

# 8. MT-4 — Reliability + Accessibility/Responsive + Security

**Covers:** Phases 9, 10.

This pack contains both user-facing resilience and adversarial authorization checks.

## MT-4.1 — Loading states

Exercise slow/blocked data paths where practical.

Verify important async surfaces show a deliberate loading state rather than a broken/empty-looking UI.

## MT-4.2 — Error states and retry

Cause recoverable data-loading failure where safely possible.

Verify:

- useful error state;
- retry action;
- retry actually invokes the current loader;
- recovery does not require a full page reload unless explicitly intended.

## MT-4.3 — Empty states

Use a test clinic with no:

- services;
- FAQs;
- appointments;
- analytics.

Verify each relevant screen has an intentional empty state.

## MT-4.4 — Form reliability

Verify:

- duplicate booking submission is prevented;
- submit controls reflect in-flight state;
- invalid forms do not create partial records;
- destructive actions require the intended confirmation;
- stale UI does not overwrite newer data unexpectedly.

## MT-4.5 — Accessibility

For public and clinic interfaces verify:

- keyboard navigation;
- visible focus;
- meaningful labels;
- semantic headings;
- buttons/links have correct roles;
- dialogs/menus are keyboard usable;
- ARIA is used only where appropriate;
- contrast is acceptable;
- Arabic RTL remains accessible.

## MT-4.6 — Responsive

Verify public and admin interfaces at:

- mobile;
- tablet;
- desktop.

Check:

- navigation;
- sidebar;
- forms;
- service cards;
- FAQ;
- booking;
- tables/lists;
- QR page;
- language controls.

## MT-4.7 — Unauthenticated denial

Without authentication, attempt direct access to:

- clinic dashboard;
- appointments management;
- services management;
- content management;
- analytics management;
- settings.

Expected:

- UI redirects/blocks appropriately;
- direct backend access remains denied.

## MT-4.8 — Cross-clinic authorization

With Clinic A credentials:

- read Clinic B protected data;
- update Clinic B data;
- transition Clinic B appointment;
- access Clinic B analytics.

Expected: backend denial.

Repeat with Clinic B against Clinic A.

## MT-4.9 — Cross-role authorization

Verify unsupported/unauthorized roles do not satisfy the protected clinic membership helper.

At minimum, confirm the accepted protected clinic roles remain:

- `owner`
- `admin`

An active membership with an unsupported role must not gain protected owner/admin access.

## MT-4.10 — Client self-escalation

Attempt to modify:

- `users/{uid}` membership;
- clinic membership role;
- clinicId;
- platform-controlled lifecycle fields;
- platform authorization.

Expected: client cannot grant itself privileges.

## MT-4.11 — Trusted operation boundary

Verify public booking and protected trusted operations behave through their intended callable/server path.

The test must distinguish:

- frontend validation;
- Firestore Rules;
- trusted Functions authorization/validation.

### MT-4 closure

Map evidence to G9.1–G9.5 and G10.1–G10.5.

---

# 9. MT-5 — Automated Tests, Build, Deployment & Regression

**Covers:** Phase 11.

## MT-5.1 — Clean dependency installation

Run the repository installation exactly as CI requires.

Verify no hidden local dependency state is necessary.

Record the current Functions dependency-lockfile limitation if it remains unresolved.

## MT-5.2 — Contract tests

Run:

```powershell
npm run test:contract
```

Expected: structural contract checks pass without weakened assertions.

## MT-5.3 — Release readiness

Run:

```powershell
npm run test:release-readiness
```

Any deliberate release blocker must remain visible.

## MT-5.4 — Production build

Run:

```powershell
npm run build
```

Inspect:

- build errors;
- missing imports;
- missing assets;
- unacceptable configuration problems;
- meaningful warnings.

## MT-5.5 — CI evidence

Verify the GitHub Actions run for the exact commit under test.

Expected:

- required CI jobs pass;
- no unrelated hidden failure;
- the tested commit is the deployed/verified commit where the workflow contract requires it.

## MT-5.6 — Deployment

Verify the deployed web application:

- opens successfully;
- serves the expected commit;
- communicates with the intended Firebase environment;
- deep links work;
- required Functions are deployed and callable.

## MT-5.7 — Regression smoke

Run the shortest integrated regression covering:

```
Entry → Auth → Clinic → Public → Booking → Appointment → Admin
→ Content → i18n → Analytics → Security
```

Do not duplicate every earlier assertion if the earlier master packs already provide the detailed evidence.

### MT-5 closure

Map evidence to G11.1–G11.5.

---

# 10. MT-6 — Product Architecture + VetLife Identity

**Covers:** Phases 12, 13.

This pack is the first integrated verification of the new product entry model and restored baseline visual identity.

## MT-6.1 — Central VetLife entry

As a signed-out user:

1. Open `/`.
2. Verify the welcoming VetLife login experience is the entry surface.
3. Verify no clinic public page is incorrectly used as the default entry.

## MT-6.2 — Platform Owner authorization

Use the controlled Platform Owner account.

Verify:

- platform authorization comes from the trusted Firebase capability/claim;
- Platform Owner workspace is accessible only to the authorized account;
- ordinary clinic users cannot enter platform operations;
- a frontend/local value cannot create Platform Owner authority.

## MT-6.3 — Platform clinic provisioning

From the Platform Owner workspace:

1. Enter a dedicated test clinic.
2. Enter the clinic owner's email.
3. Enter the platform-owner-selected temporary password.
4. Submit provisioning.

Verify the trusted operation creates:

- clinic document;
- deterministic/canonical slug;
- intended lifecycle state;
- owner membership;
- `mustChangePassword: true`;
- Firebase Auth identity.

Verify provisioning is not a client-authorized Firestore clinic creation.

## MT-6.4 — Provisioning failure/duplicate protection

Attempt:

- duplicate slug;
- invalid email;
- invalid temporary password;
- invalid localized name;
- unknown fields;
- unauthorized caller.

Expected: trusted function rejects invalid/unauthorized provisioning.

If a newly created Auth user is orphaned by a transaction failure, verify the documented cleanup behavior.

## MT-6.5 — First-login password handoff

Use the provisioned clinic owner account.

1. Log in with the temporary password.
2. Verify the user is routed to the first-password setup screen.
3. Attempt to enter the clinic dashboard before completing setup.
4. Set a new permanent password.
5. Complete setup.
6. Refresh/re-login.

Expected:

- temporary password is accepted only for the first login;
- first-login setup is mandatory;
- permanent password is handled by Firebase Authentication;
- membership changes from `mustChangePassword: true` to false only after trusted completion verification;
- subsequent login uses the permanent password;
- the platform owner cannot read the permanent password from Firestore/app state;
- no password is stored in localStorage/sessionStorage.

## MT-6.6 — Password completion anti-bypass

With a test account whose membership still has `mustChangePassword: true`:

- invoke the completion path without a legitimate Firebase Auth password update.

Expected: trusted completion does not clear the flag.

This proves the backend checks the Firebase Auth password-change timestamp against the provisioning baseline.

## MT-6.7 — Clinic workspace and public route

After setup:

- clinic owner reaches its clinic dashboard;
- clinic identity is membership-derived;
- canonical public link resolves to the intended clinic;
- public page is accessible without clinic authentication when published/active.

## MT-6.8 — Public link lifecycle

Verify:

- canonical link can be copied;
- inactive/unpublished state prevents public exposure as defined;
- protected admin paths are never represented as the public URL.

## MT-6.9 — QR security and behavior

Open the clinic QR page.

Verify:

- QR renders;
- printable output is usable;
- decoded QR payload is exactly the canonical public clinic URL;
- no credentials;
- no token;
- no membership ID;
- no admin route;
- no private Firestore path.

Open the decoded URL in an unauthenticated browser.

Expected: it resolves to the same public clinic page as the canonical link.

## MT-6.10 — Restored VetLife visual identity

Compare the public clinic experience against the approved baseline reference.

Verify the restored identity includes:

- VetLife branding;
- Navbar;
- Hero;
- sky/emerald visual direction;
- primary CTA;
- differentiated service-card palette;
- About;
- Vet Tips;
- animated FAQ;
- branded Footer;
- booking CTA/form;
- dark mode;
- responsive spacing/hierarchy.

The acceptance reference is the known baseline implementation, not a generic modern dashboard aesthetic.

## MT-6.11 — Dynamic data inside the identity

Change clinic-managed content and verify it populates the restored VetLife components without:

- arbitrary HTML injection;
- arbitrary CSS injection;
- page-builder behavior;
- broken layout from unconstrained values.

## MT-6.12 — Phase 9/10 regressions after architecture change

Repeat the highest-risk checks:

- public booking;
- clinic isolation;
- admin protection;
- language independence;
- QR/public link;
- first-login routing.

### MT-6 closure

Map evidence to G12.1–G12.4 and G13.1–G13.4.

---

# 11. MT-7 — Phase 14 Combined Verification & Progressive Closure

**Covers:** Phase 14 and provides the final evidence bridge for Phases 1–13.

This pack is not a feature test. It is the integrated proof that the already-implemented product contracts work together.

## MT-7.1 — Full Firebase runtime chain

Execute one complete chain:

```
Platform Owner
→ provision Clinic A
→ first-login password setup
→ Clinic A admin
→ configure clinic
→ public clinic
→ customer booking
→ appointment appears in admin
→ lifecycle transition
→ analytics
→ estimated service value
→ public/admin language checks
```

Record Firebase evidence at the important boundaries.

## MT-7.2 — Full isolation matrix

Test at minimum:

| Actor | Target | Expected |
|---|---|---|
| Visitor | Public active clinic | Allow approved public data |
| Visitor | Private/inactive clinic | Deny/not expose |
| Clinic A | Clinic A | Allow authorized operations |
| Clinic A | Clinic B | Deny |
| Clinic B | Clinic A | Deny |
| Clinic user | Platform provisioning | Deny |
| Platform Owner | Provisioning | Allow |
| Unsupported role | Protected clinic data | Deny |

The expected result must be produced by the backend boundary where applicable.

## MT-7.3 — Full browser/device matrix

Verify the final product on the supported test contexts:

- desktop browser;
- mobile browser;
- tablet-sized viewport.

For each, verify:

- entry/login;
- clinic dashboard;
- public clinic;
- booking;
- QR/public link;
- language;
- RTL/LTR;
- loading/error/empty/retry;
- keyboard/focus/labels.

## MT-7.4 — Deployment/runtime consistency

Verify the deployed application, Firebase Functions, Firestore Rules, and client configuration all correspond to the same intended release state.

No mixed/stale deployment may be accepted as final evidence.

## MT-7.5 — Release-hardening blockers

Explicitly inspect:

- Functions lockfile status;
- App Check enforcement status for public callable endpoints;
- rate-control boundary;
- dependency vulnerabilities;
- deployment/rollback evidence.

Each item must be:

- remediated and verified; or
- explicitly documented as a release blocker.

No blocker is silently ignored.

## MT-7.6 — Progressive closure matrix

After all evidence is collected, build:

| Phase | Gate | Evidence | Result | Closure |
|---|---|---|---|---|
| 1 | G1.x | MT-1/MT-7 evidence | PASS/FAIL/NOT VERIFIED | CLOSED/PENDING |
| 2 | G2.x | MT-1/MT-2/MT-7 | ... | ... |
| ... | ... | ... | ... | ... |
| 14 | G14.x | MT-7 | ... | ... |

A Gate closes only when every required acceptance condition has evidence.

---

# 12. FINAL — Commercial End-to-End Acceptance

Run this only after the relevant master packs pass.

## FINAL.1 — New clinic simulation

Simulate a first real clinic:

1. Platform Owner logs in.
2. Provisions a new clinic.
3. Clinic owner performs first-login password setup.
4. Clinic configures profile/branding/content/services/FAQs.
5. Clinic publishes the intended public experience.
6. Customer opens the canonical public link.
7. Customer books an appointment.
8. Clinic confirms/completes the appointment.
9. Analytics update.
10. Estimated service value updates correctly.
11. Public/admin languages remain independent.
12. QR opens the same public page.
13. Clinic B cannot access Clinic A data.

## FINAL.2 — Final security check

Repeat the highest-value denial checks:

- unauthenticated protected access;
- cross-clinic read;
- cross-clinic write;
- membership mutation;
- platform self-escalation;
- lifecycle-field mutation;
- direct appointment write;
- direct analytics write;
- private/inactive public access.

## FINAL.3 — Final visual acceptance

The public experience must still visibly be the restored VetLife product.

No final architecture/release change may accidentally replace it with a generic admin/template design.

## FINAL.4 — Release decision

The final result must explicitly state:

- phases closed;
- gates closed;
- remaining NOT VERIFIED items;
- remaining release blockers;
- deployment commit;
- Firebase project/environment verified;
- final regression result.

**No commercial-ready claim is permitted while a required critical gate remains FAIL or NOT VERIFIED.**

---

# 13. Failure Handling Protocol

When a Master Test Pack fails:

### Step 1 — Stop

Do not continue collecting unrelated evidence.

### Step 2 — Classify

Classify the failure as one of:

- application code;
- Firestore Rules;
- Firebase Auth;
- Cloud Function;
- Firebase configuration;
- deployment;
- browser/UX;
- test/environment problem.

### Step 3 — Identify the exact contract

Write:

```
Failed test
→ affected Gate
→ violated requirement
→ actual boundary
→ smallest safe fix
```

### Step 4 — Repair

Only repair the actual defect.

Do not:

- weaken the test;
- bypass Rules;
- remove an assertion;
- add a frontend-only workaround for a backend security problem;
- perform unrelated refactors.

### Step 5 — Re-run the entire affected Master Pack

Do not resume from the failed step.

The complete pack must pass because an earlier failure may have affected later evidence.

### Step 6 — Close only after evidence

Only then update the phase/gate status.

---

# 14. Test Result Template

Use one report per Master Pack.

```text
MASTER PACK:
COMMIT:
ENVIRONMENT:
FIREBASE PROJECT:
DATE:

PRECONDITIONS:
- ...

RESULTS:
MT-X.1 — PASS/FAIL/NOT VERIFIED
MT-X.2 — PASS/FAIL/NOT VERIFIED
...

AFFECTED GATES:
- Gx.x — PASS/FAIL/NOT VERIFIED
- ...

FAILURES:
1.
   Contract:
   Expected:
   Actual:
   Boundary:
   Evidence:

FIXES:
1.
   File/code:
   Reason:
   Scope:

RE-RUN:
- Full master pack rerun: YES/NO
- Result:

CLOSURE:
- Gates closed:
- Gates pending:
- Release blockers:
```

---

# 15. Explicit Firebase Boundary Checklist

Before accepting any result, verify the correct security boundary was exercised.

## Firebase Authentication

- Identity comes from Firebase Auth.
- Auth state is not simulated by React/local storage.
- Passwords are never stored by the application.
- First-login password completion uses Firebase Auth.
- Platform Owner capability is trusted/server-controlled.

## Firestore

- Clinic-owned documents are tenant-scoped.
- `clinicId` in a URL is not treated as authorization.
- Public reads are limited to intentionally public/active clinic data.
- Protected writes are denied unless explicitly allowed.
- Membership documents cannot be client-mutated.
- Appointment direct client writes remain denied where the trusted Function is authoritative.
- Analytics direct client writes remain denied where the trusted server path is authoritative.
- Platform-controlled lifecycle fields cannot be changed by clinic clients.

## Cloud Functions

For every trusted callable tested:

1. verify authentication requirement;
2. verify authorization requirement;
3. verify input validation;
4. verify clinic ownership/membership where applicable;
5. verify transaction/atomicity requirement where applicable;
6. verify persisted result;
7. verify failure path.

## Public Callables

For unauthenticated booking/analytics endpoints:

- validate all untrusted input server-side;
- verify clinic/public state;
- verify referenced service belongs to the intended clinic;
- verify identifiers and bounded strings;
- verify no protected data is returned;
- verify documented App Check/rate-control release boundary.

---

# 16. Closure Rule

The only valid closure chain is:

```
Contract
↓
Implementation
↓
Master Test evidence
↓
Firebase/backend behavior
↓
Browser/product behavior
↓
PASS
↓
Gate CLOSED
↓
All phase Gates CLOSED
↓
Phase CLOSED
```

**Implementation status is not runtime closure.**

**A green UI is not Firebase security evidence.**

**A passing structural test is not browser/runtime evidence.**

**A passing individual step is not sufficient when the Master Pack is required to pass as a whole.**

This document is the master execution map for the remaining VetLife verification work.
