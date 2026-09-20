# Phase 10 — Gate 10.1: Authentication Security

## Status
**IMPLEMENTED — PENDING RUNTIME / FIREBASE CONSOLE VERIFICATION**

## Implemented controls
- Firebase Authentication is the only application identity provider.
- Raw passwords are never stored in Firestore or application-managed storage.
- Auth state is sourced from Firebase `onAuthStateChanged`.
- Clinic routes require an authenticated Firebase user before the admin workspace is rendered.
- Logout uses Firebase `signOut`.
- Authenticated Cloud Functions use the callable request's verified auth context rather than a client-supplied UID.
- Login errors are normalized instead of exposing backend details.
- The clinic login markup was corrected so its accessibility/security attributes are valid JSX.

## Production configuration required
Verify in Firebase/Google Cloud:
1. Email/password is enabled intentionally.
2. Email-enumeration protection is enabled.
3. Authorized authentication domains contain only intended domains.
4. Sign-in quotas/rate controls are appropriate.
5. MFA is evaluated if the clinic deployment requires stronger operator authentication.
6. App Check is registered, monitored, and then enforced for supported production endpoints.

These environment controls are not claimed closed by repository changes.

## Closure evidence
- anonymous `/clinic/*` access redirects to login;
- authenticated clinic user reaches the workspace;
- logout clears the authenticated session;
- invalid credentials do not reveal whether an account exists;
- production Auth configuration is verified.
