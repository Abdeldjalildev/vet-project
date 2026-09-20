# VetLife — Phase 0 / Gate 0.4 Security Contract

**Gate:** G0.4 — Security Contract  
**Phase:** Phase 0 — Product & Architecture Contract  
**Status:** CLOSED  
**Repository:** `Abdeldjalildev/vet-project`  
**Depends on:** G0.2 Domain Model + G0.3 Routing Contract

## 1. Purpose

This contract defines the security boundaries VetLife must implement before Firebase/Auth/Firestore work begins.

Security is enforced at the identity, database-rule, and trusted-server boundaries. React route guards and hidden UI are convenience controls only.

## 2. Security Principles

1. Firebase Authentication is the authoritative identity system.
2. Raw passwords are never stored by VetLife.
3. `clinicId` identifies ownership but does not itself authorize access.
4. A public `clinicSlug` is a lookup key, never an admin credential.
5. Every clinic-owned record must be isolated by its owning `clinicId`.
6. Frontend validation is UX validation, not a security boundary.
7. Firestore Security Rules enforce direct database access boundaries.
8. Cloud Functions are used for operations requiring trusted server-side authority.
9. Client-provided role, clinicId, status, timestamps, and privileged fields must never be trusted for authorization.
10. Deny-by-default is preferred for protected data and operations.
11. Public access is limited to explicitly public clinic data and approved booking/analytics operations.
12. No security decision may depend only on route visibility or UI state.

## 3. Identity Model

### 3.1 Authentication

Clinic users authenticate with Firebase Authentication.

VetLife must not implement custom password storage in:

- Firestore;
- Realtime Database;
- localStorage/sessionStorage;
- React state as a substitute for Auth;
- source code;
- environment files.

Firebase Auth owns credentials and authenticated identity.

### 3.2 Application Membership

Conceptual membership record:

`users/{uid}`

Minimum trusted application metadata:

- `uid`
- `clinicId`
- `role`
- `status`
- `createdAt`
- `updatedAt`

The authenticated Firebase UID is the identity used to locate membership.

A membership must be active before protected clinic access is granted.

## 4. Roles

MVP roles:

### owner

May administer the clinic within the approved product surface, including:

- clinic configuration;
- branding;
- public content;
- services;
- appointments;
- analytics;
- approved settings.

### admin

May perform approved operational and content-management actions required by the clinic workspace, subject to the final field-level restrictions implemented in Phase 1+.

The MVP does not introduce arbitrary custom roles or enterprise RBAC.

## 5. Authorization Flow

The authoritative relationship is:

`Firebase Auth UID → active membership → clinicId + role → authorized operation`

A request is authorized only when the authenticated identity has the required active membership and role for the requested operation.

The browser must never be able to select a different clinic merely by changing:

- URL parameters;
- React state;
- request payloads;
- local storage;
- query parameters.

## 6. Clinic Isolation

Every clinic-owned document belongs to exactly one clinic.

Examples:

- `clinics/{clinicId}`
- `clinics/{clinicId}/services/{serviceId}`
- `clinics/{clinicId}/faqs/{faqId}`
- `clinics/{clinicId}/appointments/{appointmentId}`
- `clinics/{clinicId}/analyticsEvents/{eventId}`
- `clinics/{clinicId}/analyticsAggregates/{aggregateId}`

For protected operations, the effective clinic is derived from trusted membership, not accepted from an untrusted client as an authorization decision.

Required invariant:

> An authenticated user belonging to Clinic A must not read, create, update, delete, or otherwise manipulate Clinic B's protected data.

Cross-clinic access must fail even if the caller knows Clinic B's IDs.

## 7. Public Data Boundary

Public users do not receive authenticated clinic-admin access.

Public reads may expose only intentionally public clinic data, such as:

- active public clinic profile/configuration;
- active services;
- active FAQs;
- approved public content;
- approved social/contact information;
- public booking configuration required by the booking UI.

Private/admin-only data must not be exposed through a public query.

Examples of private data include:

- clinic membership records;
- user roles;
- administrative configuration not intended for customers;
- internal analytics aggregates unless explicitly exposed;
- appointment records;
- private operational notes.

Public reads must be shaped around public-safe data rather than relying on the frontend to hide private fields.

## 8. Public Booking Security

Public booking is intentionally unauthenticated, but it is not trusted.

A public booking request must be validated against authoritative backend data.

The trusted path must verify at minimum:

- target clinic is valid and active;
- selected service exists, belongs to that clinic, and is active/bookable;
- date/time satisfies the approved scheduling rules;
- required customer/pet fields are valid and normalized;
- appointment status is assigned by trusted logic;
- server timestamps are authoritative.

The client must not be allowed to create an arbitrary confirmed/completed appointment.

The exact booking write path may use Firestore rules and/or a Cloud Function according to the Phase 1 implementation design.

## 9. Appointment Authorization

Clinic users may access appointment records only for their authorized clinic.

Allowed lifecycle operations must follow the approved state machine:

`pending → confirmed → completed`

and:

`pending → cancelled`

`confirmed → cancelled`

Arbitrary client-side status mutation is forbidden.

Appointment ownership must never be reassigned by changing a client-provided `clinicId`.

## 10. Service and Content Authorization

Clinic-managed services, FAQs, public content, branding, contact data, hours, social links, and approved settings are clinic-owned.

Write access requires an authenticated active clinic membership with the appropriate role.

A write must not permit a client to:

- change ownership to another clinic;
- forge audit timestamps;
- elevate its own role;
- modify another user's membership without the required privilege;
- write unsupported fields that bypass the domain contract.

## 11. Membership and Privilege Protection

A clinic user must not be able to grant itself additional privileges by editing its membership document.

Role and membership status changes are privileged administrative operations and must follow the explicit authorization design implemented in Phase 1+.

No client-controlled field may be accepted as proof of elevated privilege.

If owner/admin membership management is later required, it must be added through an explicit architecture decision and security contract update.

## 12. Analytics Security

Analytics events are clinic-scoped.

Public analytics collection may accept only approved low-risk event data.

Clients must not be able to forge:

- another clinic's `clinicId`;
- privileged aggregate values;
- dashboard metrics;
- revenue values;
- administrative analytics records.

Aggregates are derived data and should be written by trusted aggregation logic where necessary.

Analytics must not collect unnecessary personal or sensitive veterinary information.

## 13. Revenue/Data Integrity Boundary

The MVP has no payment processor and therefore must not represent derived appointment/service values as confirmed financial transactions.

If estimated service value is introduced:

- service pricing is clinic-owned configuration;
- appointment value is a trusted historical snapshot;
- completed appointment values feed estimated service-revenue metrics;
- clients cannot directly write dashboard revenue totals.

Actual payment revenue requires a future payment architecture and is out of scope.

## 14. Firestore Rule Boundary

The Phase 1 rule design must enforce, at minimum:

### Public
- read only explicitly public clinic data;
- permit only intentionally public write operations;
- reject direct writes to protected clinic/admin collections.

### Authenticated clinic user
- read only data belonging to the authenticated user's active clinic;
- write only approved collections/fields for that role;
- never cross clinic boundaries.

### Privileged/trusted server
- perform operations that require trusted validation, aggregation, or protected transitions;
- use Admin SDK/server authority only where justified;
- never expose server credentials to the client.

### Default
- deny access to unspecified/private collections and fields.

The exact Firestore Rules syntax and collection-by-collection matrix are implementation deliverables of Phase 1 and must not be fabricated during Phase 0.

## 15. Cloud Functions / Trusted Operations

Cloud Functions are permitted where browser-side writes cannot safely enforce the required invariant.

Candidate trusted operations include:

- validated public appointment creation;
- protected appointment state transitions;
- analytics aggregation;
- other server-authoritative derived values.

A function must:

1. authenticate/validate the caller where applicable;
2. resolve trusted clinic membership when the operation is authenticated;
3. validate all client-controlled inputs;
4. enforce ownership and role requirements;
5. write server-authoritative timestamps/derived fields;
6. return only the minimum necessary result.

Functions must not become a generic bypass around Firestore Rules.

## 16. URL and Route Security

Approved public route:

`/c/:clinicSlug`

The slug resolves public clinic context only.

Admin routes remain:

`/clinic/*`

They do not accept `clinicId` as the authorization source.

Forbidden security assumptions:

- "the user cannot see the admin link";
- "the route is hidden";
- "the slug is secret";
- "the clinicId is hard to guess";
- "the client checks the role";
- "the frontend blocks the button".

These are not authorization controls.

## 17. Security Failure States

The application must fail closed when:

- authentication is absent for a protected route;
- membership is missing;
- membership is disabled;
- requested clinic is inactive for public access;
- authorization cannot be established;
- trusted validation fails.

It must not silently select another clinic or downgrade a protected request into a different clinic context.

## 18. Security Test Contract for Later Phases

Phase 1 and Phase 10 must provide targeted evidence for at least:

1. unauthenticated protected read denied;
2. unauthenticated protected write denied;
3. Clinic A cannot read Clinic B data;
4. Clinic A cannot write Clinic B data;
5. disabled membership cannot access clinic data;
6. user cannot self-promote role;
7. public client cannot directly write protected appointment/admin data;
8. public booking cannot create an appointment for another clinic;
9. invalid service ownership is rejected;
10. invalid appointment status transitions are rejected;
11. analytics client cannot write protected aggregates;
12. privileged server operations validate authorization and input.

These are verification requirements, not implementation instructions to prematurely build the test suite in Phase 0.

## 19. Security Non-Goals

Not part of MVP:

- enterprise RBAC;
- SSO/SAML;
- MFA enforcement beyond Firebase capabilities explicitly adopted;
- payment security/payment processing;
- medical-record security architecture;
- full audit-log product;
- rate-limit/WAF platform design;
- arbitrary staff delegation;
- multi-clinic user membership.

If introduced later, they require an explicit architecture update.

## 20. Gate Decision

**G0.4 — SECURITY CONTRACT: CLOSED**

The VetLife security boundary is defined sufficiently to begin Firebase implementation without relying on frontend-only authorization or undocumented assumptions.

The next authorized gate is **G0.5 — Architecture Freeze**.
