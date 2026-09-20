# Phase 10 — Gate 10.3: Firestore Rules

## Status
**IMPLEMENTED — PENDING EMULATOR / FIREBASE RUNTIME VERIFICATION**

## Rules posture
The ruleset is deny-by-default and grants only the operations required by the frozen product contract.

## Protected areas
- Clinic documents: public reads only when the clinic is public; protected reads require active owner/admin membership; writes require active owner/admin membership.
- Services: active services are public; protected clinic reads require membership; writes require owner/admin membership and validated value fields.
- FAQs: active FAQs are public; protected clinic reads require membership; writes require owner/admin membership.
- Appointments: clinic members can read their clinic; direct create/update/delete is denied because booking and lifecycle mutations use trusted Cloud Functions.
- Analytics events: direct client writes are denied.
- Analytics aggregates: direct client writes are denied; reads require owner/admin membership.
- User membership: users can read only their own membership; client create/update/delete is denied.
- Catch-all access is denied.

## Trusted-server boundary
Cloud Functions use the Firebase Admin SDK and therefore bypass Firestore Security Rules. Function-side authentication, membership authorization, clinic checks, input validation, and state-transition checks are consequently part of the security boundary.

## Data-model constraint
The public clinic document is intentionally limited to public-safe clinic configuration. Future private/security-sensitive data must use a separate protected path rather than being added to the public clinic document.

## Closure evidence
Run targeted Firestore Emulator tests for anonymous/public reads, member/non-member reads, cross-clinic reads, authorized/unauthorized writes, direct appointment mutation denial, analytics write denial, and membership self-modification denial.
