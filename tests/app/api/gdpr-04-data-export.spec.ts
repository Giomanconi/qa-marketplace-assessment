import { expect, test } from '../../../fixtures/pom/test-options';
import { fillCart, placeOrder } from '../../../helpers/api/checkout';
import { buyAndReview, exportData } from '../../../helpers/api/privacy';
import { CHECKOUT_ADDRESS } from '../../../test-data/static/app/checkout';
import {
    SECRET_WORDS,
    SYNTHETIC_REVIEW,
} from '../../../test-data/static/app/privacy';

/**
 * GDPR-04 (PRIV-1, PRIV-3, Arts. 15 and 20): "Download my data" holds the
 * profile, saved addresses, orders and reviews, and no secrets or other users'
 * data. The buyer has a delivered order and a review, so the checks run on a
 * filled account. The signed-out check is in gdpr-08.
 */
test.describe('gdpr-04 data export', () => {
    test(
        'should export the profile of the user',
        { tag: '@api' },
        async ({ newUser }) => {
            const { text } = await exportData(newUser);

            expect(text).toContain(newUser.email);
            expect(text).toContain(newUser.lastName);
        }
    );

    test(
        'should list the reviews and leave out secrets and the seller’s email',
        { tag: '@api' },
        async ({ newUser, soloSeller, product }) => {
            test.slow();

            await test.step('GIVEN the user received an item and reviewed it', async () => {
                const listed = await soloSeller.listProduct(product.price);
                await buyAndReview(newUser, soloSeller.seller, listed.id);
            });

            const { text } =
                await test.step('WHEN the user downloads the data', () =>
                    exportData(newUser));

            await test.step('THEN the review is there, and no secret or other user', async () => {
                expect(text).toContain(SYNTHETIC_REVIEW.body);
                for (const word of SECRET_WORDS)
                    expect(text.toLowerCase()).not.toContain(word);
                expect(text).not.toContain(newUser.password);
                expect(text).not.toContain(soloSeller.seller.email);
            });
        }
    );

    test(
        'should list the orders of the user',
        { tag: '@api' },
        async ({ newUser, product }) => {
            test.fail(
                true,
                '#20 (PRIV-3) the export has no orders and no saved addresses'
            );

            const orderId =
                await test.step('GIVEN the user placed an order', async () => {
                    await fillCart(newUser, product.id);
                    return placeOrder(newUser);
                });

            await test.step('THEN the export contains that order', async () => {
                expect((await exportData(newUser)).text).toContain(orderId);
            });
        }
    );

    test(
        'should list the saved addresses of the user',
        { tag: '@api' },
        async ({ newUser, product }) => {
            test.fail(
                true,
                '#20 (PRIV-3) the export has no orders and no saved addresses'
            );

            await test.step('GIVEN the user saved an address at checkout', async () => {
                await fillCart(newUser, product.id);
                await placeOrder(newUser, { saveAddress: true });
            });

            await test.step('THEN the export contains that address', async () => {
                expect((await exportData(newUser)).text).toContain(
                    CHECKOUT_ADDRESS.line1
                );
            });
        }
    );
});
