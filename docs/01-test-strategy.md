# 1. Test Strategy

How we decide what to test and how findings are ranked. What this cycle covers is in the [test plan](00-test-plan.md).

## Objective

Decide whether MarketNest is fit for release by checking its buyer, seller and privacy features against its documented behaviour, and report defects in a form that can be prioritised.

## Test basis

1. **Help Center:** the only written specification. Every testable statement gets a rule ID in the [requirements map](02-requirements-map.md). Expected values come from it, not from the app's own answers.
2. **Assumptions:** where the Help Center is silent, the expected behaviour is recorded with its source (convention, usability, legal expectation) and raised as a question or discrepancy, unless the behaviour is clearly harmful.

## Risk order

1. Money: totals, tax, fees, refunds.
2. Personal data (GDPR).
3. The core buyer journey.
4. The seller journey.
5. Polish.

## How we test

- **Scripted cases, kept small:** every one can be explained and defended in a walkthrough.
- **Boundary and equivalence analysis** for coupons, the shipping threshold, passwords and review length.
- **Direct inspection** of network responses, cookies and storage, and direct requests for authorisation checks.
- **Exploratory sessions** from time-boxed [charters](05-exploratory-charters.md), for what scripted cases miss.
- **Automation:** one Playwright spec per test case. Each test builds its data through the API and uses the UI only for what it verifies. A known defect stays a failing test that asserts the correct behaviour, so the suite becomes the regression check when fixes land.

## Severity and priority

**Severity** is the impact of the defect. **Priority** is how soon to fix it given the release. They are set independently.

| Severity | Definition | Examples |
|----------|-----------|----------|
| S1 Critical | Data loss or leak, wrong money charged or paid, security or GDPR breach, core flow blocked with no workaround | Customer charged the wrong amount, erasure does not erase |
| S2 Major | Core feature wrong or broken, workaround exists or limited audience | Coupon rule not enforced, cancel allowed after shipping |
| S3 Minor | Works, but with incorrect secondary behaviour or poor handling | Wrong message text |
| S4 Trivial | Cosmetic or wording | Typos, alignment |

| Priority | Meaning |
|----------|---------|
| P1 | Blocks the release |
| P2 | Fix before release if possible, otherwise first patch |
| P3 | Schedule normally |
| P4 | Backlog |

## Bug policy

One root cause is one issue. Reproduce twice, cite the rule, attach evidence with no real personal data. Lower-value findings stay as observations rather than issues. Issues are tracked on the [Project board](https://github.com/users/Giomanconi/projects/8); details are in [labels and workflow](06-labels-and-workflow.md).
