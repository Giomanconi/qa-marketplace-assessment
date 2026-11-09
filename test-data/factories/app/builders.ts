import { randomBytes } from 'node:crypto';
import type {
    ProductData,
    ShopData,
    UserData,
} from '../../../helpers/api/types';
import { PRODUCT_DEFAULTS } from '../../static/app/products';

/**
 * Short unique text so parallel workers and repeated runs never collide.
 * Time (base 36) + 3 random bytes.
 */
function unique(): string {
    return `${Date.now().toString(36)}${randomBytes(3).toString('hex')}`;
}

/**
 * Builds a synthetic user. Nothing here is real personal data (GDPR):
 * the email is on the reserved `example.com` domain and the password is
 * random per user. The email is unique because the app soft-deletes accounts
 * and never frees an email.
 *
 * @returns {UserData} A new unique user.
 */
export function buildUser(): UserData {
    const id = unique();
    return {
        firstName: 'Qa',
        lastName: `Tester ${id}`,
        email: `qa-${id}@example.com`,
        password: `Pw-${randomBytes(8).toString('hex')}-Aa1!`,
    };
}

/**
 * Builds a synthetic shop (name is 3-40 characters in the app).
 *
 * @returns {ShopData} A new unique shop.
 */
export function buildShop(): ShopData {
    return {
        name: `QA Shop ${unique()}`,
        description: 'Synthetic shop created by automated tests',
        location: 'Testville',
    };
}

/**
 * Builds a synthetic product with a unique title.
 *
 * @param {Partial<ProductData>} [overrides] - Values to replace, e.g. `{ stock: 1 }`.
 * @returns {ProductData} A new unique product.
 */
export function buildProduct(overrides?: Partial<ProductData>): ProductData {
    return {
        title: `QA Item ${unique()}`,
        description: 'Synthetic item created by automated tests',
        categoryId: PRODUCT_DEFAULTS.categoryId,
        price: 12.5,
        stock: 5,
        status: PRODUCT_DEFAULTS.status,
        art: { ...PRODUCT_DEFAULTS.art },
        ...overrides,
    };
}
