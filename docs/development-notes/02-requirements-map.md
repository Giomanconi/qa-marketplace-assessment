# 2. Requirements Map

Every behaviour the Help Center defines (the `/help` page of the sandbox, read 2026-11-04) gets a rule ID, so test cases, issues and tests can cite it. Expected values come from here, never from the app's own answers.

**Result:** `PASS`, `FAIL (#issue)`, `FAIL (S3)` for an observation without an issue (see [observations](09-exploratory-sessions.md#observations-not-filed)), `Not tested` with the reason, or an open question. *(assumption)* marks a rule the Help Center does not state.

**Coverage:** 65 rules, 60 with a result. Not tested: RET-3, RET-4, CPN-6, CPN-7 and SELL-4 on its own.

## Shipping (SHIP)

| ID | Rule | Result |
|----|------|--------|
| SHIP-1 | Each order ships from the shop that sells the item. | Open question 4: a two-shop cart makes one order with one shipping charge |
| SHIP-2 | Standard $5.99 (5 business days), Express $9.99 (2 business days). | PASS Standard; FAIL Express (#3) |
| SHIP-3 | Standard is free when the item subtotal **after discounts** is ≥ $50.00. | FAIL at exactly $50.00 (#6) |
| SHIP-4 | Tax and shipping do not count toward the threshold. | PASS |
| SHIP-5 | Express is always $9.99. | FAIL (#3) |
| SHIP-6 | Delivery estimates count business days, from the day after ordering. | PASS on the confirmation page; FAIL (S3) on the product page, which counts calendar days |
| SHIP-7 | Processing → Shipped (with tracking number) → Delivered. | PASS |

## Returns (RET)

| ID | Rule | Result |
|----|------|--------|
| RET-1 | Return window: 30 days from delivery. | PASS for the window; the app has no way to start a return (open question 7) |
| RET-2 | Delivered orders show "Return eligible until". | PASS |
| RET-3 | Items unused and in original packaging. | Not tested: policy statement, no return flow |
| RET-4 | Refunds go back to the card used. | Not tested: policy statement, no return flow |
| RET-5 | Before shipping, cancel instead of returning. | PASS for the cancel path (TC-02) |

## Orders (ORD)

| ID | Rule | Result |
|----|------|--------|
| ORD-1 | "Your orders" lists all orders, newest first. | PASS |
| ORD-2 | Order detail shows items, totals, address, status history and tracking number. | PASS |
| ORD-3 | Cancel only while Processing. | FAIL (#8) |
| ORD-4 | Cancelling refunds the **full total** and returns items to stock. | FAIL (#9) |

## Payments and tax (PAY, TAX)

| ID | Rule | Result |
|----|------|--------|
| PAY-1 | Accepted cards: Visa, Mastercard, American Express, Discover. | FAIL (#11) |
| PAY-2 | Charged once, even on double click, refresh or back. | FAIL (#10) |
| PAY-3 | Declined payment: no order, no charge, cart kept. | PASS |
| TAX-1 | Product and cart prices exclude tax. | PASS |
| TAX-2 | 8% tax on the item subtotal **after discount**. | FAIL (#2) |
| TAX-3 | Shipping is not taxed. | PASS |

**Oracle (Help Center worked example):** $50.00 − WELCOME10 $5.00 = $45.00; Standard $5.99 (below $50); tax 8% × $45.00 = $3.60; **total $54.59**.

## Coupons (CPN)

| Code | Offer | Minimum (item subtotal before discount) |
|------|-------|------------------------------------------|
| `WELCOME10` | 10% off | none |
| `SAVE20` | $20.00 off | $100.00 |
| `TAKE5` | $5.00 off | $30.00 |

| ID | Rule | Result |
|----|------|--------|
| CPN-1 | One code per order. | PASS |
| CPN-2 | Codes are not case-sensitive. | PASS |
| CPN-3 | Minimum checked before discount, tax and shipping. | PASS |
| CPN-4 | Minimum still met at checkout, or the code is removed. | FAIL (#7) |
| CPN-5 | Percentage codes apply to items only. | PASS for shipping; tax is TAX-2 (#2) |
| CPN-6 | A fixed code never takes the subtotal below $0.00. | Not tested: the minimums make it unreachable |
| CPN-7 | Expired codes cannot be used. | Not tested: no expired code known |
| CPN-8 | An unknown code shows a clear error. *(assumption)* | PASS |
| CPN-9 | WELCOME10 is promoted to new customers; no first-order rule. *(assumption)* | PASS: it works again on a second order |

## Shopping and cart (SHOP)

| ID | Rule | Result |
|----|------|--------|
| SHOP-1 | Search matches every word, any order, case-insensitive. | PASS |
| SHOP-2 | Filters and sort (price, newest, rating). | FAIL (S3): price sort uses the original price |
| SHOP-3 | Price updates when a costlier option is chosen. | PASS |
| SHOP-4 | Sale percentage is off the **original** price. | FAIL (#26) |
| SHOP-5 | Out-of-stock items are visible but cannot be added. | PASS |
| SHOP-6 | Cart icon shows the total quantity. | FAIL (S3): it counts lines |
| SHOP-7 | No more than the stock, with a clear message. *(assumption)* | PASS; adding an item again replaces the quantity (S3) |
| SHOP-8 | A seller cannot buy their own product. *(assumption)* | PASS (403, server side) |

## Reviews (REV)

| ID | Rule | Result |
|----|------|--------|
| REV-1 | Only buyers with a delivered order; one review per item. | PASS |
| REV-2 | Rating 1–5, title required, text ≥ 10 characters. | FAIL (S3): ratings 0 and -1 are accepted |
| REV-3 | Shown as first name + last initial, newest first. | PASS |
| REV-4 | Product rating = average of its reviews. | PASS |

## Account (ACC)

| ID | Rule | Result |
|----|------|--------|
| ACC-1 | Password ≥ 8 characters with a letter and a number. | FAIL (#14) |
| ACC-2 | One account per email. | FAIL (#15) |
| ACC-3 | Forgot password answers the same for any email. | PASS |
| ACC-4 | Exactly one default address. | FAIL (S3): several can be default |

## Selling (SELL)

| ID | Rule | Result |
|----|------|--------|
| SELL-1 | One shop per account; unique shop names. | PASS |
| SELL-2 | Drafts are not visible to shoppers. | FAIL (#25): they show in keyword search |
| SELL-3 | Fee = 10% of item sales only. | FAIL (#12) |
| SELL-4 | Cancelled orders carry no fee or earnings. | Not tested on its own; the hub counts them (#13) |
| SELL-5 | The Seller hub excludes cancelled orders. | FAIL (#13) |
| SELL-6 | Tracking number required to ship; then mark delivered. | PASS |

**Oracle:** $40.00 item → fee $4.00 → seller earns $36.00.

## Privacy (PRIV) — see the [GDPR test cases](../qa-cycle/04-gdpr-test-cases.md)

| ID | Rule | Result |
|----|------|--------|
| PRIV-1 | Stored data listed; password hashed. | PASS: no password, hash or token in the export |
| PRIV-2 | Personal email and address never shown to other users. | FAIL (#19): the signed-out product API exposes them |
| PRIV-3 | "Download my data" holds profile, addresses, orders and reviews. | FAIL (#20): no addresses or orders |
| PRIV-4 | Profile and addresses can be corrected. | PASS |
| PRIV-5 | Erasure: no sign-in, data erased, "Deleted user", email reusable. | FAIL (#18) |
| PRIV-6 | Marketing is opt-in and can be turned off. | FAIL (#21): pre-ticked at registration |

## Cookies (COOK)

| ID | Rule | Result |
|----|------|--------|
| COOK-1 | Essential cookies always on. | PASS |
| COOK-2 | Analytics only after "Accept all". | PASS |
| COOK-3 | Choice remembered for 12 months. | FAIL (#16): reject is not remembered |
| COOK-4 | Changing the choice means clearing cookies. *(weak: withdrawing should be as easy as giving)* | FAIL (#22) |

## Legal (LEG)

| ID | Rule | Result |
|----|------|--------|
| LEG-1 | Footer links to Privacy, Cookie Policy and Terms. | PASS for Privacy and Cookies; the policy lacks required content (#23) |
| LEG-2 | `/terms` loads. | FAIL (#1) |

## Open questions

For the product owner; what testing showed is in italics.

1. Maximum quantity per item or order? *Only the stock limit was seen.*
2. Are coupons limited to first orders? *No: WELCOME10 works again.*
3. What happens to orders and earnings when a seller deletes the account? *The listing stays live with the owner's data (#18, #19); earnings not checked.*
4. Is a multi-shop cart split into orders, and is shipping per shop? *One order, one $5.99 charge.*
5. Is Express offered when Standard is free? *Yes; its charged price is wrong (#3).*
6. How is tax rounded? *Not tested.*
7. Can buyers start a return in the app? *No: informational only.*
8. How long are anonymised orders kept after erasure? *The policy does not say (#23).*
