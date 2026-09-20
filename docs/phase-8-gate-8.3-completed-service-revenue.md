# Phase 8 — Gate 8.3: Completed-Service Revenue

## Status
**IMPLEMENTED — PENDING RUNTIME CLOSURE**

When an appointment transitions to completed, the trusted lifecycle function aggregates its historical appointment value into the clinic's daily analytics aggregate.

Fields:
- completedServices
- estimatedCompletedServiceValue
- revenueCurrency
- revenueUpdatedAt

The aggregation occurs in the same trusted transaction as the completed status transition.

Only completed appointments contribute to the completed-service value metric.
