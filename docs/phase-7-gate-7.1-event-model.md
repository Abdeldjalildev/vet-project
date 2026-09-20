# Phase 7 — Gate 7.1: Event Model

## Status
**IMPLEMENTED — PENDING RUNTIME CLOSURE**

## Implemented event types
- page_view
- session_start
- booking_started
- booking_completed
- service_view

## Event fields
- clinicId
- eventType
- page
- timestamp
- sessionId
- language
- deviceType
- serviceId when applicable

Events are recorded only through the trusted Cloud Function. Direct client writes to analyticsEvents remain denied by Firestore Rules.

No IP address, raw personal contact data, or browser fingerprint is stored by the analytics event contract.

## Idempotency
Client events carry an event identifier and the server uses it as the event document ID. Existing event IDs are ignored during retries.

No runtime closure is claimed.
