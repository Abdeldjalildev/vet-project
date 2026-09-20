# Phase 4 — Gate 4.4 — Services Management

## Status
**IMPLEMENTED — PENDING RUNTIME CLOSURE**

## Scope
Clinic owner/admin users can manage the clinic's service catalog.

Implemented:
- create service;
- read/list services ordered by order;
- edit service;
- activate/deactivate service;
- permanent delete with confirmation;
- multilingual service name/description for Arabic, English, and French;
- icon;
- display order;
- active flag.

Public synchronization uses the existing clinic service collection and realtime public subscription. Active services remain the public-facing set.

## Authorization
Service writes use the existing Firestore rule requiring active clinic membership plus owner/admin role. Public users only read active services.

## Runtime evidence required
- authorized owner/admin can create/edit/deactivate/delete;
- unauthorized users cannot mutate services;
- service order is reflected publicly;
- inactive services disappear from the public interface;
- multilingual fields render correctly.

No runtime closure is claimed yet.
