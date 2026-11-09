import { AppRoutes } from '../../../enums/app/app';
import { expect, test } from '../../../fixtures/pom/test-options';
import { addToCart } from '../../../helpers/api/orders';
import { scrollsSideways } from '../../../helpers/util/browser-state';
import {
    SIDEWAYS_TOLERANCE_PX,
    VIEWPORTS,
} from '../../../test-data/static/app/validation';

/**
 * TC-10 (usability): at 375, 768 and 1440 px the home page, catalogue, a product
 * page, the cart, checkout and account do not scroll sideways, and the main
 * action is on screen where a page has one. Overlap, clipped text and visible
 * keyboard focus need an eye, so they stay a manual check (docs/03).
 */
test.describe('tc-10 responsive layout', () => {
    for (const viewport of VIEWPORTS) {
        test.describe(`${viewport.name} ${viewport.width} px`, () => {
            test.use({
                viewport: { width: viewport.width, height: viewport.height },
            });

            test(
                'should fit the home page to the screen',
                { tag: '@regression' },
                async ({ page, appPage }) => {
                    await appPage.openHomePage();

                    expect(
                        await scrollsSideways(page, SIDEWAYS_TOLERANCE_PX)
                    ).toBe(false);
                }
            );

            test(
                'should fit the catalogue to the screen',
                { tag: '@regression' },
                async ({ page, catalogPage }) => {
                    test.fail(
                        viewport.width === 375,
                        'Observation TC-10, not filed: at 375 px the catalogue is 21 px wider than the screen once the pagination row has loaded'
                    );
                    await catalogPage.open();
                    await expect(catalogPage.pagination).toBeVisible();

                    expect(
                        await scrollsSideways(page, SIDEWAYS_TOLERANCE_PX)
                    ).toBe(false);
                    await expect(catalogPage.searchBox).toBeVisible();
                }
            );

            test(
                'should fit a product page to the screen',
                { tag: '@regression' },
                async ({ page, productPage, product }) => {
                    await productPage.open(product.id);

                    expect(
                        await scrollsSideways(page, SIDEWAYS_TOLERANCE_PX)
                    ).toBe(false);
                    await expect(productPage.addToCartButton).toBeVisible();
                }
            );

            test(
                'should fit the cart to the screen',
                { tag: '@regression' },
                async ({ page, cartPage, newUser, product, signInAs }) => {
                    test.fail(
                        viewport.width === 375,
                        'Observation TC-10, not filed: at 375 px a cart with an item is 50 px wider than the screen'
                    );
                    await addToCart(newUser, product.id);
                    await signInAs(newUser);
                    await cartPage.open();

                    expect(
                        await scrollsSideways(page, SIDEWAYS_TOLERANCE_PX)
                    ).toBe(false);
                    await expect(cartPage.checkoutLink).toBeVisible();
                }
            );

            test(
                'should fit the checkout to the screen',
                { tag: '@regression' },
                async ({ page, checkoutPage, newUser, product, signInAs }) => {
                    await addToCart(newUser, product.id);
                    await signInAs(newUser);
                    await checkoutPage.open();

                    expect(
                        await scrollsSideways(page, SIDEWAYS_TOLERANCE_PX)
                    ).toBe(false);
                    await expect(checkoutPage.placeOrderButton).toBeVisible();
                }
            );

            test(
                'should fit the account page to the screen',
                { tag: '@regression' },
                async ({ page, legalPage, newUser, signInAs }) => {
                    await signInAs(newUser);
                    await legalPage.open(AppRoutes.ACCOUNT);

                    expect(
                        await scrollsSideways(page, SIDEWAYS_TOLERANCE_PX)
                    ).toBe(false);
                }
            );
        });
    }
});
