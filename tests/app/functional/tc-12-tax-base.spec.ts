import { expect, test } from '../../../fixtures/pom/test-options';
import { ShippingMethod } from '../../../enums/app/app';
import {
    fillCart,
    getCart,
    placeOrder,
    removeCoupon,
} from '../../../helpers/api/checkout';
import { getOrder } from '../../../helpers/api/orders';
import { usd } from '../../../helpers/util/money';
import { selectRows } from '../../../helpers/util/rows';
import {
    COUPONS,
    TAX_ROWS,
    TAX_WITHOUT_COUPON,
} from '../../../test-data/static/app/pricing';

/**
 * TC-12 (TAX-2, TAX-3): tax is 8% of the discounted item subtotal and never
 * includes shipping. The cart is built through the API; the UI shows the cart
 * summary; the saved order is read back through the API. ROW=random runs one
 * random case of the table, ROW=<id> one chosen case; the other tests always run.
 */
test.describe('tc-12 tax base', () => {
    for (const row of selectRows(TAX_ROWS)) {
        const label = row.coupon
            ? `$${row.subtotal} with ${row.coupon}`
            : `$${row.subtotal}`;

        test(
            `should charge tax on the discounted subtotal for case ${row.id} (${label})`,
            { tag: '@regression' },
            async ({ newUser, signInAs, createPricedProduct, cartPage }) => {
                test.fail(
                    row.coupon !== null,
                    '#2 tax is charged on the full subtotal instead of the discounted subtotal'
                );

                await test.step('GIVEN a cart with the subtotal and coupon of the case', async () => {
                    const item = await createPricedProduct(row.subtotal);
                    await fillCart(newUser, item.id, row.coupon);
                });

                await test.step('THEN the cart summary shows the expected tax', async () => {
                    await signInAs(newUser);
                    await cartPage.open();
                    await expect(cartPage.tax).toHaveText(usd(row.tax));
                });

                await test.step('THEN the saved Standard order has the same tax', async () => {
                    const orderId = await placeOrder(newUser);
                    expect((await getOrder(newUser, orderId)).tax).toBe(
                        row.tax
                    );
                });
            }
        );
    }

    test(
        'should not tax shipping when Express is chosen',
        { tag: '@regression' },
        async ({ newUser, createPricedProduct }) => {
            test.fail(
                true,
                '#2 the tax base is wrong, so Express (case c, $109 with WELCOME10) also shows the wrong tax'
            );
            const [row] = TAX_ROWS.filter((r) => r.id === 'c');

            await test.step('GIVEN a $109 cart with WELCOME10', async () => {
                const item = await createPricedProduct(row.subtotal);
                await fillCart(newUser, item.id, COUPONS.WELCOME10);
            });

            await test.step('THEN the Express order has the same tax as the case expects', async () => {
                const orderId = await placeOrder(newUser, {
                    shippingMethod: ShippingMethod.EXPRESS,
                });
                expect((await getOrder(newUser, orderId)).tax).toBe(row.tax);
            });
        }
    );

    test(
        'should return the tax to 8% of the subtotal when the coupon is removed',
        { tag: '@regression' },
        async ({ newUser, createPricedProduct }) => {
            await test.step('GIVEN a $50 cart with WELCOME10', async () => {
                const item = await createPricedProduct(50);
                await fillCart(newUser, item.id, COUPONS.WELCOME10);
            });

            await test.step('WHEN the coupon is removed', async () => {
                expect((await removeCoupon(newUser)).status).toBe(200);
            });

            await test.step('THEN the tax is 8% of the full subtotal', async () => {
                expect((await getCart(newUser)).tax).toBe(TAX_WITHOUT_COUPON);
            });
        }
    );
});
