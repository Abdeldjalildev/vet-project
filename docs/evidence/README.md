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

## Documented P0 defect recorded here

`password-setup-ordering-evidence.txt` deliberately records a **tracked P0
defect**: `firebase-admin`'s `UserRecord` has no `passwordUpdatedAt` field
(upstream issue `firebase/firebase-admin-node#2063`), so the guard in
`netlify/functions/completeClinicPasswordSetup.js` reads a value that is always
`undefined`, resolves it to `0`, and therefore always answers **412** for a
membership with `mustChangePassword === true`. Clinic-owner onboarding cannot
complete, and the MT-1 `Number(...)` → `Date.parse(...)` change is a no-op on
every value the SDK can produce.

The suite asserts this real behaviour instead of a masked fixture, so it fails
loudly if the behaviour changes silently. **When the guard is repaired, GROUP 3
and GROUP 5 in `tests/password-setup-ordering.mjs` must be inverted** — a repair
that leaves them green would be an unverified repair.
