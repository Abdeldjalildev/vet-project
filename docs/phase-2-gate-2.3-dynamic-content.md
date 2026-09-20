# Phase 2 — Gate 2.3: Dynamic Content

## Status
**IMPLEMENTED — PENDING RUNTIME VERIFICATION**

## Requirement
Appropriate hard-coded customer-facing content must become clinic-managed data:
- Hero
- About
- FAQ
- Footer
- social links

## Implementation
- Hero reads clinic-managed badge/title/description.
- About reads clinic-managed title/description/quote/features.
- FAQ records are loaded from Firestore and rendered dynamically.
- Footer reads clinic-managed content/contact/socials/hours.
- System UI translations remain application-owned; clinic-managed content is separated through Firestore data.

## Verification still required
1. each managed section renders from Firestore;
2. edits to Firestore content appear without a source-code change;
3. inactive FAQs are excluded;
4. Arabic/English/French managed values resolve correctly;
5. legacy demo content is not used as the source for managed sections.

## Gate decision
**2.3 IMPLEMENTED — NOT CLOSED until runtime evidence is recorded.**
