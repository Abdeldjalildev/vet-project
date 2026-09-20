# Phase 3 — Gate 3.2: Validation

## Status
**IMPLEMENTED — PENDING RUNTIME VERIFICATION**

Validation is deliberately split across two trust boundaries:

### Client
`src/lib/appointmentValidation.js` provides immediate UX validation for:
- required fields
- pet type
- lengths
- date
- time
- email/notes length

### Trusted server
`functions/index.js` independently validates:
- payload shape and field allowlist
- clinic identifier
- pet/owner fields
- pet type
- date and time formats
- past dates
- service existence and active state
- public/active clinic state

The function assigns:
- `pending` status
- server timestamps

The browser cannot directly create appointment documents.

## Gate decision
**3.2 IMPLEMENTED — NOT CLOSED until targeted invalid-input runtime checks are recorded.**
