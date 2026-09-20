# Phase 11 — Gate 11.1: Automated Tests

## Status
**IMPLEMENTED — PENDING CI / RUNTIME CLOSURE**

The repository now has a deterministic `npm run test:contract` entry point covering required build/test configuration, Firebase/Functions wiring, public/admin route contracts, trusted Function exports, deny-by-default Rules markers, appointment mutation denial, service-value validation, and the repaired Rules source.

GitHub Actions runs these checks on pushes to `main` and pull requests targeting `main`.

These contract tests are not a substitute for Firebase Emulator security tests or browser end-to-end tests.

## Closure evidence
- CI run passes;
- emulator security tests pass;
- critical appointment/auth flows pass end-to-end.
