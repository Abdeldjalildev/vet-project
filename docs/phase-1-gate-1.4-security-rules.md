# VetLife — Phase 1 / Gate 1.4 Security Rules

**Status:** IMPLEMENTED — EXTERNAL RULES RUNTIME VERIFICATION REQUIRED; PHASE 2 EXTENDS THE APPOINTMENT CREATE BOUNDARY

## Implemented boundary
- Default deny for unspecified documents.
- Active Firebase Auth membership is required for protected clinic access.
- Clinic ownership is derived from users/{uid}.clinicId, not a client-selected authorization value.
- Clinic A members cannot read/write Clinic B protected data.
- Appointment records are clinic-member readable. Phase 2 adds a narrowly validated public-create path for active public clinics; conflict protection and lifecycle enforcement remain Phase 3 responsibilities.
- Analytics aggregates cannot be directly written by clients.
- Membership documents cannot be self-created, deleted, or updated from the client.
- Clinic/service/FAQ management is restricted to active owner/admin membership.
- Public clinic/service/FAQ reads are limited to documents explicitly marked public/active.

## Deliberate scope boundary
G1.4 establishes the database authorization boundary. Phase 2 may extend that boundary only through explicit, narrowly validated public operations. Appointment conflict protection, lifecycle transitions, analytics aggregation, and privileged server operations remain later gates.

## Verification status
Repository inspection confirms the rule contract is represented in firestore.rules and Firebase is configured to deploy those rules through firebase.json.
Runtime rule tests against the real VetLife Firebase project/emulator are still required before this gate can be closed.

**Decision: G1.4 IMPLEMENTED — PENDING CLOSURE.**