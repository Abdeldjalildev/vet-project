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

### Phase 4 — Clinic Admin Dashboard
- G4.1 Admin Shell — **IMPLEMENTED / PENDING RUNTIME CLOSURE**
- G4.2 Dashboard Overview — **IMPLEMENTED / PENDING RUNTIME CLOSURE**
- G4.3 Appointment Management — **IMPLEMENTED / PENDING RUNTIME CLOSURE**
- G4.4 Services Management — **IMPLEMENTED / PENDING RUNTIME CLOSURE**
- G4.5 Admin/Public Synchronization — **IMPLEMENTED / PENDING RUNTIME CLOSURE**

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

### Phase 7 — Analytics
- G7.1 Event Model — **IMPLEMENTED / PENDING RUNTIME CLOSURE**
- G7.2 Visitor/Session Logic — **IMPLEMENTED / PENDING RUNTIME CLOSURE**
- G7.3 Aggregation — **IMPLEMENTED / PENDING RUNTIME CLOSURE**
- G7.4 Analytics Dashboard — **IMPLEMENTED / PENDING RUNTIME CLOSURE**
- G7.5 Integrity & Cost Safety — **IMPLEMENTED / PENDING RUNTIME CLOSURE**

Phase 7 implementation is complete on GitHub. Runtime verification remains intentionally deferred so the planned combined verification pass can provide evidence before closure.

### Phase 8 — Revenue & Business Analytics
- G8.1 Service Value — **IMPLEMENTED / PENDING RUNTIME CLOSURE**
- G8.2 Appointment Value — **IMPLEMENTED / PENDING RUNTIME CLOSURE**
- G8.3 Completed-Service Revenue — **IMPLEMENTED / PENDING RUNTIME CLOSURE**
- G8.4 Revenue Dashboard — **IMPLEMENTED / PENDING RUNTIME CLOSURE**
- G8.5 Terminology & Integrity — **IMPLEMENTED / PENDING RUNTIME CLOSURE**

Phase 8 implementation is complete on GitHub. Runtime verification remains intentionally deferred so the planned combined verification pass can provide evidence before closure.

### Phase 9 — Production UX & Reliability
- G9.1 Loading/Error/Empty States — **IMPLEMENTED / PENDING RUNTIME CLOSURE**
- G9.2 Form Reliability — **IMPLEMENTED / PENDING RUNTIME CLOSURE**
- G9.3 Accessibility — **IMPLEMENTED / PENDING RUNTIME CLOSURE**
- G9.4 Responsive QA — **IMPLEMENTED / PENDING RUNTIME CLOSURE**
- G9.5 UX Acceptance — **IMPLEMENTED / PENDING RUNTIME CLOSURE**

Phase 9 implementation is complete on GitHub. Runtime/browser verification remains intentionally deferred so the planned combined verification pass can provide evidence before closure.






---

### Phase 10 — Security Hardening
- G10.1 Authentication Security — **IMPLEMENTED / PENDING RUNTIME CLOSURE**
- G10.2 Authorization — **IMPLEMENTED / PENDING RUNTIME CLOSURE**
- G10.3 Firestore Rules — **IMPLEMENTED / PENDING RUNTIME CLOSURE**
- G10.4 Server Validation — **IMPLEMENTED / PENDING RUNTIME CLOSURE**
- G10.5 Security Audit — **IMPLEMENTED / PENDING RUNTIME CLOSURE**

Phase 10 implementation is complete on GitHub. Runtime security verification remains intentionally deferred; no Phase 10 gate is considered CLOSED until the planned combined Firebase/Emulator verification pass provides evidence.

### Phase 11 — Testing & Commercial Release
- G11.1 Automated Tests — **IMPLEMENTED / PENDING CI + RUNTIME CLOSURE**
- G11.2 Production Build — **IMPLEMENTED / PENDING CI + RUNTIME CLOSURE**
- G11.3 Deployment Verification — **IMPLEMENTED / PENDING DEPLOYMENT CLOSURE**
- G11.4 Full Regression — **IMPLEMENTED / PENDING COMBINED RUNTIME CLOSURE**
- G11.5 Commercial Release Gate — **IMPLEMENTED / PENDING RELEASE EVIDENCE**

Phase 11 implementation is complete on GitHub. Runtime, deployment, and commercial-release verification remain intentionally deferred until concrete evidence is collected.
## 1. Mission

VetLife is being transformed into a real product that can be customized and sold to veterinary clinics.

The target product has two connected interfaces:

1. **Public Customer Interface**
   - Clinic website
   - Services
   - About
   - FAQ
   - Contact/social links
   - Booking
   - Multilingual public experience
   - Analytics event generation

2. **Clinic/Admin Interface**
   - Authenticated clinic access
   - Sidebar dashboard
   - Appointment management
   - Services management
   - Clinic profile/settings
   - Website/content management
   - FAQ/social/footer management
   - Analytics
   - Independent admin language

Both interfaces use the same backend and are linked by a secure `clinicId` boundary.

---

## 2. Target Architecture

```
                    VetLife Platform
                           |
              +------------+------------+
              |                         |
       Public Customer UI        Clinic Admin UI
              |                         |
        /c/:clinicSlug            /clinic/*
              |                         |
              +------------+------------+
                           |
                    Application/Data Layer
                           |
              +------------+------------+
              |            |             |
         Firebase Auth  Firestore   Cloud Functions
                           |
                       clinicId
                           |
              +------------+------------+
              |                         |
          Clinic A data              Clinic B data
```

### Core principles

- Firebase is the primary backend platform.
- Firebase Authentication handles identity.
- Firestore stores application data.
- Firestore Security Rules enforce data boundaries.
- Cloud Functions are used only where trusted server-side execution is required.
- `clinicId` is the tenant/data-isolation key.
- A URL parameter alone is never a security boundary.
- Authentication membership and backend/database authorization are the security boundary.
- The initial commercial deployment may be one deployment/configuration per clinic, while the architecture remains clinicId-aware.
- Do not build a full SaaS billing/multi-tenant control plane unless explicitly requested.

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

A Phase is done only when all five Gates are closed.

VetLife is commercially ready only when all Phase 0–11 release requirements are satisfied.

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
- self-service clinic onboarding
- advanced marketing attribution
- advanced BI/reporting

These may become future phases only after the core commercial product is stable.

---

# 14. Permanent Principle

**Do not optimize for the appearance of progress. Optimize for verified product correctness.**

VetLife should evolve through controlled, evidence-backed increments until a real veterinary clinic can use it safely and meaningfully.
