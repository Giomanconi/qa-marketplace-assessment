# Test accounts

All accounts are synthetic: `qa-<id>@example.com` (reserved domain), name "Qa Tester <id>", random password. No real personal data (GDPR).

The app only soft-deletes accounts (issue #18), so none of these can be removed for good and none of the emails can be used again.

## How accounts are recorded from now on

| What | Where | In git? |
|---|---|---|
| Accounts that still exist (crash safety net) | `.auth/accounts/<email>.json`, removed when the account is deleted | no |
| Permanent log: every create and delete, with the password | `.auth/account-registry.jsonl`, written by the helpers in `helpers/api/accounts.ts`, which every test registration goes through | no |
| Readable table of that log | `npm run accounts:report` writes `.auth/account-registry.md` | no |
| This document: known orphans, emails only | `docs/08-test-accounts.md` | yes |

Passwords live only in the gitignored `.auth/` folder. They are never written to this document or to the issues.

Standard for every account, automated or manual: a unique `qa-<id>@example.com` email and a random password (`Pw-<16 hex>-Aa1!`, as `buildUser()` makes), logged when created and when deleted, and deleted at the end. Scripts outside the test suite append to the same log.

## Known orphan accounts (before the log existed)

These came from one-off exploration scripts, before the log existed. Their passwords were not recorded, so they cannot be deleted from here.

| Email | When | What it is | Status |
|---|---|---|---|
| `qa-m0-1793859590@example.com` | 2026-11-05 06:19 UTC | First API probe account | Deletion not confirmed |
| `qa-buyer-1793860182@example.com` | 2026-11-05 | Buyer of the first setup script; placed order #10002 | Orphan, password lost |
| `qa-mw42tgrkcdb242b@example.com` | 2026-11-05 | Repro buyer; placed order #10020 (Express, WELCOME10) | Orphan: the delete returned 403 because the session was the seller's |
| Seller and product of the same two setup runs | 2026-11-05 | The setup script ran twice; the second run's seller, buyer and product were never cleaned | Orphan, email not recorded |
| `qa-mw4lgaa51b73d9@example.com` | 2026-11-06 | Seller of the evidence for #25 and #26 (shop "QA Shop a51b73d9"); a script run inside a Playwright browser session could not write the log and then timed out, so its password was lost. It still owns an active sale product and a draft that shows in the public search | Orphan, password lost (logged as such) |
| Buyer created by the same run | 2026-11-06 | Created just before the timeout; its email was not printed | Orphan, email and password not recorded |
| `qa-erasure-<id>@example.com` (id not recorded) | 2026-11-05 | Throwaway user of the erasure re-check for #18 | Soft-deleted by the script; email not recorded |

## Accounts since the log exists

Every account of the GDPR exploration and of the automated runs is in the local log with its create and delete times; `npm run accounts:report` shows them. All were deleted (soft-deleted, so the emails stay used). The first exploration accounts (`qa-g1-<id>@example.com`) predate the standard above: their passwords come from the id instead of being random. The account-erasure tests create and delete their own users on every run. The throwaway accounts of the exploratory sessions and the small-screen look of 2026-11-06 ([09](09-exploratory-sessions.md)) are in the same log and were deleted, except the orphans listed above.

Pipeline runs do not reach the local log, because each runner starts empty. Each run lists its accounts in its `account-log` artifact, without passwords, kept for 14 days. A final step deletes anything a crashed run left behind.

A full run creates about 100 accounts: one user for most tests, plus one seller and one buyer per worker slot. Worker accounts are kept when a worker restarts after a failed test, and the `cleanup-accounts` project deletes them at the end of the run. A run without that cleanup, such as one that is killed, leaves them for `npm run cleanup:accounts`.

## Not accounts

- `.auth/accounts` held four leftover files (`qa-mw462ydma08057`, `qa-mw462yend7860c`, `qa-mw462yfnb3d0e3`, `qa-mw46491962e38f`) from a run against a wrong URL. Login returned 401, so the accounts were never created. The files were removed.
- `qa-never-created-check@example.com` and `qa-probe-none@example.com` were fake files used to test the cleanup script. They never existed in the app.

## Main account

The `APP_EMAIL` account in `env/.env.dev` belongs to the user. Tests never use it; only the additive `seed:main` script does.

## Open

- Deletion of `qa-m0-1793859590@example.com` is unconfirmed.
- Whether the app owner can hard-delete the orphans depends on the answer to issue #18.
