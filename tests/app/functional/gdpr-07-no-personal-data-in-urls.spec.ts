import { expect, test } from '../../../fixtures/pom/test-options';
import { AppRoutes } from '../../../enums/app/app';
import { addToCart } from '../../../helpers/api/orders';
import { watchRequestUrls } from '../../../helpers/util/browser-state';

/**
 * GDPR-07 (Arts. 5 and 32): signing in through the form and opening the signed-in
 * pages sends no email or name in any URL, so they cannot end up in logs or
 * browser history.
 */
test.describe('gdpr-07 personal data in URLs', () => {
    test(
        'should keep the email and name out of every requested URL',
        { tag: '@regression' },
        async ({ page, appPage, legalPage, newUser, product }) => {
            const urlsSeen = watchRequestUrls(page);
            await addToCart(newUser, product.id);

            await test.step('WHEN the user signs in through the form', async () => {
                await appPage.openLoginPage();
                await appPage.loginAndVerify(newUser.email, newUser.password);
            });

            await test.step('WHEN the user opens the signed-in pages', async () => {
                await legalPage.open(AppRoutes.CART);
                await legalPage.open(AppRoutes.CHECKOUT);
                await legalPage.open(AppRoutes.ORDERS);
                await legalPage.open(AppRoutes.ACCOUNT);
                await legalPage.open(AppRoutes.ACCOUNT_PRIVACY);
            });

            await test.step('THEN no URL holds the email or the name', async () => {
                const urls = urlsSeen().join('\n');

                expect(urls.length).toBeGreaterThan(0);
                expect(urls).not.toContain(newUser.email);
                expect(urls).not.toContain(encodeURIComponent(newUser.email));
                expect(urls).not.toContain(
                    encodeURIComponent(newUser.lastName)
                );
            });
        }
    );
});
