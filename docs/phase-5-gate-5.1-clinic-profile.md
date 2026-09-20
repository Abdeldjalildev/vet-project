# Phase 5 — Gate 5.1 — Clinic Profile

## Status
**IMPLEMENTED — PENDING RUNTIME CLOSURE**

Clinic owner/admin can manage:
- clinic name;
- logo URL;
- multilingual clinic description;
- address;
- phone;
- email;
- opening hours;
- multilingual emergency information.

The values are stored on the clinic document and consumed by the public clinic interface where applicable. The Firestore update boundary explicitly permits the managed description field and validates the public configuration shape, including contact email and HTTPS logo URL.

Runtime evidence required:
- authorized profile update succeeds;
- public clinic reflects the updated profile;
- opening hours and emergency information render correctly;
- another clinic cannot be modified.

No runtime closure is claimed.
