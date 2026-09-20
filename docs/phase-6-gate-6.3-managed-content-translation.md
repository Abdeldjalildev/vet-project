# Phase 6 — Gate 6.3: Managed Content Translation

## Status
**IMPLEMENTED — PENDING RUNTIME CLOSURE**

## Scope
Clinic-managed customer-facing content uses the approved multilingual structure.

## Approved structure
Localized maps use { ar, en, fr }.

Applied to:
- clinic name
- clinic description
- emergency information
- address
- hero badge/title/description
- about title/description/quote
- about feature title/description
- service name/description
- FAQ question/answer
- footer about/copyright

## Separation
System UI translations remain application-owned. Clinic-managed commercial content remains Firestore data.

## Runtime evidence required
Edit representative managed fields in all three languages and verify each public language displays the corresponding stored content, including fallback behavior for missing values.

No runtime closure is claimed by this document.
