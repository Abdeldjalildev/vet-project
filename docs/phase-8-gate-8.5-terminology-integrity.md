# Phase 8 — Gate 8.5: Terminology & Integrity

## Status
**IMPLEMENTED — PENDING RUNTIME CLOSURE**

## Integrity contract
- Service values must be non-negative.
- Currency codes use three uppercase letters.
- Appointment value is snapshotted at booking time.
- Service price edits do not alter historical appointment values.
- Only completed appointments contribute to completed-service value.
- Appointment completion is already protected by the approved lifecycle state machine.
- Revenue aggregation is server-authoritative.
- Multiple currencies are displayed separately rather than numerically combined.

## Terminology
The product does not claim to process or receive payments.

Approved terminology:
- Service value
- Estimated completed-service value
- Completed service value

Avoid representing these metrics as actual cash/payment revenue.

No runtime closure is claimed.
