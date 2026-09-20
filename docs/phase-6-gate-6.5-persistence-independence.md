# Phase 6 — Gate 6.5: Persistence & Independence

## Status
**IMPLEMENTED — PENDING RUNTIME CLOSURE**

## Scope
Public and admin language preferences persist independently.

## Implementation
Two dedicated local-storage keys are used:
- vetlife_public_lang
- vetlife_admin_lang

The i18n bootstrap selects the key according to route context:
- /clinic/* → admin
- public routes → public

Language changes update only the active context key.

## Expected behavior
1. Public = French.
2. Admin = Arabic.
3. Reload public → French remains.
4. Reload admin → Arabic remains.
5. Change admin to English → public remains French.
6. Change public to Arabic → admin remains English.

## Runtime evidence required
Execute the sequence above in one browser profile and verify persistence after reloads/navigation.

No runtime closure is claimed by this document.
