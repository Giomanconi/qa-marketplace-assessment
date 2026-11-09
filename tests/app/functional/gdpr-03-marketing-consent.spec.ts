import { appConfig } from '../../../config/app';
import { expect, test } from '../../../fixtures/pom/test-options';
import { loginUser } from '../../../helpers/api/accounts';
import {
    exportData,
    getAccount,
    updateProfile,
} from '../../../helpers/api/privacy';

/**
 * GDPR-03 (PRIV-6, Arts. 6 and 7): marketing consent is opt-in, separate from
 * the Terms box, and the saved choice matches what the user chose and what the
 * data export shows.
 */
test.describe('gdpr-03 marketing consent', () => {
    test(
        'should keep the Terms box separate and unticked',
        { tag: '@regression' },
        async ({ registerPage }) => {
            await registerPage.open();

            await expect(registerPage.termsCheckbox).not.toBeChecked();
            await expect(registerPage.marketingCheckbox).toBeVisible();
        }
    );

    test(
        'should leave the marketing box unticked until the visitor ticks it',
        { tag: '@regression' },
        async ({ registerPage }) => {
            test.fail(
                true,
                '#21 (PRIV-6) the marketing box is pre-ticked on the registration form'
            );
            await registerPage.open();

            await expect(registerPage.marketingCheckbox).not.toBeChecked();
        }
    );

    for (const marketing of [false, true]) {
        test(
            `should store marketing ${marketing} when the form is sent with that choice`,
            { tag: '@regression' },
            async ({ page, registerPage, formUser, anonymousApi }) => {
                await test.step('WHEN a visitor registers through the form', async () => {
                    await registerPage.open();
                    await registerPage.register(formUser, marketing);
                    await expect(page).not.toHaveURL(/register/, {
                        timeout: appConfig.loginOutcomeTimeout,
                    });
                });

                await test.step('THEN the account holds that choice', async () => {
                    await loginUser(anonymousApi, formUser);
                    const account = await getAccount({ api: anonymousApi });

                    expect(account.user.marketingOptIn).toBe(marketing);
                });
            }
        );
    }

    test(
        'should save the marketing choice both ways and show it in the data export',
        { tag: '@api' },
        async ({ newUser }) => {
            await test.step('GIVEN a new account that did not opt in', async () => {
                expect((await getAccount(newUser)).user.marketingOptIn).toBe(
                    false
                );
            });

            await test.step('WHEN the user turns marketing on', async () => {
                const { status } = await updateProfile(newUser, {
                    marketingOptIn: true,
                });
                expect(status).toBe(200);
            });

            await test.step('THEN the account and the export both say on', async () => {
                expect((await getAccount(newUser)).user.marketingOptIn).toBe(
                    true
                );
                expect(
                    (await exportData(newUser)).file.marketingConsent
                        .emailOffers
                ).toBe(true);
            });

            await test.step('WHEN the user turns it off again', async () => {
                const { status } = await updateProfile(newUser, {
                    marketingOptIn: false,
                });
                expect(status).toBe(200);
            });

            await test.step('THEN the account and the export both say off', async () => {
                expect((await getAccount(newUser)).user.marketingOptIn).toBe(
                    false
                );
                expect(
                    (await exportData(newUser)).file.marketingConsent
                        .emailOffers
                ).toBe(false);
            });
        }
    );
});
