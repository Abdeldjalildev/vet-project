# VetLife — Phase 1 / Gate 1.5 Foundation Verification

**Status:** IMPLEMENTATION READY — EXTERNAL FIREBASE RUNTIME VERIFICATION REQUIRED
**Phase:** Phase 1 — Firebase Foundation
**Scope:** Verify Firebase App + Authentication + Firestore + Security Rules as one foundation.

## Repository evidence
- Firebase Web SDK dependency is present and the lockfile was synchronized in G1.1.
- Firebase App initialization is centralized in `src/lib/firebase.js`.
- Authentication is centralized in `src/lib/auth.js` and `AuthProvider`.
- Firestore is centralized in `src/lib/firestore.js`.
- Firestore rules are deployed through `firebase.json`.
- Rules use active Firebase Auth membership and clinic ownership.
- Default Firestore access is denied.

## Required runtime verification
1. Firebase project is the intended VetLife project.
2. Authentication Email/Password provider is enabled.
3. A test clinic user exists in Firebase Authentication.
4. The test user's `users/{uid}` membership has the expected active `clinicId` and role.
5. Clinic login establishes an Auth session.
6. Logout clears the Auth session and protected dashboard access is denied afterward.
7. The authenticated member can access only its own clinic's protected data.
8. A different clinic's protected data is denied.
9. Self-created or self-modified membership is denied.
10. Public reads expose only explicitly public/active documents; client writes are constrained to the approved public/managed schemas.
11. Direct client appointment mutations are denied; valid public appointment creation is accepted only through the Phase 3 trusted function, which validates clinic/service ownership and scheduling constraints.
12. Direct client writes to analytics aggregates are denied.
13. Unspecified collections/documents remain denied.
14. Public clinic/service/FAQ queries satisfy the same constraints enforced by their Security Rules.
15. Client clinic updates cannot add or mutate fields outside the approved managed-content contract; service and FAQ writes are field-bounded; client clinic deletion is denied.

## Evidence boundary
GitHub source inspection can establish implementation presence and configuration, but it cannot prove the real Firebase project's Auth provider state, membership documents, or runtime rule decisions.

Therefore G1.5 remains pending closure until the targeted runtime checks above are executed against the intended VetLife Firebase project (or an equivalent rules emulator setup).

**Decision: G1.5 IMPLEMENTATION COMPLETE — PENDING CLOSURE.**