# Phase 5 — Gate 5.3 — FAQ Management

## Status
**IMPLEMENTED — PENDING RUNTIME CLOSURE**

Clinic owner/admin can:
- create FAQ;
- edit FAQ;
- order FAQ;
- activate/deactivate FAQ;
- delete FAQ;
- manage question and answer in Arabic, English, and French.

The public FAQ section reads active FAQs from the same clinic-owned collection. Firestore also constrains FAQ fields to the approved shape and requires localized question/answer maps, numeric order, and boolean active state.

Runtime evidence required:
- CRUD operations persist;
- ordering is reflected publicly;
- inactive FAQs are hidden;
- multilingual content renders;
- clinic isolation holds.

No runtime closure is claimed.
