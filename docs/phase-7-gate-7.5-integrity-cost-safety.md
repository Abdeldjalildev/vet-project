# Phase 7 — Gate 7.5: Integrity & Cost Safety

## Status
**IMPLEMENTED — PENDING RUNTIME CLOSURE**

## Integrity
- Analytics event writes are server-mediated.
- Direct analytics event/aggregate writes remain denied.
- Clinic availability is checked before recording events.
- Clinic-owned analytics paths are used.
- Duplicate event IDs are ignored.
- Visitor-day markers prevent repeated daily unique-visitor increments.
- Dashboard reads aggregate documents rather than raw events.

## Cost safety
- The public client records only the approved event types.
- The dashboard loads a bounded 30-day aggregate window.
- No raw-event dashboard scan is used.
- No IP collection or browser fingerprinting is introduced.

## Runtime evidence required
- Verify event creation.
- Verify duplicate event behavior.
- Verify one visitor generates one daily unique-visitor increment.
- Verify sessions, page views, booking funnel, and service views.
- Verify cross-clinic analytics access is denied.
- Verify dashboard reads aggregate data only.
- Review Firestore usage after realistic navigation/booking activity.

No runtime closure is claimed.
