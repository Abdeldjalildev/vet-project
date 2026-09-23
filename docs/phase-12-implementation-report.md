# VetLife — Phase 12 Implementation Report

**Phase:** 12 — Product Architecture & Access Flow  
**Implementation status:** COMPLETE ON GITHUB / RUNTIME CLOSURE PENDING  
**Date:** 2026-09-23

## Scope

This implementation follows the active `agent.md` contract and is limited to:

- G12.1 Entry & Routing
- G12.2 Platform Owner & Provisioning
- G12.3 Clinic Lifecycle & Public Access
- G12.4 Architecture Regression & Contract Verification

No Phase 13 visual restoration or Phase 14 runtime closure work was introduced.

## Implemented architecture

### Entry and routing

- `/` → VetLife welcome/login.
- `/clinic/*` → authenticated clinic workspace.
- `/platform/*` → Platform Owner workspace.
- `/c/:clinicSlug` → public clinic experience.
- `/c/:clinicSlug/book` remains inside the public clinic route family.
- `/clinic/login` remains as a compatibility authentication entry.

### Platform Owner authorization

- Firebase custom claim: `platformOwner: true`.
- A privileged Admin SDK bootstrap script sets the claim.
- The client reads the claim only for UX/routing.
- Trusted `provisionClinic` and `listProvisionedClinics` callable Functions independently enforce the claim from the verified Auth token.

### Clinic provisioning

Trusted provisioning:

1. validates localized clinic name, slug and owner email;
2. checks slug uniqueness;
3. resolves or creates the Firebase Auth owner;
4. creates the clinic and owner membership in a Firestore transaction;
5. sets `lifecycle: provisioned`, `active: true`, and the requested public state;
6. removes a newly created Auth user if the Firestore transaction fails;
7. returns a password setup link only when a new owner account was created.

The setup link is not persisted in Firestore.

### Lifecycle boundary

Clinic administrators cannot modify:

- `slug`
- `public`
- `active`

through the existing clinic profile update contract. These fields remain platform-controlled.

### Public link and QR

Clinic Admin now has a **Public link & QR** section at:

`/clinic/public`

It:

- derives the canonical URL from the clinic slug and current application origin;
- provides copy-to-clipboard;
- generates the QR locally in the browser;
- provides print behavior;
- encodes only the canonical public URL.

## Files added

- `src/components/VetLifeEntry.jsx`
- `src/components/PlatformOwnerDashboard.jsx`
- `src/components/ClinicPublicAccessAdmin.jsx`
- `src/lib/platform.js`
- `src/i18n/phase12.js`
- `functions/scripts/set-platform-owner.js`
- `docs/phase-12-implementation-report.md`

## Files modified

- `src/App.jsx`
- `src/lib/auth.js`
- `src/components/ClinicAdminLayout.jsx`
- `src/main.jsx`
- `functions/index.js`
- `package.json`
- `package-lock.json`
- `tests/contract-smoke.mjs`
- `agent.md`

## Verification boundary

Repository-level inspection and contract consistency checks were performed after implementation.

**NOT VERIFIED**

- live Firebase custom-claim propagation;
- deployed callable Functions;
- real clinic provisioning transaction against the intended Firestore project;
- cross-clinic/role runtime isolation;
- production browser routing/deep links;
- QR scan from a physical/mobile camera;
- CI execution after the dependency lock change;
- production deployment.

These belong to the later combined verification/release pass and are not claimed as Phase 12 closure evidence.
