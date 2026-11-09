import { expect, test } from '../../../fixtures/pom/test-options';
import { AppRoutes } from '../../../enums/app/app';
import { getPublicProduct, searchCatalog } from '../../../helpers/api/catalog';
import { fillCart, placeOrder } from '../../../helpers/api/checkout';
import { getPageOk } from '../../../helpers/api/client';
import { buyAndReview } from '../../../helpers/api/privacy';
import { CHECKOUT_ADDRESS } from '../../../test-data/static/app/checkout';
import { PUBLIC_SHOP_FIELDS } from '../../../test-data/static/app/privacy';

/**
 * GDPR-07 (PRIV-2, REV-3, Arts. 5 and 32): other users, and signed-out
 * visitors, see only public business data of a shop, never the owner's personal
 * account data, and reviews show a first name and last initial. Every read
 * must answer 200 first, so an error page never passes as "no data shown".
 * URLs are checked in gdpr-07-no-personal-data-in-urls.
 */
test.describe('gdpr-07 personal data exposure', () => {
    test(
        'should list only the public fields of a shop in the catalogue',
        { tag: '@api' },
        async ({ soloSeller, product, anonymousApi }) => {
            const listed = await soloSeller.listProduct(product.price);

            const { body } = await searchCatalog(
                { api: anonymousApi },
                { q: listed.title }
            );

            expect(Object.keys(body.items[0].shop).sort()).toEqual([
                ...PUBLIC_SHOP_FIELDS,
            ]);
        }
    );

    test(
        'should not print the owner’s email or name on the public shop page',
        { tag: '@api' },
        async ({ soloSeller, product, anonymousApi }) => {
            const listed = await soloSeller.listProduct(product.price);
            const { body } = await searchCatalog(
                { api: anonymousApi },
                { q: listed.title }
            );

            const text = await getPageOk(
                anonymousApi,
                AppRoutes.SHOPS + '/' + body.items[0].shop.slug
            );

            expect(text).not.toContain(soloSeller.seller.email);
            expect(text).not.toContain(soloSeller.seller.lastName);
        }
    );

    test(
        'should not show the seller’s email or name in the public product data',
        { tag: '@api' },
        async ({ soloSeller, product, anonymousApi }) => {
            test.fail(
                true,
                "#19 (PRIV-2) the signed-out product API returns the shop owner's email and name"
            );
            const listed = await soloSeller.listProduct(product.price);

            const { text } = await getPublicProduct(
                { api: anonymousApi },
                listed.id
            );

            expect(text).not.toContain(soloSeller.seller.email);
            expect(text).not.toContain(soloSeller.seller.lastName);
        }
    );

    test(
        'should not show the seller’s saved address or phone in the public product data',
        { tag: '@api' },
        async ({ soloSeller, product, anonymousApi }) => {
            test.fail(
                true,
                "#19 (PRIV-2) the signed-out product API returns the owner's saved address and phone"
            );
            const listed = await soloSeller.listProduct(product.price);

            await test.step('GIVEN the seller saved a home address at checkout', async () => {
                await fillCart(soloSeller.seller, product.id);
                await placeOrder(soloSeller.seller, { saveAddress: true });
            });

            const { text } = await getPublicProduct(
                { api: anonymousApi },
                listed.id
            );

            expect(text).not.toContain(CHECKOUT_ADDRESS.line1);
            expect(text).not.toContain(CHECKOUT_ADDRESS.phone);
        }
    );

    test(
        'should show a reviewer as first name and last initial only',
        { tag: '@api' },
        async ({ soloSeller, product, newUser, anonymousApi }) => {
            test.slow();
            const listed = await soloSeller.listProduct(product.price);

            await test.step('GIVEN a buyer reviewed the item', () =>
                buyAndReview(newUser, soloSeller.seller, listed.id));

            await test.step('THEN the public data shows only the short name', async () => {
                const { text, product: answer } = await getPublicProduct(
                    { api: anonymousApi },
                    listed.id
                );
                const initial = newUser.lastName.charAt(0);

                expect(answer.reviews[0].authorName).toBe(
                    newUser.firstName + ' ' + initial + '.'
                );
                expect(text).not.toContain(newUser.lastName);
                expect(text).not.toContain(newUser.email);
            });
        }
    );

    test(
        'should show a seller the delivery address of an order but not the buyer’s email or phone',
        { tag: '@api' },
        async ({ soloSeller, product, buyer }) => {
            const listed = await soloSeller.listProduct(product.price);

            await test.step('GIVEN a buyer ordered the seller’s product', async () => {
                await fillCart(buyer, listed.id);
                await placeOrder(buyer);
            });

            await test.step('THEN the seller’s order list shows only what delivery needs', async () => {
                const text = await getPageOk(
                    soloSeller.seller.api,
                    AppRoutes.SELLER_ORDERS
                );

                expect(text).toContain(CHECKOUT_ADDRESS.line1);
                expect(text).not.toContain(buyer.email);
                expect(text).not.toContain(CHECKOUT_ADDRESS.phone);
            });
        }
    );
});
