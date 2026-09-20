# Phase 2 — Gate 2.4: Public Booking

## Status
**IMPLEMENTED — PENDING RUNTIME VERIFICATION**

## Requirement
A public visitor can:
- select a service;
- select a date/time;
- enter owner information;
- enter pet information;
- add notes;
- submit an appointment.

## Implementation
- Booking is rendered from the active Firestore services.
- Appointment fields include owner, pet, service, date, time, notes, clinicId, status, and server timestamps.
- Public creation is allowed only for an active public clinic.
- Firestore Rules validate the field allowlist, data types, clinic ownership, active service ownership, pending status, and server timestamps.
- The old React-state-only appointment pipeline was removed.
- Appointment conflict protection and lifecycle transitions remain Phase 3 responsibilities.

## Security boundary
The browser is not trusted for authorization. Firestore Rules enforce the public-create contract.

## Verification still required
1. valid booking persists in Firestore;
2. invalid service/clinic data is rejected;
3. malformed or extra fields are rejected;
4. timestamps/status cannot be forged;
5. authenticated clinic users can later read the appointment through the approved clinic membership path.

## Gate decision
**2.4 IMPLEMENTED — NOT CLOSED until runtime evidence is recorded.**
