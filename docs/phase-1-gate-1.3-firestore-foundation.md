# VetLife — Phase 1 / Gate 1.3 Firestore Foundation

**Gate:** G1.3 — Firestore Foundation  
**Phase:** Phase 1 — Firebase Foundation  
**Status:** IMPLEMENTED — EXTERNAL FIRESTORE CONFIGURATION AND RUNTIME VERIFICATION REQUIRED  
**Repository:** `Abdeldjalildev/vet-project`  
**Depends on:** G1.2 architecture boundary; Phase 0 domain/security contracts

## 1. Scope

G1.3 establishes the browser Firestore client and the approved Phase 0 collection/document contract. It does not implement Security Rules, public booking, appointment writes, service CRUD, or analytics collection.

## 2. Implemented

### Firestore client boundary

Created `src/lib/firestore.js` using the modular Firebase SDK and the existing Firebase App.

### Centralized references

The data layer exposes centralized Firestore references for:

- `clinics/{clinicId}`
- `users/{uid}`
- `clinics/{clinicId}/services/{serviceId}`
- `clinics/{clinicId}/faqs/{faqId}`
- `clinics/{clinicId}/appointments/{appointmentId}`
- `clinics/{clinicId}/analyticsEvents/{eventId}`
- `clinics/{clinicId}/analyticsAggregates/{aggregateId}`

The reference helpers do not perform application reads or writes. They establish one application/data-layer boundary for later gates and keep Firestore path construction out of presentation components.

## 3. Security Boundary

This gate deliberately does not add Firestore Security Rules. G1.4 is the authorized gate for rule enforcement.

The presence of a `clinicId` in a path is not treated as authorization.

## 4. Index Strategy

No composite indexes are added yet because the current G1.3 implementation does not introduce application queries that require them. Query-specific indexes will be added only when a concrete query is introduced and verified.

## 5. External Verification Required

The project owner must confirm in the intended Firebase project that Cloud Firestore is created and available to the Web App. Firebase's console supports creating the database and managing rules/indexes separately.

The initial database should use the default `(default)` database unless an explicit architecture decision changes that choice.

## 6. Gate Decision

**G1.3 — IMPLEMENTED, NOT CLOSED.**

Closure requires local/runtime verification against the real VetLife Firebase project. Security Rule verification remains G1.4.
