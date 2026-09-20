# Phase 8 — Gate 8.2: Appointment Value

## Status
**IMPLEMENTED — PENDING RUNTIME CLOSURE**

When a public appointment is created, the trusted booking function snapshots the selected service's value into the appointment:
- estimatedServiceValue
- serviceCurrency

The snapshot is historical. Later service-price edits do not rewrite existing appointments.

This value represents estimated service value, not a payment transaction.
