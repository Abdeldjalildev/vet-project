# Phase 3 — Gate 3.4: Appointment Lifecycle

## Status
**IMPLEMENTED — PENDING RUNTIME VERIFICATION**

Approved state machine:

```
pending → confirmed → completed
        ↘ cancelled

confirmed → cancelled
```

No other transitions are accepted.

Implementation:
- `transitionAppointment` is a trusted Cloud Function.
- caller must be authenticated;
- membership must be active;
- membership clinic must match the target appointment clinic;
- target status must be part of the approved state machine;
- `updatedAt` is server-authoritative;
- direct appointment updates/deletes are denied by Firestore Rules.

## Gate decision
**3.4 IMPLEMENTED — NOT CLOSED until each allowed and forbidden transition is runtime-tested.**
