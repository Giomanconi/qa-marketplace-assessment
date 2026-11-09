# 9. Exploratory session log

Two time-boxed sessions on the rules that had no result yet (reviews, returns, seller and cart rules). They were run on 2026-11-06 (UTC) with throwaway accounts (see [08](08-test-accounts.md)), small Node scripts against the API, and a Playwright browser session for the pages. The scripts are not part of the repo; the findings and their evidence are.

Charter format and the other charters are in [05](05-exploratory-charters.md). Charters C1 and C2 are covered by the automated test cases; C3 (checkout and orders) in part, C6, C8 and C9 were not run as sessions.

## Session 1: reviews and returns (charter C7, part of C3)

**Explore** reviews, delivery and returns **with** a seller and three buyers, one delivered order each **to discover** eligibility, validation and calculation errors.

Setup: seller with one product ($12.50); buyers A, B and C order it; the seller ships (tracking number) and delivers through the API.

| Rule | What was done | Result |
|---|---|---|
| REV-1 | Review before delivery and while Shipped; by a user who never bought; a second review of the same item | PASS: 403 "Only buyers who received this item can review it." in the first three cases; 409 "You've already reviewed this item." for the second review |
| REV-2 | One product per invalid input, so a "already reviewed" answer cannot hide the result: rating 6, 3.5, missing, 0, -1; empty title; 9-character text; 10-character text (control) | FAIL (S3): 6, 3.5 and missing are rejected with "Choose a rating from 1 to 5 stars."; empty title and 9 characters are rejected; the 10-character review is accepted. **Rating 0 and -1 are accepted (201)** and count in the average. Not filed (S3: found with a direct request; the review form in the UI was not tried): see "Observations not filed" below |
| REV-3 | Three reviews on one product | PASS: shown as "Qa T." (first name and last initial), newest first |
| REV-4 | Reviews of 0 (accepted by the bug above), 4 and 4 | PASS for the calculation: the average is 2.7 for three reviews (0+4+4)/3; the product page shows "2.7 (3 reviews)". The 4.3 expected for 5, 4 and 4 was not measured because the invalid 0 was in the data |
| SHIP-7, SELL-6 | Ship without and with an empty tracking number; deliver before shipping; ship; deliver | PASS: tracking number is required (400 "Enter a tracking number."), deliver before ship is 409, the status goes Processing, Shipped (tracking number on the order), Delivered; the order timeline records each step |
| ORD-1, ORD-2 | Two orders by one buyer; the order detail | PASS: the list is newest first; the order has items, totals, address, payment, tracking number and a timeline |
| SHIP-6 | Order placed on Friday 2026-11-06 (UTC), Standard | PASS on the confirmation page: "Estimated delivery 11/13/2026, Standard, 5 business days" (Monday to Friday, starting the next day). **FAIL on the product page**: it says Standard "arrives by Wednesday, Nov 11" and Express "arrives by Sunday, Nov 8", counting calendar days and promising a Sunday. Not filed (S3), see "Observations not filed" below |
| RET-1, RET-2 | The delivered order's page | PASS: "Return eligible until" is 30 days after delivery (delivered 6 Nov, eligible until 6 Dec). Observation: the order page writes dates day first ("06/12/2026"), while the confirmation page and the account page write them month first ("11/13/2026", "11/06/2026"); see "Observations not filed" below |
| RET-1, RET-5 and open question 7 | Looked for a way to start a return: routes `/api/orders/{id}/return`, `/returns`, `/api/returns` (all 404) and the order page | There is no return flow in the app: the page has a "How returns work" text and no button. Returns are informational only |

**Bugs found → issue links:** none filed. Observations not filed (listed below): rating 0 and -1 accepted (S3); the product page delivery estimate counts calendar days (S3).

**Not tested:** reviews through the UI form (the stars cannot be 0 there, not tried); rating shown with one decimal in listings (not checked); the second page of reviews; a return after the 30-day window (the app has no return flow); RET-3 and RET-4 (policy statements, no flow to test).

## Session 2: seller and cart rules (charters C4 and C5)

**Explore** shops, drafts, stock, sale prices, options and addresses **with** two sellers and buyers **to discover** visibility, limit and price errors.

| Rule | What was done | Result |
|---|---|---|
| SELL-1 | A second shop for the same user; the same name for another user; the same name in capitals | PASS: 409 "You already have a shop."; 409 "That shop name is already taken." in both name cases |
| SELL-2 | A draft product: by id (API and page), as another buyer, in a cart, in new arrivals, in search | **FAIL:** hidden everywhere except the keyword search, which lists it with its price. Filed as [#25](https://github.com/Giomanconi/qa-marketplace-assessment/issues/25) |
| SHOP-8 | The seller adds a product from their own shop | PASS: 403 "You can't buy items from your own shop." (server side, direct request; the UI message was not looked at) |
| SHOP-7 | Stock 5: add 6; add 5; stock 3: add 3 then 1 more, then 3 more | PASS for the limit: 409 "Only 5 left in stock." for 6. Observation: adding the same product again **replaces** the quantity (3, then 1 more gives 1, not 4) in the API; in the UI a second click on "Add to cart" also leaves the quantity at 1. Not filed (S3, nothing in the Help Center defines it) |
| SHOP-3 | The demo keyboard with a "Blue switches" option at +$10 | PASS: the page shows "+ $10.00"; the cart unit price is $119 for a $109 item; the sold-out option is refused with "This item is out of stock." |
| SHOP-4 | Sale items $40 / $50 and $19.99 / $29.99 | **FAIL:** the badge shows -25% and -50% instead of -20% and -33%. Filed as [#26](https://github.com/Giomanconi/qa-marketplace-assessment/issues/26) |
| Cart persistence | Sign out, sign in again | PASS: the cart still holds the item |
| CPN-9 | WELCOME10 on two orders of the same buyer | The code works again on the second order. The banner says "New here?", the Help Center lists no first-order rule, so this is as documented; not a defect |
| SHIP-1 and open question 4 | A cart with items from two shops | One order holds both shops' items and charges shipping once ($5.99). The Help Center says each order ships from the shop that sells the item; it does not say how a mixed cart is split. Left as an open question |
| ACC-4 | A second and a third address saved with "default" | **FAIL (S3, not filed):** all of them stay default; the Addresses page shows two "Default" badges and has no "make default" control. The rule says exactly one |

**Bugs found → issue links:** [#25](https://github.com/Giomanconi/qa-marketplace-assessment/issues/25), [#26](https://github.com/Giomanconi/qa-marketplace-assessment/issues/26). Observations not filed (listed below): quantity replaced when adding again (S3), several default addresses (S3).

**Not tested:** the UI message for a seller buying their own product; a seller order list for a mixed cart; editing price or stock while the item is in a cart; the 7-day chart in the Seller hub; pagination and the rating filter; a draft after being published.

## Small-screen look (manual part of TC-10)

Run 2026-11-06 (UTC) with one throwaway buyer holding one item in the cart (a catalogue item named "QA Repro Item" plus 14 characters). Full-page screenshots at 375 x 812 and 768 x 1024 of the home page, catalogue, product, cart, checkout, account and Privacy & data pages, each opened and looked at; then a fill of the checkout form and 14 presses of Tab at 375 px.

| Page | 375 px (phone) | 768 px (tablet) |
|---|---|---|
| Home | fits, nothing clipped | fits |
| Catalogue | 21 px wider than the screen once the pagination row has loaded: the row is cut at both ends ("Previous" loses its arrow). A search with few results has no pagination and fits | fits |
| Product | fits | fits |
| Cart | **56 px wider than the screen**: the item card and the summary run past the header and the green banner | fits |
| Checkout | **23 px wider than the screen**: all four cards run past the right edge; the form, the delivery options and the Place order button are usable | fits, two-column fields look right |
| Account and Privacy & data | fit; the tab strip is cut after the third tab (the fourth, Privacy & data, shows half) | fits |

Keyboard: on the checkout form Tab moves from the logo to the search box, account, cart and then through every field in order, and each has a visible focus (a green ring on inputs, the browser outline on links). An error appears under an empty required field when it loses focus.

Also seen: the checkout heading reads "Shiping address" (typo, S4); the product page promises "Express delivery: arrives by Sunday, Nov 8" (see Session 1, SHIP-6). Both are report-only observations; there are no issues for these.

Not covered: colour contrast, screen reader labels, landscape orientation, zoomed text and the seller pages at 375 px.

Two limits of the automated TC-10 spec found by comparing it with this look:
- The catalogue check first passed because it measured before the pagination row had loaded. It now waits for that row and is red at 375 px (re-measured 2026-11-06: 21 px on `/products` and `/products?page=2`, 0 px on a search without pagination).
- The checkout check uses a short product title and passes at 375 px; with a 28-character title the page is 23 px too wide, so that check can miss it.

## What was not run as a session

C1 (money) and C2 (privacy) are covered by the test cases TC-01 to TC-13 and GDPR-01 to GDPR-09. C3 (checkout and orders) is covered by TC-01 to TC-03 and part of Session 1. C6 (accounts and authorisation) is covered by TC-08 and GDPR-08. C8 (legal pages, errors) is covered by GDPR-09, and C9 (cross-cutting) by TC-10 and its manual part. None of these ran as a timed session.

## Observations not filed

S3 and S4 findings kept out of the issue list. The test report gives only their count.

| Severity | Observation | Automated test |
|---|---|---|
| S3 | The session cookie has no `Secure` flag (HTTP is redirected to HTTPS, so exposure is limited). | `gdpr-08-access-control.spec.ts` (red) |
| S3 | At 375 px the cart is 56 px wider than the screen and the checkout 23 px wider (with a 28-character product title); the catalogue is 21 px wider once its pagination row has loaded (the row is clipped). Nothing is unreachable. | `tc-10-responsive-layout.spec.ts` (cart and catalogue red at 375 px; the checkout check uses a short title and passes) |
| S3 | Price sort uses the original price, so sale items appear out of order (SHOP-2). | `tc-07-search-filters.spec.ts` (red) |
| S3 | A review rating of 0 or -1 is accepted by the API and counts in the average (REV-2). | none |
| S3 | The product page counts calendar days for delivery: Express "arrives by Sunday" on a Friday, Standard on Wednesday; the confirmation page counts business days correctly (SHIP-6, Standard checked; Express and the checkout page not checked). | none |
| S3 | After a successful payment, the server sometimes never answers `/orders/<id>/confirmation`: the order exists, but checkout stays on "Processing payment…" (or a reload times out), so a customer could pay again. The TC-03 refresh test failed 5 of 23 runs on 2026-11-07, and 2 of those were traced to this request; 10 separately timed payments all confirmed within 16 s. It may be the host's deliberate failures, so it is rated S3 and not filed; raise it if it also happens on a stable host. | `tc-03-declined-card-double-submit.spec.ts` (intermittent) |
| S3 | Several addresses can be marked default; the Addresses page shows two "Default" badges (ACC-4). | none |
| S3 | Adding a product that is already in the cart replaces its quantity instead of adding to it, in the API and the UI. | none |
| S3 | Dates are written day first on the order page ("12/11/2026" for 12 November) and month first on the confirmation and account pages ("11/12/2026"), so the same date reads differently. | none |
| S4 | The header cart badge counts cart lines, not total quantity (SHOP-6). | `tc-09-cart-badge.spec.ts` (red) |
| S4 | The order confirmation prints amounts without two decimals (`$40`, `$3.2`) while other pages use `$40.00`. | none |
| S4 | The checkout heading reads "Shiping address". | none |
| S4 | A 101-character first name is accepted in the profile; the Erasure tile says "Ask us to delete" but the page has a self-service button. | none |

## What works

- Coupon rules: minimums at $29.99/$30 and $99.99/$100, case-insensitive codes, one code per order, unknown code message, reuse on a second order; a percentage code leaves shipping unchanged.
- Free-shipping threshold below $50 and on the discounted subtotal; shipping is not counted toward it (SHIP-4); shipping is not taxed (TAX-3).
- A declined card creates no order and keeps the cart; refreshing the confirmation does not duplicate the order.
- Order flow: Processing, Shipped (tracking number required), Delivered, each in the order timeline; the order list is newest first; the order detail has items, totals, address, payment, tracking number and history; "Return eligible until" is 30 days after delivery.
- Reviews: only for items that were delivered, once per item, shown as first name and last initial, newest first; the average includes every review; ratings of 6 or 3.5, an empty title and a 9-character text are rejected.
- Seller side: one shop per account, shop names are unique (also in capitals), drafts are hidden by id, page and cart, and a seller cannot buy from their own shop.
- Cart and catalogue: out-of-stock items are listed but cannot be added to the cart, in the UI or by a direct request; the stock limit is enforced with a clear message; an option that costs extra updates the price; the cart survives signing out and in; search ignores word order and case; odd search inputs do not break the page.
- Access control: another buyer cannot cancel or view an order, the data export holds only the requester's data, signed-out requests get no data, forgot-password answers are identical for known and unknown emails, plain HTTP is redirected to HTTPS, the session cookie is HttpOnly and SameSite Lax.
- Cookies: before a choice there is no cookie, storage key or third-party request; no analytics cookies or requests at any point; Reject and Accept sit side by side, one click each; the choice cookie lasts 365 days.
- Privacy data: the registration form stores the marketing choice it is sent with, consent can be turned on and off and the export matches; reviews show first name and last initial; no URL holds the email or name; the export holds no password, hash or token; shop pages and the catalogue list show only public shop data; a seller sees the delivery address of an order but not the buyer's email or phone.
- Layout: no sideways scroll for the home page, product page, account pages and tablet width on every page tested; keyboard focus is visible on the checkout form.

## Limits of this cycle

- **Not checked:** overlap and clipped text beyond what the small-screen look found, colour contrast, screen readers, forms in use at small sizes beyond the checkout; forgot-password timing (status and body match); charters C3 (beyond reviews and returns) and the remaining parts of C9. The accessibility and security checks of the scope are light: keyboard focus, cookie flags, HTTPS redirect and access control only; no penetration testing, as planned.
- **Not tested rules:** RET-3 and RET-4 (policy statements, the app has no return flow), CPN-6 and CPN-7 (no reachable case or expired code known), and SELL-4 on its own; how tax is rounded (open question 6) was not tried either. The Privacy Policy content was read by hand, not automated.
- **Erasure is a soft delete.** The deleted test accounts and their emails stay in the app, so test accounts cannot be removed for good; they are logged in [08](08-test-accounts.md). Erasure by a shop owner was seen once and is not automated: the listing stays live with the email in the public data, and the Help Center does not say what should happen.
- **Registration reveals existing emails** (409 for a taken address, and the profile edit says "Another account already uses this email"); the Help Center only requires a neutral message for forgot-password (ACC-3), which passes.
- **Test data left in the sandbox.** The suite deletes what it creates, but the app only soft-deletes accounts and has no shop delete, so the seller shops of the test runs and a few exploration products (including one draft that shows in search, #25) stay in the catalogue; see [08](08-test-accounts.md).
- Expected values come from the Help Center and its worked examples, not from the app's own answers.
- GDPR findings are reported as non-compliance risks for product and legal to confirm; this is a QA review, not legal advice.

## Run stability

Three full runs without retries before the TC-10 catalogue change, one of them from a fresh clone with only `APP_URL`: 100 pass / 42 fail, 98 / 44, and 99 / 43; the seed step was skipped. 42 failures were the same in all three.

**Final runs on the finished code (2026-11-07), 143 tests with the two setup steps, no retries.** The local run behind the test report: 96 pass / 46 fail, 1 skipped. On GitHub: 96 pass / 46 fail, 1 skipped. Each has the 44 known failures plus 2 others, and those 2 differ: TC-02 cancel and TC-03 refresh locally, a GDPR-05 setup call and a TC-07 page load on GitHub. An earlier GitHub run, before the report change, had only the 44. TC-02, GDPR-05 and TC-07 passed twice on rerun; TC-03 refresh is the observation above. The local API suite on its own (12 failures) and the smoke set (green, locally and on GitHub) matched as well.

The earlier run behind the first report (2026-11-06, 22:43 UTC, 143 tests with the two setup steps): 98 pass / 44 fail, 1 skipped (the seed step). Its failures match the previous run except for one addition, the TC-10 catalogue check at 375 px, as expected after that change. The double-click test failed in this run too.

The QA host is slow and fails requests on purpose; a red test caused by a host failure shows up as a one-off and passes on rerun. Differences across the full runs: some tests timed out on the host in one run only (the signed-out access check in gdpr-08, "Accept all" in gdpr-01, TC-05 case c) and passed when rerun; the double-click test (#10) failed in two of the three latest runs, which fits a race (the double order happened in 5 of 6 manual tries); the low-to-high price sort (SHOP-2) only fails when a sale item falls inside the price range of the live catalogue, for example a $10 item with a $20 original price sorted last.
