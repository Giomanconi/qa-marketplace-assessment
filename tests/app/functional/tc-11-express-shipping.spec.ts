import { expect, test } from '../../../fixtures/pom/test-options';
import { ShippingMethod } from '../../../enums/app/app';
import { fillCart, placeOrder } from '../../../helpers/api/checkout';
import { getOrder } from '../../../helpers/api/orders';
import { usd } from '../../../helpers/util/money';
import { selectRows } from '../../../helpers/util/rows';
import {
    EXPRESS_SHIPPING_PRICE,
    EXPRESS_SHIPPING_ROWS,
} from '../../../test-data/static/app/pricing';

/**
 * TC-11 (SHIP-2, SHIP-5): Express is always $9.99. The cart is built through
 * the API; the UI only shows the checkout, and the saved order is read back
 * through the API. ROW=random runs one random case, ROW=<id> one chosen case.
 */
test.describe('tc-11 express shipping price', () => {
    for (const row of selectRows(EXPRESS_SHIPPING_ROWS)) {
        const label = row.coupon
            ? `$${row.subtotal} with ${row.coupon}`
            : `$${row.subtotal}`;

        test(
            `should charge Express at the price shown for case ${row.id} (${label})`,
            { tag: '@regression' },
            async ({
                newUser,
                signInAs,
                createPricedProduct,
                checkoutPage,
            }) => {
                test.fail(
                    true,
                    '#3 Express is charged $14.99 instead of $9.99 (also without a coupon)'
                );

                await test.step('GIVEN a cart with the subtotal and coupon of the case', async () => {
                    const item = await createPricedProduct(row.subtotal);
                    await fillCart(newUser, item.id, row.coupon);
                });

                await test.step('WHEN the buyer selects Express at checkout', async () => {
                    await signInAs(newUser);
                    await checkoutPage.open();
                    await checkoutPage.selectShipping(ShippingMethod.EXPRESS);
                });

                await test.step('THEN the option and the summary line show the same price', async () => {
                    await expect(checkoutPage.expressOptionPrice).toHaveText(
                        usd(EXPRESS_SHIPPING_PRICE)
                    );
                    await expect(checkoutPage.summaryShipping).toHaveText(
                        usd(EXPRESS_SHIPPING_PRICE)
                    );
                });

                await test.step('THEN the saved order charges that price', async () => {
                    const orderId = await placeOrder(newUser, {
                        shippingMethod: ShippingMethod.EXPRESS,
                    });
                    const order = await getOrder(newUser, orderId);
                    expect(order.shipping).toBe(EXPRESS_SHIPPING_PRICE);
                });
            }
        );
    }
});
