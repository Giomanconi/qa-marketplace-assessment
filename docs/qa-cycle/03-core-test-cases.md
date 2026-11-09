# 3. Core Test Cases (13)

A deliberately small set, chosen so every one can be executed, explained and defended in the interview. They are spread across the four severity levels (3 / 3 / 2 / 2). GDPR is covered by its own list in [04-gdpr-test-cases.md](04-gdpr-test-cases.md).

**Severity** = impact **if the test fails** (see the model in the [strategy](01-test-strategy.md#severity-and-priority)). **Priority** = how early it is run and how urgently a failure must be fixed.

## Overview

| ID | Title | Area | Severity if it fails | Priority | Requirements |
|----|-------|------|----------------------|----------|--------------|
| TC-01 | Order total with discount, shipping and tax | Checkout | S1 Critical | P1 | SHIP-3, TAX-2, TAX-3, CPN-5 |
| TC-02 | Cancel an order: refund, stock and state rules | Orders | S1 Critical | P1 | ORD-3, ORD-4 |
| TC-03 | Declined card and double submit | Payments | S1 Critical | P1 | PAY-2, PAY-3 |
| TC-04 | Coupon rules and boundaries | Cart | S2 Major | P2 | CPN-1 to CPN-4 |
| TC-05 | Free-shipping threshold is evaluated after discount | Cart/Checkout | S2 Major | P2 | SHIP-3, SHIP-4, SHIP-5 |
| TC-06 | Seller fee, earnings and Seller hub exclude cancelled orders | Seller | S2 Major | P2 | SELL-3, SELL-4, SELL-5 |
| TC-07 | Search, filters, sorting and out-of-stock handling | Catalog | S3 Minor | P3 | SHOP-1, SHOP-2, SHOP-5 |
| TC-08 | Registration validation and duplicate email | Account | S3 Minor | P3 | ACC-1, ACC-2 |
| TC-09 | Header cart badge shows total quantity | Cart | S4 Trivial | P4 | SHOP-6 |
| TC-10 | Responsive layout on key pages (375 px) | Cross-cutting | S4 Trivial | P4 | n/a (usability) |

Three further regression cases (TC-11 to TC-13) were added after the first findings; see the section at the end of this document.

Suggested execution order: TC-01 → TC-03 → TC-02 → TC-04 → TC-05 → TC-06 → TC-07 → TC-08 → TC-09 → TC-10.

## Shared test data

| Item | Value |
|------|-------|
| Buyer account | `buyer-a` (throwaway, fictitious data) |
| Seller account | `seller-b` with one published shop and 2–3 products at known prices |
| Coupons | `WELCOME10` (10%, no minimum), `SAVE20` ($20, min $100), `TAKE5` ($5, min $30) |
| Shipping | Standard $5.99 (free ≥ $50.00 after discount), Express $9.99 |
| Tax | 8% on item subtotal after discount; shipping not taxed |

Note the exact prices you used in the result so every figure can be recomputed.

---

## TC-01. Order total with discount, shipping and tax
**Severity if it fails:** S1 · **Priority:** P1 · **Requirements:** SHIP-3, TAX-2, TAX-3, CPN-5

**Why it matters:** wrong money charged to every customer.

**Preconditions:** buyer signed in, empty cart, a product (or combination) with item subtotal **$50.00**.

**Steps**
1. Add items totalling $50.00 to the cart.
2. Apply `WELCOME10`.
3. Continue to checkout, choose **Standard** shipping.
4. Compare cart, checkout summary and the order confirmation/detail.

**Expected (Help Center worked example)**
| Line | Amount |
|------|--------|
| Items | $50.00 |
| Discount (`WELCOME10`) | −$5.00 |
| Standard shipping | $5.99 (subtotal after discount $45.00 is below $50) |
| Tax (8% of $45.00) | $3.60 |
| **Total** | **$54.59** |

The same figures appear in cart, checkout, confirmation and order detail. The discount applies to items only (not shipping), and tax is calculated on the discounted items only (not on shipping).

**Variation:** repeat with Express ($9.99) → total $58.59 ($45.00 + $9.99 + $3.60).

**Automation:** yes, UI e2e (`@smoke`), plus API-level total check if an endpoint is observable.

---

## TC-02. Cancel an order: refund, stock and state rules
**Severity if it fails:** S1 · **Priority:** P1 · **Requirements:** ORD-3, ORD-4

**Why it matters:** wrong refunds, or cancelling orders that already left the warehouse.

**Preconditions:** two orders by `buyer-a`: Order A in **Processing**; Order B moved to **Shipped** by the seller (with tracking number). Note stock of the product(s) before ordering.

**Steps**
1. Open Order A (Processing): cancel it.
2. Check refund amount, order status, product stock and the Seller hub.
3. Open Order B (Shipped): look for a cancel option; if hidden, try the cancel URL/request directly (DevTools → copy request from Order A and replay for Order B).

**Expected**
- Order A becomes Cancelled; **full order total** is refunded (items + shipping + tax); stock goes back up by the ordered quantity.
- Order B cannot be cancelled in the UI **and** the server rejects a direct request (server-side enforcement).
- Cancelled order is listed correctly in order history.

**Automation:** yes, e2e for UI path; API check for rejection on Shipped (`@regression`).

---

## TC-03. Declined card and double submit
**Severity if it fails:** S1 · **Priority:** P1 · **Requirements:** PAY-2, PAY-3

**Why it matters:** customers charged without an order, or charged twice.

**Preconditions:** cart with items; use only the test/dummy card numbers the site accepts or declines (no real cards).

**Steps**
1. Check out with a card that should be **declined**.
2. Verify no order exists in "Your orders", the cart is unchanged, and an error message is shown.
3. Retry with a valid card; during submission click **Place order** twice quickly (and, in a second run, refresh/back after submit).

**Expected**
- Declined: no order, nothing charged, cart intact (PAY-3).
- Valid card: exactly **one** order and one charge (PAY-2) even with double click/refresh.
- Only Visa, Mastercard, Amex and Discover are accepted (PAY-1); another brand is rejected with a clear message.

**Automation:** partially (decline path and double-click are good candidates for e2e).

---

## TC-04. Coupon rules and boundaries
**Severity if it fails:** S2 · **Priority:** P2 · **Requirements:** CPN-1, CPN-2, CPN-3, CPN-4, CPN-8

**Preconditions:** products allowing subtotals of $29.99, $30.00, $99.99, $100.00.

**Steps / Expected**
| Case | Action | Expected |
|------|--------|----------|
| a | `TAKE5` at $29.99, then $30.00 | Rejected at $29.99; applied at $30.00 (−$5.00) |
| b | `SAVE20` at $99.99, then $100.00 | Rejected at $99.99; applied at $100.00 (−$20.00) |
| c | `welcome10`, `WeLcOmE10` | Applied, same as upper case |
| d | Apply `WELCOME10`, then try `TAKE5` without removing | Second code refused (one code per order) |
| e | Apply `SAVE20` at $100.00, remove an item so subtotal < $100 | Code removed from cart; total recalculated; still absent at checkout |
| f | Unknown code `NOPE` | Clear error, nothing changes |

**Automation:** yes, data-driven (`@regression`), ideal for a table of cases.

---

## TC-05. Free-shipping threshold evaluated after discount
**Severity if it fails:** S2 · **Priority:** P2 · **Requirements:** SHIP-3, SHIP-4, SHIP-5

**Steps / Expected**
| Case | Item subtotal | Coupon | Subtotal after discount | Standard shipping |
|------|---------------|--------|-------------------------|-------------------|
| a | $49.99 | none | $49.99 | $5.99 |
| b | $50.00 | none | $50.00 | **Free** |
| c | $55.00 | `WELCOME10` | $49.50 | **$5.99** (the discount drops it below the threshold) |
| d | $55.55 | `WELCOME10` | $49.995 (rounds to $50.00) | Rounding edge case: record the result; the shipping decision must be consistent with the discounted subtotal shown to the user. Unclear rule → `question` issue |
| e | $50.00 | none, **Express** | n/a | **$9.99** (always) |

Tax and shipping must not count toward the threshold (a subtotal of $45 + tax must still be charged shipping).

**Automation:** yes, data-driven.

---

## TC-06. Seller fee, earnings and Seller hub exclude cancelled orders
**Severity if it fails:** S2 · **Priority:** P2 · **Requirements:** SELL-3, SELL-4, SELL-5

**Preconditions:** `seller-b` shop with a **$40.00** item; buyer `buyer-a` can purchase it (a seller cannot buy their own product).

**Steps**
1. Buyer orders the $40 item (shipping and tax added on top). Do not use a coupon in run 1.
2. In Seller hub note revenue, orders, units sold, AOV, net earnings and the 7-day chart.
3. Buyer cancels a second similar order while Processing.
4. Check the Seller hub again.

**Expected**
- Fee = **$4.00** (10% of item price only), earnings = **$36.00**; shipping and tax are not charged a fee.
- Cancelled order contributes **nothing** to revenue, orders, units, AOV, earnings or chart; no fee recorded (SELL-4, SELL-5).
- Optional run 2 with a coupon: state which base the fee uses and flag if unclear (question issue).

**Automation:** UI check of dashboard values after API/UI setup.

---

## TC-07. Search, filters, sorting and out-of-stock handling
**Severity if it fails:** S3 · **Priority:** P3 · **Requirements:** SHOP-1, SHOP-2, SHOP-5

**Steps / Expected**
1. Search a two-word query in both word orders and different case (e.g. `leather wallet` / `WALLET Leather`) → same results (SHOP-1); a word that appears only in tag, shop name or category still matches.
2. Apply category + price range + rating filters together; change sort (price, newest, rating) → results consistent with the filters and sort order; result count correct.
3. Open an **out-of-stock** product → visible in catalog, add-to-cart disabled and cannot be added by request (SHOP-5).
4. Edge inputs: empty search, 200-character query, special characters (`<>"'%`) → no error page, no unescaped output.

**Automation:** yes for search/filter (`@regression`).

---

## TC-08. Registration validation and duplicate email
**Severity if it fails:** S3 · **Priority:** P3 · **Requirements:** ACC-1, ACC-2

**Steps / Expected**
| Case | Input | Expected |
|------|-------|----------|
| a | Password 7 characters with letter + number | Rejected |
| b | Password 8 characters, letters only / digits only | Rejected (needs letter **and** number) |
| c | Password 8 characters with letter + number | Accepted |
| d | Missing name or invalid email format | Field-level error, nothing created |
| e | Register an existing email, also with different letter case | Rejected: one account per email |

Messages are clear and do not reveal implementation detail.

**Automation:** yes, data-driven.

---

## TC-09. Header cart badge shows total quantity
**Severity if it fails:** S4 · **Priority:** P4 · **Requirements:** SHOP-6

**Steps / Expected**
1. Add product A ×2 and product B ×1 → badge shows **3** (total items, not number of lines).
2. Increase/decrease quantity, remove an item → badge updates immediately.
3. Reload, open in a new tab, sign out and in → badge matches cart contents.

**Automation:** yes, simple UI test.

---

## TC-10. Responsive layout on key pages (375 px)
**Severity if it fails:** S4 · **Priority:** P4 · **Requirements:** usability (assumption)

**Steps / Expected**
- At 375 px, 768 px and 1440 px open home, product, cart, checkout and account pages.
- No horizontal scroll, no overlapping or clipped text/buttons, primary actions reachable, forms usable, focus visible when tabbing.

**Automation:** optional visual/viewport smoke.

---

---

# Test cases derived from findings

Added after exploratory testing of TC-01 exposed two defects in the checkout summary (Express shipping price and tax base). They turn each finding into a repeatable, data-driven check and are the first candidates for automation.

| ID | Title | Severity if it fails | Priority | Requirements | Issue |
|----|-------|----------------------|----------|--------------|-------|
| TC-11 | Express shipping is always $9.99 and matches what the delivery option shows | S1 Critical | P1 | SHIP-2, SHIP-5 | #3 |
| TC-12 | Tax is 8% of the discounted item subtotal and never includes shipping | S2 Major | P2 | TAX-2, TAX-3 | #2 |
| TC-13 | An invalid ZIP code gets an error about the ZIP code, not the phone number | S3 Minor | P3 | assumption (usability) | #4 |

## TC-11. Express shipping is always $9.99 and matches what the delivery option shows
**Severity if it fails:** S1 · **Priority:** P1 · **Requirements:** SHIP-2, SHIP-5

**Why it matters:** the customer is charged more than the price shown when choosing a delivery method.

**Preconditions:** buyer signed in; products allowing the subtotals below.

**Steps:** for each row, add items, (apply the coupon if listed), go to checkout, select **Express**, and compare the delivery-option price, the "Shipping (Express)" line in the order summary, the order confirmation, and the order detail.

| Case | Item subtotal | Coupon | Express price shown on option | Expected "Shipping (Express)" line |
|------|---------------|--------|-------------------------------|------------------------------------|
| a | $30.00 | none | $9.99 | $9.99 |
| b | $49.99 | none | $9.99 | $9.99 |
| c | $50.00 | none | $9.99 | $9.99 |
| d | $99.99 | none | $9.99 | $9.99 |
| e | $100.00 | none | $9.99 | $9.99 |
| f | $109.00 | `WELCOME10` | $9.99 | $9.99 (known failure: $14.99 charged) |
| g | $109.00 | none | $9.99 | $9.99 |

**Expected:** the price on the option, the summary line, the confirmation and the order detail are identical and equal to **$9.99**, independent of order value and coupon. Switching Standard ↔ Express updates only the shipping line and the total.

**Automation:** yes, data-driven UI test (`@regression`); also a good API-level check on the checkout/pricing response.

## TC-12. Tax is 8% of the discounted item subtotal and never includes shipping
**Severity if it fails:** S2 · **Priority:** P2 · **Requirements:** TAX-2, TAX-3

**Steps:** for each row, build the cart, apply the coupon, go to checkout with Standard shipping, and compare the tax line with `round(0.08 × (item subtotal − discount), 2)`.

| Case | Item subtotal | Coupon | Discount | Taxable amount | Expected tax |
|------|---------------|--------|----------|----------------|--------------|
| a | $50.00 | none | $0.00 | $50.00 | $4.00 |
| b | $50.00 | `WELCOME10` | $5.00 | $45.00 | $3.60 |
| c | $109.00 | `WELCOME10` | $10.90 | $98.10 | $7.85 ($7.848 rounded) (known failure: $8.72 shown) |
| d | $30.00 | `TAKE5` | $5.00 | $25.00 | $2.00 |
| e | $100.00 | `SAVE20` | $20.00 | $80.00 | $6.40 |

**Total oracle for case c:** Standard → $98.10 + $0.00 + $7.85 = **$105.95**; Express → $98.10 + $9.99 + $7.85 = **$115.94**.

**Expected:** tax equals 8% of the discounted subtotal in every row, is the same whether Standard or Express is chosen (shipping is not taxed), and the same value appears in the confirmation and order detail. Also check that removing the coupon returns tax to 8% of the full subtotal.

**Automation:** yes, data-driven (`@regression`).

## TC-13. An invalid ZIP code gets an error about the ZIP code
**Severity if it fails:** S3 · **Priority:** P3 · **Requirements:** none in the Help Center (assumption, usability)

**Steps:** at checkout fill every field with valid data, enter ZIP `ABCDE`, fill a test card and click **Place order**.

**Expected:** the error under the ZIP field is about the ZIP code (for example "Enter a valid ZIP code"). The same data with ZIP `98101` is accepted.

**Actual (2026-11-05):** "Enter a valid phone number." under the ZIP field (issue #4).

**Automation:** yes, `@regression`.

## Results log

Automated run of 2026-11-05 and 2026-11-06 (Playwright, spec per test case). "PASS" means every check of the case passed; a case with a defect lists the issue.

| ID | Spec | Result | Issue |
|----|------|--------|-------|
| TC-01 | `tests/app/e2e/tc-01-order-total.spec.ts` | FAIL: worked example (tax on the full subtotal) and the Express variation | #2, #3 |
| TC-02 | `tests/app/e2e/tc-02-cancel-order.spec.ts` | FAIL: Processing cancel and refund amount pass; stock is not restored; a Shipped order can be cancelled (button and API) | #9, #8 |
| TC-03 | `tests/app/e2e/tc-03-declined-card-double-submit.spec.ts` | FAIL: declined card passes; refresh/back passes unless the confirmation page gets no answer (intermittent, see [docs/development-notes/09](../development-notes/09-exploratory-sessions.md#observations-not-filed)); a double click creates two orders; an unsupported card brand is charged | #10, #11 |
| TC-04 | `tests/app/functional/tc-04-coupon-rules.spec.ts` | FAIL: cases a, b, c, d and f pass; case e (SAVE20 stays after the subtotal drops below $100) fails | #7 |
| TC-05 | `tests/app/functional/tc-05-free-shipping-threshold.spec.ts` | FAIL: cases a, c, d (consistent) and f pass; case b ($50.00 is not free) and case e (Express $14.99) fail | #6, #3 |
| TC-06 | `tests/app/functional/tc-06-seller-fee-earnings.spec.ts` | FAIL: fee is $4.92 instead of $4.00; the hub counts the cancelled order | #12, #13 |
| TC-07 | `tests/app/functional/tc-07-search-filters.spec.ts` | FAIL: search order/case, out-of-stock and odd inputs pass; price sort uses the original price | report |
| TC-08 | `tests/app/api/tc-08-registration-validation.spec.ts` | FAIL: cases b, c, d pass; a 7-character password and the same email in another case are accepted | #14, #15 |
| TC-09 | `tests/app/functional/tc-09-cart-badge.spec.ts` | FAIL: the badge counts lines (2) instead of total quantity (3) | report |
| TC-10 | `tests/app/functional/tc-10-responsive-layout.spec.ts` | PARTIAL: at 375, 768 and 1440 px the home page, catalogue, a product, the cart, checkout and account do not scroll sideways, and the search box, Add to cart, Checkout and Place order are visible, except that at 375 px a cart with an item is 50 px wider than the screen and the catalogue is 21 px wider once its pagination row has loaded (the check waits for that row; before that change it passed by measuring too early). Manual look at 375 and 768 px (see [09](../development-notes/09-exploratory-sessions.md)): the cart is 56 px too wide and the checkout 23 px too wide on a phone with an ordinary product title (the spec's short title hides the checkout case), the catalogue pagination row is clipped, and keyboard focus is visible; nothing is unreachable. Not looked at: contrast and screen readers. | report |
| TC-11 | `tests/app/functional/tc-11-express-shipping.spec.ts` | FAIL in all 7 cases ($30 to $109, with and without coupon): option $9.99, summary $14.99 | #3 |
| TC-12 | `tests/app/functional/tc-12-tax-base.spec.ts` | FAIL in 4 of 4 coupon cases (b, c, d, e); case a and removing the coupon pass | #2 |
| TC-13 | `tests/app/functional/tc-13-zip-error-message.spec.ts` | FAIL: invalid ZIP shows "Enter a valid phone number." | #4 |

The first manual run (2026-11-04) found TC-11 case f and TC-12 case c failing; the automated run shows the defects are wider than first recorded (every TC-11 case, every coupon case of TC-12).

## Why these cases (rationale to explain in the interview)

- **Money first.** Totals, refunds, coupons, shipping thresholds and seller fees are where defects cost the business most, and the Help Center gives exact numbers that act as test oracles.
- **State and authority.** Cancellation and payment are state machines with a server-side rule that the UI alone cannot guarantee.
- **Sampling lower tiers.** Search, validation, the cart badge and responsiveness represent common medium/low-impact defect classes without bloating the set.
- **Not included as test cases on purpose:** reviews, returns, address management and extra seller and cart rules were covered by two [exploratory sessions](../development-notes/09-exploratory-sessions.md) instead, and filed only when the finding was strong (#25, #26); profile edits are in GDPR-05.
