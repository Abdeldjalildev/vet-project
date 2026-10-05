# Evidence directory

This directory holds **machine-captured evidence** for the Master Test Plan
(`docs/master-tests.md`). It is the landing zone for the file-based evidence that
`tests/mt1-rules-matrix.mjs` and `tests/password-setup-ordering.mjs` produce, and
for the one-off evidence captured by the Step 2 production probes.

It is **not** a report. The per-test record required by `docs/master-tests.md`
§ *Test Evidence Standard* (ID, environment, actor, action, expected backend
behaviour, actual result, PASS / FAIL / NOT VERIFIED) still has to be written
from this raw material. No credentials, tokens or passwords may ever be written
here.

## What is tracked, and what is generated

| File | Origin | Tracked? |
|---|---|---|
| `README.md` | this policy document | **yes** — and it is the only reason this directory exists in a fresh clone |
| `mt1-matrix-evidence.txt` | `npm run test:mt1:rules` (`tests/mt1-rules-matrix.mjs`) | no — rewritten on every run |
| `password-setup-ordering-evidence.txt` | `npm run test:password-setup-ordering` | no — rewritten on every run |
| `mt1-browser-evidence.txt`, `mt1-browser-evidence-local.txt` | `tests/mt1-browser-e2e.mjs`, `tests/mt1-local-dom.mjs` (ignored probes) | not ignored, but deliberately uncommitted single-run captures |
| `mt1-deployed-evidence.txt`, `mt1-matrix-out.txt` | `tests/mt1-api-read.mjs`, `tests/mt1-deployed-read.mjs`, `tests/mt1-token-probe.mjs` (ignored probes) | not ignored, but deliberately uncommitted single-run captures |
| `mt1-production-evidence.md` | the per-test record for Master Test Plan §5 (MT-1), written from the Step 2 production captures | **yes** — the deliverable of Step 2 |
| `mt11-ui-evidence-2026-10-04.json` | raw DOM capture of the MT-1.1 real-UI run, copied from `%TEMP%\mt1run\` | **yes** — the raw basis of the MT-1.1U rows |
| `mt1-deployed-rules-parity-2026-10-04.txt` | deployed-vs-local `firestore.rules` sha256 parity plus both composite indexes, copied from the same run | **yes** — the raw basis of the rules claim in §0 of the record |

The two suite outputs are ignored in `.gitignore` because they are regenerated
by `npm run test:local` (and by CI) — a committed copy could only ever be stale
and would dirty the tree after every local run. In CI they are collected instead
as the uploadable `emulator-evidence` artifact (`docs/evidence/*.txt`).

The evidence files carry the absolute path of the machine that produced them and
a run timestamp, so they are evidence of *that* run only. Do not treat a file in
this directory as proof of a later state of the code.

## Suites that write here

| Suite | Command | Emulators | Evidence file |
|---|---|---|---|
| MT-1 Firestore Rules matrix (113 cases, 7 personas + anonymous) | `npm run test:mt1:rules` | Firestore `8085`, Auth `9095`, project `demo-vetlife-mt1`, using the repository `firestore.rules` | `mt1-matrix-evidence.txt` |
| Password-setup ordering contract | `npm run test:password-setup-ordering` | Firestore `8086`, Auth `9096`, project `demo-vetlife-pso` | `password-setup-ordering-evidence.txt` |

Both suites are emulator-only (`demo-` project ids) and need no Firebase, Netlify
or Vercel credentials. `firebase.json` intentionally declares no `emulators`
block, so each suite writes an equivalent emulator-only config into the OS temp
directory and re-launches itself through `firebase emulators:exec`. The MT-1
matrix suite must use the repository `firestore.rules`, so its generated config
points at that file.

The sibling Phase 16B groups (`tests/phase16b-group*.mjs`, project
`demo-vetlife-poc`, Firestore `8080`, Auth `9099`) and the Netlify Admin runtime
suite (`tests/netlify-admin-runtime.mjs`, project `demo-vetlife-poc`) also run
under the emulators; they assert through process exit codes and console output
and record no evidence file.

## MT-1 production probes (not runnable in CI)

`tests/mt1-api-read.mjs`, `tests/mt1-browser-e2e.mjs`, `tests/mt1-cdp-evidence.mjs`,
`tests/mt1-deployed-read.mjs`, `tests/mt1-local-dom.mjs` and
`tests/mt1-token-probe.mjs` are **Step 2 production probes**. They need live
Firebase credentials, the deployed origin, or a real browser/CDP session, so they
are listed in `.gitignore` and are never wired into CI. The evidence they already
captured is kept in this directory for review; re-running them requires those
credentials to be supplied locally.

## Documented P0 defects recorded here

The per-test record for this material is `mt1-production-evidence.md`. Its §3 is the defect
register (P0-B1, P0-B2, P0-B3) and §4 holds the causal-isolation rows for the first two.

### P0-B1 - the guard repair cannot observe a credential change in production

`password-setup-ordering-evidence.txt` deliberately records a **tracked P0 defect**.
The original finding was that `firebase-admin`'s `UserRecord` has no `passwordUpdatedAt`
field (upstream issue `firebase/firebase-admin-node#2063`), so the guard in
`netlify/functions/completeClinicPasswordSetup.js` read a value that is always
`undefined`, resolved it to `0`, and therefore always answered **412** for a membership
with `mustChangePassword === true`.

Commit `8dd4936` repaired that in source: the guard now compares a SHA-256 digest of the
subject's Auth `passwordHash` against the stored `passwordSetupHashDigest`. **That repair did
not change the production outcome**, and the Step 2 verification established why with a
three-state probe: in this project the Admin **SDK** exposes no `passwordHash`/`passwordSalt`
and no `passwordUpdatedAt` at all.

> **Correction to the reading of that probe (recorded 2026-10-05).** An earlier version of this
> note stated that the **raw** Identity Toolkit `accounts:lookup` call "returns the credential
> fields", implying usable credential material was reachable. It is not. The 12-character
> `passwordHash` it returns is the **redaction sentinel** - base64 of the literal `"REDACTED"`
> (`UkVEQUNURUQ=`), which is why it is a constant 12 characters for every user. firebase-admin
> maps that sentinel back to `undefined`. **No surface in this project exposes usable credential
> material**, so the digest architecture could never succeed in production regardless of SDK
> mapping. The defect conclusion is unchanged and, if anything, better supported.

**Status: deployed 2026-10-05 and re-verified in production.** The digest architecture is removed
entirely.
`provisionClinic` no longer reads `passwordHash` and no longer writes `passwordSetupHashDigest`;
`completeClinicPasswordSetup` now proves the change with the server-side Auth
`tokensValidAfterTime` marker compared against the provisioning baseline
`passwordSetupIssuedAt`, failing closed with 412 when either side is missing or unparseable.
Emulator parity was established before relying on that marker: a plain sign-in does **not**
advance it, while an admin or client password update does (one-second granularity, so a
rotation must cross a second boundary).

### P0-B2 - the same premise makes provisioning fail

`netlify/functions/provisionClinic.js:98-112` copies the same premise (its comment cites
an Auth **emulator** probe as the basis: *"The Admin SDK exposes passwordHash
(firebase-admin@13.10.0, Auth emulator PROBE PASS)"*) and needs the fresh owner's
credential material to stamp the setup verifier. In production that read comes back empty
and the function answers **HTTP 500**, rolling back cleanly (no orphan Auth account, no
orphan clinic).

**Status: deployed 2026-10-05.** Provisioning no longer reads `passwordHash`
and no longer writes a setup verifier; it stamps only `passwordSetupIssuedAt`, the baseline
the repaired completion guard compares against. The positive provisioning path could not be
re-exercised in production (no `platformOwner` minting capability in this environment) - see
"Production re-verification" below.

### P0-B3 - no clinic document can be updated at all

`firestore.rules:141` whitelists 14 keys for a clinic-document update, but the clinic
document written by `provisionClinic.js:122-130` also carries `lifecycle`, `createdAt` and
`updatedAt`. `hasOnly` is evaluated over the whole resulting document, so **every** clinic
document update is denied for every actor - the clinic settings, branding and content
editors cannot save. It is invisible to the emulator suites because the provisioning
function is the only writer of those documents and it bypasses rules.

**Status: deployed 2026-10-05 and re-verified in production (12/12).** The resulting-key whitelist now includes
`lifecycle`, `createdAt` and `updatedAt`, and all three stay immutable to clients through the
existing affected-key gate (verified for value change *and* field deletion). The original
rules were re-run against producer-shaped fixtures and reproduced `permission-denied` for
legitimate edits, so the matrix result of **127/127 PASS** is attributable to the repair.

**Regression guard added.** The defect survived CI because no test compared the fields the
producer writes against the fields the rules whitelist. `tests/contract-smoke.mjs` now parses
both sides and fails if a field written to `clinics/{clinicId}` is absent from the rules
whitelist, naming the offending field. The guard was negative-tested: removing `lifecycle` from
the whitelist makes `npm run test:contract` fail with
`...absent from the firestore.rules resulting-key whitelist: lifecycle`.

### Production re-verification after the repair (2026-10-05)

Firestore rules and the Netlify functions were deployed, then re-verified against production.

| Gate | Result | Evidence |
|---|---|---|
| B1 completion guard | **PASS** | `POST completeClinicPasswordSetup` with a valid owner token now answers `HTTP 200 {"completed":true}` and writes `passwordSetupCompletedAt` / flips `mustChangePassword=false`. This is the exact call that answered `412` forever before. Unauthenticated call still `401`; repeat call idempotent `200`. |
| B3 clinic writes | **PASS (12/12)** | An owner can now update an editable clinic field and the edit persists - the write that previously returned `permission-denied` for **every** actor. Immutability intact: `lifecycle`, `createdAt`, `updatedAt` (value change **and** field deletion), `public`, unknown-field injection, and a malformed localized value all still denied. |
| B2 provisioning | **PARTIAL** | Boundary surface verified (`204` preflight, `401` without/with malformed token, `405` non-POST) - the function no longer errors before authorization. **The positive provisioning path could NOT be re-exercised**: it requires a `platformOwner` identity, and minting one needs a service-account private key that is not available in this environment (the Firebase CLI OAuth token cannot sign custom tokens). The removed `passwordHash` read is enforced at source level by `tests/contract-smoke.mjs`. |
| F-2 credential remediation | **PASS** | Clinic A's owner credential was rotated to a value generated in memory and never written to disk or printed; `%TEMP%\mt1run\mt11-newpass.txt` was overwritten and deleted; verified no residue. Post-rotation sign-in with a fresh in-memory password returns `200` and with a wrong password `400`. |

**Two corrections to earlier work in this file, both of which were my own test-payload errors
rather than product defects:**

1. The first B3 production probe sent `description: {en, fr}` and was denied. `validLocalized()`
   requires **all three** of `ar`/`en`/`fr` as strings, so the payload was invalid; the denial
   said nothing about the rules. Re-run with a valid payload it is accepted. The malformed payload
   is retained as a check that the guard still rejects bad input.
2. The same probe asserted CORS on `body.length > 0`, but the preflight correctly returns `204`
   with an intentionally empty body. The assertion now checks the status.

**MT-1 is NOT closed by this milestone.** The targeted B1/B2/B3 gates above pass, but the
superseding full MT-1 run (the 293-assertion production suite recorded in
`mt1-production-evidence.md`) has not been re-executed, and B2's positive path is unverified.
MT-1 stays open until that superseding run is completed.

### Suite rule

Both emulator suites assert real deployed behaviour instead of a masked fixture, so they fail
loudly if the behaviour changes silently. **When a guard is repaired, GROUP 3 and GROUP 5
in `tests/password-setup-ordering.mjs` must be inverted** - a repair that leaves them
green is an unverified repair. For P0-B1 the same rule applies to the *deployed*
behaviour, not to the source: the repair is only real once the operation can answer 200
for a provably rotated credential in production.
