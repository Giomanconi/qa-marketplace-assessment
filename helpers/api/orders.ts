import { ApiEndpoints } from '../../enums/app/app';
import { apiCall, getOk } from './client';
import type { ApiResult, Session } from './types';

/** The parts of an order the tests check. Money is in dollars. */
export type OrderSummary = {
    id: string;
    status: string;
    subtotal: number;
    discount: number;
    shipping: number;
    tax: number;
    total: number;
    couponCode: string | null;
    shippingMethod: string;
    trackingNumber: string | null;
    items: { productId: string; qty: number }[];
};

/**
 * Lists the orders of the logged-in user.
 *
 * @param {Session} user - Buyer.
 * @returns {Promise<OrderSummary[]>} The user's orders.
 */
export async function getOrders(user: Session): Promise<OrderSummary[]> {
    const body = await getOk<{ orders: OrderSummary[] }>(
        user.api,
        ApiEndpoints.ORDERS
    );
    return body.orders;
}

/**
 * Reads one order of the logged-in user from the order list.
 *
 * @param {Session} user - Buyer.
 * @param {string} orderId - Order id.
 * @returns {Promise<OrderSummary>} The order.
 */
export async function getOrder(
    user: Session,
    orderId: string
): Promise<OrderSummary> {
    const order = (await getOrders(user)).find((o) => o.id === orderId);
    if (!order) throw new Error('Order ' + orderId + ' not found');
    return order;
}

/**
 * Reads the stock of a product through the public product route.
 *
 * @param {Session} user - Any session.
 * @param {string} productId - Product id.
 * @returns {Promise<number>} Units in stock.
 */
export async function getProductStock(
    user: Session,
    productId: string
): Promise<number> {
    const body = await getOk<{ product: { stock: number } }>(
        user.api,
        ApiEndpoints.PRODUCTS + '/' + productId
    );
    return body.product.stock;
}

/**
 * Puts a product in the user's cart (the cart belongs to the user's session,
 * so the browser sees it once it uses the same cookie).
 *
 * @param {Session} user - Buyer.
 * @param {string} productId - Product to add.
 * @param {number} [qty] - Units to add (default 1).
 */
export async function addToCart(
    user: Session,
    productId: string,
    qty = 1
): Promise<void> {
    const { status } = await apiCall(
        user.api,
        'POST',
        ApiEndpoints.CART_ITEMS,
        { productId, qty }
    );
    if (status !== 201)
        throw new Error('Add to cart failed with status ' + status);
}

/**
 * Cancels an order. Returns the raw answer, because tests also check that the
 * app rejects a cancellation (for example for a shipped order).
 *
 * @param {Session} user - Buyer that owns the order.
 * @param {string} orderId - Order id.
 * @returns {Promise<ApiResult>} Status and body of the answer.
 */
export async function cancelOrder(
    user: Session,
    orderId: string
): Promise<ApiResult> {
    return apiCall(
        user.api,
        'POST',
        ApiEndpoints.ORDERS + '/' + orderId + '/cancel'
    );
}
