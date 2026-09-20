# Phase 10 — Gate 10.2: Authorization

## Status
**IMPLEMENTED — PENDING RUNTIME SECURITY VERIFICATION**

## Authorization model
`Firebase Auth UID → users/{uid} membership → clinicId + role → authorized operation`

Accepted roles:
- owner
- admin

Membership must have `status: "active"` and a clinicId.

## Implemented controls
- Admin shell resolves membership before exposing clinic data.
- Firestore rules authorize using authenticated UID and active membership with an accepted owner/admin role.
- Clinic slug and clinicId are never treated as credentials.
- `transitionAppointment` verifies authentication, active membership, role, and exact clinic match.
- Direct client appointment lifecycle writes are denied.
- Client creation/update/deletion of membership records is denied.
- Analytics aggregate reads require authorized clinic membership.
- Public booking is unauthenticated by design but restricted by trusted clinic/service checks.

## Cross-clinic boundary
Changing a client-supplied clinicId cannot grant another clinic's authorization because the trusted transition function compares it with the authenticated membership clinic, and Firestore reads independently require membership for protected data.

## Closure evidence
1. anonymous user denied clinic data;
2. clinic A member can access clinic A;
3. clinic A member denied clinic B;
4. inactive membership denied;
5. unsupported role denied;
6. direct appointment mutation denied;
7. mismatched-clinic transition denied;
8. unauthorized analytics aggregate access denied.
