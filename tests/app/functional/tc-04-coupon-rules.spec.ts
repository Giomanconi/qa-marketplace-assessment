import { expect, test } from '../../../fixtures/pom/test-options';
import { applyCoupon, fillCart, getCart } from '../../../helpers/api/checkout';
import { addToCart } from '../../../helpers/api/orders';
import {
    COUPON_CASE_ROWS,
    COUPON_CASE_SUBTOTAL,
    COUPON_MINIMUM_ROWS,
    COUPON_REMOVAL_CART,
    COUPONS,
    UNKNOWN_COUPON,
    WELCOME10_DISCOUNT_ON_50,
} from '../../../test-data/static/app/pricing';

type CouponError = { fields: { code: string } };

/**
 * TC-04 (CPN-1 to CPN-4, CPN-8): coupon rules and boundaries. The cart is
 * built and read through the API; case e also uses the cart page.
 */
test.describe('tc-04 coupon rules', () => {
    for (const row of COUPON_MINIMUM_ROWS) {
        test(
            `should refuse ${row.code} just below its minimum for case ${row.id} ($${row.below})`,
            { tag: '@regression' },
            async ({ newUser, createPricedProduct }) => {
                await test.step(`GIVEN a $${row.below} cart`, async () => {
                    const item = await createPricedProduct(row.below);
                    await addToCart(newUser, item.id);
                });

                await test.step('WHEN the code is applied', async () => {
                    const result = await applyCoupon(newUser, row.code);

                    expect(result.status).toBe(400);
                    expect((result.body as CouponError).fields.code).toBe(
                        row.message
                    );
                });

                await test.step('THEN the cart has no discount', async () => {
                    expect((await getCart(newUser)).discount).toBe(0);
                });
            }
        );

        test(
            `should apply ${row.code} at its minimum for case ${row.id} ($${row.minimum})`,
            { tag: '@regression' },
            async ({ newUser, createPricedProduct }) => {
                await test.step(`GIVEN a $${row.minimum} cart`, async () => {
                    const item = await createPricedProduct(row.minimum);
                    await addToCart(newUser, item.id);
                });

                await test.step('WHEN the code is applied', async () => {
                    expect((await applyCoupon(newUser, row.code)).status).toBe(
                        200
                    );
                });

                await test.step('THEN the discount is the fixed amount', async () => {
                    expect((await getCart(newUser)).discount).toBe(
                        row.discount
                    );
                });
            }
        );
    }

    for (const row of COUPON_CASE_ROWS) {
        test(
            `should accept the code in ${row.id} case (${row.code})`,
            { tag: '@regression' },
            async ({ newUser, createPricedProduct }) => {
                await test.step('GIVEN a $50 cart', async () => {
                    const item =
                        await createPricedProduct(COUPON_CASE_SUBTOTAL);
                    await addToCart(newUser, item.id);
                });

                await test.step('WHEN the code is applied in another letter case', async () => {
                    expect((await applyCoupon(newUser, row.code)).status).toBe(
                        200
                    );
                });

                await test.step('THEN the discount is the same as for WELCOME10', async () => {
                    expect((await getCart(newUser)).discount).toBe(
                        WELCOME10_DISCOUNT_ON_50
                    );
                });
            }
        );
    }

    test(
        'should refuse a second code while one is applied',
        { tag: '@regression' },
        async ({ newUser, createPricedProduct }) => {
            await test.step('GIVEN a $50 cart with WELCOME10 applied', async () => {
                const item = await createPricedProduct(COUPON_CASE_SUBTOTAL);
                await fillCart(newUser, item.id, COUPONS.WELCOME10);
            });

            await test.step('WHEN a second code is applied', async () => {
                expect((await applyCoupon(newUser, COUPONS.TAKE5)).status).toBe(
                    409
                );
            });

            await test.step('THEN the first code stays and the discount is unchanged', async () => {
                const cart = await getCart(newUser);

                expect(cart.coupon?.code).toBe(COUPONS.WELCOME10);
                expect(cart.discount).toBe(WELCOME10_DISCOUNT_ON_50);
            });
        }
    );

    test(
        'should drop SAVE20 when removing an item takes the subtotal below $100',
        { tag: '@regression' },
        async ({
            newUser,
            signInAs,
            createPricedProduct,
            cartPage,
            checkoutPage,
        }) => {
            test.fail(
                true,
                '#7 (CPN-4) SAVE20 stays applied after the subtotal drops below $100'
            );

            const removed =
                await test.step('GIVEN a $100 cart (two items) with SAVE20 applied', async () => {
                    const kept = await createPricedProduct(
                        COUPON_REMOVAL_CART.kept
                    );
                    const second = await createPricedProduct(
                        COUPON_REMOVAL_CART.removed
                    );
                    await fillCart(newUser, kept.id);
                    await fillCart(newUser, second.id, COUPONS.SAVE20);
                    return second;
                });

            await test.step('WHEN the buyer removes the $40 item in the cart', async () => {
                await signInAs(newUser);
                await cartPage.open();
                await cartPage.removeItem(removed.title);
            });

            await test.step('THEN the code is gone and the total is recalculated', async () => {
                const cart = await getCart(newUser);

                expect(cart.coupon).toBeNull();
                expect(cart.discount).toBe(0);
                expect(cart.subtotal).toBe(COUPON_REMOVAL_CART.kept);
                await expect(cartPage.removeCouponButton).toBeHidden();
            });

            await test.step('THEN the checkout shows no discount', async () => {
                await checkoutPage.open();
                await expect(checkoutPage.summaryDiscount).toBeHidden();
            });
        }
    );

    test(
        'should refuse an unknown code with a clear message and change nothing',
        { tag: '@regression' },
        async ({ newUser, createPricedProduct }) => {
            await test.step('GIVEN a $50 cart', async () => {
                const item = await createPricedProduct(COUPON_CASE_SUBTOTAL);
                await addToCart(newUser, item.id);
            });

            await test.step('WHEN an unknown code is applied', async () => {
                const result = await applyCoupon(newUser, UNKNOWN_COUPON.code);

                expect(result.status).toBe(400);
                expect((result.body as CouponError).fields.code).toBe(
                    UNKNOWN_COUPON.message
                );
            });

            await test.step('THEN the cart is unchanged', async () => {
                const cart = await getCart(newUser);

                expect(cart.coupon).toBeNull();
                expect(cart.discount).toBe(0);
            });
        }
    );
});
