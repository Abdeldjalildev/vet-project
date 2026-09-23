# VetLife — AI Agent Project Contract

> **Status:** Master roadmap and permanent engineering reference  
> **Repository:** `Abdeldjalildev/vet-project`  
> **Primary objective:** Transform VetLife from a frontend/demo veterinary website into a secure, configurable, production-ready veterinary clinic platform with a public customer interface and a clinic/admin interface backed by Firebase.

## Current Implementation Status — 2026-09-20

### Phase 0
**CLOSED — G0.1 through G0.5**

### Phase 1 — Firebase Foundation
- G1.1 Firebase Integration — **CLOSED**
- G1.2 Authentication — **IMPLEMENTED / PENDING RUNTIME CLOSURE**
- G1.3 Firestore Foundation — **IMPLEMENTED / PENDING RUNTIME CLOSURE**
- G1.4 Security Rules — **IMPLEMENTED / PENDING RUNTIME CLOSURE**
- G1.5 Foundation Verification — **IMPLEMENTED / PENDING RUNTIME CLOSURE**

Phase 1 is intentionally left pending until the local/Firebase verification pass is performed.

### Phase 1 deep-audit repair record — 2026-09-20
A repository-level deep audit of G1.1–G1.5 was completed against this contract and the Firebase/Firestore security model. The audit reconciled stale G1.1 documentation and tightened client-side Firestore write boundaries for clinic, service, and FAQ documents. Public clinic lookup was aligned with the `public == true` + `active == true` rule constraints. No Phase 0 contract or Phase 1 authentication architecture was changed. Runtime Firebase/Rules verification remains pending and is not implied by this repair.

### Phase 2 — Public Website → Real Data
- G2.1 Clinic Configuration — **IMPLEMENTED / PENDING RUNTIME CLOSURE**
- G2.2 Dynamic Services — **IMPLEMENTED / PENDING RUNTIME CLOSURE**
- G2.3 Dynamic Content — **IMPLEMENTED / PENDING RUNTIME CLOSURE**
- G2.4 Public Booking — **IMPLEMENTED / PENDING RUNTIME CLOSURE**
- G2.5 Synchronization — **IMPLEMENTED / PENDING RUNTIME CLOSURE**

Phase 2 implementation is complete on GitHub. Runtime verification is intentionally deferred so Phase 1 and Phase 2 can be tested together in the intended Firebase project.

### Phase 2 deep-audit repair record — 2026-09-20
A repository-level deep audit of G2.1–G2.5 was completed against this contract, the Phase 0 architecture freeze, and the repaired Phase 1 Firestore boundary. The audit found and corrected stale G2.4/G2.5/completion documentation that still described direct client appointment creation after the trusted Phase 3 function had become authoritative. Public clinic lookup was also tightened from scanning all public/active clinics and filtering by slug in memory to querying the requested slug together with the required public/active constraints. No new product scope was introduced; runtime verification remains pending.


### Phase 3 — Real Appointment System
- G3.1 Appointment Model — **IMPLEMENTED / PENDING RUNTIME CLOSURE**
- G3.2 Validation — **IMPLEMENTED / PENDING RUNTIME CLOSURE**
- G3.3 Availability / Conflict Protection — **IMPLEMENTED / PENDING RUNTIME CLOSURE**
- G3.4 Appointment Lifecycle — **IMPLEMENTED / PENDING RUNTIME CLOSURE**
- G3.5 End-to-End Flow — **IMPLEMENTED / PENDING RUNTIME CLOSURE**

Phase 3 implementation is complete on GitHub. Runtime verification is intentionally deferred with Phases 1–3 to preserve the agreed evidence-first closure workflow.

### Phase 3 deep-audit repair record — 2026-09-20
A repository-level deep audit of G3.1–G3.5 was completed against this contract, the Phase 0 appointment/lifecycle contract, and the repaired Phase 1–2 boundaries. The audit found a real server-validation defect in the appointment email regex and overly permissive coercion of optional ownerEmail/notes types; both were corrected. The audit also reconciled Phase 3 documentation with later Phase 8 extensions to the trusted lifecycle function without changing the Phase 3 state-machine contract. Firestore transaction ordering and conflict protection were reviewed against current Firebase transaction semantics; runtime concurrency evidence remains pending.

### Phase 4 deep-audit repair record — 2026-09-20
A repository-level deep audit of G4.1–G4.5 was completed against the Phase 0 routing/security contracts and the repaired Phase 1–3 boundaries. The audit found two data-integrity/behavior issues: service deletion was performed by a client-side check followed by a direct delete, creating a race with trusted appointment creation; and the dashboard labeled all pending/confirmed records as upcoming without comparing their date/time to the current local time. Both were repaired. Dashboard appointment ordering now includes date and time, with a dedicated Firestore index. Service deletion is now a trusted transaction-backed operation and direct client deletion is denied by Rules. Runtime verification remains pending.

### Phase 4 — Clinic Admin Dashboard
- G4.1 Admin Shell — **IMPLEMENTED / PENDING RUNTIME CLOSURE**
- G4.2 Dashboard Overview — **IMPLEMENTED / PENDING RUNTIME CLOSURE**
- G4.3 Appointment Management — **IMPLEMENTED / PENDING RUNTIME CLOSURE**
- G4.4 Services Management — **IMPLEMENTED / PENDING RUNTIME CLOSURE**
- G4.5 Admin/Public Synchronization — **IMPLEMENTED / PENDING RUNTIME CLOSURE**

### Phase 5 deep-audit repair record — 2026-09-20
A repository-level deep audit of G5.1–G5.5 was completed against this contract and the Phase 0–4 security/data boundaries. The audit found a real Firestore contract drift: updateClinicProfile writes the managed description field, but the clinic update rule did not permit that field, so the profile operation could be rejected at the backend boundary. The audit also found that public logo/social URLs and branding colors were not constrained by Firestore, and FAQ/managed-content document shapes were only allowlisted at the top level. These boundaries were tightened: description is now an approved clinic field; logo/social destinations are HTTPS-only (or empty); branding colors are six-digit hexadecimal values; managed hero/about/footer structures and FAQ localized fields/order/active types are validated. The public content remains structured and bounded, with no arbitrary HTML/CSS/page-builder surface introduced. Contract-smoke coverage was updated for the new Phase 5 boundaries. Runtime verification remains pending.

### Phase 5 — Full Clinic Content & Configuration
- G5.1 Clinic Profile — **IMPLEMENTED / PENDING RUNTIME CLOSURE**
- G5.2 Branding — **IMPLEMENTED / PENDING RUNTIME CLOSURE**
- G5.3 FAQ Management — **IMPLEMENTED / PENDING RUNTIME CLOSURE**
- G5.4 Social/Footer Management — **IMPLEMENTED / PENDING RUNTIME CLOSURE**
- G5.5 Content Contract — **IMPLEMENTED / PENDING RUNTIME CLOSURE**

### Phase 6 — Multilingual System
- G6.1 Admin System i18n — **IMPLEMENTED / PENDING RUNTIME CLOSURE**
- G6.2 Public System i18n — **IMPLEMENTED / PENDING RUNTIME CLOSURE**
- G6.3 Managed Content Translation — **IMPLEMENTED / PENDING RUNTIME CLOSURE**
- G6.4 RTL/LTR Isolation — **IMPLEMENTED / PENDING RUNTIME CLOSURE**
- G6.5 Persistence & Independence — **IMPLEMENTED / PENDING RUNTIME CLOSURE**

Phase 4, Phase 5, and Phase 6 implementations are complete on GitHub. Runtime verification remains intentionally deferred so the planned combined verification pass can provide evidence before closure.

### Phase 6 deep-audit repair record — 2026-09-20
A repository-level deep audit of G6.1–G6.5 was completed against the multilingual contract and the Phase 0–5 data/content boundaries. The audit found three concrete issues: the base i18n resource contained duplicate keys, the admin FAQ preview always preferred English regardless of the active admin language, and Firestore only validated the managed feature list as a list without validating each feature's localized title/description structure. These were repaired by removing duplicate base keys, making the admin FAQ preview use the active language with the shared localized fallback, and enforcing bounded localized feature objects (including a list-size cap) at the Firestore boundary. The independent public/admin persistence model and document direction synchronization were reviewed and retained. Runtime multilingual/RTL persistence evidence remains pending.

### Phase 7 — Analytics
- G7.1 Event Model — **IMPLEMENTED / PENDING RUNTIME CLOSURE**
- G7.2 Visitor/Session Logic — **IMPLEMENTED / PENDING RUNTIME CLOSURE**
- G7.3 Aggregation — **IMPLEMENTED / PENDING RUNTIME CLOSURE**
- G7.4 Analytics Dashboard — **IMPLEMENTED / PENDING RUNTIME CLOSURE**
- G7.5 Integrity & Cost Safety — **IMPLEMENTED / PENDING RUNTIME CLOSURE**

Phase 7 implementation is complete on GitHub. Runtime verification remains intentionally deferred so the planned combined verification pass can provide evidence before closure.

### Phase 7 deep-audit repair record — 2026-09-20
A deep repository audit of G7.1–G7.5 was completed against the analytics event, visitor/session, aggregation, dashboard, security-rule, and cost-safety contracts. Two concrete defects were found and repaired: the browser's session-start marker was global across clinics, which could suppress the first session event for a second clinic visited in the same browser session; it is now namespaced by clinic. The trusted analytics function accepted arbitrary strings for session, visitor, and event identifiers even though the client generates UUID v4 identifiers; it now enforces UUID v4 shape and rejects slash-containing service identifiers. The dashboard's aggregate-window semantics, server-mediated writes, clinic isolation, idempotent event documents, and bounded aggregate reads were reviewed and retained. Firebase's current callable/App Check guidance was reviewed: anonymous analytics endpoints can benefit from App Check before commercial release, but enabling it is an environment/runtime deployment decision and was not silently introduced during this audit. Runtime verification remains pending.

### Phase 8 — Revenue & Business Analytics
- G8.1 Service Value — **IMPLEMENTED / PENDING RUNTIME CLOSURE**
- G8.2 Appointment Value — **IMPLEMENTED / PENDING RUNTIME CLOSURE**
- G8.3 Completed-Service Revenue — **IMPLEMENTED / PENDING RUNTIME CLOSURE**
- G8.4 Revenue Dashboard — **IMPLEMENTED / PENDING RUNTIME CLOSURE**
- G8.5 Terminology & Integrity — **IMPLEMENTED / PENDING RUNTIME CLOSURE**

Phase 8 implementation is complete on GitHub. Runtime verification remains intentionally deferred so the planned combined verification pass can provide evidence before closure.

### Phase 8 deep-audit repair record — 2026-09-20
A deep repository audit of G8.1–G8.5 was completed against the service-value, appointment snapshot, completed-service aggregation, dashboard, terminology, and integrity contracts. One substantive integrity defect was found: the daily analytics aggregate stored a single `revenueCurrency` alongside a single numeric completed-service value. If different currencies were completed on the same day, later writes could overwrite the currency label while the dashboard summed the numeric values together, violating the explicit Phase 8 requirement that multiple currencies remain separate. The trusted completion transaction now stores completed-service value in a currency-keyed map, and the dashboard aggregates that map independently per currency. Documentation and contract-smoke coverage were reconciled accordingly. Service price/currency validation, historical appointment snapshots, trusted lifecycle aggregation, and payment-vs-estimated-value terminology were reviewed and retained. Runtime verification remains pending.

### Phase 9 — Production UX & Reliability
- G9.1 Loading/Error/Empty States — **IMPLEMENTED / PENDING RUNTIME CLOSURE**
- G9.2 Form Reliability — **IMPLEMENTED / PENDING RUNTIME CLOSURE**
- G9.3 Accessibility — **IMPLEMENTED / PENDING RUNTIME CLOSURE**
- G9.4 Responsive QA — **IMPLEMENTED / PENDING RUNTIME CLOSURE**
- G9.5 UX Acceptance — **IMPLEMENTED / PENDING RUNTIME CLOSURE**

Phase 9 implementation is complete on GitHub. Runtime/browser verification remains intentionally deferred so the planned combined verification pass can provide evidence before closure.






---

### Phase 9 deep-audit repair record — 2026-09-20
A deep repository audit of G9.1–G9.5 was completed against the production UX/reliability, accessibility, responsive, and acceptance contracts. Two substantive reliability/UX issues were repaired: a successful public appointment could be reported as a booking failure if the subsequent non-critical `booking_completed` analytics call failed; analytics delivery is now best-effort after the appointment has been durably created. Recoverable admin data-loading failures lacked a retry action in the admin shell and appointments/services/FAQ sections; retry actions were added. Route-level authentication loading and missing-public-slug messages were also moved into the Phase 9 i18n resource instead of hard-coded English. Existing accessibility semantics, responsive structure, error-boundary behavior, and bounded Phase 9 scope were reviewed and retained. Runtime/browser/device accessibility and responsive verification remain pending.

### Phase 10 — Security Hardening
- G10.1 Authentication Security — **IMPLEMENTED / PENDING RUNTIME CLOSURE**
- G10.2 Authorization — **IMPLEMENTED / PENDING RUNTIME CLOSURE**
- G10.3 Firestore Rules — **IMPLEMENTED / PENDING RUNTIME CLOSURE**
- G10.4 Server Validation — **IMPLEMENTED / PENDING RUNTIME CLOSURE**
- G10.5 Security Audit — **IMPLEMENTED / PENDING RUNTIME CLOSURE**

Phase 10 implementation is complete on GitHub. Runtime security verification remains intentionally deferred; no Phase 10 gate is considered CLOSED until the planned combined Firebase/Emulator verification pass provides evidence.

### Phase 10 deep-audit repair record — 2026-09-20
A line-by-line deep audit of G10.1–G10.5 was completed against the security contract. One substantive authorization defect was found: the Firestore `memberOf()` helper treated any active membership as authorized for protected clinic reads, even though the frozen authorization model accepts only `owner` and `admin` roles. This could have widened protected read access if an unsupported/legacy role existed. The helper was hardened to require both active membership and an accepted owner/admin role, and the contract smoke test plus G10.2/G10.3/G10.5 documentation were reconciled. Other Phase 10 boundaries were reviewed: Firebase Auth remains authoritative, client membership mutation is denied, appointment/analytics direct writes remain denied, trusted Functions validate authenticated membership and clinic ownership, server-side value snapshots remain authoritative, and public analytics/booking endpoints remain subject to the documented App Check/rate-control production boundary. Runtime security verification remains pending and no gate is closed.

### Phase 11 — Testing & Commercial Release
- G11.1 Automated Tests — **IMPLEMENTED / PENDING CI + RUNTIME CLOSURE**
- G11.2 Production Build — **IMPLEMENTED / PENDING CI + RUNTIME CLOSURE**
- G11.3 Deployment Verification — **IMPLEMENTED / PENDING DEPLOYMENT CLOSURE**
- G11.4 Full Regression — **IMPLEMENTED / PENDING COMBINED RUNTIME CLOSURE**
- G11.5 Commercial Release Gate — **IMPLEMENTED / PENDING RELEASE EVIDENCE**

Phase 11 implementation is complete on GitHub. Runtime, deployment, and commercial-release verification remain intentionally deferred until concrete evidence is collected.

### Phase 11 deep-audit repair record — 2026-09-20
A line-by-line deep audit of G11.1–G11.5 was completed against the Definition of Done, evidence-first rules, and the repository's actual deployment/testing state. The first CI execution exposed a real cross-platform lockfile defect: Linux `npm ci` rejected the repository lock because `@emnapi/core@1.11.3` and `@emnapi/runtime@1.11.3` were absent from the lock despite being required by the Linux dependency graph. The lockfile was repaired with the exact registry metadata and a contract assertion was added to prevent recurrence. The contract smoke test itself also contained an incorrect assumption that every admin route string appears literally in `App.jsx`; the application intentionally derives section routes from a validated `validSections` list, so the test was corrected to assert the real routing contract rather than changing application code. Deployment documentation was reconciled with the repository's current Vercel web deployment metadata and now requires explicit deployment/rollback evidence. CI/runtime/deployment closure remains pending.

A remaining release-hardening boundary is intentionally not claimed as solved: `functions/package-lock.json` is absent, so CI currently installs Functions dependencies with `npm install --ignore-scripts --no-package-lock` rather than a reproducibly pinned Functions lockfile. This does not invalidate source implementation, but it prevents a claim of fully reproducible Functions dependency installation and must remain visible before commercial release closure.
### Final pre-runtime audit repair record — 2026-09-20
A final repository-level audit across Phases 0–11 found two remaining implementation-contract issues before the local/Firebase verification pass. First, active services and FAQs could be read directly when their parent clinic was inactive or non-public, because their subcollection read rules checked only the child document's active flag. Public reads are now additionally gated by the parent clinic's public/active state while authenticated clinic members retain their authorized read path. Second, service create/update rules allowed the approved field names but did not validate the full service document shape; service name/description localization, icon, price, currency, order, and active state are now validated at the Firestore boundary. The contract smoke test covers these repaired boundaries, and the Phase 2 completion report was reconciled with the authoritative trusted booking path.

The audit also identified release-test boundaries that remain intentionally unresolved until the local verification pass: no Functions lockfile exists, the current contract smoke suite is structural rather than emulator/browser behavior testing, App Check/rate-control is not yet enforced on public callable endpoints, and npm reports dependency vulnerabilities. These are release verification/remediation items, not grounds to invent closure evidence.
The same pass identified an imminent GitHub Actions maintenance issue: the workflow used `actions/checkout@v4` and `actions/setup-node@v4`, whose action runtimes were emitting Node 20 deprecation warnings on the current runner. The workflow was migrated to the Node 24-compatible v5 action runtimes while retaining Node 20 as the installed project runtime required by the Functions engine. This separates the Actions runner runtime from the application's Node 20 compatibility requirement.

### Phase 12 — Product Architecture & Access Flow
- G12.1 Architecture Amendment, Entry & Routing Contract — **PLANNED / NOT IMPLEMENTED**
- G12.2 Platform Owner Authorization & Clinic Provisioning — **PLANNED / NOT IMPLEMENTED**
- G12.3 Clinic Lifecycle & Public Access — **PLANNED / NOT IMPLEMENTED**
- G12.4 Architecture Regression & Contract Verification — **PLANNED / NOT IMPLEMENTED**

Phase 12 extends the frozen architecture only for the explicitly approved entry, Platform Owner, provisioning, lifecycle, and public-access boundaries. It does not reopen unrelated Phase 0–11 decisions.

### Phase 13 — VetLife Experience & Commercial UI Restoration
- G13.1 Original VetLife Visual Identity Restoration — **PLANNED / NOT IMPLEMENTED**
- G13.2 Dynamic Content Inside the VetLife Identity — **PLANNED / NOT IMPLEMENTED**
- G13.3 Public Link, QR & Clinic Discovery UX — **PLANNED / NOT IMPLEMENTED**
- G13.4 Commercial UX Consistency — **PLANNED / NOT IMPLEMENTED**

Phase 13 restores the original VetLife public product identity and integrates the existing managed-data model without weakening its contracts.

### Phase 14 — Full Verification, Integration & Commercial Release
- G14.1 Combined Firebase Runtime Verification — **PLANNED / NOT IMPLEMENTED**
- G14.2 Security & Isolation Verification — **PLANNED / NOT IMPLEMENTED**
- G14.3 Browser, Responsive & Accessibility Verification — **PLANNED / NOT IMPLEMENTED**
- G14.4 CI, Deployment & Full Regression — **PLANNED / NOT IMPLEMENTED**
- G14.5 Progressive Phase Closure & Commercial Release — **PLANNED / NOT IMPLEMENTED**

Phase 14 is verification/release only. It must not be used to introduce unrelated product scope.

## 1. Mission

VetLife is being transformed into a real product that can be customized and sold to veterinary clinics.

The target product has three controlled product surfaces:

1. **VetLife Entry & Authentication**
   - Welcoming VetLife login/entry experience
   - Firebase Authentication
   - Routing based on authenticated identity and authorized role
   - No public clinic content is exposed as the default application entry

2. **Public Customer Interface**
   - Canonical clinic public page
   - Clinic services
   - About
   - FAQ
   - Contact/social links
   - Booking
   - Multilingual public experience
   - Analytics event generation

3. **Authenticated Management Interfaces**
   - Clinic/Admin workspace
   - Platform Owner workspace
   - Clinic-specific appointment/content/service/analytics management
   - Platform-level clinic provisioning and lifecycle management

The public and clinic interfaces remain linked by a secure `clinicId` boundary. Platform Owner authorization is a separate security boundary and must never be implemented as a frontend-only UID/email check.

---

## 2. Target Architecture

```
                         VetLife Platform
                               |
                    +----------+----------+
                    |                     |
              Entry / Auth         Platform Owner
                    |                     |
                    |              /platform/*
                    |
          +---------+----------------------+
          |                                |
    Clinic/Admin                      Public Clinic
     /clinic/*                        /c/:clinicSlug
          |                                |
          +---------------+----------------+
                          |
                 Application/Data Layer
                          |
             +------------+-------------+
             |            |              |
        Firebase Auth  Firestore    Cloud Functions
                          |
                       clinicId
                          |
             +------------+-------------+
             |                          |
         Clinic A data             Clinic B data
```

### Core principles

- Firebase is the primary backend platform.
- Firebase Authentication handles identity.
- Firestore stores application data.
- Firestore Security Rules enforce clinic data boundaries.
- Cloud Functions are used where trusted server-side execution is required.
- `clinicId` is the tenant/data-isolation key for clinic-owned data.
- A URL parameter alone is never a security boundary.
- Authentication membership and backend/database authorization are the clinic security boundary.
- Platform Owner is a distinct platform-level authorization boundary above clinic membership.
- Platform Owner privileges must be established by trusted server-side authorization, such as a controlled Firebase custom claim, and must never be granted by client-side profile fields, email strings, hidden routes, or local storage.
- Clinic provisioning is a trusted platform operation. A client must not be able to arbitrarily create clinics or memberships.
- The canonical public clinic identity is a controlled slug mapped to a provisioned clinic.
- The QR code represents only the canonical public clinic URL; it must never contain credentials, session tokens, or private clinic data.
- The original VetLife visual identity is code-owned and remains the base public experience. Firestore-managed content and constrained branding may populate that experience but must not turn it into an arbitrary page builder.
- The initial commercial deployment may be one deployment/configuration per clinic, while the architecture remains clinicId-aware.
- Do not build a full SaaS billing/multi-tenant control plane unless explicitly requested.

### Identity and authorization flow

Clinic access:

```
Firebase Auth UID
      ↓
users/{uid} membership
      ↓
clinicId + role
      ↓
Firestore Rules / trusted server operation
```

Platform Owner access:

```
Firebase Auth UID
      ↓
trusted platform authorization
      ↓
Platform Owner capability
      ↓
trusted provisioning / platform operations
```

The platform authorization source must be server-controlled. A frontend route guard may improve UX, but it is never the authoritative security boundary.

### Canonical route contract introduced by the architecture extension

```
/                       → VetLife welcome/login entry
/clinic/*               → authenticated clinic workspace
/platform/*             → authenticated Platform Owner workspace
/c/:clinicSlug          → public clinic experience
/c/:clinicSlug/book     → public clinic booking flow
```

Exact sub-routes may be refined during Phase 12 only when they remain consistent with the security and public-link contract.
---

## 3. Firebase Policy

Use:

- Firebase Authentication
- Cloud Firestore
- Firestore Security Rules
- Cloud Functions when necessary

Do **not**:

- store raw clinic passwords in Firestore;
- implement fake frontend-only authentication;
- trust a client-provided clinicId for authorization;
- expose private secrets in the frontend;
- bypass Firestore rules for convenience;
- perform sensitive authorization only in React.

Expected identity flow:

```
Firebase Auth UID
      ↓
users/{uid}
      ↓
clinicId + role
      ↓
Firestore Rules / trusted server operation
```

---

## 3A. Architecture Extension Contract

The original Phase 0 architecture freeze remains authoritative for existing clinic domain, data ownership, authentication, Firestore, appointment, multilingual, analytics, and deployment boundaries.

Phases 12–14 add an explicit product-architecture extension for:

- VetLife welcome/login entry;
- Platform Owner authorization;
- platform-level clinic provisioning;
- clinic lifecycle;
- canonical public clinic routing;
- public-link management;
- QR generation/printing;
- restoration of the original VetLife public visual identity.

This extension does not reopen unrelated Phase 0 decisions and must not weaken the existing clinic isolation or trusted-operation model. Where a Phase 12 requirement necessarily changes the old routing/access description, the Phase 12 contract is the explicit successor for that routing/access behavior.

### Platform Owner boundary

The Platform Owner is not a clinic role.

- Clinic roles remain the approved clinic membership roles used by existing Rules.
- Platform Owner authorization is independent of `users/{uid}.clinicId + role`.
- Platform Owner operations that create or provision clinics must execute through trusted server-side code.
- Client-selected clinic IDs, local storage values, email comparisons, or hidden UI routes are insufficient to authorize platform operations.
- Platform Owner access must not grant implicit access to every clinic document through a broad client-side rule; operations should use explicit trusted paths and least privilege.

### Clinic provisioning boundary

A provisioned clinic must have a deterministic identity and lifecycle state.

At minimum the trusted provisioning flow must establish:

1. clinic document;
2. canonical public slug;
3. owner/admin membership;
4. required account/invitation state;
5. active/provisioned lifecycle state only when the provisioning operation authorizes it.

No public client flow may self-provision a clinic.

### Public-link and QR boundary

The public clinic link is canonical and non-sensitive.

- It resolves to the provisioned clinic's public route.
- It is safe to copy/share publicly.
- QR generation encodes only that canonical public URL.
- QR output must not expose Auth state, membership IDs, credentials, private document paths, or admin URLs.

### Visual identity boundary

The baseline VetLife public experience is the product's visual identity.

- Preserve the baseline's recognizable Navbar, Hero, Services, About, FAQ, Footer, booking CTA, gradients, spacing, responsive behavior, and dark-mode direction.
- Dynamic clinic content must fit the existing component contract.
- Constrained branding fields may customize approved colors/logo/content only.
- No arbitrary HTML/CSS/page-builder capability is introduced.
- Visual restoration is a product requirement, not merely optional cosmetic polish.

---

## 4. Product Domain

The initial domain consists of:

- Clinic
- User
- Service
- FAQ
- Appointment
- Analytics Event
- Analytics Aggregate

Potential future domains (not MVP):

- Payments
- SMS/WhatsApp
- Staff roles beyond the basic model
- CRM
- Inventory
- Pharmacy
- Laboratory
- Medical records
- SaaS billing/subscriptions

These future domains must not be introduced accidentally during MVP work.

---

## 5. Draft Data Model

The exact schema is locked during Phase 0. The following is the architectural target, not permission to skip Phase 0 design.

```
clinics/{clinicId}
  profile/configuration
  branding
  contact
  address
  openingHours
  socialLinks
  hero/about content
  bookingSettings

clinics/{clinicId}/services/{serviceId}

clinics/{clinicId}/faqs/{faqId}

clinics/{clinicId}/appointments/{appointmentId}

users/{uid}
  uid
  clinicId
  role

analytics / aggregate structures
  clinicId
  event/date dimensions
```

All clinic-owned records must be traceable to a clinic.

---

## 6. Appointment Contract

The final appointment schema is approved in Phase 0, but the target domain includes:

- appointmentId
- clinicId
- petName
- petType
- ownerName
- ownerPhone
- ownerEmail
- serviceId
- date
- time
- notes
- status
- createdAt
- updatedAt

The exact fields, validation, indexes, availability rules, and lifecycle are part of the Phase 0 contract.

Expected initial lifecycle:

```
pending → confirmed → completed
        ↘ cancelled
```

Booking is not considered real until it is persisted in Firestore and visible to the authenticated clinic.

---

## 7. Multilingual Contract

There are two independent language contexts:

### Public

The visitor can select:
- Arabic
- English
- French

### Clinic/Admin

The clinic user can independently select:
- Arabic
- English
- French

Changing the public language must not change the admin language and vice versa.

Separate:

1. **System UI translations**
   - buttons
   - labels
   - dashboard UI
   - validation
   - errors

2. **Clinic-managed multilingual content**
   - service names/descriptions
   - FAQs
   - hero/about content
   - other customer-facing managed content

Arabic must correctly support RTL and English/French LTR.

---

## 8. Analytics Contract

Analytics must distinguish:

- Page Views
- Sessions
- Unique Visitors

Initial events may include:

- page_view
- session_start
- booking_started
- booking_completed
- service_view

Events should contain only necessary data, such as:

- clinicId
- eventType
- page
- timestamp
- sessionId
- language
- deviceType

Do not make the dashboard read every raw event on every render.

Use aggregation where appropriate:

```
events → daily/weekly/monthly aggregates → dashboard
```

Initial analytics:

- visitors
- page views
- bookings
- booking conversion
- popular services
- popular pages

Revenue must not be described as actual payment revenue unless an actual payment system exists.

If based on completed appointment/service prices, use terminology such as:
- Estimated service revenue
- Completed appointment value

---

# MASTER ROADMAP

## Phase 0 — Product & Architecture Contract

**Objective:** Freeze the product architecture before implementation.

### Gate 0.1 — Current-State Baseline
Document the actual repository state:
- architecture
- components
- data flow
- booking flow
- admin flow
- i18n
- hard-coded content
- dependencies
- deployment
- existing risks

**Evidence:** repository-grounded baseline.

### Gate 0.2 — Domain Model
Define and approve:
- Clinic
- User
- Service
- FAQ
- Appointment
- Analytics Event
- Analytics Aggregate
- relationships
- ownership
- timestamps
- identifiers

**Evidence:** finalized data/domain contract.

### Gate 0.3 — Routing Contract
Define public and admin routes, including clinic identity strategy.

Target concept:
```
/c/:clinicSlug
/c/:clinicSlug/book

/clinic/login
/clinic/dashboard
/clinic/appointments
/clinic/services
/clinic/content
/clinic/analytics
/clinic/settings
```

Exact routes may be refined only with evidence.

### Gate 0.4 — Security Contract
Define:
- authentication
- authorization
- roles
- clinic isolation
- public writes
- authenticated writes
- server-side operations
- Firestore rule boundaries

### Gate 0.5 — Architecture Freeze
Produce the final architecture contract covering:
- routing
- data model
- Firebase
- auth
- authorization
- clinicId
- public/admin data flow
- multilingual model
- analytics
- deployment model

**Phase 0 closes only when all five gates have evidence.**

---

## Phase 1 — Firebase Foundation

**Objective:** Establish the secure backend foundation.

### Gate 1.1 — Firebase Integration
- Configure Firebase safely.
- Keep environment-specific configuration appropriate for deployment.
- Avoid secrets in source.

### Gate 1.2 — Authentication
Implement:
- login
- logout
- auth state
- session persistence
- protected admin entry

No custom password storage.

### Gate 1.3 — Firestore Foundation
Implement the approved Phase 0 schema and required indexes/configuration.

### Gate 1.4 — Security Rules
Prove:
- authenticated clinic users access only authorized clinic data;
- clinic A cannot access clinic B;
- unauthorized writes fail;
- public operations expose only intentionally public data.

### Gate 1.5 — Foundation Verification
Verify Auth + Firestore + Rules together.

**Phase 1 closes only with security evidence.**

---

## Phase 2 — Public Website → Real Data

**Objective:** Replace hard-coded customer-facing data with clinic-managed persistent data.

### Gate 2.1 — Clinic Configuration
Public interface reads:
- name
- logo
- branding
- contact
- address
- hours
- social links
- public configuration

### Gate 2.2 — Dynamic Services
Services come from Firestore and support the approved active/order model.

### Gate 2.3 — Dynamic Content
Convert appropriate hard-coded content to managed data:
- Hero
- About
- FAQ
- Footer
- social links

### Gate 2.4 — Public Booking
Customer can:
- select service
- select date/time
- enter owner information
- enter pet information
- add notes
- submit appointment

### Gate 2.5 — Synchronization
Prove that clinic-side content changes appear correctly on the public interface.

**Phase 2 closes only after public data is no longer dependent on demo hard-coding for managed content.**

---

## Phase 3 — Real Appointment System

**Objective:** Build the actual appointment domain.

### Gate 3.1 — Appointment Model
Implement the approved appointment schema.

### Gate 3.2 — Validation
Validate client-side for UX and server-side for trust:
- required fields
- valid service
- valid clinic
- valid date/time
- valid state transitions
- normalized data

### Gate 3.3 — Availability / Conflict Protection
Prevent invalid duplicate bookings and enforce the approved scheduling rules.

### Gate 3.4 — Appointment Lifecycle
Implement approved statuses:
- pending
- confirmed
- completed
- cancelled

Only valid transitions are permitted.

### Gate 3.5 — End-to-End Flow
Prove:
```
Customer
→ booking
→ Firestore
→ clinic dashboard
→ status update
→ synchronized result
```

**Phase 3 closes only with end-to-end evidence.**

---

## Phase 4 — Clinic Admin Dashboard

**Objective:** Turn the existing admin concept into a real authenticated clinic workspace.

### Gate 4.1 — Admin Shell
Implement a production sidebar and authenticated layout:
- Dashboard
- Appointments
- Services
- Content
- Analytics
- Settings
- Logout

### Gate 4.2 — Dashboard Overview
Provide useful overview metrics and appointment summaries.

### Gate 4.3 — Appointment Management
Clinic can:
- view appointments
- inspect details
- confirm
- cancel
- complete

### Gate 4.4 — Services Management
Support:
- create
- read
- update
- archive/delete where appropriate
- activate/deactivate
- ordering

### Gate 4.5 — Admin/Public Synchronization
Prove that clinic changes propagate correctly to the public interface.

---

## Phase 5 — Full Clinic Content & Configuration

**Objective:** Make VetLife genuinely configurable for different clinics.

### Gate 5.1 — Clinic Profile
Manage:
- clinic name
- logo
- description
- address
- phone
- email
- hours
- emergency information

### Gate 5.2 — Branding
Manage a constrained safe branding system:
- primary color
- accent color
- logo
- approved visual configuration

Do not build a custom CSS/page-builder system.

### Gate 5.3 — FAQ Management
Support:
- create/edit
- ordering
- active/inactive
- multilingual content

### Gate 5.4 — Social/Footer Management
Manage approved links/content:
- Facebook
- Instagram
- TikTok
- YouTube
- WhatsApp
- website
- footer content

### Gate 5.5 — Content Contract
Audit the customer-facing application and prove that commercial clinic content is configuration/data-driven rather than accidentally hard-coded.

---

## Phase 6 — Multilingual System

**Objective:** Complete independent public/admin multilingual behavior.

### Gate 6.1 — Admin System i18n
Translate the admin system UI.

### Gate 6.2 — Public System i18n
Maintain Arabic/English/French public UI.

### Gate 6.3 — Managed Content Translation
Implement approved multilingual structures for clinic-managed content.

### Gate 6.4 — RTL/LTR Isolation
Prove independent direction handling for public and admin contexts.

### Gate 6.5 — Persistence & Independence
Prove public language and admin language persist independently.

---

## Phase 7 — Analytics

**Objective:** Provide useful, privacy-conscious, cost-aware analytics.

### Gate 7.1 — Event Model
Implement approved analytics event schema.

### Gate 7.2 — Visitor/Session Logic
Correctly distinguish:
- page views
- sessions
- unique visitors

Avoid naive page-load counters.

### Gate 7.3 — Aggregation
Implement efficient daily/weekly/monthly aggregation as defined by the architecture.

### Gate 7.4 — Analytics Dashboard
Show:
- visitors
- page views
- bookings
- conversion
- popular services
- popular pages

### Gate 7.5 — Integrity & Cost Safety
Verify:
- clinic isolation
- duplicate-event handling
- aggregation correctness
- reasonable Firestore reads/writes

---

## Phase 8 — Revenue & Business Analytics

**Objective:** Add useful business metrics without misrepresenting revenue.

### Gate 8.1 — Service Value
Add approved service pricing/value fields if required.

### Gate 8.2 — Appointment Value
Associate appointment value with the approved service/value model.

### Gate 8.3 — Completed-Service Revenue
Only approved completed service values contribute to estimated revenue.

### Gate 8.4 — Revenue Dashboard
Provide:
- completed appointments
- estimated service revenue
- revenue by service
- revenue over time

### Gate 8.5 — Terminology & Integrity
Clearly distinguish estimated service value from actual payment revenue.

---

## Phase 9 — Production UX & Reliability

**Objective:** Make the product reliable for real users.

### Gate 9.1 — Loading/Error/Empty States
All important async flows have explicit:
- loading
- success
- error
- empty states

### Gate 9.2 — Form Reliability
Prevent:
- duplicate submissions
- invalid states
- stale writes
- accidental destructive actions

### Gate 9.3 — Accessibility
Review:
- keyboard navigation
- labels
- focus
- ARIA
- contrast
- semantic structure
- RTL accessibility

### Gate 9.4 — Responsive QA
Verify public and admin interfaces across:
- mobile
- tablet
- desktop

### Gate 9.5 — UX Acceptance
Verify complete customer and clinic user journeys.

---

## Phase 10 — Security Hardening

**Objective:** Perform a dedicated production security pass.

### Gate 10.1 — Authentication Security
Verify:
- unauthenticated access denial
- session behavior
- logout
- protected routes

### Gate 10.2 — Authorization
Test cross-clinic and cross-role access.

### Gate 10.3 — Firestore Rules
Test:
- unauthorized read
- unauthorized write
- cross-clinic access
- privilege escalation
- public/private boundaries

### Gate 10.4 — Server Validation
Ensure sensitive operations do not rely on frontend validation.

### Gate 10.5 — Security Audit
Produce final evidence for:
- Auth
- Rules
- Functions
- clinic isolation
- data ownership

---

## Phase 11 — Testing & Commercial Release

**Objective:** Establish release confidence and prepare VetLife for its first real clinic.

### Gate 11.1 — Automated Tests
Add appropriate automated coverage for:
- domain/data behavior
- auth
- booking
- authorization
- critical UI flows

Do not create meaningless tests just to increase coverage.

### Gate 11.2 — Production Build
Verify production build and inspect for:
- errors
- broken imports
- missing assets
- configuration problems
- unacceptable warnings

### Gate 11.3 — Deployment Verification
Verify the deployed application and required Firebase integration.

### Gate 11.4 — Full Regression
Re-verify:
- public website
- booking
- authentication
- admin
- appointments
- services
- content
- i18n
- analytics
- security

### Gate 11.5 — Commercial Release Gate
Produce a final release report proving the product is ready for the first real clinic.

---

## Phase 12 — Product Architecture & Access Flow

**Objective:** Extend the frozen VetLife architecture with the controlled product entry flow, Platform Owner boundary, clinic provisioning/lifecycle, and canonical public access model.

Phase 12 is implementation work. Its runtime/security evidence remains pending until the later verification pass. It must not silently reopen or weaken the existing Phase 0–11 contracts.

### Gate 12.1 — Architecture Amendment, Entry & Routing Contract

Define and implement the approved product entry topology:

```
/                       → VetLife welcome/login
/clinic/*               → authenticated clinic workspace
/platform/*             → authenticated Platform Owner workspace
/c/:clinicSlug          → public clinic page
/c/:clinicSlug/book     → public booking
```

Prove by repository evidence that:
- the default entry is the VetLife welcome/login experience;
- authenticated users are routed according to authorized identity/capability;
- clinic routes remain protected;
- Platform Owner routes have a distinct authorization boundary;
- public clinic routes remain accessible only for intentionally public/active clinics;
- no route guard is treated as backend security.

### Gate 12.2 — Platform Owner Authorization & Clinic Provisioning

Implement a trusted Platform Owner model.

Requirements:
- Platform Owner is distinct from clinic owner/admin membership;
- authorization is established by trusted server-side control;
- platform clinic creation/provisioning is not a client-authorized Firestore write;
- provisioning creates/establishes the clinic identity, canonical slug, owner/admin membership, and required lifecycle state;
- arbitrary client-selected clinic IDs cannot create or claim a clinic;
- existing clinic isolation remains intact.

The implementation may use a controlled Firebase custom claim or an equivalent trusted server-side authorization mechanism, but must not use frontend-only UID/email checks as the authoritative boundary.

### Gate 12.3 — Clinic Lifecycle & Public Access

Implement the clinic lifecycle and canonical public identity.

Requirements:
- deterministic clinic identity;
- unique/canonical public slug;
- explicit active/provisioned state;
- public lookup resolves only to the intended clinic;
- inactive/unpublished clinics are not exposed publicly;
- clinic admin can see its canonical public link;
- clinic ownership remains derived from authenticated membership rather than a client-selected clinicId;
- existing appointment/content/analytics security boundaries remain unchanged.

### Gate 12.4 — Architecture Regression & Contract Verification

Add targeted repository/contract checks for the new architecture without weakening existing tests.

Verify structurally that:
- route topology matches the contract;
- Platform Owner authorization cannot be represented only by frontend state;
- provisioning uses trusted server execution;
- clinic public lookup remains bounded;
- QR/public-link implementation cannot carry sensitive data;
- existing clinic authorization helpers and Rules remain authoritative.

Runtime Firebase/browser security evidence is deferred to Phase 14.

**Phase 12 closes only when all four gates have implementation evidence and the later runtime evidence required by the Definition of Done is available.**

---

## Phase 13 — VetLife Experience & Commercial UI Restoration

**Objective:** Restore the original VetLife public product identity while keeping all Phase 1–10 data, security, multilingual, analytics, and reliability contracts intact.

### Gate 13.1 — Original VetLife Visual Identity Restoration

Restore the baseline VetLife public experience, using the known baseline implementation as the visual reference.

The restored experience must cover:
- Navbar and VetLife branding;
- Hero and primary CTA;
- Services cards and visual differentiation;
- About section;
- FAQ interaction;
- Footer and social presentation;
- booking presentation/CTA;
- dark mode;
- responsive layout;
- established spacing, typography, gradients, and visual hierarchy.

Do not replace the baseline identity with a generic dashboard/template aesthetic.

### Gate 13.2 — Dynamic Content Inside the VetLife Identity

Integrate the existing Firestore-driven clinic configuration/content into the restored visual system.

Requirements:
- Firestore remains the source of truth for approved clinic-managed content;
- dynamic services, FAQs, profile, hero/about/footer and approved branding remain functional;
- missing/empty data has safe fallback states;
- dynamic content cannot inject arbitrary HTML/CSS;
- constrained branding cannot destroy layout or accessibility;
- public/admin language independence remains intact;
- RTL/LTR behavior remains correct.

### Gate 13.3 — Public Link, QR & Clinic Discovery UX

Complete the clinic-facing public-access experience.

Requirements:
- clinic admin can view and copy the canonical public link;
- QR Code page exists in the clinic admin workspace;
- QR preview is accurate;
- QR is printable;
- QR encodes only the canonical public clinic URL;
- no credentials, private paths, tokens, or admin routes are encoded;
- public page opened through the QR behaves identically to the canonical public URL.

### Gate 13.4 — Commercial UX Consistency

Reconcile the restored public experience with the existing production UX contract.

Verify implementation consistency for:
- loading/error/empty states;
- accessibility semantics;
- responsive behavior;
- multilingual/RTL behavior;
- booking reliability;
- analytics event behavior;
- public clinic isolation;
- admin/public synchronization.

Do not perform unrelated visual redesign outside the approved VetLife identity.

**Phase 13 closes only after implementation evidence exists and Phase 14 provides the required browser/runtime evidence.**

---

## Phase 14 — Full Verification, Integration & Commercial Release

**Objective:** Perform the combined evidence pass for the complete VetLife product and close the remaining phases progressively.

Phase 14 is verification/release work. It must not become a place to silently add new product scope.

### Gate 14.1 — Combined Firebase Runtime Verification

Verify integrated runtime behavior for:
- Auth;
- Firestore;
- Rules;
- clinic membership;
- clinic provisioning;
- public clinic lookup;
- booking;
- appointment lifecycle;
- services/content;
- i18n persistence and RTL/LTR;
- analytics;
- revenue/value aggregation.

Every result must be backed by concrete evidence. Unrun checks remain **NOT VERIFIED**.

### Gate 14.2 — Security & Isolation Verification

Explicitly verify:
- unauthenticated access denial;
- clinic A vs clinic B isolation;
- role boundaries;
- Platform Owner authorization;
- client inability to self-provision clinics;
- protected Firestore reads/writes;
- trusted appointment operations;
- analytics write boundaries;
- public/private clinic boundaries;
- no sensitive data in public links or QR payloads;
- production App Check/rate-control requirements where applicable.

### Gate 14.3 — Browser, Responsive & Accessibility Verification

Verify the actual product in supported browser/device contexts:
- welcome/login;
- clinic admin;
- Platform Owner;
- public clinic page;
- booking;
- QR/public-link flow;
- Arabic/English/French;
- RTL/LTR;
- mobile/tablet/desktop;
- keyboard/focus/labels/contrast;
- loading/error/empty/retry states.

Visual verification must use the restored VetLife identity as the acceptance reference.

### Gate 14.4 — CI, Deployment & Full Regression

Verify:
- automated tests;
- production build;
- dependency installation behavior;
- Functions dependency reproducibility boundary;
- deployment;
- deployed Firebase integration;
- rollback/deployment evidence;
- complete regression across Phases 0–13.

Known unresolved release items, including the Functions lockfile boundary, App Check/rate-control enforcement, and dependency vulnerabilities, must be either remediated or explicitly documented as release blockers before the final gate.

### Gate 14.5 — Progressive Phase Closure & Commercial Release

Close Phases 1–14 progressively based on their actual evidence.

For every closure:
```
Requirement
↓
Implementation
↓
Runtime / security behavior
↓
Evidence
↓
Pass / Fail
↓
Gate closed
↓
Phase closed
```

Do not mark a gate or phase CLOSED merely because its implementation exists.

The final commercial release gate requires:
- all required gates closed;
- no unresolved critical security/data-integrity issue;
- deployment evidence;
- regression evidence;
- release report;
- explicit confirmation that the product definition is satisfied.


---

# 9. Strict AI Agent Engineering Rules

These rules are permanent unless explicitly changed by the project owner.

## Rule 1 — Inspect Before Editing

Never modify code based on assumptions.

Before meaningful implementation:
1. inspect current repository state;
2. identify relevant files;
3. understand existing behavior;
4. define the smallest safe change;
5. implement;
6. verify.

## Rule 2 — Phase and Gate Discipline

The agent must work on the currently authorized Phase/Gate only.

Do not silently:
- implement future phases;
- add unrelated features;
- perform speculative refactors;
- redesign unrelated UI.

If a discovered issue belongs to a later phase, document it and stop unless it blocks the current gate.

## Rule 3 — No Random Testing

Tests must answer a known question.

Do not run large collections of unrelated tests merely to appear thorough.

Preferred sequence:

```
Requirement
→ Targeted check
→ Evidence
→ Result
```

## Rule 4 — Evidence-First Closure

A gate is not closed because the code looks correct.

Every gate requires:
- requirement
- implementation result
- verification
- evidence
- pass/fail status

## Rule 5 — Preserve Working Behavior

Do not rewrite functioning code without a justified requirement.

Prefer incremental changes over rewrites.

## Rule 6 — Minimal Dependency Changes

Do not add, remove, upgrade, downgrade, or replace dependencies unless required by the active gate.

Every dependency change must have a documented reason.

## Rule 7 — Clean Architecture

Maintain clear separation between:

```
UI
↓
application/data layer
↓
Firebase
```

Avoid scattering Firestore calls throughout unrelated UI components.

## Rule 8 — No Security Theater

Never claim security because:
- a route is hidden;
- a button is hidden;
- a clinicId exists in a URL;
- a password exists in React state.

Security must be enforced at the backend/database boundary.

## Rule 9 — No Raw Password Storage

Never store clinic passwords in:
- Firestore
- localStorage
- sessionStorage
- source code
- configuration files
- frontend state

Use Firebase Authentication.

## Rule 10 — Clinic Isolation Is Mandatory

Every clinic-owned operation must respect clinic ownership.

A user belonging to Clinic A must never be able to access Clinic B data.

## Rule 11 — Server Trust Boundary

Frontend validation is for UX.

It is not a security mechanism.

Sensitive validation and authorization must be enforced by Firebase Rules and/or trusted server-side functions.

## Rule 12 — Configuration Over Hard-Coding

Commercial clinic data belongs in configuration/database where appropriate.

Do not hard-code:
- clinic identity
- phone
- email
- address
- social links
- services
- FAQs
- claims
- appointment settings

System constants and UI translations may remain in code when appropriate.

## Rule 13 — Do Not Make Everything Editable

Configurable does not mean arbitrary.

Do not build:
- page builders
- custom CSS editors
- drag-and-drop site builders
- arbitrary component editors

Prefer a constrained, reliable product configuration model.

## Rule 14 — Truthful Product Claims

Do not implement or advertise features that do not exist.

Examples:
- do not call a booking "paid" without payment;
- do not call estimated service value "actual revenue";
- do not claim 24/7 emergency service unless the clinic explicitly configures and supports it.

## Rule 15 — i18n Quality

Avoid duplicate translation keys.

Keep:
- system translations
- clinic-managed translations

conceptually separate.

Never introduce language-dependent logic that breaks RTL/LTR.

## Rule 16 — Code Quality

Write code that is:
- readable
- predictable
- maintainable
- appropriately modular
- consistently named
- free of unnecessary duplication
- free of dead code
- free of temporary hacks

Do not optimize prematurely.

## Rule 17 — Comments

Comments must be **English** and professional.

Add comments when they explain:
- non-obvious business rules;
- security boundaries;
- important architectural decisions;
- Firebase-specific constraints;
- intentionally unusual behavior;
- complex algorithms.

Do not comment obvious code.

Bad:
```
// Set the name
setName(name)
```

Good:
```
// The clinicId is derived from the authenticated user's membership,
// not from the public route, to prevent cross-clinic data access.
```

Comments should explain **why**, not merely repeat **what** the code does.

## Rule 18 — No Dead Code

Do not leave:
- unused imports
- unused dependencies
- abandoned components
- commented-out implementations
- debug logs
- temporary test bypasses

unless explicitly justified and documented.

## Rule 19 — Error Handling

User-facing operations must fail safely.

Do not silently swallow errors.

Do not expose sensitive internal errors to customers.

Provide useful developer diagnostics where appropriate and safe user-facing messages.

## Rule 20 — Data Integrity

Use:
- server timestamps where appropriate;
- stable identifiers;
- explicit status transitions;
- normalized references;
- appropriate validation;
- deterministic data ownership.

Avoid duplicated sources of truth.

## Rule 21 — Performance

Avoid unnecessary:
- Firestore reads
- Firestore listeners
- re-renders
- repeated analytics writes
- full collection scans

Analytics must be designed with Firestore usage in mind.

## Rule 22 — Accessibility Is Part of Done

Accessibility is not an optional visual polish step.

Interactive controls must have:
- meaningful labels;
- keyboard support;
- appropriate focus behavior;
- appropriate ARIA where needed;
- correct directionality.

## Rule 23 — Do Not Weaken Tests

Never:
- delete a meaningful test to make a phase pass;
- weaken an assertion;
- bypass a security check;
- suppress an error without understanding it.

If a test is wrong, document why and fix the test deliberately.

## Rule 24 — No Unrelated Cleanup During Critical Work

Avoid drive-by refactors.

If cleanup is necessary to safely implement the active gate, keep it minimal and document it.

## Rule 25 — Git Hygiene

Changes must be:
- scoped;
- reviewable;
- logically grouped;
- clearly committed when commits are requested.

Do not rewrite history or force-push unless explicitly authorized.

## Rule 26 — Local Environment Boundary

The AI agent may modify repository/GitHub state.

The project owner handles local synchronization and local verification.

Do not assume local-only state exists unless evidence is available.

## Rule 27 — Never Invent Verification

If a test could not be run, state:

```
NOT VERIFIED
```

Do not report it as passed.

## Rule 28 — Stop on Ambiguity

If an architectural decision affects security, schema, routing, or irreversible data behavior and is not defined by the active contract, stop and request/establish the decision rather than guessing.

## Rule 29 — Keep the Repository Production-Clean

Before a phase is closed, inspect for:
- debug code
- temporary files
- accidental secrets
- dead code
- inconsistent naming
- broken imports
- unnecessary comments
- accidental generated artifacts
- unsafe configuration

## Rule 30 — The Repository Is the Source of Truth

README claims, old conversations, and assumptions do not override actual repository evidence.

Always inspect the current code before making claims about implementation state.

---

# 10. Definition of Done

A feature is not "done" because it renders.

A feature is done when:

```
Requirement
↓
Implementation
↓
Data/security behavior
↓
Verification
↓
Evidence
↓
Gate closed
```

A Phase is done only when every Gate defined for that Phase is closed.

For the current roadmap:
- Phases 0–11 retain their existing five-gate structure.
- Phase 12 contains four implementation gates.
- Phase 13 contains four implementation gates.
- Phase 14 contains five verification/release gates.

VetLife is commercially ready only when all required Phase 0–14 release requirements are satisfied.

---

# 11. Agent Operating Protocol

For every assigned task:

### Step 1 — Read this file
Identify:
- current Phase
- current Gate
- constraints
- relevant architecture

### Step 2 — Inspect repository
Use actual source/configuration state.

### Step 3 — State the implementation boundary
Identify what will and will not change.

### Step 4 — Implement minimally
Preserve existing behavior outside the scope.

### Step 5 — Verify
Run only relevant checks available to the agent.

### Step 6 — Report evidence
Report:
- files changed
- behavior changed
- checks performed
- results
- unresolved items
- gate status

### Step 7 — Stop
Do not automatically continue into the next Gate unless explicitly instructed.

---

# 12. Final Product Definition

At release, VetLife must provide:

### Product Entry & Platform Management
- VetLife welcome/login entry
- secure Firebase Authentication
- distinct Platform Owner workspace
- trusted clinic provisioning
- explicit clinic lifecycle
- canonical public clinic links
- printable QR codes for clinic public pages

### Public Customer Experience
- clinic-branded website
- services
- managed content
- FAQ
- social/contact information
- booking
- Arabic/English/French
- RTL/LTR
- reliable responsive UX

### Clinic Experience
- secure login
- protected dashboard
- clinic-specific data
- appointment management
- service management
- content management
- FAQ management
- social/footer management
- clinic settings
- analytics
- independent language

### Platform
- Firebase Authentication
- Firestore
- Security Rules
- Cloud Functions where required
- clinicId isolation
- persistent data
- server-side validation where required
- analytics
- production build/deployment
- automated testing for critical behavior

---

# 13. Non-MVP Backlog

The following are intentionally deferred:

- online payments
- SMS infrastructure
- WhatsApp automation
- advanced staff roles
- CRM
- inventory
- pharmacy
- laboratory
- full veterinary medical records
- SaaS subscription billing
- self-service clinic onboarding (the current MVP uses Platform Owner-controlled provisioning)
- advanced marketing attribution
- advanced BI/reporting

These may become future phases only after the core commercial product is stable.

---

# 14. Permanent Principle

**Do not optimize for the appearance of progress. Optimize for verified product correctness.**

VetLife should evolve through controlled, evidence-backed increments until a real veterinary clinic can use it safely and meaningfully.
