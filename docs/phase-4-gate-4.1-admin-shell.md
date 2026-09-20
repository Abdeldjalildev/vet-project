# Phase 4 — Gate 4.1 — Admin Shell

## Status
**IMPLEMENTED — PENDING RUNTIME CLOSURE**

## Scope
The clinic area is now a real authenticated workspace rather than a standalone appointment screen.

Implemented:
- authenticated /clinic/* routing;
- clinic membership verification before rendering the workspace;
- owner/admin role requirement at the application boundary;
- persistent desktop sidebar;
- mobile horizontal navigation;
- Dashboard, Appointments, Services, Content, Analytics, Settings;
- logout;
- clinic identity in the shell.

The shell does not claim future-phase functionality. Content, Analytics, and Settings currently point to reserved sections until their dedicated phases.

## Security boundary
The client resolves the authenticated user's membership from users/{uid}. The URL section is navigation only. Firestore rules and trusted appointment functions remain the backend authorization boundary.

## Runtime evidence required
- authenticated clinic user can enter the shell;
- inactive/invalid membership is rejected;
- navigation reaches each admin route;
- logout returns to login;
- mobile and desktop shell render correctly.

No runtime closure is claimed yet.
