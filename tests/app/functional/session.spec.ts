import { expect, test } from '../../../fixtures/pom/test-options';
import { appConfig } from '../../../config/app';

test.describe('functional session', () => {
    test(
        'should start signed in when the API session is copied to the browser',
        { tag: '@sanity' },
        async ({ appPage, signInAs, buyer }) => {
            await test.step('GIVEN the browser uses the API session of a new user', async () => {
                await signInAs(buyer);
            });

            await test.step('WHEN the home page opens', async () => {
                await appPage.openHomePage();
            });

            await test.step('THEN the account link is shown without a UI login', async () => {
                await expect(appPage.nav.accountLink).toBeVisible({
                    timeout: appConfig.loginOutcomeTimeout,
                });
            });
        }
    );
});
