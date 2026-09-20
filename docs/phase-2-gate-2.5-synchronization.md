# Phase 2 — Gate 2.5: Synchronization

## Status
**IMPLEMENTED — PENDING RUNTIME VERIFICATION**

## Requirement
Clinic-side data changes must propagate correctly to the public interface.

## Implementation
- The public clinic page resolves its clinic by slug.
- The public data layer subscribes to the clinic document, active services, and active FAQs with Firestore realtime listeners.
- The UI updates from Firestore snapshots rather than maintaining a demo copy in React state.
- Public booking writes to the same clinic-owned appointment collection.

## Verification still required
1. modify clinic configuration in Firestore and observe public update;
2. activate/deactivate/reorder a service and observe public update;
3. modify/add/deactivate an FAQ and observe public update;
4. submit a booking and confirm it appears in the clinic-owned appointment collection;
5. verify cross-clinic data is not surfaced.

## Gate decision
**2.5 IMPLEMENTED — NOT CLOSED until runtime evidence is recorded.**
