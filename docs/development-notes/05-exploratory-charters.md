# 5. Exploratory Test Charters

Session-based testing: each charter is a time-boxed mission (60–90 min), written as *Explore* [area] *with* [data or tools] *to discover* [risk]. Findings are filed while the evidence is fresh and merged at triage. Session notes are in [09](09-exploratory-sessions.md).

**Heuristics:** boundaries; empty, maximum and negative inputs; order of operations; back, refresh and double click; two tabs, two users; session expiry; slow network; small screens; keyboard only; and "what does the Help Center say against what the UI does?".

## Charters and status

| # | Mission | Priority | Rules | Status |
|---|---------|----------|-------|--------|
| C1 | Money: coupons, shipping, tax and totals, to find wrong amounts or figures that differ between screens | Highest | SHIP, TAX, CPN, PAY | Covered by TC-01, TC-04, TC-05, TC-11, TC-12 |
| C2 | Privacy: consent, access, erasure and exposure | Highest | PRIV, COOK | Covered by GDPR-01 to GDPR-09 |
| C3 | Checkout and orders: double charging, state changes, refunds | High | PAY, ORD, RET, SHIP | Partly: TC-01 to TC-03 and session 1 |
| C4 | Seller flow and fees: wrong fees, visibility leaks, order handling | High | SELL | Session 2 |
| C5 | Catalogue, search, filters, cart: wrong results, prices or counts | High | SHOP | Session 2 |
| C6 | Accounts and authorisation: validation gaps, access bypasses | High | ACC | Covered by TC-08, GDPR-08 |
| C7 | Reviews and ratings: eligibility and calculation errors | Medium | REV | Session 1 |
| C8 | Legal pages, navigation, errors: broken pages, leaks | Medium | LEG | Covered by GDPR-09 |
| C9 | Cross-cutting: layout, accessibility, console and network errors | Medium | none | Partly: TC-10 and the small-screen look |

## Key ideas per charter

- **C1:** the worked example ($54.59); the free-shipping boundary after discount ($49.99, $50.00, $55 with WELCOME10); coupon minimums at $29.99/$30 and $99.99/$100; drop below a minimum after applying a code; compare totals on cart, checkout, confirmation and order.
- **C2:** cookies before any choice; export against the UI and the policy; delete the account, then sign in, register again and check reviews and orders; another user's IDs in requests.
- **C3:** card brands and a declined card; double click, refresh and back after submitting; cancel after Shipped, also by a direct request; refund equals the full total; "Return eligible until"; a two-shop cart.
- **C4:** one shop per account and unique names; drafts by URL and search; the fee on an order with shipping, tax and a coupon; the hub after a cancel; tracking number required.
- **C5:** multi-word search in any order; combined filters and sort; sale percentage; option prices; stock limits; the cart badge after add, change and remove.
- **C6:** passwords of 7 and 8 characters, letters or digits only; duplicate email in another case; forgot-password answers; signed-out access to account pages; other users' IDs.
- **C7:** reviews before and after delivery, twice, ratings 0 and 6 by request, text of 9 and 10 characters, name display, the average.
- **C8:** `/terms`, policy anchors, unknown routes, error pages that leak detail.
- **C9:** 375, 768 and 1440 px; keyboard focus; labels and error messages; contrast; console errors.

## Session note template

```
Session <n>: <charter>, <date> <start>–<end>
Accounts and data:
Findings (rule, result, issue):
Questions and assumptions:
Not tested:
```
