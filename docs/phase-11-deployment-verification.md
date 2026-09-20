# Phase 11 — Deployment Verification & Commercial Release Procedure

## Status
**IMPLEMENTED — PENDING REAL DEPLOYMENT VERIFICATION**

1. Verify the target Firebase project and web application configuration.
2. Verify Authentication provider/domain configuration.
3. Verify Firestore Rules and indexes.
4. Deploy Cloud Functions from `functions/`.
5. Deploy the production web application through the configured web host (the repository currently advertises a Vercel deployment).
6. Verify public clinic resolution and managed content.
7. Verify authenticated clinic login/logout.
8. Verify appointment creation, conflict protection, and lifecycle transitions.
9. Verify analytics ingestion/aggregation.
10. Verify completed-service value aggregation.
11. Run the full regression checklist across Phases 1–10.
12. Record deployment URLs, Firebase deployment evidence, test evidence, and the rollback target before changing any release gate to CLOSED.

No production credentials, service-account keys, or environment secrets belong in Git.

A release is not considered complete merely because deployment succeeds. If runtime verification exposes a regression, stop release closure and fix the smallest authorized scope before redeploying.

Actual deployment, browser verification, Firebase Console verification, and production regression remain pending.
