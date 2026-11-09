import { expect, test } from '../../../fixtures/pom/test-options';
import { ShippingMethod } from '../../../enums/app/app';
import { fillCart, getCart, placeOrder } from '../../../helpers/api/checkout';
import { getOrder } from '../../../helpers/api/orders';
import { isFreeShipping } from '../../../helpers/util/money';
import {
    EXPRESS_SHIPPING_PRICE,
    ROUNDING_EDGE,
    STANDARD_SHIPPING_ROWS,
} from '../../../test-data/static/app/pricing';

/**
 * TC-05 (SHIP-3, SHIP-4, SHIP-5): Standard is free from $50.00 after the
 * discount; tax and shipping never count toward the threshold. The cart is
 * built and read through the API.
 */
test.describe('tc-05 free shipping threshold', () => {
    for (const row of STANDARD_SHIPPING_ROWS) {
        const label = row.coupon
            ? `$${row.subtotal} with ${row.coupon}`
            : `$${row.subtotal}`;

        test(
            `should charge Standard shipping of $${row.shipping} for case ${row.id} (${label})`,
            { tag: '@regression' },
            async ({ newUser, createPricedProduct }) => {
                test.fail(
                    row.id === 'b',
                    '#6 (SHIP-3) Standard is not free at exactly $50.00 (case b)'
                );

                await test.step('GIVEN a cart with the subtotal and coupon of the case', async () => {
                    const item = await createPricedProduct(row.subtotal);
                    await fillCart(newUser, item.id, row.coupon);
                });

                await test.step('THEN the Standard shipping is the expected amount', async () => {
                    expect((await getCart(newUser)).shipping).toBe(
                        row.shipping
                    );
                });
            }
        );
    }

    test(
        'should decide free shipping from the discounted subtotal it shows ($55.55 with WELCOME10)',
        { tag: '@regression' },
        async ({ newUser, createPricedProduct }) => {
            await test.step('GIVEN a $55.55 cart with WELCOME10', async () => {
                const item = await createPricedProduct(ROUNDING_EDGE.subtotal);
                await fillCart(newUser, item.id, ROUNDING_EDGE.coupon);
            });

            await test.step('THEN shipping is free exactly when the subtotal after discount reaches $50', async () => {
                const cart = await getCart(newUser);
                const shownSubtotal = cart.subtotal - cart.discount;
                expect(cart.shipping === 0).toBe(isFreeShipping(shownSubtotal));
            });
        }
    );

    test(
        'should charge Express at $9.99 for a $50 cart',
        { tag: '@regression' },
        async ({ newUser, createPricedProduct }) => {
            test.fail(true, '#3 Express is charged $14.99 instead of $9.99');

            await test.step('GIVEN a $50 cart', async () => {
                const item = await createPricedProduct(50);
                await fillCart(newUser, item.id);
            });

            await test.step('THEN the Express order charges $9.99 shipping', async () => {
                const orderId = await placeOrder(newUser, {
                    shippingMethod: ShippingMethod.EXPRESS,
                });
                expect((await getOrder(newUser, orderId)).shipping).toBe(
                    EXPRESS_SHIPPING_PRICE
                );
            });
        }
    );
});
