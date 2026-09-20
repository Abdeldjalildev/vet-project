# Phase 6 — Gate 6.2: Public System i18n

## Status
**IMPLEMENTED — PENDING RUNTIME CLOSURE**

## Scope
The public clinic interface retains Arabic, English, and French system UI translations.

## Implementation
- Public system translations remain application-owned through i18next.
- Navigation, hero actions, service labels, FAQ labels, booking labels/messages, footer labels, and theme controls use translation keys.
- Public language selection remains available from the Navbar.
- Opening-hour day labels are translated rather than fixed English weekday names.
- Public language is persisted under vetlife_public_lang.

## Runtime evidence required
Switch a public clinic through Arabic, English, and French; verify all system UI changes language; reload the public route and confirm persistence; confirm the public preference does not overwrite the admin preference.

No runtime closure is claimed by this document.
