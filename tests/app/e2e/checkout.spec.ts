import { expect, test } from '../../../fixtures/pom/test-options';
import { appConfig } from '../../../config/app';
import {
    addToCart,
    getOrders,
    getProductStock,
} from '../../../helpers/api/orders';
import {
    CARD_DETAILS,
    CHECKOUT_ADDRESS,
    TEST_CARDS,
} from '../../../test-data/static/app/checkout';

/**
 * Data comes from the API first: the `product` fixture lists a new item in this
 * worker's seller shop, and `newUser` is a fresh buyer (both deleted after the
 * test), and the item is put in the cart through the API. The UI then only does
 * what the test is about: paying.
 */
test.describe('e2e checkout', () => {
    test.beforeEach(async ({ signInAs, newUser, product }) => {
        await addToCart(newUser, product.id);
        await signInAs(newUser);
    });

    test(
        'should buy a seller item with an approved card',
        { tag: '@smoke' },
        async ({
            newUser: buyer,
            seller,
            product,
            checkoutPage,
            confirmationPage,
        }) => {
            await test.step('WHEN the buyer pays with the approved test card', async () => {
                await checkoutPage.open();
                await checkoutPage.fillShipping(CHECKOUT_ADDRESS);
                await checkoutPage.fillCard({
                    number: TEST_CARDS.approved,
                    ...CARD_DETAILS,
                });
                await checkoutPage.placeOrder();
            });

            await test.step('THEN the order is confirmed for that item', async () => {
                await expect(confirmationPage.thankYouHeading).toBeVisible({
                    timeout: appConfig.checkoutOutcomeTimeout,
                });
                await expect(confirmationPage.paymentApproved).toBeVisible();
                await expect(
                    confirmationPage.orderedItem(product.title)
                ).toBeVisible();
            });

            await test.step('THEN the API shows one processing order and the stock went down by one', async () => {
                const orders = await getOrders(buyer);
                expect(orders).toHaveLength(1);
                expect(orders[0].status).toBe('processing');
                expect(orders[0].items).toHaveLength(1);
                expect(orders[0].items[0]).toMatchObject({
                    productId: product.id,
                    qty: 1,
                });
                expect(await getProductStock(seller, product.id)).toBe(
                    product.stock - 1
                );
            });
        }
    );
});
