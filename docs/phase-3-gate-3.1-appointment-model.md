# Phase 3 — Gate 3.1: Appointment Model

## Status
**IMPLEMENTED — PENDING RUNTIME VERIFICATION**

The approved Phase 0 appointment schema is now used by the public booking flow and clinic workflow.

Fields:
- appointmentId
- clinicId
- petName
- petType
- ownerName
- ownerPhone
- ownerEmail
- serviceId
- date
- time
- notes
- status
- createdAt
- updatedAt

The service is referenced by `serviceId`; display names are not used as identity.

Public creation is handled by the trusted `createPublicAppointment` Cloud Function.

## Evidence
- `functions/index.js`
- `src/lib/appointments.js`
- `src/lib/firestore.js`
- `src/components/BookingForm.jsx`
- `src/components/ClinicDashboard.jsx`

## Gate decision
**3.1 IMPLEMENTED — NOT CLOSED until local/Firebase runtime evidence is recorded.**
