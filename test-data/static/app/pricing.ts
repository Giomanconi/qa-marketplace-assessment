/**
 * Pricing oracles copied from the assessment test cases (docs/03). The
 * expected values come from the Help Center rules, never from the app's own
 * answers. Amounts are in dollars.
 */
export const COUPONS = {
    WELCOME10: 'WELCOME10',
    TAKE5: 'TAKE5',
    SAVE20: 'SAVE20',
} as const;

/** SHIP-5: Express costs this, whatever the order value or coupon */
export const EXPRESS_SHIPPING_PRICE = 9.99;

/** TC-11: item subtotal and coupon per case; Express must always be $9.99 */
export const EXPRESS_SHIPPING_ROWS = [
    { id: 'a', subtotal: 30, coupon: null },
    { id: 'b', subtotal: 49.99, coupon: null },
    { id: 'c', subtotal: 50, coupon: null },
    { id: 'd', subtotal: 99.99, coupon: null },
    { id: 'e', subtotal: 100, coupon: null },
    { id: 'f', subtotal: 109, coupon: COUPONS.WELCOME10 },
    { id: 'g', subtotal: 109, coupon: null },
] as const;

/** TC-12: tax is 8% of the discounted item subtotal (TAX-2), not on shipping */
export const TAX_ROWS = [
    { id: 'a', subtotal: 50, coupon: null, tax: 4.0 },
    { id: 'b', subtotal: 50, coupon: COUPONS.WELCOME10, tax: 3.6 },
    { id: 'c', subtotal: 109, coupon: COUPONS.WELCOME10, tax: 7.85 },
    { id: 'd', subtotal: 30, coupon: COUPONS.TAKE5, tax: 2.0 },
    { id: 'e', subtotal: 100, coupon: COUPONS.SAVE20, tax: 6.4 },
] as const;

/** TC-12: removing the coupon from the $50.00 cart returns tax to 8% of $50.00 */
export const TAX_WITHOUT_COUPON = 4.0;

/** TC-01: the Help Center worked example ($50.00, WELCOME10, Standard) */
export const WORKED_EXAMPLE = {
    subtotal: 50,
    coupon: COUPONS.WELCOME10,
    discount: 5,
    shipping: 5.99,
    tax: 3.6,
    total: 54.59,
} as const;

/** SHIP-3: Standard is free from this merchandise subtotal after discounts */
export const FREE_SHIPPING_THRESHOLD = 50;

/** TC-05: Standard shipping per case (0 means free) */
export const STANDARD_SHIPPING_ROWS = [
    { id: 'a', subtotal: 49.99, coupon: null, shipping: 5.99 },
    { id: 'b', subtotal: 50, coupon: null, shipping: 0 },
    { id: 'c', subtotal: 55, coupon: COUPONS.WELCOME10, shipping: 5.99 },
    // SHIP-4: items $47 plus 8% tax is $50.76, but tax does not count
    { id: 'f', subtotal: 47, coupon: null, shipping: 5.99 },
] as const;

/** TC-05 case d: $55.55 less 10% is $49.995, which rounds to $50.00 */
export const ROUNDING_EDGE = { subtotal: 55.55, coupon: COUPONS.WELCOME10 };

/** TC-04 a and b: a coupon works from its minimum, never below it (CPN-3) */
export const COUPON_MINIMUM_ROWS = [
    {
        id: 'a',
        code: COUPONS.TAKE5,
        below: 29.99,
        minimum: 30,
        discount: 5,
        message: 'This code needs an order of at least $30.00.',
    },
    {
        id: 'b',
        code: COUPONS.SAVE20,
        below: 99.99,
        minimum: 100,
        discount: 20,
        message: 'This code needs an order of at least $100.00.',
    },
] as const;

/** TC-04 c: codes are not case-sensitive (CPN-2); a $50 cart gets 10% off */
export const COUPON_CASE_ROWS = [
    { id: 'lower', code: 'welcome10' },
    { id: 'mixed', code: 'WeLcOmE10' },
] as const;
export const COUPON_CASE_SUBTOTAL = 50;
export const WELCOME10_DISCOUNT_ON_50 = 5;

/** TC-04 f: an unknown code is refused with a clear message (CPN-8) */
export const UNKNOWN_COUPON = {
    code: 'NOPE',
    message: "This code isn't valid. Check the spelling and try again.",
};

/** TC-04 e: SAVE20 needs $100; the cart is $60 + $40, then the $40 item goes */
export const COUPON_REMOVAL_CART = { kept: 60, removed: 40 };

/** TC-06 (SELL-3): fee is 10% of the item price only, never shipping or tax */
export const SELLER_FEE_EXAMPLE = {
    itemPrice: 40,
    fee: 4,
    earnings: 36,
};

/** TC-06: after one kept and one cancelled order the hub counts only the kept one */
export const HUB_KEPT_ORDER = { orders: '1', units: '1' };

/** TC-09: header badge after each step (A x2 and B x1, +1, -1, then B removed) */
export const CART_BADGE = {
    start: '3',
    afterIncrease: '4',
    afterDecrease: '3',
    afterRemoval: '2',
};
