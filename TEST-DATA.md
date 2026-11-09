# Test data and accounts

How the tests get their data. Short on purpose: this is an MVP.

## Rules

1. **The main account** (`APP_EMAIL` / `APP_PASSWORD` in `env/.env.*`) is for **exploration only**. No test logs in with it and nothing changes it. The only code that touches it is the seed script (additive, see below).
2. **Every test creates its own data through the API first** (users, shops, products, cart), then uses the UI only for what it is testing.
3. **Workers never share data.** Account fixtures are worker-scoped (one seller and one buyer per worker slot, kept when a worker restarts after a failed test and deleted at the end of the run); anything a single test needs is test-scoped.
4. **Everything created is deleted** when its fixture ends (the app only soft-deletes accounts, see the GDPR section). Leftovers of a crashed run are removed with `npm run cleanup:accounts`.
5. **Every account is recorded.** Creating and deleting an account appends a line to `.auth/account-registry.jsonl` (gitignored, includes the synthetic password); `npm run accounts:report` prints the table. See [docs/development-notes/08](docs/development-notes/08-test-accounts.md).

## Where things live

| What                                                                          | Where                                                 |
| ----------------------------------------------------------------------------- | ----------------------------------------------------- |
| API calls (cookie session, retries on 5xx)                                    | `helpers/api/client.ts`                               |
| Create/delete users, account log                                              | `helpers/api/accounts.ts`                             |
| Create shop, create/delete product, ship and deliver an order                 | `helpers/api/selling.ts`                              |
| Cart, orders, stock                                                           | `helpers/api/orders.ts`                               |
| Coupons, totals, checkout                                                     | `helpers/api/checkout.ts`                             |
| Catalog search, public product                                                | `helpers/api/catalog.ts`                              |
| Profile, addresses, data export, reviews                                      | `helpers/api/privacy.ts`                              |
| Main account seed                                                             | `helpers/api/seed.ts`, `tests/app/seed-main.setup.ts` |
| Synthetic data builders                                                       | `test-data/factories/app/builders.ts`                 |
| Fixed values (test cards, seed items, required fields)                        | `test-data/static/app/`                               |
| Fixtures: `seller`, `buyer`, `newUser`, `product`, `anonymousApi`, `signInAs` | `fixtures/api/account-fixture.ts`                     |
| Fixtures: `soloSeller`, `createPricedProduct`, `formUser`                     | `fixtures/api/account-fixture.ts`                     |
| Wait for the server-rendered page to hydrate                                  | `helpers/util/hydration.ts`                           |

`signInAs(user)` copies the user's API session cookie into the browser, so UI tests start signed in without a UI login.

Example (checkout): the `product` fixture lists a new item in the worker's seller shop, `newUser` is a fresh buyer, `addToCart` fills the cart by API, and the test only fills the checkout form and asserts the confirmation, the order and the stock. See `tests/app/e2e/checkout.spec.ts`.

## Commands

```bash
npm run seed:main          # make sure the main account has its seed items (idempotent)
npm run cleanup:accounts   # delete accounts a crashed run left in .auth/accounts
npm run test:api           # API tests only
npx playwright test        # everything (seeds the main account first for UI tests; SEED_MAIN=0 skips)
```

## The QA host is flaky on purpose

Requests are sometimes slow or fail. So: API setup calls retry on network errors and 5xx (not on 4xx); timeouts are named constants in `config/app.ts`; the pages are server-rendered, so tests wait for hydration before typing or clicking; local runs retry once.

## GDPR

- **Synthetic data only.** Emails are on the reserved `example.com` domain, names are `Qa Tester <id>`, passwords are random per user, and the address and phone are fake. No real personal data is in the code, the logs or the reports.
- **Data minimisation.** Marketing opt-in is always off; terms are accepted only because registration requires it.
- **Secrets.** Real credentials live only in the gitignored `env/.env.*`. Pending test accounts are recorded in the gitignored `.auth/accounts/` until deleted. Traces and screenshots are produced only on failure, in gitignored folders.
- **Erasure.** Accounts are deleted through `DELETE /api/account` (needs the password and `confirm: "DELETE"`). **Defect of the app ([#18](https://github.com/Giomanconi/qa-marketplace-assessment/issues/18)):** this is a soft delete. The record stays with `deletedAt` set, the old session stops working, but login still answers and the email can never be registered again; shops cannot be deleted. That is why only synthetic data is ever stored, and why every new user gets a new unique email. Real erasure of the backend rows would need a change in the application.

## API facts (live capture, no OpenAPI exists)

`POST /api/auth/register` (201, sets the `mp_session` cookie), `POST /api/auth/login`, `POST /api/auth/forgot-password`, `GET|PATCH|DELETE /api/account`, `GET /api/account/export`, `GET|POST /api/account/addresses` and `PATCH|DELETE /api/account/addresses/{id}`, `POST /api/seller/shop` (one per user), `POST /api/seller/products`, `DELETE /api/seller/products/{id}`, `GET /api/products/{id}`, `GET /api/products?q=`, `POST /api/products/{id}/reviews`, `POST /api/cart/items`, `GET /api/cart`, `POST|DELETE /api/cart/coupon`, `GET /api/orders`, `GET /api/orders/{id}`, `POST /api/orders/{id}/cancel`, `POST /api/checkout`, `POST /api/seller/orders/{id}/ship` and `/deliver`. Validation errors are 400 with `fields.<name>`. A `POST /api/cart/items` for a product already in the cart replaces its quantity.
