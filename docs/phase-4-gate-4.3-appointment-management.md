# Phase 4 — Gate 4.3 — Appointment Management

## Status
**IMPLEMENTED — PENDING RUNTIME CLOSURE**

## Scope
Clinic users can now manage the appointment lifecycle from the dedicated admin workspace.

Implemented:
- appointment listing;
- appointment detail fields;
- pending → confirmed;
- pending → cancelled;
- confirmed → completed;
- confirmed → cancelled;
- action loading/disable behavior;
- refresh after successful transition.

All lifecycle mutations continue through the trusted transitionAppointment Cloud Function. Direct Firestore appointment updates remain denied by Security Rules.

## Runtime evidence required
- authorized clinic can view its appointments;
- each valid transition succeeds;
- invalid transitions fail;
- cross-clinic transitions fail;
- updated status is persisted and visible after refresh.

No runtime closure is claimed yet.
