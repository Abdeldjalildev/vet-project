# Phase 10 — Gate 10.4: Server Validation

## Status
**IMPLEMENTED — PENDING CLOUD FUNCTION RUNTIME VERIFICATION**

## Hardened validation
Trusted functions now:
- reject unsupported fields on appointment creation, analytics ingestion, and appointment transitions;
- validate document identifiers so client input cannot introduce path separators;
- validate optional appointment email syntax;
- validate appointment dates and times server-side;
- validate clinic/service existence and active/public state where applicable;
- validate lifecycle transitions server-side;
- validate active membership and exact clinic ownership for authenticated mutations;
- assign authoritative appointment status and timestamps server-side;
- snapshot service value/currency server-side instead of trusting client pricing;
- aggregate completed-service value only after a valid transition reaches `completed`;
- keep analytics aggregation behind a trusted callable instead of direct client writes.

## Abuse-resistance boundary
Validation is not rate limiting. Public callable endpoints can still receive abusive traffic until App Check, monitoring, quotas, and any required application-level abuse controls are configured and verified.

## Closure evidence
- malformed payloads rejected;
- unsupported fields rejected;
- invalid IDs rejected;
- invalid email/date/time rejected;
- inactive clinic/service rejected;
- duplicate appointment slot rejected atomically;
- unauthorized lifecycle transition rejected;
- cross-clinic transition rejected;
- client-supplied service pricing ignored;
- repeated completion cannot double-count a completed appointment.
