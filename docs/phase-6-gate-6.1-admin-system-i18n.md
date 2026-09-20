# Phase 6 — Gate 6.1: Admin System i18n

## Status
**IMPLEMENTED — PENDING RUNTIME CLOSURE**

## Scope
The authenticated clinic/admin interface must expose its system UI in Arabic, English, and French.

## Implementation
- Admin UI continues to use the shared React i18next translation resources.
- Clinic authentication UI is translated.
- The admin shell exposes an Arabic/English/French language selector.
- Authentication errors are represented as translation keys.
- Opening-hour day labels in admin settings are translated.

## Language context
Admin language is persisted under the dedicated vetlife_admin_lang key and is not stored in the public-language key.

## Runtime evidence required
Switch the admin UI through Arabic, English, and French; verify navigation, authentication, settings, content, services, appointments, and status messages; reload the clinic interface and confirm persistence.

No runtime closure is claimed by this document.
