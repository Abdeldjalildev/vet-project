# Phase 4 — Gate 4.5 — Admin/Public Synchronization

## Status
**IMPLEMENTED — PENDING RUNTIME CLOSURE**

## Scope
The admin service catalog and public service catalog now use the same Firestore source.

Flow:
Clinic Admin
→ clinics/{clinicId}/services
→ public realtime subscription
→ public Services section

Implemented:
- admin writes to the clinic-owned service collection;
- public interface listens to active services;
- public service ordering uses the stored order field;
- inactive services are excluded from the public subscription.

The appointment management interface also operates on the same clinic-owned appointment records already used by public booking.

## Runtime evidence required
- create/edit/activate/deactivate a service in admin;
- observe the corresponding public change;
- verify ordering;
- verify inactive services are hidden;
- verify clinic isolation.

No runtime closure is claimed yet.
