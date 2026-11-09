import { expect, test } from '../../../fixtures/pom/test-options';

const ITEMS_IN_CART = 1;

test.describe('functional cart', () => {
    test(
        'should add a seller item to the cart from its product page',
        { tag: '@sanity' },
        async ({ appPage, signInAs, newUser, product, productPage }) => {
            await test.step('GIVEN a signed-in buyer on the product page', async () => {
                await signInAs(newUser);
                await productPage.open(product.id);
            });

            await test.step('WHEN the buyer adds the item to the cart', async () => {
                await productPage.addToCart();
            });

            await test.step('THEN the header cart shows one item', async () => {
                await expect(appPage.nav.cartLink).toContainText(
                    String(ITEMS_IN_CART)
                );
            });
        }
    );
});
