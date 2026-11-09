# 8. Test accounts

Every account is synthetic: a unique `qa-<id>@example.com` email (a reserved domain), the name "Qa Tester <id>" and a random password. No real personal data is used. The app only soft-deletes accounts (#18), so no account can be removed for good and no email can be used again; that is why each one is recorded.

## How accounts are recorded

| What | Where | In git |
|---|---|---|
| Every create and delete, with the password | `.auth/account-registry.jsonl`, written by `helpers/api/accounts.ts` | no |
| Readable table of that log | `npm run accounts:report` | no |
| Accounts that still exist (crash safety net) | `.auth/accounts/`, cleared by `npm run cleanup:accounts` | no |
| Pipeline runs | the `account-log-<suite>` artifact of each run, without passwords, kept 14 days | no |
| Leftover accounts, emails only | this document | yes |

A full run creates about 100 accounts (one user for most tests, plus a seller and a buyer per worker) and deletes them all at the end. The main account in `env/.env.dev` belongs to the tester: no test uses it, only the additive `seed:main` script.

## Leftover accounts

All from one-off exploration scripts before the log existed, so their passwords were not recorded and they cannot be deleted from here.

| Email | Date | What it is |
|---|---|---|
| `qa-m0-1793859590@example.com` | 2026-11-05 | First API probe; deletion not confirmed |
| `qa-buyer-1793860182@example.com` | 2026-11-05 | Buyer of the first setup script (order #10002) |
| `qa-mw42tgrkcdb242b@example.com` | 2026-11-05 | Buyer of a repro order (#10020); the delete used the wrong session |
| Seller, buyer and product of a second setup run | 2026-11-05 | Email not recorded |
| `qa-erasure-<id>@example.com` | 2026-11-05 | Erasure re-check for #18; soft-deleted, id not recorded |
| `qa-mw4lgaa51b73d9@example.com` | 2026-11-06 | Seller of the evidence for #25 and #26; still owns a sale product and a draft that shows in search |
| Buyer of the same run | 2026-11-06 | Email not recorded |

Every account since then, manual or automated, is in the log and was deleted.

## Open

- Deletion of `qa-m0-1793859590@example.com` is unconfirmed.
- Whether the app owner can hard-delete the leftovers depends on the answer to #18.
