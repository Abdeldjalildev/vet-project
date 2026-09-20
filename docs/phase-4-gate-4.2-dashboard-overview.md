# Phase 4 — Gate 4.2 — Dashboard Overview

## Status
**IMPLEMENTED — PENDING RUNTIME CLOSURE**

## Scope
The dashboard now provides an operational clinic overview from persisted appointment data.

Implemented:
- appointment counts for the currently loaded appointment window;
- pending/confirmed/completed breakdown;
- upcoming pending/confirmed appointments;
- direct navigation to appointment management;
- explicit loading and error states.

The overview uses the existing authenticated clinic appointment read path and does not introduce a second appointment data model. The loaded 100-record window is ordered by appointment date and time descending; upcoming cards are filtered against the current local date/time so past pending/confirmed records are not presented as upcoming.

## Important boundary
The current appointment list is intentionally capped at 100 records. Dashboard metrics therefore describe the loaded recent appointment window, not an authoritative historical analytics total. Full analytics belongs to Phase 7.

## Runtime evidence required
- dashboard loads for an authorized clinic;
- metrics correspond to persisted appointments;
- upcoming appointments are correct;
- empty/error states behave correctly;
- cross-clinic data is not exposed.

No runtime closure is claimed yet.
