# Phase 8 — Gate 8.4: Revenue Dashboard

## Status
**IMPLEMENTED — PENDING RUNTIME CLOSURE**

The clinic analytics dashboard now displays:
- completed services;
- estimated completed-service value by currency, read from the currency-keyed aggregate map;
- existing visitor/page/session/booking metrics.

The dashboard reads daily aggregates and does not scan raw appointments for every render.

The value is explicitly labelled as estimated completed-service value rather than actual payment revenue.
