import { expect, test } from '../../../fixtures/pom/test-options';
import { appConfig } from '../../../config/app';
import { fillCart, getCart } from '../../../helpers/api/checkout';
import { getOrders, getProductStock } from '../../../helpers/api/orders';
import {
    CARD_DETAILS,
    CHECKOUT_ADDRESS,
    TEST_CARDS,
    UNSUPPORTED_CARD,
} from '../../../test-data/static/app/checkout';

/**
 * TC-03 (PAY-1, PAY-2, PAY-3): a declined card creates no order and keeps the
 * cart; a double click or a refresh creates exactly one order. The cart is
 * filled through the API; the UI only pays.
 */
test.describe('tc-03 payments', () => {
    test.beforeEach(async ({ signInAs, newUser, product }) => {
        await fillCart(newUser, product.id);
        await signInAs(newUser);
    });

    test(
        'should create no order and keep the cart when the card is declined',
        { tag: '@regression' },
        async ({
            newUser,
            seller,
            product,
            checkoutPage,
            confirmationPage,
        }) => {
            await test.step('WHEN the buyer pays with the declined test card', async () => {
                await checkoutPage.open();
                await checkoutPage.fillShipping(CHECKOUT_ADDRESS);
                await checkoutPage.fillCard({
                    number: TEST_CARDS.declined,
                    ...CARD_DETAILS,
                });
                await checkoutPage.placeOrder();
            });

            await test.step('THEN the declined error is shown and there is no confirmation', async () => {
                await expect(checkoutPage.cardDeclinedError).toBeVisible({
                    timeout: appConfig.checkoutOutcomeTimeout,
                });
                await expect(confirmationPage.thankYouHeading).toBeHidden();
            });

            await test.step('THEN no order exists, the cart is intact and the stock is unchanged', async () => {
                expect(await getOrders(newUser)).toHaveLength(0);
                expect((await getCart(newUser)).itemCount).toBe(1);
                expect(await getProductStock(seller, product.id)).toBe(
                    product.stock
                );
            });
        }
    );

    test(
        'should create exactly one order when the order button is double-clicked',
        { tag: '@e2e' },
        async ({
            newUser,
            seller,
            product,
            checkoutPage,
            confirmationPage,
        }) => {
            test.fail(
                true,
                '#10 (PAY-2) a double click on Place order creates two orders'
            );

            await test.step('WHEN the buyer double-clicks Place order with the approved card', async () => {
                await checkoutPage.open();
                await checkoutPage.fillShipping(CHECKOUT_ADDRESS);
                await checkoutPage.fillCard({
                    number: TEST_CARDS.approved,
                    ...CARD_DETAILS,
                });
                await checkoutPage.placeOrderDoubleClick();
            });

            await test.step('THEN the order is confirmed', async () => {
                await expect(confirmationPage.thankYouHeading).toBeVisible({
                    timeout: appConfig.checkoutOutcomeTimeout,
                });
            });

            await test.step('THEN exactly one order exists and one unit left the stock', async () => {
                expect(await getOrders(newUser)).toHaveLength(1);
                expect(await getProductStock(seller, product.id)).toBe(
                    product.stock - 1
                );
            });
        }
    );

    test(
        'should keep one order when the confirmation page is refreshed and the buyer goes back',
        { tag: '@regression' },
        async ({ newUser, page, checkoutPage, confirmationPage }) => {
            await test.step('GIVEN a placed order', async () => {
                await checkoutPage.open();
                await checkoutPage.fillShipping(CHECKOUT_ADDRESS);
                await checkoutPage.fillCard({
                    number: TEST_CARDS.approved,
                    ...CARD_DETAILS,
                });
                await checkoutPage.placeOrder();
                await expect(confirmationPage.thankYouHeading).toBeVisible({
                    timeout: appConfig.checkoutOutcomeTimeout,
                });
            });

            await test.step('WHEN the buyer refreshes and goes back', async () => {
                await page.reload();
                await page.goBack();
            });

            await test.step('THEN there is still exactly one order', async () => {
                expect(await getOrders(newUser)).toHaveLength(1);
            });
        }
    );

    test(
        'should reject a card of a brand the store does not accept',
        { tag: '@regression' },
        async ({ newUser, checkoutPage }) => {
            test.fail(
                true,
                '#11 (PAY-1) a card brand the store does not accept is charged'
            );

            await test.step('WHEN the buyer pays with an unsupported card brand', async () => {
                await checkoutPage.open();
                await checkoutPage.fillShipping(CHECKOUT_ADDRESS);
                await checkoutPage.fillCard({
                    number: UNSUPPORTED_CARD,
                    ...CARD_DETAILS,
                });
                await checkoutPage.placeOrder();
            });

            await test.step('THEN the card number is refused and no order is created', async () => {
                await expect(checkoutPage.cardNumberError).toBeVisible();
                expect(await getOrders(newUser)).toHaveLength(0);
            });
        }
    );
});
