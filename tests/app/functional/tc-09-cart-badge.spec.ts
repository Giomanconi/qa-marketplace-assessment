import { expect, test } from '../../../fixtures/pom/test-options';
import { addToCart } from '../../../helpers/api/orders';
import { CART_BADGE } from '../../../test-data/static/app/pricing';

/**
 * TC-09 (SHOP-6): the header cart badge shows the total quantity of items,
 * not the number of lines. The cart is filled through the API.
 */
test.describe('tc-09 cart badge', () => {
    test.beforeEach(async ({ newUser, signInAs, createPricedProduct }) => {
        const first = await createPricedProduct(10);
        const second = await createPricedProduct(12);
        await addToCart(newUser, first.id, 2);
        await addToCart(newUser, second.id);
        await signInAs(newUser);
    });

    test(
        'should show the total quantity of two items and one more',
        { tag: '@regression' },
        async ({ appPage, cartPage }) => {
            test.fail(
                true,
                'Observation SHOP-6, not filed: the badge counts cart lines (2), not the total quantity (3)'
            );
            await cartPage.open();

            await expect(appPage.nav.cartCount).toHaveText(CART_BADGE.start);
        }
    );

    test(
        'should update the badge when the quantity changes or a line is removed',
        { tag: '@regression' },
        async ({ appPage, cartPage, page }) => {
            test.fail(
                true,
                'Observation SHOP-6, not filed: the badge counts cart lines, not the total quantity'
            );
            await cartPage.open();
            const [first, second] = await page
                .getByTestId('cart-line-title')
                .allInnerTexts();

            await test.step('WHEN the buyer adds one unit', async () => {
                await cartPage.increaseQuantity(first);
            });

            await test.step('THEN the badge shows 4', async () => {
                await expect(appPage.nav.cartCount).toHaveText(
                    CART_BADGE.afterIncrease
                );
            });

            await test.step('WHEN the buyer takes one unit away', async () => {
                await cartPage.decreaseQuantity(first);
            });

            await test.step('THEN the badge shows 3', async () => {
                await expect(appPage.nav.cartCount).toHaveText(
                    CART_BADGE.afterDecrease
                );
            });

            await test.step('WHEN the buyer removes the other line and reloads', async () => {
                await cartPage.removeItem(second);
                await page.reload();
            });

            await test.step('THEN the badge shows 2', async () => {
                await expect(appPage.nav.cartCount).toHaveText(
                    CART_BADGE.afterRemoval
                );
            });
        }
    );
});
