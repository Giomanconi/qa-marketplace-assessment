import { expect, test } from '../../../fixtures/pom/test-options';
import { ApiEndpoints } from '../../../enums/app/app';
import { searchCatalog } from '../../../helpers/api/catalog';
import { apiCall } from '../../../helpers/api/client';
import {
    EDGE_QUERIES,
    PRICE_FILTER,
} from '../../../test-data/static/app/search';

/**
 * TC-07 (SHOP-1, SHOP-2, SHOP-5): search in any word order and case, filters
 * and sort, out-of-stock items, and odd search inputs. Products are created
 * through the API; the search itself is checked through the public catalog API,
 * with the header search box checked in the UI.
 */
test.describe('tc-07 search, filters and stock', () => {
    test(
        'should find a product with its words in another order and case',
        { tag: '@regression' },
        async ({ anonymousApi, createPricedProduct, catalogPage }) => {
            const product = await createPricedProduct(20);
            const shuffled = product.title.split(' ').reverse().join(' ');

            await test.step('THEN the catalog API finds it for the reversed upper-case query', async () => {
                const result = await searchCatalog(
                    { api: anonymousApi },
                    { q: shuffled.toUpperCase() }
                );

                expect(result.status).toBe(200);
                expect(result.body.items.map((item) => item.id)).toContain(
                    product.id
                );
            });

            await test.step('THEN the header search box shows it too', async () => {
                await catalogPage.open();
                await catalogPage.search(shuffled.toUpperCase());
                await expect(
                    catalogPage.productCard(product.title)
                ).toBeVisible();
            });
        }
    );

    // No test.fail(): it fails only on runs where a sale item in the range is out of order (SHOP-2 observation)
    test(
        'should return only prices inside the range, sorted low to high',
        { tag: '@regression' },
        async ({ anonymousApi }) => {
            const result = await searchCatalog(
                { api: anonymousApi },
                { ...PRICE_FILTER, sort: 'price-asc' }
            );
            const prices = result.body.items.map((item) => item.price);

            expect(result.status).toBe(200);
            expect(prices.length).toBeGreaterThan(0);
            expect(Math.min(...prices)).toBeGreaterThanOrEqual(
                PRICE_FILTER.min
            );
            expect(Math.max(...prices)).toBeLessThanOrEqual(PRICE_FILTER.max);
            expect(prices).toEqual([...prices].sort((a, b) => a - b));
        }
    );

    test(
        'should sort high to low when the range and in-stock filters are on',
        { tag: '@regression' },
        async ({ anonymousApi }) => {
            test.fail(
                true,
                'Observation SHOP-2, not filed: price sort uses the original price, so sale items are out of order'
            );
            const result = await searchCatalog(
                { api: anonymousApi },
                { ...PRICE_FILTER, inStock: 1, sort: 'price-desc' }
            );
            const prices = result.body.items.map((item) => item.price);

            expect(result.status).toBe(200);
            expect(prices).toEqual([...prices].sort((a, b) => b - a));
        }
    );

    test(
        'should list an out-of-stock product but not let it be added to the cart',
        { tag: '@regression' },
        async ({
            anonymousApi,
            newUser,
            signInAs,
            createPricedProduct,
            productPage,
        }) => {
            const product = await createPricedProduct(20, { stock: 0 });

            await test.step('THEN the catalog still lists it', async () => {
                const result = await searchCatalog(
                    { api: anonymousApi },
                    { q: product.title }
                );

                expect(result.body.items.map((item) => item.id)).toContain(
                    product.id
                );
            });

            await test.step('THEN the product page cannot add it to the cart', async () => {
                await signInAs(newUser);
                await productPage.open(product.id);
                await expect(productPage.outOfStockButton).toBeDisabled();
            });

            await test.step('THEN a direct request to add it is rejected', async () => {
                const result = await apiCall(
                    newUser.api,
                    'POST',
                    ApiEndpoints.CART_ITEMS,
                    { productId: product.id, qty: 1 }
                );

                expect(result.status).toBeGreaterThanOrEqual(400);
            });
        }
    );

    for (const [name, query] of Object.entries(EDGE_QUERIES)) {
        test(
            `should answer a ${name} search without an error`,
            { tag: '@regression' },
            async ({ anonymousApi }) => {
                const result = await searchCatalog(
                    { api: anonymousApi },
                    { q: query }
                );

                expect(result.status).toBe(200);
            }
        );
    }
});
