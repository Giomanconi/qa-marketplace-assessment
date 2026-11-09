import { ApiEndpoints, ShippingMethod } from '../../enums/app/app';
import {
    CARD_DETAILS,
    CHECKOUT_ADDRESS,
    TEST_CARDS,
} from '../../test-data/static/app/checkout';
import { apiCall, getOk } from './client';
import { addToCart } from './orders';
import type { ApiResult, Session, TestUser } from './types';

/** The cart totals the app calculates. Money is in dollars. */
export type CartTotals = {
    subtotal: number;
    discount: number;
    shipping: number;
    tax: number;
    total: number;
    itemCount: number;
    coupon: { code: string } | null;
};

/**
 * Reads the cart totals as the app calculates them (the same numbers the
 * cart page shows, Standard shipping).
 *
 * @param {Session} user - Buyer.
 * @returns {Promise<CartTotals>} Subtotal, discount, shipping, tax and total.
 */
export async function getCart(user: Session): Promise<CartTotals> {
    return getOk<CartTotals>(user.api, ApiEndpoints.CART);
}

/**
 * Applies a coupon code. Returns the raw answer, because tests also check the
 * rejected codes (below the minimum, unknown, a second code).
 *
 * @param {Session} user - Buyer.
 * @param {string} code - Coupon code.
 * @returns {Promise<ApiResult>} Status and body (the cart on success).
 */
export async function applyCoupon(
    user: Session,
    code: string
): Promise<ApiResult> {
    return apiCall(user.api, 'POST', ApiEndpoints.CART_COUPON, { code });
}

/**
 * Removes the coupon from the cart.
 *
 * @param {Session} user - Buyer.
 * @returns {Promise<ApiResult>} Status and body (the cart).
 */
export async function removeCoupon(user: Session): Promise<ApiResult> {
    return apiCall(user.api, 'DELETE', ApiEndpoints.CART_COUPON);
}

/** Options of `placeOrder`. */
export type PlaceOrderOptions = {
    shippingMethod?: ShippingMethod;
    cardNumber?: string;
    /** Keep the delivery address in the user's address book (default: no) */
    saveAddress?: boolean;
};

/**
 * Places an order for the cart through the checkout API with the fictitious
 * address and a test card (approved by default). Sent once and never retried:
 * a repeated request could create a second order.
 *
 * @param {TestUser} user - Buyer with items in the cart.
 * @param {PlaceOrderOptions} [options] - Delivery method and card number.
 * @returns {Promise<string>} The order id.
 */
export async function placeOrder(
    user: TestUser,
    options: PlaceOrderOptions = {}
): Promise<string> {
    const response = await user.api.post(ApiEndpoints.CHECKOUT, {
        data: {
            addressId: null,
            address: {
                fullName: user.firstName + ' ' + user.lastName,
                line1: CHECKOUT_ADDRESS.line1,
                line2: '',
                city: CHECKOUT_ADDRESS.city,
                state: CHECKOUT_ADDRESS.state,
                zip: CHECKOUT_ADDRESS.zip,
                phone: CHECKOUT_ADDRESS.phone,
            },
            saveAddress: options.saveAddress ?? false,
            shippingMethod: options.shippingMethod ?? ShippingMethod.STANDARD,
            card: {
                number: options.cardNumber ?? TEST_CARDS.approved,
                ...CARD_DETAILS,
            },
        },
    });
    if (response.status() !== 201)
        throw new Error('Checkout failed with status ' + response.status());
    const body = (await response.json()) as { orderId: string };
    return body.orderId;
}

/**
 * Puts a product in the cart and, when given, applies a coupon. Throws if the
 * app rejects the coupon, so a bad test setup fails here and not later.
 *
 * @param {Session} user - Buyer.
 * @param {string} productId - Product to add.
 * @param {string | null} [coupon] - Coupon code, or null for none.
 */
export async function fillCart(
    user: Session,
    productId: string,
    coupon: string | null = null
): Promise<void> {
    await addToCart(user, productId);
    if (coupon === null) return;
    const { status } = await applyCoupon(user, coupon);
    if (status !== 200)
        throw new Error('Coupon ' + coupon + ' rejected with status ' + status);
}
