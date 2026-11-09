import { ApiEndpoints } from '../../enums/app/app';
import { TRACKING_NUMBER } from '../../test-data/static/app/checkout';
import { SYNTHETIC_REVIEW } from '../../test-data/static/app/privacy';
import { fillCart, placeOrder } from './checkout';
import { apiCall, getOk } from './client';
import { deliverOrder, shipOrder } from './selling';
import type { ApiResult, Session, TestUser } from './types';

/** A saved address as the app returns it. */
export type SavedAddress = {
    id: string;
    line1: string;
    city: string;
    state: string;
    zip: string;
    phone: string;
};

/** The parts of the data export the tests read. */
export type ExportFile = {
    marketingConsent: { emailOffers: boolean };
};

/**
 * Asks for "Download my data" (retried, because the host fails reads on
 * purpose). Returns the file as text, so a test can look for values anywhere in
 * it and for words that must not be in it, and the parsed marketing choice.
 *
 * @param {Session} user - Signed-in user.
 * @returns {Promise<{ text: string; file: ExportFile }>} Raw and parsed file.
 */
export async function exportData(
    user: Session
): Promise<{ text: string; file: ExportFile }> {
    const file = await getOk<ExportFile>(user.api, ApiEndpoints.ACCOUNT_EXPORT);
    return { text: JSON.stringify(file), file };
}

/**
 * Posts a review of a product the user has received. Returns the raw answer.
 *
 * @param {Session} user - Buyer of the product.
 * @param {string} productId - The product.
 * @param {object} review - Rating, title and body.
 * @returns {Promise<ApiResult>} Status and body of the answer.
 */
export async function postReview(
    user: Session,
    productId: string,
    review: object
): Promise<ApiResult> {
    return apiCall(
        user.api,
        'POST',
        ApiEndpoints.PRODUCTS + '/' + productId + '/reviews',
        review
    );
}

/**
 * Corrects profile fields (name) or the marketing preference.
 *
 * @param {Session} user - Signed-in user.
 * @param {object} fields - Fields to change, for example `{ firstName: 'Quinn' }`.
 * @returns {Promise<ApiResult>} Status and body (the updated user, or the field errors).
 */
export async function updateProfile(
    user: Session,
    fields: object
): Promise<ApiResult> {
    return apiCall(user.api, 'PATCH', ApiEndpoints.ACCOUNT, fields);
}

/**
 * Reads the profile the account page shows.
 *
 * @param {Session} user - Signed-in user.
 * @returns {Promise<{ user: { firstName: string; marketingOptIn: boolean } }>} The account.
 */
export async function getAccount(
    user: Session
): Promise<{ user: { firstName: string; marketingOptIn: boolean } }> {
    return getOk(user.api, ApiEndpoints.ACCOUNT);
}

/**
 * Lists the user's saved addresses.
 *
 * @param {Session} user - Signed-in user.
 * @returns {Promise<SavedAddress[]>} The address book.
 */
export async function getAddresses(user: Session): Promise<SavedAddress[]> {
    const body = await getOk<{ addresses: SavedAddress[] }>(
        user.api,
        ApiEndpoints.ACCOUNT_ADDRESSES
    );
    return body.addresses;
}

/**
 * Corrects one saved address.
 *
 * @param {Session} user - Signed-in user.
 * @param {string} addressId - Address to change.
 * @param {object} fields - Fields to change, for example `{ city: 'Newtown' }`.
 * @returns {Promise<ApiResult>} Status and body (the address, or the field errors).
 */
export async function updateAddress(
    user: Session,
    addressId: string,
    fields: object
): Promise<ApiResult> {
    return apiCall(
        user.api,
        'PATCH',
        `${ApiEndpoints.ACCOUNT_ADDRESSES}/${addressId}`,
        fields
    );
}

/**
 * Takes an order all the way to a review: the buyer orders the product, the
 * seller ships and delivers it, and the buyer reviews it (REV-1). Throws if a
 * setup step is refused.
 *
 * @param {TestUser} buyer - Buyer.
 * @param {Session} seller - Seller of the product.
 * @param {string} productId - The product.
 * @returns {Promise<string>} The order id.
 */
export async function buyAndReview(
    buyer: TestUser,
    seller: Session,
    productId: string
): Promise<string> {
    await fillCart(buyer, productId);
    const orderId = await placeOrder(buyer);
    const shipped = await shipOrder(seller, orderId, TRACKING_NUMBER);
    if (shipped.status !== 200)
        throw new Error('Ship order failed with status ' + shipped.status);
    await deliverOrder(seller, orderId);
    const review = await postReview(buyer, productId, SYNTHETIC_REVIEW);
    if (review.status !== 201)
        throw new Error('Review failed with status ' + review.status);
    return orderId;
}
