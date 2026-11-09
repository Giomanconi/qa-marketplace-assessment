import { ApiEndpoints } from '../../enums/app/app';
import { apiCall } from './client';
import type { ApiResult, ProductData, Session, ShopData } from './types';

/**
 * Opens a shop for the user. A user can have one shop, and shops cannot be
 * deleted: the shop stays until the account is removed.
 *
 * @param {Session} user - Owner of the shop.
 * @param {ShopData} shop - Synthetic shop data from `buildShop`.
 * @returns {Promise<string>} The shop id.
 */
export async function createShop(
    user: Session,
    shop: ShopData
): Promise<string> {
    const { status, body } = await apiCall<{ shop: { id: string } }>(
        user.api,
        'POST',
        ApiEndpoints.SHOP,
        shop
    );
    if (status !== 201)
        throw new Error(`Create shop failed with status ${status}`);
    return body.shop.id;
}

/**
 * Lists a product in the user's shop.
 *
 * @param {Session} user - Seller that owns a shop.
 * @param {ProductData} product - Synthetic product data from `buildProduct`.
 * @returns {Promise<string>} The product id.
 */
export async function createProduct(
    user: Session,
    product: ProductData
): Promise<string> {
    const { status, body } = await apiCall<{ product: { id: string } }>(
        user.api,
        'POST',
        ApiEndpoints.SELLER_PRODUCTS,
        product
    );
    if (status !== 201)
        throw new Error(`Create product failed with status ${status}`);
    return body.product.id;
}

/**
 * Deletes one of the user's products. A 404 counts as done, so teardown can
 * run twice safely.
 *
 * @param {Session} user - Seller that owns the product.
 * @param {string} productId - Id returned by `createProduct`.
 */
export async function deleteProduct(
    user: Session,
    productId: string
): Promise<void> {
    const { status } = await apiCall(
        user.api,
        'DELETE',
        `${ApiEndpoints.SELLER_PRODUCTS}/${productId}`
    );
    if (status !== 200 && status !== 404) {
        throw new Error(`Delete product failed with status ${status}`);
    }
}

/**
 * Marks an order of the seller's shop as shipped. Returns the raw answer.
 *
 * @param {Session} seller - Seller whose shop sold the items.
 * @param {string} orderId - Order id.
 * @param {string} trackingNumber - Carrier tracking number.
 * @returns {Promise<ApiResult>} Status and body of the answer.
 */
export async function shipOrder(
    seller: Session,
    orderId: string,
    trackingNumber: string
): Promise<ApiResult> {
    return apiCall(
        seller.api,
        'POST',
        ApiEndpoints.SELLER_ORDERS + '/' + orderId + '/ship',
        { trackingNumber }
    );
}

/**
 * Marks a shipped order of the seller's shop as delivered (SELL-6). Throws if
 * the app refuses, because tests use it as setup (a review needs delivery).
 *
 * @param {Session} seller - Seller whose shop sold the items.
 * @param {string} orderId - Order id.
 */
export async function deliverOrder(
    seller: Session,
    orderId: string
): Promise<void> {
    const { status } = await apiCall(
        seller.api,
        'POST',
        ApiEndpoints.SELLER_ORDERS + '/' + orderId + '/deliver'
    );
    if (status !== 200)
        throw new Error('Deliver order failed with status ' + status);
}
