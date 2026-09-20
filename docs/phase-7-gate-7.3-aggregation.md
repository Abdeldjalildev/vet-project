# Phase 7 — Gate 7.3: Aggregation

## Status
**IMPLEMENTED — PENDING RUNTIME CLOSURE**

## Strategy
Analytics use write-time aggregation in trusted Cloud Functions:

`raw events → daily aggregates → dashboard`

Each clinic has daily aggregate documents under:
`clinics/{clinicId}/analyticsAggregates/{YYYY-MM-DD}`

Daily aggregates contain:
- pageViews
- sessions
- uniqueVisitors
- bookingsStarted
- bookingsCompleted
- page counters
- service counters
- updatedAt

Raw events remain available for audit/debugging, while the dashboard reads aggregate documents instead of scanning raw events.

## Cost boundary
The dashboard requests at most the latest 30 daily aggregate documents for its initial view.

No runtime closure is claimed.
