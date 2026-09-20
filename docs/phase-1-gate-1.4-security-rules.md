# VetLife — Phase 1 / Gate 1.4 Security Rules

**Status:** IMPLEMENTED — EXTERNAL RULES RUNTIME VERIFICATION REQUIRED; PHASE 2 EXTENDS THE APPOINTMENT CREATE BOUNDARY

## Implemented boundary
- Default deny for unspecified documents.
- Active Firebase Auth membership is required for protected clinic access.
- Clinic ownership is derived from users/{uid}.clinicId, not a client-selected authorization value.
- Clinic A members cannot read/write Clinic B protected data.
- Appointment records are clinic-member readable. Phase 2 introduced persistent booking, and Phase 3 moves public creation plus lifecycle mutations behind trusted Cloud Functions; direct client appointment mutations are denied.
- Analytics aggregates cannot be directly written by clients.
- Membership documents cannot be self-created, deleted, or updated from the client.
- Clinic/service/FAQ management is restricted to active owner/admin membership.
- Public clinic/service/FAQ reads are limited to explicitly public/active documents whose top-level fields are constrained to the approved public schema. Clinic client updates are also restricted to the approved managed-content fields; clinic deletion is denied from the client.

## Deliberate scope boundary
G1.4 establishes the database authorization boundary. Phase 2/3 extend that boundary only through explicit trusted operations. Appointment conflict protection and lifecycle transitions are implemented in Phase 3 Cloud Functions and remain pending runtime verification.

## Verification status
Repository inspection confirms the rule contract is represented in firestore.rules and Firebase is configured to deploy those rules through firebase.json.
Runtime rule tests against the real VetLife Firebase project/emulator are still required before this gate can be closed. The public clinic lookup query is explicitly constrained by both `public == true` and `active == true` so it remains compatible with Firestore's query/rules evaluation model.

**Decision: G1.4 IMPLEMENTED — PENDING CLOSURE.**