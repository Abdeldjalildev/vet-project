# Phase 3 — Gate 3.5: End-to-End Flow

## Status
**IMPLEMENTED — PENDING RUNTIME VERIFICATION**

Target flow:

```
Public customer
→ validated booking request
→ trusted Cloud Function
→ Firestore appointment
→ authenticated clinic dashboard
→ lifecycle transition
→ updated Firestore appointment
```

Implementation evidence:
- public booking calls `createPublicAppointment`;
- trusted function persists the appointment;
- clinic dashboard loads only the authenticated user's membership clinic;
- dashboard exposes allowed lifecycle actions;
- lifecycle mutations call `transitionAppointment`;
- Firestore Rules allow clinic-scoped reads but deny direct appointment mutations.

## Runtime evidence still required
1. public valid booking persists;
2. clinic user sees the appointment;
3. pending → confirmed works;
4. confirmed → completed works;
5. cancellation works from pending/confirmed;
6. invalid transitions fail;
7. another clinic cannot access the appointment;
8. occupied slot cannot be booked again.

## Gate decision
**3.5 IMPLEMENTED — NOT CLOSED until the complete flow is verified locally against Firebase.**
