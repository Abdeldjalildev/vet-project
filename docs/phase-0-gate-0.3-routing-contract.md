# VetLife — Phase 0 / Gate 0.3 Routing Contract

**Gate:** G0.3 — Routing Contract  
**Phase:** Phase 0 — Product & Architecture Contract  
**Status:** CLOSED  
**Repository:** `Abdeldjalildev/vet-project`  
**Depends on:** G0.2 Domain Model

## 1. Purpose

This contract defines how users enter and navigate the two VetLife interfaces:

1. Public Customer Interface
2. Clinic/Admin Interface

The contract establishes route ownership, access class, clinic identity resolution, and navigation boundaries before router implementation.

## 2. Route Families

VetLife has two distinct route families:

```
/c/:clinicSlug/*
/clinic/*
```

The public family is clinic-scoped by URL.

The admin family is authenticated and resolves the clinic from authenticated membership rather than trusting a URL clinic identifier.

## 3. Public Routes

### 3.1 Public Clinic Home

```
/c/:clinicSlug
```

Purpose:
- render the selected clinic's public website;
- load public clinic configuration;
- display active services, public content, FAQs, contact/social information;
- expose the public booking entry point.

Access:
- public, no authentication required.

### 3.2 Public Booking

```
/c/:clinicSlug/book
```

Purpose:
- render the booking workflow for the selected clinic;
- collect approved owner/pet/service/date/time/notes data;
- submit a booking request for that clinic.

Access:
- public, no authentication required.

Security rule:
The `:clinicSlug` identifies the public context only. It does not authorize access to private clinic data.

### 3.3 Public Unknown/Invalid Clinic

A clinic slug that cannot be resolved to an active public clinic must render a controlled not-found/inactive state.

It must not:
- expose another clinic's content;
- silently fall back to a different clinic;
- expose internal identifiers.

Exact UI copy is a later UX concern.

## 4. Clinic/Admin Routes

### 4.1 Clinic Login

```
/clinic/login
```

Purpose:
- authenticate clinic users through Firebase Authentication.

Access:
- public authentication entry point.

The login page must not accept or store raw application passwords in Firestore.

### 4.2 Dashboard

```
/clinic/dashboard
```

Access:
- authenticated clinic user only.

Purpose:
- clinic overview;
- operational summaries;
- approved dashboard metrics.

### 4.3 Appointments

```
/clinic/appointments
```

Access:
- authenticated clinic user with approved clinic role.

Purpose:
- view and manage appointments belonging to the authenticated user's clinic.

### 4.4 Services

```
/clinic/services
```

Access:
- authenticated clinic user with approved management role.

Purpose:
- create/edit/archive/activate/order clinic services.

### 4.5 Content

```
/clinic/content
```

Access:
- authenticated clinic user with approved management role.

Purpose:
- manage public content such as hero/about/FAQ/footer/social information according to the bounded content model.

### 4.6 Analytics

```
/clinic/analytics
```

Access:
- authenticated clinic user with approved analytics access.

Purpose:
- display clinic-scoped analytics aggregates.

### 4.7 Settings

```
/clinic/settings
```

Access:
- authenticated clinic user, with sensitive configuration actions restricted according to role/security policy.

Purpose:
- clinic profile;
- branding;
- contact/hours;
- booking settings;
- approved administrative configuration.

## 5. Admin Route Boundary

The admin route family intentionally does **not** use:

```
/clinic/:clinicId/...
```

as its authorization boundary.

Instead:

```
Firebase Auth
   ↓
authenticated UID
   ↓
membership record
   ↓
clinicId + role
   ↓
authorized application/data access
```

The authenticated membership determines which clinic the admin operates on.

A future route parameter may be introduced only through an explicit architecture decision if a concrete use case requires it.

## 6. Public Clinic Resolution

Public route resolution:

```
/c/:clinicSlug
       ↓
resolve active clinic by slug
       ↓
obtain clinicId
       ↓
load public-safe clinic data
       ↓
render public interface
```

The slug is a public lookup key.

It must never be treated as proof that the requester is an authorized clinic administrator.

## 7. Route Access Matrix

| Route | Public | Auth required | Clinic-scoped | Purpose |
|---|---:|---:|---:|---|
| `/c/:clinicSlug` | yes | no | yes | Public clinic website |
| `/c/:clinicSlug/book` | yes | no | yes | Public booking |
| `/clinic/login` | yes | no | no | Authentication |
| `/clinic/dashboard` | no | yes | yes | Clinic overview |
| `/clinic/appointments` | no | yes | yes | Appointment management |
| `/clinic/services` | no | yes | yes | Service management |
| `/clinic/content` | no | yes | yes | Public content management |
| `/clinic/analytics` | no | yes | yes | Analytics |
| `/clinic/settings` | no | yes | yes | Clinic configuration |

## 8. Authentication Redirect Contract

Unauthenticated access to a protected `/clinic/*` route must redirect to:

```
/clinic/login
```

After successful authentication, the application should return the user to the originally requested protected route where safe and practical.

Authenticated users visiting `/clinic/login` may be redirected to their authorized dashboard rather than being shown the login form again.

The exact session implementation belongs to Phase 1.

## 9. Clinic Mismatch / Membership Failure

If an authenticated user has no active clinic membership:

- protected clinic data must not be shown;
- the application must present a controlled access state;
- no clinic may be inferred from an arbitrary URL parameter.

If the membership is disabled, the user must not retain clinic administrative access.

These are route-level manifestations of the future Security Contract; actual authorization must be enforced below the router as well.

## 10. Public vs Admin Navigation

### Public navigation

The public interface may navigate within:

```
/c/:clinicSlug
/c/:clinicSlug/book
```

Internal section anchors such as services/about/FAQ may remain implementation details of the public page unless a future requirement justifies separate routes.

### Admin navigation

The authenticated sidebar navigates between:

```
/clinic/dashboard
/clinic/appointments
/clinic/services
/clinic/content
/clinic/analytics
/clinic/settings
```

Logout returns to:

```
/clinic/login
```

## 11. Language Context Boundary

The route contract reserves independent language contexts:

```
Public UI language
      ≠
Admin UI language
```

Changing language under `/c/:clinicSlug/*` must not change the admin language.

Changing language under `/clinic/*` must not change the public language.

The persistence mechanism is intentionally deferred to the multilingual implementation phase, but the route architecture must not couple the two contexts.

## 12. Error Routes

The application must support controlled handling for at least:

- unknown public clinic;
- missing public resource;
- unknown admin route;
- unauthorized protected route.

A global error strategy may be implemented by the router without creating new business entities.

## 13. Deep-Link Requirement

Every declared route must support direct navigation/deep linking in the production deployment.

The deployment configuration must eventually serve the application entry point for client-side routes.

This is a deployment requirement, not a reason to add routing-specific backend behavior in Phase 0.

## 14. Current-to-Target Migration Note

The current repository has no router and uses hash/anchor navigation.

The future router must preserve the existing public section navigation while introducing the two route families above.

This gate does not implement React Router or rewrite the current UI.

## 15. Explicitly Forbidden Routing Decisions

Do not implement:

- clinic authorization based only on `:clinicSlug`;
- public admin routes;
- raw clinic passwords in route state/query parameters;
- clinic credentials in URLs;
- duplicate route families for the same business screen without a documented need;
- arbitrary nested `/clinic/:clinicId/*` authorization;
- page-builder routes or future-domain routes not in the approved contract.

## 16. Gate Decision

**G0.3 — ROUTING CONTRACT: CLOSED**

The public/customer and authenticated clinic/admin navigation boundaries are now defined.

The next authorized gate is **G0.4 — Security Contract**.
