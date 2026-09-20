# Phase 3 — Gate 3.3: Availability / Conflict Protection

## Status
**IMPLEMENTED — PENDING RUNTIME VERIFICATION**

## Scheduling invariant
The MVP currently treats a clinic's exact `date + time` as a single bookable slot. A slot occupied by a `pending` or `confirmed` appointment cannot receive another public booking.

This is an explicit minimal scheduling rule for Phase 3. Service duration/opening-hours scheduling remains a later refinement if required by the clinic configuration model.

## Implementation
The trusted public booking function:
1. validates clinic/service;
2. runs a Firestore transaction;
3. reads existing pending/confirmed appointments for the requested date/time;
4. rejects an occupied slot;
5. creates the appointment atomically when the slot is free.

Firestore transactions provide atomic read/write behavior and retry under concurrent document changes. citeturn0search0turn0search6

A composite Firestore index is declared for the conflict query.

Direct client appointment creation is denied by Firestore Rules.

## Gate decision
**3.3 IMPLEMENTED — NOT CLOSED until concurrent/conflict runtime evidence is recorded.**
