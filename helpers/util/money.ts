import { FREE_SHIPPING_THRESHOLD } from '../../test-data/static/app/pricing';

/**
 * Formats an amount the way the app prints money in the cart, checkout and
 * order pages (two decimals). Display only: expected amounts always come from
 * the test data, never from a calculation.
 *
 * @param {number} amount - Amount in dollars.
 * @returns {string} For example `$9.99`.
 */
export function usd(amount: number): string {
    return '$' + amount.toFixed(2);
}

/**
 * Formats a discount line the way the app prints it (a minus sign before the
 * amount).
 *
 * @param {number} amount - Discount in dollars (positive number).
 * @returns {string} For example `−$5.00`.
 */
export function usdDiscount(amount: number): string {
    return '−' + usd(amount);
}

/**
 * Whether Standard shipping should be free for a subtotal after discounts
 * (SHIP-3). The amount is rounded to cents first, like the app displays it.
 *
 * @param {number} subtotalAfterDiscount - Items less discount, in dollars.
 * @returns {boolean} True when the subtotal reaches the threshold.
 */
export function isFreeShipping(subtotalAfterDiscount: number): boolean {
    return (
        Math.round(subtotalAfterDiscount * 100) / 100 >= FREE_SHIPPING_THRESHOLD
    );
}
