# 9. Exploratory session log

Two time-boxed sessions on the rules that had no result yet, run on 2026-11-06 with throwaway accounts ([08](08-test-accounts.md)), small API scripts and a browser session. Charters are in [05](05-exploratory-charters.md). The other charters are covered by the test cases (C1, C2, C6, C8), or only in part (C3, C9).

## Session 1: reviews and returns (C7, part of C3)

**Mission:** explore reviews, delivery and returns with a seller and three buyers, each with a delivered order, to find eligibility, validation and calculation errors.

| Rule | Result |
|---|---|
| REV-1 | PASS: no review before delivery or without buying (403); one per item (409) |
| REV-2 | FAIL (S3): ratings 0 and -1 are accepted and count in the average; 6, 3.5, a missing rating, an empty title and 9 characters are rejected |
| REV-3 | PASS: "Qa T.", newest first |
| REV-4 | PASS: the average of all reviews (2.7 for 0, 4, 4) |
| SHIP-7, SELL-6 | PASS: tracking number required, no delivery before shipping, each status in the timeline |
| ORD-1, ORD-2 | PASS: newest first; the detail has items, totals, address, payment, tracking and history |
| SHIP-6 | PASS on the confirmation page (business days); FAIL (S3) on the product page, which counts calendar days and promises a Sunday |
| RET-1, RET-2 | PASS: eligible until delivery + 30 days. Dates are day first on the order page, month first elsewhere (S4) |
| RET-1, RET-5 | No return flow: no route or button, only a "How returns work" text |

**Filed:** none; 2 observations. **Not tested:** reviews through the UI form, the second page of reviews, RET-3 and RET-4.

## Session 2: seller and cart rules (C4, C5)

**Mission:** explore shops, drafts, stock, sale prices, options and addresses with two sellers and buyers, to find visibility, limit and price errors.

| Rule | Result |
|---|---|
| SELL-1 | PASS: one shop per user; names unique, also in capitals |
| SELL-2 | FAIL: drafts are hidden everywhere except the keyword search ([#25](https://github.com/Giomanconi/qa-marketplace-assessment/issues/25)) |
| SHOP-8 | PASS: a seller cannot buy from their own shop (403) |
| SHOP-7 | PASS for the stock limit; adding an item again replaces the quantity (S3) |
| SHOP-3 | PASS: an option at +$10 updates the price; a sold-out option is refused |
| SHOP-4 | FAIL: -25% and -50% shown instead of -20% and -33% ([#26](https://github.com/Giomanconi/qa-marketplace-assessment/issues/26)) |
| Cart | PASS: the cart survives signing out and in |
| CPN-9 | As documented: WELCOME10 works again on a second order |
| SHIP-1 | Open question: a two-shop cart is one order with one shipping charge |
| ACC-4 | FAIL (S3): several addresses can be default |

**Filed:** #25, #26; 2 observations. **Not tested:** the seller's view of a mixed cart, editing price or stock while in a cart, the 7-day chart, pagination and the rating filter.

## Small-screen look (manual part of TC-10)

Pages opened at 375 and 768 px with one item in the cart, plus the checkout form filled by keyboard at 375 px.

| Page | 375 px | 768 px |
|---|---|---|
| Home, product | fit | fit |
| Catalogue | 21 px too wide once pagination loads (row clipped) | fits |
| Cart | 56 px too wide | fits |
| Checkout | 23 px too wide, still usable | fits |
| Account | fits; the tab strip is cut after the third tab | fits |

Keyboard focus is visible and in order on the checkout form. The automated TC-10 check now waits for the pagination row (it first passed by measuring too early); its checkout check uses a short title and misses the 23 px case. **Not covered:** contrast, screen readers, landscape, zoom, seller pages.

## Observations not filed

S3 and S4 findings kept out of the issue list; the report gives their count.

| Sev. | Observation | Automated test |
|---|---|---|
| S3 | The session cookie has no `Secure` flag (HTTP redirects to HTTPS, so exposure is limited). | `gdpr-08` (expected failure) |
| S3 | At 375 px the cart (56 px), checkout (23 px, long title) and catalogue (21 px) are wider than the screen; nothing is unreachable. | `tc-10` (cart and catalogue) |
| S3 | Price sort uses the original price, so sale items are out of order (SHOP-2). | `tc-07` (expected failure for high to low) |
| S3 | A review rating of 0 or -1 is accepted and counts in the average (REV-2). | none |
| S3 | The product page counts calendar days for delivery (SHIP-6). | none |
| S3 | After payment the confirmation page sometimes never answers; the order exists, so a customer could pay again. Failed 5 of 23 runs; may be the host's deliberate failures; raise it if it happens on a stable host. | `tc-03` refresh (intermittent) |
| S3 | Several addresses can be default (ACC-4). | none |
| S3 | Adding an item already in the cart replaces its quantity. | none |
| S3 | Dates are day first on the order page and month first elsewhere. | none |
| S4 | The cart badge counts lines, not quantity (SHOP-6). | `tc-09` (expected failure) |
| S4 | The confirmation prints amounts without two decimals (`$3.2`). | none |
| S4 | The checkout heading reads "Shiping address". | none |
| S4 | A 101-character first name is accepted; the Erasure tile says "Ask us to delete" beside a self-service button. | none |

## What works

- **Money:** coupon minimums and rules; the free-shipping threshold on the discounted subtotal, with tax and shipping left out of it (SHIP-4); untaxed shipping (TAX-3).
- **Payments and orders:** a declined card creates no order; the status flow, order list and detail; the return window.
- **Reviews:** eligibility, one per item, name display, the average.
- **Seller and cart:** unique shops, hidden drafts (except search), no self-purchase, stock limits, option prices, cart persistence, search.
- **Access and privacy:** no access to other users' orders or exports; signed-out requests get nothing; neutral forgot-password; HTTPS redirect; HttpOnly and SameSite cookie; no trackers before consent; marketing consent round trip; no personal data in URLs or public pages.
- **Layout:** no sideways scroll at tablet width or on home, product and account pages; visible focus on checkout.

## Limits of this cycle

- **Light checks only** for accessibility and security (focus, cookie flags, HTTPS, access control); no contrast, screen reader or penetration testing.
- **Not tested:** RET-3, RET-4, CPN-6, CPN-7, SELL-4 on its own, and tax rounding. The Privacy Policy content was read by hand.
- **Erasure is a soft delete** (#18), so test accounts and the shops of test runs stay in the sandbox ([08](08-test-accounts.md)). A shop owner's erasure was seen once, not automated.
- **Registration reveals existing emails** (409); only forgot-password must be neutral (ACC-3), and it is.
- Expected values come from the Help Center, not the app. GDPR findings are non-compliance risks for product and legal to confirm, not legal advice.

## Run stability

The host fails requests on purpose, so a host failure shows up as a one-off that passes on rerun. Before known defects were marked, full runs had the same 44 failures plus 0 to 2 host timeouts. The double-click defect (#10) is a race (5 of 6 manual tries), and the low-to-high price sort fails only when a sale item falls in the price range. With the defects marked as expected failures, the latest full runs are green, with an occasional flaky test that passes on retry.
