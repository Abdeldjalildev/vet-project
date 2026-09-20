# Phase 8 — Gate 8.1: Service Value

## Status
**IMPLEMENTED — PENDING RUNTIME CLOSURE**

Services now support a historical commercial value:
- price: non-negative numeric value
- currency: three-letter uppercase currency code

The admin service manager can create/edit these fields. Firestore Rules validate the value fields on service writes.

Public service cards expose the configured service value.

No payment processing is implied by this field.
