# 5. Exploratory Test Charters

Session-based testing: each charter is a time-boxed mission (60–90 min). Take notes while testing and file findings straight away (evidence while it's fresh), then consolidate duplicates at triage.

**What was run:** two sessions, on C7 (reviews and returns, with part of C3) and on C4 and C5 (seller and cart rules), plus a manual small-screen look for C9. Their notes are in [09](09-exploratory-sessions.md). C1 and C2 are covered by the automated test cases, and C6 and C8 by TC-08, GDPR-08 and GDPR-09. The rest of C3 and the remaining parts of C9 were not run.

**Charter format:** *Explore* [area] *with* [data/tools] *to discover* [risk].

**Heuristics to keep in mind:** boundaries, empty/max/negative inputs, order of operations, back/refresh/double-click, two tabs, two users, session expiry, slow network, mobile viewport, keyboard-only, and "what does the Help Center say vs. what does the UI do?"

## Priority order

| # | Charter | Priority | Linked requirements |
|---|---------|----------|---------------------|
| C1 | Money: coupons, shipping, tax, totals | Highest | SHIP, TAX, CPN, PAY |
| C2 | Privacy and data rights | Highest | PRIV, COOK, GDPR test cases |
| C3 | Checkout and orders (incl. cancel and status flow) | High | PAY, ORD, RET, SHIP |
| C4 | Seller flow and fees | High | SELL |
| C5 | Catalog, search, filters, cart | High | SHOP |
| C6 | Accounts, auth and authorisation | High | ACC, GDPR F |
| C7 | Reviews and ratings | Medium | REV |
| C8 | Legal and static pages, navigation, errors | Medium | LEG |
| C9 | Cross-cutting: responsive, accessibility, console/network | Medium | — |

---

## C1. Money: coupons, shipping, tax, totals

**Explore** the cart and checkout totals **with** the three coupons, boundary subtotals and DevTools **to discover** wrong amounts, rule violations or inconsistent figures between cart, checkout and order confirmation.

Ideas:
- Reproduce the Help Center worked example ($50.00, `WELCOME10`, standard shipping): expected **$54.59** total (CPN, TAX, SHIP).
- Free-shipping boundary **after discount**: items $49.99 / $50.00 / $50.01 with and without a coupon. Example: $55.00 with `WELCOME10` → $49.50 after discount → shipping must be charged (SHIP-3).
- Rounding: subtotals that produce fractions of cents (e.g. 10% of $55.56 = $5.556), and 8% tax rounding (TAX-2).
- `SAVE20` at $99.99 / $100.00 / $100.01 and `TAKE5` at $29.99 / $30.00 (CPN-3). The minimum is on the **pre-discount** subtotal.
- Apply `SAVE20` at $100, then remove items so the subtotal drops below $100: code must be removed (CPN-4). Check also at checkout.
- Lowercase/mixed-case/spaces in the code (CPN-2); unknown code; expired code; two codes (CPN-1).
- Percentage code must not reduce shipping or tax (CPN-5); express shipping unaffected by order value (SHIP-5).
- Tax must be computed on the discounted subtotal and not on shipping (TAX-2, TAX-3).
- Compare totals shown in cart, checkout summary, confirmation page, order detail and email (if any).
- Change quantity after applying a code; refresh; open in a second tab.

## C2. Privacy and data rights

**Explore** the cookie banner, Account → Privacy & data and public pages **with** DevTools and a throwaway account **to discover** consent, access, erasure and exposure problems.

Ideas: follow the [GDPR test cases](04-gdpr-test-cases.md). Key scenarios: cookies before choice; "Accept all" vs. restrictive path; export content vs. UI vs. policy; delete account then try to sign in, re-register, and check reviews/orders/shop; request tampering with another user's IDs.

## C3. Checkout and orders

**Explore** placing, tracking, cancelling and returning orders **with** valid, declined and edge-case cards (use only official test/dummy numbers the site accepts) **to discover** double charging, wrong state transitions and refund errors.

Ideas:
- Card brands (Visa, MC, Amex, Discover) accepted, other brands rejected (PAY-1); declined card keeps cart and creates no order (PAY-3).
- Double-click "Place order", refresh after submit, browser back after confirmation (PAY-2).
- Default address preselected (ACC-4); shipping to a non-default address; delete the default address then check out.
- Order list sort order and detail content (ORD-1, ORD-2).
- Cancel: allowed only in Processing (ORD-3). Try after Shipped/Delivered, and try forcing it via URL or request (server-side enforcement). Check refund equals **full total** including shipping and tax, and stock restored (ORD-4).
- After delivery: "Return eligible until" equals delivery date + 30 days (RET-1, RET-2). Check business-day estimates (SHIP-6).
- Multi-shop cart: how orders/shipping are split (open question 4).

## C4. Seller flow and fees

**Explore** shop creation, listings and order handling **with** two accounts (seller and buyer) **to discover** wrong fees/earnings, visibility leaks and broken state handling.

Ideas:
- Open shop: unique name (case-insensitive duplicates?), one shop per account (SELL-1).
- Draft vs published visibility to a logged-out visitor, including direct URL and search (SELL-2).
- Seller cannot buy own product (SHOP-8): message clarity and server-side enforcement.
- Fee: 10% of item sales only; verify on an order with shipping + tax + coupon (SELL-3). Worked example: $40.00 → $4.00 fee → $36.00 earnings.
- Order with items from two shops: fee only on each shop's items.
- Cancel an order: fee and earnings removed; Seller hub revenue, orders, units, AOV, net and 7-day chart exclude it (SELL-4, SELL-5).
- Shipping: tracking number required/validated; mark delivered; buyer sees updates (SELL-6, SHIP-7).
- Edit price/stock after items are in someone's cart.

## C5. Catalog, search, filters, cart

**Explore** product discovery and the cart **with** varied queries and filter combinations **to discover** wrong results, wrong prices and count mismatches.

Ideas:
- Multi-word search in any order across title, description, tags, shop, category; case-insensitivity; special characters, very long input, empty search (SHOP-1).
- Filters: category, price range (min > max, equal values), rating, availability, deals; combine with sort (SHOP-2). Check result counts and pagination.
- Sale items: struck-through original and the **percentage off the original** (SHOP-4). Compute it.
- Option that costs extra (e.g. size): price updates in listing/cart/checkout (SHOP-3).
- Out-of-stock: visible but cannot add (SHOP-5); stock limit on quantity (SHOP-7).
- Header cart badge equals the **sum of quantities** (SHOP-6) after add, change, remove, reload, new tab, sign-in/sign-out.
- Cart persistence across sessions and login.

## C6. Accounts, auth and authorisation

**Explore** registration, login, password reset and access control **with** two accounts **to discover** validation gaps and authorisation bypasses.

Ideas:
- Password rules: 7 vs. 8 characters; letters only; digits only; spaces; very long (ACC-1). Email format edge cases, duplicates with different case (ACC-2).
- Forgot password: identical message for existing and unknown emails, also identical status/timing (ACC-3).
- Session handling: logout then back button; session in two tabs; direct access to `/account`, `/orders`, `/sell` signed out.
- Authorisation: open another user's order/address/export by changing IDs (GDPR F4).
- Profile edit validation (empty name, HTML/script in name: check it renders escaped everywhere, including reviews and shop name).

## C7. Reviews and ratings

**Explore** the review form and rating display **with** buyers who have and have not received an item **to discover** eligibility and calculation errors.

Ideas: review before delivery (blocked), after delivery (allowed), second review of the same item (blocked); rating 0/6 via request tampering; title empty; text 9 vs. 10 characters (REV-2); name display (REV-3); average recalculation including rounding (REV-4); order of reviews.

## C8. Legal and static pages, navigation, errors

**Explore** all footer/header links and error handling **to discover** broken pages and leaks.

Ideas: `/terms` (known to error: capture status, console, network, page content); privacy and cookie policy anchors; 404 page; unknown routes; trailing slashes; error pages not leaking technical detail (GDPR F10).

## C9. Cross-cutting

**Explore** the whole app **with** DevTools, Lighthouse and keyboard only **to discover** layout, accessibility and error-handling defects.

Ideas: 375/768/1440 px layouts; keyboard navigation, focus order and visible focus; form labels and error announcements; colour contrast; alt text; console errors and failed requests on each main page; title/meta per page.

---

## Session log template

Copy one block per session into the running file [09-exploratory-sessions.md](09-exploratory-sessions.md).

```
### Session <n>: <charter> — <date>, <start>–<end>
Tester:
Build/URL:
Accounts/data used:
Setup notes:

Observations (time-stamped):
- 00:05 ...
- 00:12 ...

Bugs found → issue links:
Questions / assumptions:
Ideas for later sessions:
Coverage notes (what was NOT tested):
```
