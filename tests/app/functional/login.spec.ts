import { expect, test } from '../../../fixtures/pom/test-options';
import { appConfig } from '../../../config/app';
import { Messages } from '../../../enums/app/app';
import { INVALID_LOGIN_ATTEMPTS } from '../../../test-data/static/app/invalidCredentials';

const ERROR_MESSAGES: Record<
    (typeof INVALID_LOGIN_ATTEMPTS)[number]['expectedError'],
    Messages
> = {
    'fields-required': Messages.LOGIN_FIELDS_REQUIRED,
    'invalid-credentials': Messages.LOGIN_INVALID_CREDENTIALS,
};

test.describe('login form', () => {
    test.beforeEach(async ({ appPage }) => {
        await appPage.openLoginPage();
    });

    test(
        'signs in with valid credentials',
        { tag: '@smoke' },
        async ({ appPage, buyer }) => {
            await test.step('WHEN a user created via the API enters their credentials', async () => {
                await appPage.login(buyer.email, buyer.password);
            });

            await test.step('THEN the account link is shown instead of Sign in', async () => {
                await expect(appPage.nav.accountLink).toBeVisible({
                    timeout: appConfig.loginOutcomeTimeout,
                });
                await expect(appPage.nav.signInLink).toBeHidden();
            });
        }
    );

    for (const {
        description,
        email,
        password,
        expectedError,
    } of INVALID_LOGIN_ATTEMPTS) {
        test(
            `rejects a failed login: ${description}`,
            { tag: '@regression' },
            async ({ appPage }) => {
                await test.step('WHEN user submits the invalid credentials', async () => {
                    await appPage.login(email, password);
                });

                await test.step('THEN the expected error is displayed and user stays signed out', async () => {
                    await expect(
                        appPage.errorAlert(ERROR_MESSAGES[expectedError])
                    ).toBeVisible();
                    await expect(appPage.loginHeading).toBeVisible();
                    await expect(appPage.nav.accountLink).toBeHidden();
                });
            }
        );
    }
});
