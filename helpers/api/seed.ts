import { ApiEndpoints } from '../../enums/app/app';
import { SEED_PRODUCTS } from '../../test-data/static/app/seed';
import { loginUser } from './accounts';
import { apiCall, newApiSession } from './client';
import { createProduct } from './selling';

/**
 * Makes sure the main account's shop has the fixed seed items.
 * Additive and idempotent: an item is created only when a public search for
 * its exact title finds nothing, and nothing is ever edited or deleted, so
 * running it again changes nothing. This is the only code that logs in as the
 * main account.
 *
 * @returns {Promise<number>} How many items were created (0 when all exist).
 */
export async function seedMainAccount(): Promise<number> {
    const api = await newApiSession();
    let created = 0;

    try {
        await loginUser(api, {
            email: process.env.APP_EMAIL!,
            password: process.env.APP_PASSWORD!,
        });

        for (const product of SEED_PRODUCTS) {
            const { body } = await apiCall<{ items: { title: string }[] }>(
                api,
                'GET',
                `${ApiEndpoints.PRODUCTS}?q=${encodeURIComponent(product.title)}`
            );
            if (body.items.some((item) => item.title === product.title)) {
                continue;
            }
            await createProduct({ api }, product);
            created++;
        }
    } finally {
        await api.dispose();
    }

    return created;
}
