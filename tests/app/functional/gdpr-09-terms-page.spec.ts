import { expect, test } from '../../../fixtures/pom/test-options';
import { AppRoutes } from '../../../enums/app/app';

/**
 * GDPR-09 (LEG-1, LEG-2): the legal documents are reachable. The Terms of
 * Service page is a known defect, kept as an expected failure (`test.fail()`)
 * so the suite stays green and turns red the day the page is fixed.
 */
test.describe('gdpr-09 legal pages', () => {
    test(
        'should load the Terms of Service page',
        { tag: '@regression' },
        async ({ legalPage }) => {
            test.fail(true, '#1 /terms returns 404');

            const status = await legalPage.open(AppRoutes.TERMS);

            expect(status).toBe(200);
        }
    );

    test(
        'should open the Privacy Policy from the footer',
        { tag: '@regression' },
        async ({ legalPage, page }) => {
            await legalPage.open(AppRoutes.HELP);

            await legalPage.privacyLink.click();

            await expect(page).toHaveURL(/\/help#privacy$/);
        }
    );

    test(
        'should open the Cookie Policy from the footer',
        { tag: '@regression' },
        async ({ legalPage, page }) => {
            await legalPage.open(AppRoutes.HELP);

            await legalPage.cookieLink.click();

            await expect(page).toHaveURL(/\/help#cookies$/);
        }
    );
});
