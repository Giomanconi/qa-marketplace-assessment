# 4. GDPR Test Cases (9)

A separate, focused list for privacy and data-protection compliance. Each case maps to a GDPR principle or data-subject right and to the site's own promises (Privacy Policy and Cookie Policy on `/help`). This is a QA review, not legal advice: a failure is reported as a **non-compliance risk** for product/legal to confirm.

**Tools:** browser DevTools only (Application → Cookies/Storage, Network, Console).
**Accounts:** fictitious data only. Use `buyer-a`, `seller-b`, and a dedicated `deleter-c` for the erasure test (run it last, after exporting data).

## Overview

| ID | Title | GDPR basis | Severity if it fails | Priority | Requirements |
|----|-------|-----------|----------------------|----------|--------------|
| GDPR-01 | No optional cookies or trackers before consent | Consent, ePrivacy | S1 Critical | P1 | COOK-1, COOK-2 |
| GDPR-02 | Cookie choice: reject option and ability to change it | Art. 7 (withdrawal as easy as giving) | S2 Major | P2 | COOK-3, COOK-4 |
| GDPR-03 | Marketing consent is opt-in, separate and persistent | Arts. 6–7 | S2 Major | P2 | PRIV-6 |
| GDPR-04 | Data export is complete and limited to the requester | Art. 15, 20 | S1 Critical | P1 | PRIV-1, PRIV-3 |
| GDPR-05 | Rectification: edits persist and are reflected in the export | Art. 16 | S3 Minor | P3 | PRIV-4 |
| GDPR-06 | Account erasure works end to end | Art. 17 | S1 Critical | P1 | PRIV-5 |
| GDPR-07 | No personal data exposed to other users or in URLs | Art. 5, 32 | S1 Critical | P1 | PRIV-2, REV-3 |
| GDPR-08 | Access control: no access to other users' data; no account enumeration | Art. 32 | S1 Critical | P1 | ACC-3 |
| GDPR-09 | Legal transparency: Privacy Policy, Cookie Policy and Terms are reachable and accurate | Arts. 12–14 | S2 Major | P1 | LEG-1, LEG-2 |

Suggested order: GDPR-01 → 02 → 03 → 09 → 07 → 08 → 04 → 05 → 06 (destructive last).

---

## GDPR-01. No optional cookies or trackers before consent
**Severity if it fails:** S1 · **Priority:** P1 · **Requirements:** COOK-1, COOK-2

**Preconditions:** fresh browser profile or incognito, no cookies for the site.

**Steps**
1. Open the home page; **do not interact** with the cookie banner.
2. DevTools → Application: list cookies, localStorage, sessionStorage. Network: list all requests and domains.
3. Navigate to two more pages without choosing.
4. Repeat after choosing **Accept all**, and in a fresh profile after choosing the restrictive option (if one exists).

**Expected**
- Before choice: only essential cookies (session/consent) and first-party requests. No analytics cookies or storage keys, no third-party analytics requests.
- After **Accept all**: analytics cookies/requests appear (and only then).
- After the restrictive choice: still no analytics.

**Evidence:** screenshots of Cookies and Network before/after.

---

## GDPR-02. Cookie choice: reject option and ability to change it
**Severity if it fails:** S2 · **Priority:** P2 · **Requirements:** COOK-3, COOK-4

**Steps**
1. Inspect the banner: is there a **Reject / Essential only** button as prominent as **Accept all**? Count clicks for each.
2. After choosing, reload: banner must not reappear (12 months, check cookie expiry).
3. Look for a way to change the choice (footer link, settings). The Help Center says to "clear your cookies" instead.

**Expected**
- Rejecting is as easy as accepting (one click, equal prominence, no pre-selected optional toggle).
- Choice persists ~12 months.
- Changing/withdrawing consent is possible without manually clearing browser cookies. If not → non-compliance risk (withdrawal must be as easy as giving consent).

---

## GDPR-03. Marketing consent is opt-in, separate and persistent
**Severity if it fails:** S2 · **Priority:** P2 · **Requirements:** PRIV-6

**Steps**
1. Open the registration form (and checkout, if it has a marketing option): is the marketing box **unticked** by default and **separate** from terms acceptance?
2. Register once **without** ticking, once **with** ticking.
3. In Account, change the preference; reload; re-open. Download data and compare the stored value.

**Expected**
- Not pre-ticked, not bundled into mandatory acceptance.
- The preference saved matches what was chosen and **persists** after reload; it can be turned off at any time; the export shows the same value.

---

## GDPR-04. Data export is complete and limited to the requester
**Severity if it fails:** S1 · **Priority:** P1 · **Requirements:** PRIV-1, PRIV-3

**Preconditions:** `buyer-a` with a profile, 2 addresses, 2 orders, 1 review, marketing preference set.

**Steps**
1. Account → Privacy & data → **Download my data**.
2. Check the file opens as valid JSON.
3. Compare the content with the UI.

**Expected**
- Contains profile, addresses, orders and reviews (and the marketing preference, as stored data per the policy).
- Matches what the UI shows, with correct values and no missing records.
- Contains **no password/hash, tokens or other users' personal data** (e.g. no seller or buyer emails/addresses).
- Download works for authenticated user only (open the URL signed out → denied).

---

## GDPR-05. Rectification: edits persist and are reflected in the export
**Severity if it fails:** S3 · **Priority:** P3 · **Requirements:** PRIV-4

**Steps**
1. Edit name and an address; save; reload.
2. Check the order history/addresses and a fresh export.

**Expected:** changes saved and shown everywhere they should be; invalid data is rejected with a clear message; the export reflects the corrected values.

---

## GDPR-06. Account erasure works end to end
**Severity if it fails:** S1 · **Priority:** P1 · **Requirements:** PRIV-5

**Preconditions:** `deleter-c` with a review on a product, a delivered order, saved address. Export data first.

**Steps**
1. Account → Privacy & data → **Delete my account**; confirm the dialog wording clearly explains the consequence.
2. Try to sign in again; reuse the old session in another tab/request.
3. View the product page where the review was posted.
4. Check seller side for the order (as `seller-b`) and any public page containing the user.
5. Register again using the **same email**.

**Expected**
- Sign-in impossible; old session invalidated.
- Personal data erased; the review shows **"Deleted user"**; order records kept only in **anonymised** form (no name, address, email).
- The same email can create a new account (and the new account is empty).
- If the user also had a shop: behaviour is defined and consistent (note if the Help Center is silent: question issue).

---

## GDPR-07. No personal data exposed to other users or in URLs
**Severity if it fails:** S1 · **Priority:** P1 · **Requirements:** PRIV-2, REV-3

**Steps**
1. As a logged-out visitor, open a shop page, product pages and reviews; in DevTools → Network inspect the JSON/API responses for the seller, shop and review objects.
2. Search for fields such as `email`, `address`, `phone`, `lastName`, `passwordHash`.
3. As `seller-b`, open an order and note what buyer data is shown (only what is necessary to fulfil, e.g. delivery address, not email).
4. Review URLs/query strings across the app for personal data.

**Expected**
- Shops show only public business information (PRIV-2); reviews show **first name + last initial** only (REV-3) in UI **and** in the response payload.
- No personal data in URLs; no hash/secret in any response.

---

## GDPR-08. Access control and account enumeration
**Severity if it fails:** S1 · **Priority:** P1 · **Requirements:** ACC-3

**Steps**
1. As `buyer-a`, copy the request for one of your orders, addresses and the data export. Sign in as `buyer-b` and request `buyer-a`'s order/address IDs (change the ID in the URL or request).
2. Open order and account URLs while signed out.
3. Forgot password with a **registered** and an **unregistered** email: compare message text, status code, response time.
4. Check that the site is served over HTTPS only.

**Expected**
- Other users' orders/addresses/exports return denied/not found (no data leak).
- Signed-out access redirects to sign-in.
- Forgot-password gives the **identical** message (and no distinguishing status or timing) for both emails (ACC-3).
- HTTP redirects to HTTPS.

---

## GDPR-09. Legal transparency: policies and Terms are reachable and accurate
**Severity if it fails:** S2 · **Priority:** P1 · **Requirements:** LEG-1, LEG-2

**Steps**
1. Click **Privacy Policy**, **Cookie Policy** and **Terms of Service** in the footer (and registration/checkout links if present).
2. For `/terms`, note status code, what is shown, console and network errors.
3. Read the Privacy Policy: does it state controller/contact, purposes, legal basis, retention (including how long anonymised orders are kept), rights, and the right to complain to a supervisory authority?
4. Compare the documented data (PRIV-1) and cookie description with what the app actually stores/sets.

**Expected**
- All three legal documents load and are readable. A broken Terms page is a defect in itself and prevents users from seeing the terms they accept.
- Policy content is accurate and complete; gaps (no contact point, retention period, legal basis) are reported as a **discrepancy** issue.

---

## Results log

Executed 2026-11-05 and 2026-11-06 (UTC): manual exploration with throwaway accounts first, then one Playwright spec per case in `tests/app/`. "PASS" means every check of the case passed. An order reaches Delivered through the seller (`POST /api/seller/orders/{id}/deliver`), so review checks run on real reviews. Not run: forgot-password timing (GDPR-08 compares status and body only), and the policy content has no automated check.

| ID | Spec | Result | Issue |
|----|------|--------|-------|
| GDPR-01 | `functional/gdpr-01-no-trackers-before-consent.spec.ts` | PARTIAL: before a choice there is no cookie, storage key or third-party request (PASS); Accept all stores only `mp_consent` (PASS); Reject non-essential stores nothing and the banner returns on reload (FAIL). No analytics cookies or requests at any point. | #16 |
| GDPR-02 | `functional/gdpr-02-cookie-choice.spec.ts` | PARTIAL: Reject and Accept are side by side, one click each, nothing pre-selected, and the choice cookie lasts 365 days (PASS); there is no way to change the choice (FAIL). | #22 |
| GDPR-03 | `functional/gdpr-03-marketing-consent.spec.ts` | PARTIAL: the Terms box is separate and unticked, the form stores the choice it is sent with (ticked or unticked), and the choice round trip (account to export) works (PASS); the marketing box is pre-ticked on the registration form (FAIL). | #21 |
| GDPR-04 | `api/gdpr-04-data-export.spec.ts` | PARTIAL: with a delivered order and a review on the account, the profile, marketing choice and review are exported, with no password, hash, token or seller email (PASS); orders and saved addresses are missing from the file (FAIL). | #20 |
| GDPR-05 | `api/gdpr-05-rectification.spec.ts` | PASS: a corrected name shows in the account and the export; a corrected city shows in the address book; an empty name and an invalid ZIP are rejected with a field message. Not filed: a 101-character first name is accepted; the export does not list addresses (#20). | |
| GDPR-06 | `api/gdpr-06-account-erasure.spec.ts` | FAIL: the old session ends (PASS); the deleted account can still sign in, its data can still be exported, its email cannot register again, its reviews keep the author's name instead of "Deleted user", and the seller still sees the name and address on kept orders. The UI shows the same: the dialog says "You won't be able to sign in again", yet sign-in works. A shop owner who deletes the account keeps the listing live with the email in the public product data (seen once, not automated). | #18 |
| GDPR-07 | `api/gdpr-07-personal-data-exposure.spec.ts`, `functional/gdpr-07-no-personal-data-in-urls.spec.ts` | FAIL: the shop page and the catalogue list show only public shop data, reviews show first name and last initial, a seller sees the delivery address but not the buyer's email or phone, and no requested URL holds the email or name on the sign-in and signed-in pages (PASS); the signed-out product API returns the shop owner's email, name, saved address and phone (FAIL). | #19 |
| GDPR-08 | `api/gdpr-08-access-control.spec.ts` | PARTIAL: another buyer cannot cancel or view an order; the export holds only the requester; signed-out requests get nothing; forgot-password answers the same for known and unknown emails; plain HTTP redirects to HTTPS; the session cookie is HttpOnly and SameSite Lax. Not filed (S3): the session cookie has no `Secure` flag (red test, report only). Registration answers 409 for an existing email. | |
| GDPR-09 | `functional/gdpr-09-terms-page.spec.ts` | FAIL: `/terms` returns 404 (expected failure with `test.fail()`); Privacy and Cookie links open the right `/help` sections. Read by hand: the Privacy Policy has no controller, contact, legal basis, retention period or right to complain (not automated). | #1, #23 |

## Extra spot checks (only if time remains; no separate test case)

- Cookie flags on the session cookie (`HttpOnly`, `Secure`, `SameSite`).
- List of all third-party domains contacted and whether each is disclosed in the policy.
- Registration/checkout ask only for necessary fields (data minimisation).
- Error pages and console messages do not leak stack traces, internal paths or personal data.
