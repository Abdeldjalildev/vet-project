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
- Public appointment creation is now performed by the trusted `createPublicAppointment` Cloud Function. Firestore Rules explicitly deny direct client appointment creation/update/delete. The trusted function validates the field allowlist, clinic/public-active state, active service ownership, normalized booking data, conflict state, pending status, and server timestamps.
- The old React-state-only appointment pipeline was removed.
- Appointment conflict protection and lifecycle transitions remain Phase 3 responsibilities.

## Security boundary
The browser is not trusted for authorization. Direct client appointment writes are denied by Firestore Rules; the trusted Cloud Function is the authoritative public booking write path.

## Verification still required
1. valid booking persists in Firestore;
2. invalid service/clinic data is rejected by the trusted function;
3. malformed or extra fields are rejected by the trusted function;
4. timestamps/status cannot be forged because they are server-assigned;
5. authenticated clinic users can later read the appointment through the approved clinic membership path.

## Gate decision
**2.4 IMPLEMENTED — NOT CLOSED until runtime evidence is recorded.**
