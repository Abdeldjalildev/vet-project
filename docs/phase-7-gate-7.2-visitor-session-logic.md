# Phase 7 — Gate 7.2: Visitor / Session Logic

## Status
**IMPLEMENTED — PENDING RUNTIME CLOSURE**

## Visitor
An anonymous random visitor identifier is stored locally in the browser. It is not derived from IP address, device fingerprinting, or personal identity.

A server-side visitor-day marker prevents the same anonymous visitor from incrementing the daily unique-visitor counter repeatedly.

## Session
A random session identifier is stored in sessionStorage. session_start is emitted once per browser session.

## Page views
page_view is emitted for the resolved public clinic page.

## Funnel events
The booking form emits booking_started when mounted and booking_completed only after the trusted appointment creation succeeds.

## Service views
Service cards use IntersectionObserver and emit service_view when a service becomes meaningfully visible, once per service for the current page lifecycle.

## Metric boundary
Daily unique visitors are exact at the visitor-day level. A multi-day unique-visitor total must not be represented as the sum of daily unique counts without an explicit semantic qualification.

No runtime closure is claimed.
