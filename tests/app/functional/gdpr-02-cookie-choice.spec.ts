import { expect, test } from '../../../fixtures/pom/test-options';
import { CONSENT_COOKIE_MIN_DAYS } from '../../../test-data/static/app/privacy';

const SECONDS_PER_DAY = 86400;

/**
 * GDPR-02 (COOK-3, COOK-4, Art. 7): rejecting is as easy as accepting, the
 * choice is remembered for about 12 months, and it can be changed later
 * without clearing browser cookies.
 */
test.describe('gdpr-02 cookie choice', () => {
    test(
        'should offer Reject and Accept side by side, one click each',
        { tag: '@regression' },
        async ({ catalogPage, cookieBanner }) => {
            await test.step('WHEN a visitor opens the site for the first time', async () => {
                await catalogPage.open();
            });

            await test.step('THEN both choices are in the banner, with nothing pre-selected', async () => {
                await expect(cookieBanner.rejectButton).toBeVisible();
                await expect(cookieBanner.acceptButton).toBeVisible();
                await expect(
                    cookieBanner.banner.getByRole('checkbox')
                ).toHaveCount(0);
            });
        }
    );

    test(
        'should remember Accept all for about 12 months',
        { tag: '@regression' },
        async ({ context, catalogPage, cookieBanner }) => {
            await test.step('WHEN the visitor accepts all cookies', async () => {
                await catalogPage.open();
                await cookieBanner.acceptButton.click();
                await expect(cookieBanner.banner).toBeHidden();
            });

            await test.step('THEN the consent cookie lasts at least the documented period', async () => {
                const cookies = await context.cookies();
                const consent = cookies.find((c) => c.name === 'mp_consent');
                const days =
                    ((consent?.expires ?? 0) - Date.now() / 1000) /
                    SECONDS_PER_DAY;

                expect(days).toBeGreaterThanOrEqual(CONSENT_COOKIE_MIN_DAYS);
            });
        }
    );

    test(
        'should let a visitor change the cookie choice without clearing cookies',
        { tag: '@regression' },
        async ({ catalogPage, cookieBanner }) => {
            test.fail(
                true,
                '#22 (COOK-4) there is no footer control to change or withdraw the choice'
            );

            await test.step('GIVEN the visitor has accepted all cookies', async () => {
                await catalogPage.open();
                await cookieBanner.acceptButton.click();
                await expect(cookieBanner.banner).toBeHidden();
            });

            await test.step('THEN the footer offers a cookie settings control', async () => {
                await expect(cookieBanner.changeChoiceControl).toBeVisible();
            });

            await test.step('THEN the control brings the choice back', async () => {
                await cookieBanner.changeChoiceControl.click();
                await expect(cookieBanner.rejectButton).toBeVisible();
            });
        }
    );
});
