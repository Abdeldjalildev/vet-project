# Phase 6 — Gate 6.4: RTL/LTR Isolation

## Status
**IMPLEMENTED — PENDING RUNTIME CLOSURE**

## Scope
Arabic uses RTL and English/French use LTR without leaking direction state between public and admin contexts.

## Implementation
- The active i18n language listener sets the document language.
- Arabic sets document direction to rtl.
- English and French set document direction to ltr.
- Direction is derived from the active interface language on application boot.
- Public and admin interfaces use separate persisted language keys.

## Isolation model
public language → vetlife_public_lang
admin language → vetlife_admin_lang

## Runtime evidence required
Verify Arabic public/admin pages are RTL, English/French public/admin pages are LTR, and navigation between contexts follows the active interface language.

No runtime closure is claimed by this document.
