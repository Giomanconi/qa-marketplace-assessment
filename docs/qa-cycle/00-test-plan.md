# 0. Test Plan

- **Project:** MarketNest marketplace, pre-release QA cycle
- **Environment:** the sandbox provided for this assessment (its address is given to the reviewer, not published here)
- **Prepared by:** Giomanconi
- **Approach:** see the [test strategy](01-test-strategy.md). Results are in the [test report](07-test-report.md).

## Scope

| Domain | Test cases | Rules |
|---|---|---|
| Checkout and payments | TC-01, TC-03, TC-11, TC-12, TC-13 | SHIP, TAX, PAY |
| Orders | TC-02 | ORD, RET |
| Cart, coupons, shipping | TC-04, TC-05, TC-09 | CPN, SHIP, SHOP-6 |
| Catalogue and reviews | TC-07, session 1 | SHOP, REV |
| Selling | TC-06, session 2 | SELL |
| Account | TC-08 | ACC |
| GDPR and privacy | GDPR-01 to GDPR-09 | PRIV, COOK, LEG |
| Usability | TC-10 and a small-screen look | none |

**Out of scope:** load and performance, penetration testing, infrastructure, payment processor internals, native apps, browsers other than Chromium. Accessibility and security are light checks only.

## Environment and data

- Chromium through Playwright, at desktop size; TC-10 also at 375, 768 and 1440 px.
- Locally, or on GitHub Actions when started by hand (see "Pipeline" in the [README](../../README.md)).
- Synthetic data only: throwaway accounts with `example.com` emails, published test card numbers. Every account is [logged](../development-notes/08-test-accounts.md).

## Milestones

| Date | Milestone | Status |
|---|---|---|
| 2026-11-05 | Strategy, requirements map, test cases, test automation | Done |
| 2026-11-05 | Core test cases automated, first issues filed | Done |
| 2026-11-06 | GDPR test cases automated, privacy issues filed | Done |
| 2026-11-06 | Exploratory sessions, clean-clone run, report | Done |
| 2026-11-07 | On-demand pipeline, final review, complete run of all suites | Done |
| 2026-11-07 | Known defects as expected failures, results summary, host failure label, one-random-case switch | Done |
| Not set | Release decision by the product owner | Open |

## Entry and exit criteria

**Entry:** site reachable, Help Center available, throwaway accounts can be created.

**Exit (release recommendation):**
- All S1 and P1 issues resolved or explicitly accepted by the product owner.
- No open GDPR defect that exposes personal data or prevents exercising a data-subject right.
- Critical journeys pass: browse, cart, coupon, checkout, order, cancel; open shop, publish, sell, ship, deliver.
- Remaining issues documented and prioritised.

## Risks

| Risk | Mitigation |
|---|---|
| The host is slow and fails requests on purpose | A failure counts only if it repeats |
| Shared environment, state changes between sessions | Fresh accounts for each test |
| Help Center ambiguous or silent | Record an assumption, raise it as a question |
| Accounts can only be soft-deleted | Log every account; disclose leftovers |
| Too many low-value issues | One root cause is one issue; the rest stay as observations |

## Deliverables

Test plan, strategy and report; [requirements map](../development-notes/02-requirements-map.md); [core](03-core-test-cases.md) and [GDPR](04-gdpr-test-cases.md) test cases; [session notes](../development-notes/09-exploratory-sessions.md); GitHub Issues on the [Project board](https://github.com/users/Giomanconi/projects/8); the Playwright suite and its on-demand pipeline.
