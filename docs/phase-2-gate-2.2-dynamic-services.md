# Phase 2 — Gate 2.2: Dynamic Services

## Status
**IMPLEMENTED — PENDING RUNTIME VERIFICATION**

## Requirement
Public services must come from Firestore and respect the approved active/order model.

## Implementation
- Services are read from `clinics/{clinicId}/services`.
- Only `active == true` services are queried.
- Results are ordered by the stored `order` field in the application data layer.
- Service names/descriptions support multilingual maps.
- Booking service selection uses the Firestore service IDs rather than hard-coded service values.
- The obsolete four hard-coded service cards were removed.

## Verification still required
1. active services render;
2. inactive services do not render;
3. order changes are reflected;
4. multilingual service fields resolve correctly;
5. booking submits the selected service ID.

## Gate decision
**2.2 IMPLEMENTED — NOT CLOSED until runtime evidence is recorded.**
