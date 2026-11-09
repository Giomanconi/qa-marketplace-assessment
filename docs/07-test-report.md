# 7. Test Report

- **Date:** 2026-11-07, 08:21 UTC (full automated run, no retries)
- **Project:** MarketNest, pre-release QA cycle
- **Environment:** the sandbox provided for this assessment
- **Prepared by:** Giomanconi
- **Status:** final; the recommendation is the tester's proposal, the product owner decides

## Verdict: do not release as is

Customers can be charged the wrong amount or twice, anyone can read sellers' personal data, data-subject rights are not honoured, and the Terms page is missing. Fix the six P1 bugs below before release.

## Execution

| Domain | Planned | Run | Passed | Failed | Blocked | Coverage | Pass rate |
|---|---:|---:|---:|---:|---:|---:|---:|
| Checkout and payments | 22 | 22 | 4 | 18 | 0 | 100% | 18.2% |
| Orders | 4 | 4 | 1 | 3 | 0 | 100% | 25.0% |
| Cart, coupons, shipping | 18 | 18 | 13 | 5 | 0 | 100% | 72.2% |
| Catalogue and reviews | 7 | 7 | 6 | 1 | 0 | 100% | 85.7% |
| Selling | 12 | 12 | 10 | 2 | 0 | 100% | 83.3% |
| Account | 19 | 19 | 17 | 2 | 0 | 100% | 89.5% |
| GDPR and privacy | 41 | 41 | 27 | 14 | 0 | 100% | 65.9% |
| Usability | 18 | 18 | 16 | 2 | 0 | 100% | 88.9% |
| **Total** | **141** | **141** | **94** | **47** | **0** | **100%** | **66.7%** |

Counts are automated tests, without the two setup steps. A failed test is a defect found, not a broken suite: 45 map to an issue or an observation, and 2 are host failures in this run (TC-02 cancel, which passed on rerun, and TC-03 refresh, see Concern). Failed includes the `/terms` test, which Playwright reports as an expected failure.

Against the [requirements map](02-requirements-map.md), 60 of 65 rules have a result.

## Exit criteria

| Criterion | Status |
|---|---|
| All S1 and P1 issues resolved or accepted | **Not met:** 5 S1 and 6 P1 open |
| No GDPR defect exposing personal data or blocking a data right | **Not met:** #18, #19, #20 |
| Critical journeys pass | **Partly met:** they complete, but totals, shipping, cancel rules and seller figures are wrong |
| Remaining issues documented and prioritised | **Met** |

## Concern

- Money is wrong in checkout: Express price, tax base and the seller fee all fail, so checkout has the lowest pass rate.
- Personal data is exposed to signed-out visitors, and erasure does not erase.
- Not tested: 5 rules (RET-3, RET-4, CPN-6, CPN-7, SELL-4 on its own). Accessibility and security had light checks only.
- After a successful payment, the server sometimes never answers the order confirmation page: the order exists, but checkout stays on "Processing payment…", so a customer could pay again. It cannot yet be told apart from the host's deliberate failures, so it is an [observation](09-exploratory-sessions.md#observations-not-filed), not an issue.
- Results can vary slightly: the host fails requests on purpose, and the double-click bug is a race. Expect 44 to 46 failures per run, plus the expected `/terms` failure.
- These figures come from the run before known defects were marked with `test.fail()`. From then on, a run reports the known defects as expected failures, and only new failures, or known defects that pass, turn it red (see "Pipeline" in the README).

## What works

Coupon rules, declined cards, the order status flow, review eligibility, access control between users, and no trackers before consent. Full list in the [session log](09-exploratory-sessions.md).

## Next target

- Fix the P1 bugs, then the P2 bugs before release or in the first patch.
- Rerun the regression after each fix: a fixed defect's marked test passes and turns the run red, which is the signal to retest, remove its `test.fail()` and close the issue.
- Close the 5 rules not tested, once a return flow and an expired code exist.

## Tracker

[Bug tracker board](https://github.com/users/Giomanconi/projects/8) and [all open issues](https://github.com/Giomanconi/qa-marketplace-assessment/issues): 23 (5 S1, 13 S2, 5 S3). 20 have a test marked as an expected failure; 3 are confirmed without one.

## Active P1 and P2 bugs

**P1 (6)**
- [#3](https://github.com/Giomanconi/qa-marketplace-assessment/issues/3): Express shipping charged $14.99 instead of $9.99
- [#10](https://github.com/Giomanconi/qa-marketplace-assessment/issues/10): Double-clicking Place order creates two orders
- [#18](https://github.com/Giomanconi/qa-marketplace-assessment/issues/18): Delete my account does not erase data
- [#19](https://github.com/Giomanconi/qa-marketplace-assessment/issues/19): Signed-out API exposes the shop owner's email, address and phone
- [#20](https://github.com/Giomanconi/qa-marketplace-assessment/issues/20): Data export leaves out addresses and orders
- [#1](https://github.com/Giomanconi/qa-marketplace-assessment/issues/1): `/terms` returns 404

**P2 (13)**
- [#2](https://github.com/Giomanconi/qa-marketplace-assessment/issues/2): Tax charged on the full subtotal when a coupon applies
- [#7](https://github.com/Giomanconi/qa-marketplace-assessment/issues/7): SAVE20 stays applied below $100
- [#8](https://github.com/Giomanconi/qa-marketplace-assessment/issues/8): A Shipped order can still be cancelled
- [#9](https://github.com/Giomanconi/qa-marketplace-assessment/issues/9): Cancelling does not return items to stock
- [#11](https://github.com/Giomanconi/qa-marketplace-assessment/issues/11): An unaccepted card brand is charged
- [#12](https://github.com/Giomanconi/qa-marketplace-assessment/issues/12): Marketplace fee taken on the whole order total
- [#13](https://github.com/Giomanconi/qa-marketplace-assessment/issues/13): Seller hub counts cancelled orders
- [#15](https://github.com/Giomanconi/qa-marketplace-assessment/issues/15): Same email in another letter case creates a second account
- [#21](https://github.com/Giomanconi/qa-marketplace-assessment/issues/21): Marketing box pre-ticked at registration
- [#22](https://github.com/Giomanconi/qa-marketplace-assessment/issues/22): Cookie choice cannot be changed or withdrawn
- [#23](https://github.com/Giomanconi/qa-marketplace-assessment/issues/23): Privacy Policy lacks required information (discrepancy)
- [#25](https://github.com/Giomanconi/qa-marketplace-assessment/issues/25): Draft products listed in public search
- [#26](https://github.com/Giomanconi/qa-marketplace-assessment/issues/26): Sale badge shows the wrong percentage

Also open: 4 P3 issues, and 13 rows of [observations not filed](09-exploratory-sessions.md#observations-not-filed).

## Details

[Test plan](00-test-plan.md), [strategy](01-test-strategy.md), [core](03-core-test-cases.md) and [GDPR](04-gdpr-test-cases.md) test cases with results, [session log and limits](09-exploratory-sessions.md), [evidence](../evidence/).
