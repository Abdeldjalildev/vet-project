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
subject's **live** Auth credential material against the stored
`passwordSetupHashDigest`. **The repair does not change the production outcome**, and the
Step 2 verification established why with a three-state probe: in this project the Admin
**SDK** exposes no `passwordHash`/`passwordSalt` and no `passwordUpdatedAt` at all, while
the **raw** Identity Toolkit `accounts:lookup` call returns the credential fields. A guard
built on the SDK surface can therefore only ever conclude "unchanged" and stays fail-closed
at 412, which leaves clinic-owner onboarding unable to complete (reproduced end to end
through the deployed UI).

### P0-B2 - the same premise makes provisioning fail

`netlify/functions/provisionClinic.js:98-112` copies the same premise (its comment cites
an Auth **emulator** probe as the basis: *"The Admin SDK exposes passwordHash
(firebase-admin@13.10.0, Auth emulator PROBE PASS)"*) and needs the fresh owner's
credential material to stamp the setup verifier. In production that read comes back empty
and the function answers **HTTP 500**, rolling back cleanly (no orphan Auth account, no
orphan clinic).

### P0-B3 - no clinic document can be updated at all

`firestore.rules:141` whitelists 14 keys for a clinic-document update, but the clinic
document written by `provisionClinic.js:122-130` also carries `lifecycle`, `createdAt` and
`updatedAt`. `hasOnly` is evaluated over the whole resulting document, so **every** clinic
document update is denied for every actor - the clinic settings, branding and content
editors cannot save. It is invisible to the emulator suites because the provisioning
function is the only writer of those documents and it bypasses rules.

### Suite rule

Both emulator suites assert real deployed behaviour instead of a masked fixture, so they fail
loudly if the behaviour changes silently. **When a guard is repaired, GROUP 3 and GROUP 5
in `tests/password-setup-ordering.mjs` must be inverted** - a repair that leaves them
green is an unverified repair. For P0-B1 the same rule applies to the *deployed*
behaviour, not to the source: the repair is only real once the operation can answer 200
for a provably rotated credential in production.
