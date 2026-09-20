# VetLife — Phase 0 / Gate 0.5 Architecture Freeze

**Gate:** G0.5 — Architecture Freeze  
**Phase:** Phase 0 — Product & Architecture Contract  
**Status:** CLOSED  
**Repository:** `Abdeldjalildev/vet-project`  
**Depends on:** G0.1, G0.2, G0.3, G0.4

## 1. Purpose

This document freezes the product and architecture decisions established during Phase 0.

Phase 0 is complete only because the repository baseline, domain model, routing contract, and security contract have all been documented and verified.

No Firebase or router implementation is performed by this gate.

## 2. Product Definition

VetLife is a configurable veterinary clinic platform with two connected interfaces:

### Public Customer Interface

Provides:

- clinic public website;
- clinic-managed services and content;
- FAQ/contact/social information;
- multilingual customer experience;
- public appointment booking;
- privacy-conscious analytics event generation.

### Clinic/Admin Interface

Provides:

- authenticated clinic access;
- dashboard;
- appointment management;
- service management;
- content/configuration management;
- analytics;
- settings;
- independent admin language.

The two interfaces share the same backend data model while maintaining distinct access boundaries.

## 3. Frozen Technology Architecture

Primary backend:

- Firebase Authentication
- Cloud Firestore
- Firestore Security Rules
- Cloud Functions only where trusted server-side execution is required

Frontend:

- existing React/Vite application;
- routing will be introduced during implementation;
- existing visual foundation should be preserved where it remains compatible with the product contract.

Application layering target:

`UI → application/data layer → Firebase`

Firestore access should not be scattered indiscriminately throughout presentation components.

## 4. Tenant / Clinic Boundary

`clinicId` is the canonical clinic ownership key.

Approved data structure:

```
clinics/{clinicId}
clinics/{clinicId}/services/{serviceId}
clinics/{clinicId}/faqs/{faqId}
clinics/{clinicId}/appointments/{appointmentId}
clinics/{clinicId}/analyticsEvents/{eventId}
clinics/{clinicId}/analyticsAggregates/{aggregateId}
users/{uid}
```

Every clinic-owned record must belong to exactly one clinic.

The initial commercial deployment may be configured for one clinic at a time, but the data architecture remains clinicId-aware.

A URL slug or client-provided clinicId is never an authorization boundary.

## 5. Identity and Authorization

Authentication:

`Firebase Auth UID`

Membership:

`users/{uid} → clinicId + role + status`

Authorization:

`authenticated identity → active membership → clinicId + role → permitted operation`

MVP roles:

- `owner`
- `admin`

Raw passwords are never stored by VetLife.

Protected access must fail closed when authentication, active membership, or authorization cannot be established.

## 6. Routing Architecture

Public:

```
/c/:clinicSlug
/c/:clinicSlug/book
```

Admin:

```
/clinic/login
/clinic/dashboard
/clinic/appointments
/clinic/services
/clinic/content
/clinic/analytics
/clinic/settings
```

Public clinic resolution:

`clinicSlug → active public clinic → clinicId → public-safe data`

Admin clinic resolution:

`Firebase Auth UID → membership → clinicId`

The admin route family intentionally does not use `/clinic/:clinicId/*` as an authorization boundary.

Deep linking is required in production.

## 7. Domain Model

Frozen MVP entities:

- Clinic
- User / Clinic Membership
- Service
- FAQ
- Appointment
- Analytics Event
- Analytics Aggregate

Key relationship:

`Appointment → Service`

Appointments reference stable `serviceId`, not mutable service names.

Persistent mutable business records use server-authoritative `createdAt` and `updatedAt`.

## 8. Appointment Contract

Core fields:

- appointmentId
- clinicId
- petName
- petType
- ownerName
- ownerPhone
- ownerEmail?
- serviceId
- date
- time
- notes?
- status
- createdAt
- updatedAt

Initial lifecycle:

```
pending → confirmed → completed
pending → cancelled
confirmed → cancelled
```

The client cannot authoritatively choose ownership, status, or server timestamps.

Public booking is unauthenticated but must pass trusted validation.

## 9. Public/Admin Data Flow

### Public

```
/c/:clinicSlug
      ↓
resolve active clinic
      ↓
load public-safe configuration/content
      ↓
render customer UI
```

Booking:

```
customer input
      ↓
trusted validation
      ↓
appointment creation
      ↓
clinic-scoped Firestore record
      ↓
clinic admin visibility
```

### Admin

```
Firebase Auth
      ↓
membership
      ↓
authorized clinic context
      ↓
clinic-scoped data access
      ↓
admin UI
```

Clinic-managed public content flows back to the public interface through the shared persistent data model.

## 10. Content and Configuration

Clinic-managed content is bounded configuration, not a page builder.

Approved domains include:

- clinic profile/contact;
- address/hours/emergency information;
- branding;
- hero/about content;
- services;
- FAQs;
- approved social links;
- footer content;
- booking settings.

No arbitrary custom CSS or unrestricted page-builder system is part of MVP.

## 11. Multilingual Architecture

Supported languages:

- Arabic
- English
- French

Two independent contexts:

`publicLanguage ≠ adminLanguage`

System UI translations are separate from clinic-managed localized content.

Approved localized content shape:

```
{
  ar: string,
  en: string,
  fr: string
}
```

Arabic requires RTL handling; English/French require LTR handling.

Changing one interface's language must not change the other interface's language.

## 12. Analytics Architecture

Initial events:

- page_view
- session_start
- booking_started
- booking_completed
- service_view

Analytics distinguishes:

- page views;
- sessions;
- unique visitors.

Raw events are clinic-scoped.

Dashboard reads should prefer derived daily/weekly/monthly aggregates rather than scanning all raw events on every render.

Analytics must avoid unnecessary personal or sensitive veterinary information.

## 13. Revenue Semantics

MVP does not include payment processing.

If service pricing is used:

- appointment value is a historical service-value snapshot;
- completed appointment values may contribute to estimated service revenue;
- dashboard terminology must not imply actual payment revenue.

Actual financial transactions require a future payment architecture.

## 14. Security Architecture

The security boundary is:

```
Firebase Auth
    ↓
active membership
    ↓
clinicId + role
    ↓
Firestore Rules / trusted functions
```

Firestore Rules must deny unspecified/private access by default.

Public clients may access only intentionally public data and approved public operations.

Protected clinic data is readable/writable only within the authorized clinic boundary.

Trusted functions may be used for:

- validated public booking;
- protected appointment transitions;
- analytics aggregation;
- trusted derived values.

Functions are not a generic bypass around Firestore Rules.

## 15. Deployment Model

Initial product delivery may use one deployment/configuration per clinic.

The architecture nevertheless remains clinicId-aware so the data model does not need to be redesigned when additional clinics are introduced.

Production routing must support direct navigation to all declared client-side routes.

Environment-specific Firebase configuration must not expose server secrets.

## 16. Phase Boundaries

Phase 0 freezes architecture only.

It does not implement:

- Firebase;
- Authentication;
- Firestore;
- Security Rules;
- React Router;
- appointment persistence;
- analytics collection;
- production deployment.

Those belong to later phases.

## 17. Explicit MVP Non-Goals

The following remain outside the frozen MVP:

- payments/payment processing;
- SaaS billing/subscriptions;
- medical records;
- prescriptions;
- pharmacy;
- laboratory;
- inventory;
- CRM;
- messaging records;
- enterprise RBAC;
- arbitrary page builders;
- custom CSS storage;
- multi-clinic user membership;
- SSO/SAML;
- full audit-log product.

Any addition requires an explicit architecture decision.

## 18. Phase 0 Gate Evidence

| Gate | Status | Evidence |
|---|---|---|
| G0.1 Current-State Baseline | CLOSED | `docs/phase-0-gate-0.1-current-state-baseline.md` |
| G0.2 Domain Model | CLOSED | `docs/phase-0-gate-0.2-domain-model.md` |
| G0.3 Routing Contract | CLOSED | `docs/phase-0-gate-0.3-routing-contract.md` |
| G0.4 Security Contract | CLOSED | `docs/phase-0-gate-0.4-security-contract.md` |
| G0.5 Architecture Freeze | CLOSED | This document |

## 19. Architecture Freeze Decision

**PHASE 0 — CLOSED**

The VetLife product architecture is now frozen sufficiently to begin **Phase 1 — Firebase Foundation**.

From this point forward, implementation must follow the contracts established by G0.2–G0.5. Any material change to the frozen domain, routing, security, or backend architecture requires an explicit architecture decision rather than silent implementation drift.

**Next authorized phase: Phase 1 — Firebase Foundation.**
