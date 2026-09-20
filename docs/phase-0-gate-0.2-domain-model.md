# VetLife — Phase 0 / Gate 0.2 Domain Model

**Gate:** G0.2 — Domain Model  
**Phase:** Phase 0 — Product & Architecture Contract  
**Status:** CLOSED  
**Repository:** `Abdeldjalildev/vet-project`  
**Baseline:** G0.1 commit `9951357603769b6f7ac028aa037357a5c7b1fc09`

## 1. Purpose

This document defines the approved MVP domain model before Firebase collections, authentication, persistence, or application implementation.

The model separates:
- clinic-owned business data;
- user identity/membership;
- public website configuration;
- appointments;
- analytics events and aggregates.

No Phase 1 implementation is authorized by this document.

## 2. Domain Principles

1. Every clinic-owned record belongs to exactly one `clinicId`.
2. `clinicId` is a data-ownership key, not an authorization mechanism by itself.
3. Firebase Authentication owns credentials and identity; application data stores membership metadata, never raw passwords.
4. IDs are stable document identifiers and are not business fields supplied by the public URL.
5. Server timestamps are authoritative for creation/update times.
6. Public-facing content and system UI translations are separate concerns.
7. Multilingual clinic content uses explicit language fields rather than embedding language selection into business records.
8. Appointment service references use `serviceId`, not service display names.
9. Appointment status changes are constrained to the approved lifecycle.
10. Analytics raw events and dashboard aggregates are separate models.
11. Revenue/value fields represent service value unless a real payment system is later introduced.

## 3. Entity Map

```
Clinic
├── Users / memberships
├── Services
├── FAQs
├── Appointments
├── Public configuration/content
└── Analytics
    ├── Events
    └── Aggregates

Appointment ──references──> Service
User ──belongs to──> Clinic
All clinic-owned entities ──belong to──> Clinic
```

## 4. Clinic

**Identity:** `clinicId`

Conceptual Firestore location:

```
clinics/{clinicId}
```

Purpose: root tenant and public website configuration boundary.

### Required identity fields

| Field | Type | Required | Meaning |
|---|---|---:|---|
| clinicId | string | yes | Stable clinic identifier; normally the document ID |
| slug | string | yes | Public URL-safe clinic identifier; unique within the deployment |
| name | string | yes | Public clinic name |
| status | enum | yes | Initial values: `active`, `inactive` |
| createdAt | timestamp | yes | Server creation timestamp |
| updatedAt | timestamp | yes | Server update timestamp |

### Public configuration

The clinic document may contain bounded configuration groups for:

- contact information;
- address;
- opening hours;
- emergency information;
- booking settings;
- branding;
- public hero/about content;
- approved social links;
- footer content.

These are configuration domains, not arbitrary page-builder data.

### Important distinction

A clinic's public `slug` identifies which public website is being requested. It does not grant administrative access.

## 5. User / Clinic Membership

Conceptual location:

```
users/{uid}
```

Firebase Authentication is authoritative for the user's identity and credentials.

Application membership metadata contains:

| Field | Type | Required | Meaning |
|---|---|---:|---|
| uid | string | yes | Firebase Auth UID; normally document ID |
| clinicId | string | yes for clinic staff | Clinic membership |
| role | enum | yes for clinic staff | Initial MVP role: `owner` or `admin` |
| status | enum | yes | Initial values: `active`, `disabled` |
| createdAt | timestamp | yes | Membership record creation |
| updatedAt | timestamp | yes | Membership record update |

### Role boundary

MVP supports:

- `owner`: clinic administration and clinic configuration authority.
- `admin`: clinic operational management within the approved admin surface.

Additional staff roles are explicitly outside the MVP domain.

A user must not belong to multiple clinics implicitly through a single unqualified `clinicId` field. Multi-membership is a future architectural extension and is not introduced accidentally here.

## 6. Service

Conceptual location:

```
clinics/{clinicId}/services/{serviceId}
```

Purpose: clinic-managed services used by the public website and appointments.

| Field | Type | Required | Meaning |
|---|---|---:|---|
| serviceId | string | yes | Stable document ID |
| clinicId | string | yes | Owning clinic |
| name | localized object | yes | Public service name |
| description | localized object | yes | Public service description |
| price | number/null | no | Service value when the clinic chooses to publish/use it |
| currency | string/null | no | Currency for the value |
| durationMinutes | integer/null | no | Expected appointment duration |
| isActive | boolean | yes | Whether publicly bookable/visible |
| sortOrder | integer | yes | Public/admin ordering |
| createdAt | timestamp | yes | Server timestamp |
| updatedAt | timestamp | yes | Server timestamp |

### Localized object

Approved language keys:

```
{
  ar: string,
  en: string,
  fr: string
}
```

A language value may be absent only where the product's content-completeness rules explicitly permit fallback. The exact completeness enforcement belongs to later implementation/validation work.

### Service identity rule

Appointments reference `serviceId`. They do not store a mutable service name as their primary identity.

## 7. FAQ

Conceptual location:

```
clinics/{clinicId}/faqs/{faqId}
```

| Field | Type | Required | Meaning |
|---|---|---:|---|
| faqId | string | yes | Stable document ID |
| clinicId | string | yes | Owning clinic |
| question | localized object | yes | Question by language |
| answer | localized object | yes | Answer by language |
| isActive | boolean | yes | Public visibility |
| sortOrder | integer | yes | Display order |
| createdAt | timestamp | yes | Server timestamp |
| updatedAt | timestamp | yes | Server timestamp |

FAQ content is clinic-managed content, not system UI translation.

## 8. Appointment

Conceptual location:

```
clinics/{clinicId}/appointments/{appointmentId}
```

| Field | Type | Required | Meaning |
|---|---|---:|---|
| appointmentId | string | yes | Stable document ID |
| clinicId | string | yes | Owning clinic |
| petName | string | yes | Patient/pet name |
| petType | enum/string | yes | Initial values: cat, dog, bird, other |
| ownerName | string | yes | Owner/contact person |
| ownerPhone | string | yes | Contact phone |
| ownerEmail | string | no | Contact email |
| serviceId | string | yes | Selected service |
| date | date string | yes | Appointment calendar date |
| time | time string | yes | Appointment start time |
| notes | string | no | Customer-provided context |
| status | enum | yes | pending, confirmed, completed, cancelled |
| createdAt | timestamp | yes | Server creation timestamp |
| updatedAt | timestamp | yes | Server update timestamp |

### Appointment value

If service pricing is enabled, a value snapshot may be associated with the appointment so historical appointment value is not silently changed when the service price later changes.

This value is **estimated service value**, not payment revenue.

### Lifecycle

Approved initial lifecycle:

```
pending → confirmed → completed
        ↘ cancelled

confirmed → cancelled
```

No arbitrary status mutation is part of the MVP.

## 9. Public Booking Request

A public booking is not a separate long-lived domain entity.

The public interface collects booking input and creates an Appointment through the approved application/backend path.

The browser must not be treated as the authority for:
- clinic ownership;
- service validity;
- appointment status;
- timestamps;
- authorization.

Those trust-boundary decisions belong to the Phase 0 Security Contract and later implementation.

## 10. Analytics Event

Conceptual location:

```
clinics/{clinicId}/analyticsEvents/{eventId}
```

Purpose: minimal event facts used to produce analytics.

| Field | Type | Required | Meaning |
|---|---|---:|---|
| eventId | string | yes | Stable event ID |
| clinicId | string | yes | Owning clinic |
| eventType | enum | yes | Approved event type |
| page | string | no | Public/admin page identifier as applicable |
| timestamp | timestamp | yes | Event occurrence time |
| sessionId | string | no | Anonymous/session grouping identifier |
| visitorId | string | no | Privacy-conscious anonymous visitor grouping |
| language | enum | no | ar/en/fr |
| deviceType | enum/string | no | coarse device category |

Initial event types:

- `page_view`
- `session_start`
- `booking_started`
- `booking_completed`
- `service_view`

Analytics must not collect unnecessary personal or sensitive veterinary information.

## 11. Analytics Aggregate

Conceptual aggregate location:

```
clinics/{clinicId}/analyticsAggregates/{aggregateId}
```

The exact aggregate key can encode:
- period;
- date;
- metric;
- optional dimension.

Example conceptual dimensions:

```
clinicId
period: day | week | month
dateKey
pageViews
sessions
uniqueVisitors
bookingStarts
bookingsCompleted
serviceViews
```

Aggregates are derived data, not an independent source of truth.

The dashboard should read aggregates rather than scan every raw event on every render.

## 12. Clinic Configuration Subdomains

The following are considered part of the Clinic domain rather than separate top-level entities:

### Profile/contact
- name
- description
- phone
- email
- address
- opening hours
- emergency information

### Branding
- logo
- constrained primary color
- constrained accent color

### Public content
- hero content
- about content
- footer content

### Social links
Approved platforms may include:
- Facebook
- Instagram
- TikTok
- YouTube
- WhatsApp
- website

### Booking settings

Initial configuration may include:
- booking enabled/disabled;
- approved booking horizon;
- minimum lead time;
- opening/availability configuration.

Detailed scheduling semantics are deferred to Phase 3 where they are required.

## 13. Relationships and Ownership

| Entity | Owner | Primary relationship |
|---|---|---|
| Clinic | platform/domain root | owns clinic data |
| User | Firebase identity + clinic membership | belongs to clinic |
| Service | Clinic | belongs to clinic |
| FAQ | Clinic | belongs to clinic |
| Appointment | Clinic | belongs to clinic; references Service |
| Analytics Event | Clinic | belongs to clinic |
| Analytics Aggregate | Clinic | derived from clinic events |

Every clinic-owned document must be traceable to exactly one clinic.

## 14. Timestamps

All persistent business entities that can change over time use:

- `createdAt`
- `updatedAt`

Server-authoritative timestamps are preferred over client-supplied timestamps.

Analytics events additionally require their event occurrence timestamp.

## 15. Identifiers

- Clinic identity: `clinicId`
- Firebase user identity: `uid`
- Service identity: `serviceId`
- FAQ identity: `faqId`
- Appointment identity: `appointmentId`
- Analytics event identity: `eventId`
- Aggregate identity: deterministic aggregate key/document ID

Human-readable names are never used as stable relational identifiers.

## 16. Explicitly Out of Scope

The following are not part of the MVP domain contract:

- payment transactions;
- payment processor records;
- subscription/billing entities;
- medical records;
- prescriptions;
- inventory;
- laboratory records;
- pharmacy;
- CRM;
- SMS/WhatsApp messaging records;
- arbitrary page builder blocks;
- custom CSS storage;
- multi-role enterprise RBAC;
- multi-clinic user membership model.

These may be introduced only through an explicit architecture change.

## 17. Gate Decision

**G0.2 — DOMAIN MODEL: CLOSED**

The MVP domain is now sufficiently specified to define navigation and route boundaries.

The next authorized gate is **G0.3 — Routing Contract**.
