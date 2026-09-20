# Phase 2 — Gate 2.1: Clinic Configuration

## Status
**IMPLEMENTED — PENDING RUNTIME VERIFICATION**

## Requirement
The public interface must read clinic-managed:
- name
- logo
- branding
- contact
- address
- opening hours
- social links
- public configuration

## Implementation
- Public clinic identity is resolved from `/c/:clinicSlug`.
- `src/lib/clinicData.js` resolves only public clinics.
- `Navbar` reads clinic name/logo.
- Public root container applies clinic branding variables.
- `Footer` reads contact, address, opening hours, social links, and footer content.
- Public content is no longer sourced from the old hard-coded contact/social values.

## Security boundary
The slug is lookup context only. Firestore rules decide whether the clinic document is publicly readable.

## Verification still required
Local/Firebase runtime verification must prove:
1. the intended Firebase project is used;
2. a public clinic document exists with a valid slug;
3. public configuration loads from Firestore;
4. non-public clinic documents are not exposed;
5. branding/contact/hours/social changes are reflected publicly.

## Gate decision
**2.1 IMPLEMENTED — NOT CLOSED until runtime evidence is recorded.**
