import { expect, test } from '../../../fixtures/pom/test-options';
import { appConfig } from '../../../config/app';
import { ShippingMethod } from '../../../enums/app/app';
import { applyCoupon, placeOrder } from '../../../helpers/api/checkout';
import { addToCart, getOrder, getOrders } from '../../../helpers/api/orders';
import { usd, usdDiscount } from '../../../helpers/util/money';
import {
    CARD_DETAILS,
    CHECKOUT_ADDRESS,
    TEST_CARDS,
} from '../../../test-data/static/app/checkout';
import { WORKED_EXAMPLE } from '../../../test-data/static/app/pricing';

/**
 * TC-01 (SHIP-3, TAX-2, TAX-3, CPN-5): the Help Center worked example. A $50
 * item with WELCOME10 and Standard shipping totals $54.59, and the same figures
 * show in the cart, the checkout, the confirmation and the order detail.
 */
test.describe('tc-01 order total', () => {
    test(
        'should show the worked-example totals everywhere for a $50 item with WELCOME10',
        { tag: '@e2e' },
        async ({
            newUser,
            signInAs,
            createPricedProduct,
            cartPage,
            checkoutPage,
            confirmationPage,
            orderDetailPage,
        }) => {
            test.fail(
                true,
                '#2 tax is charged on the full subtotal, so the tax and the total are wrong'
            );

            await test.step('GIVEN a $50 item in the cart with WELCOME10 applied', async () => {
                const item = await createPricedProduct(WORKED_EXAMPLE.subtotal);
                await addToCart(newUser, item.id);
                expect(
                    (await applyCoupon(newUser, WORKED_EXAMPLE.coupon)).status
                ).toBe(200);
                await signInAs(newUser);
            });

            await test.step('THEN the cart summary shows the worked example', async () => {
                await cartPage.open();
                await expect(cartPage.subtotal).toHaveText(
                    usd(WORKED_EXAMPLE.subtotal)
                );
                await expect(cartPage.discount).toHaveText(
                    usdDiscount(WORKED_EXAMPLE.discount)
                );
                await expect(cartPage.shipping).toHaveText(
                    usd(WORKED_EXAMPLE.shipping)
                );
                await expect(cartPage.tax).toHaveText(usd(WORKED_EXAMPLE.tax));
                await expect(cartPage.total).toHaveText(
                    usd(WORKED_EXAMPLE.total)
                );
            });

            await test.step('THEN the checkout summary shows the same figures', async () => {
                await checkoutPage.open();
                await expect(checkoutPage.summaryShipping).toHaveText(
                    usd(WORKED_EXAMPLE.shipping)
                );
                await expect(checkoutPage.summaryTax).toHaveText(
                    usd(WORKED_EXAMPLE.tax)
                );
                await expect(checkoutPage.summaryTotal).toHaveText(
                    usd(WORKED_EXAMPLE.total)
                );
            });

            await test.step('WHEN the buyer pays with the approved test card', async () => {
                await checkoutPage.fillShipping(CHECKOUT_ADDRESS);
                await checkoutPage.fillCard({
                    number: TEST_CARDS.approved,
                    ...CARD_DETAILS,
                });
                await checkoutPage.placeOrder();
            });

            await test.step('THEN the confirmation and the order detail show the same total', async () => {
                await expect(confirmationPage.total).toHaveText(
                    usd(WORKED_EXAMPLE.total),
                    { timeout: appConfig.checkoutOutcomeTimeout }
                );
                const [order] = await getOrders(newUser);
                await orderDetailPage.open(order.id);
                await expect(orderDetailPage.total).toHaveText(
                    usd(WORKED_EXAMPLE.total)
                );
            });
        }
    );

    test(
        'should total $58.59 for the same cart with Express',
        { tag: '@regression' },
        async ({ newUser, createPricedProduct }) => {
            test.fail(
                true,
                '#3 Express is charged $14.99 instead of $9.99; #2 tax is on the full subtotal'
            );

            await test.step('GIVEN a $50 item in the cart with WELCOME10 applied', async () => {
                const item = await createPricedProduct(WORKED_EXAMPLE.subtotal);
                await addToCart(newUser, item.id);
                expect(
                    (await applyCoupon(newUser, WORKED_EXAMPLE.coupon)).status
                ).toBe(200);
            });

            await test.step('THEN the Express order is items less discount, plus $9.99 and the tax', async () => {
                const orderId = await placeOrder(newUser, {
                    shippingMethod: ShippingMethod.EXPRESS,
                });
                const order = await getOrder(newUser, orderId);
                expect(order.total).toBe(EXPRESS_TOTAL);
            });
        }
    );
});

// Items $50.00 - $5.00 discount + $9.99 Express + $3.60 tax (docs/qa-cycle/03, TC-01 variation)
const EXPRESS_TOTAL = 58.59;
