/**
 * Privacy (GDPR) test data. All values are synthetic and were checked against
 * the live app on 2026-11-06.
 */

/** GDPR-02: the consent cookie lasts about 12 months; allow a few days of slack */
export const CONSENT_COOKIE_MIN_DAYS = 360;

/** GDPR-04: words that must never appear in the data export (no password, hash or token) */
export const SECRET_WORDS = ['password', 'hash', 'token'] as const;

/** GDPR-05: corrected values for the rectification checks */
export const EDITED_FIRST_NAME = 'Quinn';
export const EDITED_CITY = 'Newtown';

/** GDPR-05: a ZIP the address form must reject (the app wants 5 digits) */
export const INVALID_ADDRESS_ZIP = 'abc';

/** GDPR-07: the only fields of a shop that are public (catalogue list) */
export const PUBLIC_SHOP_FIELDS = ['id', 'name', 'slug'] as const;

/** GDPR-04, 06, 07: a review from a buyer who received the item */
export const SYNTHETIC_REVIEW = {
    rating: 5,
    title: 'Synthetic title',
    body: 'Synthetic review created by automated tests',
} as const;

/** GDPR-06 (PRIV-5): the name a review shows once its author deleted the account */
export const DELETED_USER_LABEL = 'Deleted user';

/** GDPR-08: status the server uses to send plain HTTP visitors to HTTPS */
export const HTTP_PERMANENT_REDIRECT = 301;

/** GDPR-08: the flags the session cookie must carry */
export const SESSION_COOKIE_FLAGS = {
    sameSite: 'Lax',
} as const;
