import { ApiEndpoints } from '../../enums/app/app';
import { apiCall, getOk } from './client';
import type { ApiResult, Session } from './types';

/** The parts of a catalog item the tests check. Price is in dollars. */
export type CatalogItem = {
    id: string;
    title: string;
    price: number;
    stock: number;
    /** The shop block of the item: only public fields should be in it */
    shop: { slug: string } & Record<string, unknown>;
};

/** The public product answer: the parts the tests read. */
export type PublicProduct = {
    reviews: { authorName: string }[];
};

/**
 * Reads a product as anyone can (retried, so a failed read never looks like
 * data being absent).
 *
 * @param {Session} session - Any session.
 * @param {string} productId - The product.
 * @returns {Promise<{ text: string; product: PublicProduct }>} Raw and parsed answer.
 */
export async function getPublicProduct(
    session: Session,
    productId: string
): Promise<{ text: string; product: PublicProduct }> {
    const product = await getOk<PublicProduct>(
        session.api,
        ApiEndpoints.PRODUCTS + '/' + productId
    );
    return { text: JSON.stringify(product), product };
}

/** A page of catalog results. */
export type CatalogPage = { items: CatalogItem[]; total: number };

/**
 * Searches and filters the public catalog. Params the app understands: `q`,
 * `category`, `min`, `max`, `inStock`, `sort` (price-asc, price-desc, newest,
 * rating) and `page`. Returns the raw answer so tests can check the status.
 *
 * @param {Session} session - Any session.
 * @param {Record<string, string | number>} [params] - Query parameters.
 * @returns {Promise<ApiResult<CatalogPage>>} Status and the page of results.
 */
export async function searchCatalog(
    session: Session,
    params: Record<string, string | number> = {}
): Promise<ApiResult<CatalogPage>> {
    const query = new URLSearchParams(
        Object.entries(params).map(([key, value]) => [key, String(value)])
    ).toString();
    return apiCall<CatalogPage>(
        session.api,
        'GET',
        ApiEndpoints.PRODUCTS + '?' + query
    );
}
