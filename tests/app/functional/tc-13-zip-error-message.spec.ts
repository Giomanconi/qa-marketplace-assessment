import { expect, test } from '../../../fixtures/pom/test-options';
import { addToCart } from '../../../helpers/api/orders';
import { CHECKOUT_ADDRESS } from '../../../test-data/static/app/checkout';
import { INVALID_ZIP } from '../../../test-data/static/app/validation';

/**
 * TC-13 (assumption, usability): an invalid ZIP code gets a message about the
 * ZIP code, not about the phone number.
 */
test.describe('tc-13 zip error message', () => {
    test(
        'should name the ZIP code in the error for an invalid ZIP',
        { tag: '@regression' },
        async ({ newUser, signInAs, product, checkoutPage }) => {
            test.fail(
                true,
                '#4 the ZIP field shows "Enter a valid phone number."'
            );

            await test.step('GIVEN a buyer at checkout with an item in the cart', async () => {
                await addToCart(newUser, product.id);
                await signInAs(newUser);
                await checkoutPage.open();
            });

            await test.step('WHEN the buyer submits an invalid ZIP code with a valid phone number', async () => {
                await checkoutPage.fillShipping({
                    ...CHECKOUT_ADDRESS,
                    zip: INVALID_ZIP,
                });
                await checkoutPage.placeOrder();
            });

            await test.step('THEN the error under the ZIP field is about the ZIP code', async () => {
                await expect(checkoutPage.zipError).toBeVisible();
                await expect(checkoutPage.zipError).toContainText(/zip/i);
            });
        }
    );
});
