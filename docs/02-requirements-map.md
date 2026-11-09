# 2. Requirements Map

Source: MarketNest Help Center, the `/help` page of the sandbox (read 2026-11-04).

Every statement that defines behaviour is given an ID so that test cases, issues and automated tests can cite it.
**Result** column: `PASS`, `FAIL (#issue)` or `FAIL (S3, report)` for an observation without an issue, listed in [docs/09](09-exploratory-sessions.md), `Not tested` with the reason, and `Open question` (see the questions at the end).

## 2.1 Shipping and delivery (SHIP)

| ID | Rule | Result |
|----|------|--------|
| SHIP-1 | Each order ships from the independent shop that sells the item. | Open question 4: a cart with two shops creates one order with one shipping charge (session 2, [09](09-exploratory-sessions.md)) |
| SHIP-2 | Standard: $5.99, 5 business days. Express: $9.99, 2 business days. | PASS (Standard); FAIL Express (#3) |
| SHIP-3 | Standard is free when the **merchandise subtotal after discounts** is ≥ $50.00. | FAIL at exactly $50.00 (#6) |
| SHIP-4 | Tax and shipping do not count toward the free-shipping threshold. | PASS |
| SHIP-5 | Express is always $9.99 regardless of order value. | FAIL (#3) |
| SHIP-6 | Delivery estimates count business days only (Mon–Fri), starting the day after ordering; no weekend delivery. | PASS on the confirmation page (a Friday order: Standard arrives Fri 13 Nov; Express and the checkout page not checked); FAIL on the product page, which counts calendar days and promises Express on a Sunday (S3, report) |
| SHIP-7 | Status flow: Processing → Shipped (tracking number appears on order page) → Delivered. | PASS (session 1): Processing, Shipped with tracking number, Delivered; each step is in the order timeline |

## 2.2 Returns (RET)

| ID | Rule | Result |
|----|------|--------|
| RET-1 | Return allowed within 30 days **from the delivery date**. | PASS for the window: 30 days after delivery (session 1). The app has no way to start a return (open question 7) |
| RET-2 | Delivered orders show "Return eligible until" with the last day of the window. | PASS (session 1): "Return eligible until" is the delivery date plus 30 days |
| RET-3 | Items should be unused and in original packaging (policy statement). | Not tested: policy statement, the app has no return flow |
| RET-4 | Refunds go back to the card used. | Not tested: policy statement, the app has no return flow |
| RET-5 | Before shipping, the buyer should cancel instead of returning. | PASS for the cancel path (TC-02: Processing orders can be cancelled); returns are not in the app |

## 2.3 Orders and cancellations (ORD)

| ID | Rule | Result |
|----|------|--------|
| ORD-1 | "Your orders" lists all orders, newest first. | PASS (session 1): newest first |
| ORD-2 | Order detail shows items, totals, delivery address, status history and tracking number. | PASS (session 1): items, totals, address, payment, tracking number and a status timeline |
| ORD-3 | Cancellation is allowed **only while status is Processing**. | FAIL (#8) |
| ORD-4 | Cancelling refunds the **full order total** and returns items to stock. | FAIL (#9) |

## 2.4 Payments and tax (PAY / TAX)

| ID | Rule | Result |
|----|------|--------|
| PAY-1 | Accepted cards: Visa, Mastercard, American Express, Discover (credit and debit). | FAIL (#11) |
| PAY-2 | Card is charged once, at order placement (no double charge on double click/refresh/back). | FAIL (#10) |
| PAY-3 | Declined payment: no order created, nothing charged, cart unchanged so another card can be tried. | PASS |
| TAX-1 | Product and cart prices exclude sales tax. | PASS (TC-01, TC-12): subtotal and cart prices exclude tax, tax is added in the summary |
| TAX-2 | 8% sales tax added at checkout, calculated on item subtotal **after discount**. | FAIL (#2) |
| TAX-3 | Shipping is not taxed. | PASS |

**Worked example from the Help Center (use as a regression oracle):**
Items $50.00 − WELCOME10 $5.00 = $45.00; Standard shipping $5.99 (subtotal after discount is below $50); Tax 8% × $45.00 = $3.60; **Total $54.59**.

## 2.5 Coupons (CPN)

| Code | Offer | Minimum order (on item subtotal before discount) |
|------|-------|--------------------------------------------------|
| `WELCOME10` | 10% off | none |
| `SAVE20` | $20.00 off | $100.00 |
| `TAKE5` | $5.00 off | $30.00 |

| ID | Rule | Result |
|----|------|--------|
| CPN-1 | One code per order; remove the current code before using another. | PASS |
| CPN-2 | Codes are not case-sensitive (`welcome10` = `WELCOME10`). | PASS |
| CPN-3 | Minimum is evaluated on item subtotal **before** discount, tax and shipping. | PASS |
| CPN-4 | Minimum must still be met **at checkout**: if the subtotal drops below it after removing items, the code is removed from the cart. | FAIL (#7) |
| CPN-5 | Percentage codes apply to items only, not shipping or tax. | PASS for shipping (session 2: WELCOME10 takes 10% off the items and shipping stays $5.99); tax is covered by TAX-2 (#2) |
| CPN-6 | A fixed-amount code can never take the item subtotal below $0.00. | Not tested: the known codes have minimums ($100, $30), so a result below $0.00 cannot be reached |
| CPN-7 | Expired codes cannot be used. | Not tested: no expired code is known and guessing codes was not tried |
| CPN-8 | An invalid/unknown code shows a clear error and changes nothing. *(assumption)* | PASS |
| CPN-9 | Banner promotes `WELCOME10` for "new here" customers. Help lists no first-order restriction. *(assumption: check if reusable on every order)* | PASS, assumption confirmed (session 2): WELCOME10 works again on a second order; the banner says "New here?" but the Help Center has no first-order rule |

## 2.6 Shopping, search and cart (SHOP)

| ID | Rule | Result |
|----|------|--------|
| SHOP-1 | Search matches **every word typed, in any order**, across title, description, tags, shop name and category; case-insensitive. | PASS |
| SHOP-2 | Filters: category, price range, customer rating, availability, deals. Sort: price, newest, rating. | FAIL: price sort uses the original price (report) |
| SHOP-3 | Displayed price is the price for one item; price updates when a costlier option (e.g. bigger size) is chosen. | PASS (session 2): a +$10 option shows "+ $10.00" and the cart unit price is $119 for a $109 item |
| SHOP-4 | Sale items show the original price struck through and the percentage saved **off the original price**. | FAIL (#26): the badge shows -25% for $40 / $50 and -50% for $19.99 / $29.99 |
| SHOP-5 | Out-of-stock items stay visible in the catalog but cannot be added to the cart. | PASS |
| SHOP-6 | Header cart icon shows the **total number of items** (sum of quantities). | FAIL: badge counts lines (report) |
| SHOP-7 | Cannot add more than available stock; clear message. *(assumption)* | PASS (session 2): 6 of 5 in stock is refused with "Only 5 left in stock." Adding the same item again replaces the quantity (S3, report) |
| SHOP-8 | A seller cannot buy their own product. *(observed behaviour; not in Help. Verify message is clear and enforced server-side)* | PASS (session 2): 403 "You can't buy items from your own shop." on a direct request; the UI message was not looked at |

## 2.7 Ratings and reviews (REV)

| ID | Rule | Result |
|----|------|--------|
| REV-1 | Only verified buyers can review, once an order with the item is **delivered**. One review per item. | PASS (session 1): not before delivery, not for a non-buyer, once per item |
| REV-2 | Rating 1–5 stars, title required, text ≥ 10 characters. | FAIL (S3, report): rating 0 and -1 are accepted; 6, 3.5, an empty title and 9 characters are rejected |
| REV-3 | Reviewer shown as first name + last initial, newest first. | PASS (session 1): "Qa T." (first name and last initial), newest first |
| REV-4 | Product rating = average of all its reviews. | PASS for the calculation (session 1): the average of all reviews, 2.7 for 0, 4 and 4, with the invalid 0 from REV-2 in the data; the 5, 4, 4 case (4.3) was not measured |

## 2.8 Account (ACC)

| ID | Rule | Result |
|----|------|--------|
| ACC-1 | Registration needs name, email and password ≥ 8 chars containing a letter and a number. | FAIL (#14) |
| ACC-2 | One account per email address. | FAIL (#15) |
| ACC-3 | Forgot password shows the same message whether or not the email has an account (no account enumeration). | PASS |
| ACC-4 | Addresses are managed under Account → Addresses; exactly one default address, preselected at checkout. | FAIL (S3, report): several addresses can be default (two "Default" badges); "preselected at checkout" was not checked |

## 2.9 Selling (SELL)

| ID | Rule | Result |
|----|------|--------|
| SELL-1 | Anyone with an account can open a shop; one shop per account; shop names are unique. | PASS (session 2): second shop 409 "You already have a shop."; a taken name, also in capitals, 409 |
| SELL-2 | No listing fees; drafts are free and **not visible to shoppers** until published. | FAIL (#25): drafts are hidden everywhere except the keyword search |
| SELL-3 | Marketplace fee = **10% of item sales only** (never shipping or tax), only on the shop's items in an order. | FAIL (#12) |
| SELL-4 | Cancelled orders carry no fee and no earnings. | Not tested on its own: the hub counts a cancelled order in its totals (#13) |
| SELL-5 | Seller hub shows revenue, orders, units sold, average order value, net earnings, and a 7-day sales chart; **cancelled orders are excluded from all of them**. | FAIL (#13) |
| SELL-6 | Seller adds a tracking number when shipping and marks the order delivered. | PASS (session 1): tracking number required (400), deliver before ship refused (409), ship and deliver work |

**Worked example:** $40.00 item → fee $4.00 → seller earns $36.00.

## 2.10 Privacy and data (PRIV) — see also the [GDPR test cases](04-gdpr-test-cases.md)

| ID | Rule | Result |
|----|------|--------|
| PRIV-1 | Data stored: name, email, password (hashed), saved addresses, orders, reviews, shop, marketing preference. | PASS: no password, hash or token in the export |
| PRIV-2 | Shops show only public business info; a user's personal email/home address is never shown to other users. | FAIL: the signed-out product API returns the shop owner's email, name, address and phone (#19); the pages and the catalogue list are clean |
| PRIV-3 | **Access/portability:** "Download my data" returns JSON with profile, addresses, orders and reviews. | FAIL: the file has no addresses and no orders (#20) |
| PRIV-4 | **Rectification:** profile and addresses can be corrected at any time. | PASS: name and address edits are kept, invalid values rejected (a 101-character first name is accepted: not filed) |
| PRIV-5 | **Erasure:** "Delete my account" → cannot sign in afterwards, personal data erased, reviews show "Deleted user", same email can sign up again; anonymised order records may be retained where legally required. | FAIL: the account can still sign in and export, the email cannot register again, reviews keep the author's name and kept orders are not anonymised (#18) |
| PRIV-6 | **Marketing:** opt-in only (box not pre-ticked), can be turned off from the account at any time. | FAIL: the box is pre-ticked on the registration form (#21); turning it on and off works and the export matches |

## 2.11 Cookies (COOK)

| ID | Rule | Result |
|----|------|--------|
| COOK-1 | Essential cookies (session, remembered cookie choice) are always on. | PASS |
| COOK-2 | Optional analytics cookies are set **only** after the user chooses "Accept all". | PASS (no optional cookies seen) |
| COOK-3 | Choice remembered for 12 months; banner not shown again. | FAIL: reject is not remembered (#16) |
| COOK-4 | To change the choice the user must clear cookies. *(Weak point: withdrawing consent should be as easy as giving it. Covered by GDPR-02.)* | FAIL: no control to change the choice (#22) |

## 2.12 Legal pages (LEG)

| ID | Rule | Result |
|----|------|--------|
| LEG-1 | Footer links to Privacy Policy, Cookie Policy (both on `/help`) and Terms of Service (`/terms`). | PASS (privacy and cookie links); terms link leads to a 404. The Privacy Policy lacks controller, contact, legal basis, retention and the right to complain (#23) |
| LEG-2 | `/terms` loads a Terms of Service page. *(Already observed: it errors → candidate S2/P1 issue, also a GDPR transparency concern.)* | FAIL (#1) |

## 2.13 Open questions the Help Center does not answer

Keep this list short and raise each as a question/discrepancy issue only if it affects users.

Each question has what testing showed (sessions in [09](09-exploratory-sessions.md)); the answer itself still has to come from the product owner.

1. Is there a maximum quantity per item or per order? *Only the stock limit was seen ("Only 5 left in stock."); no other maximum was tried.*
2. Are `WELCOME10` and others limited to first orders or a single use per customer? *No: WELCOME10 worked again on a second order of the same buyer.*
3. What happens to an order and the seller's earnings when a seller deletes their account or shop? *The shop cannot be deleted; after the owner deletes the account the listing stays active and the public product data still shows the owner's email and name (#18, #19). Earnings were not checked.*
4. Is a multi-shop cart split into separate orders (SHIP-1 implies per-shop shipping)? How is shipping charged: per shop or per order? *One order with both shops' items and one $5.99 shipping charge.*
5. Is Express shipping available when Standard is free, and does it ever combine with free-shipping rules? *Yes: the checkout offers Standard (Free) next to Express ($9.99); the charged Express price is wrong (#3).*
6. How is tax rounded (per line, per order)? *Not tested.*
7. Can buyers return an item (RET-*) in-app, or is it informational only? *Informational only: no return routes (404) and no button, only a "How returns work" text.*
8. How long are anonymised order records retained after erasure? *The Privacy Policy does not say (#23).*
