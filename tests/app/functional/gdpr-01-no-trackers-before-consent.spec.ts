import { expect, test } from '../../../fixtures/pom/test-options';
import { AppRoutes } from '../../../enums/app/app';
import {
    cookieNames,
    storageKeys,
    watchRequestHosts,
} from '../../../helpers/util/browser-state';
import { ESSENTIAL_COOKIES } from '../../../test-data/static/app/validation';

/**
 * GDPR-01 (COOK-1, COOK-2, COOK-3): before the visitor chooses, the site sets
 * no cookie or storage and talks only to its own host; after either choice only
 * essential cookies exist and the banner stays away. A fresh browser context
 * (the default) starts with no cookies.
 */
test.describe('gdpr-01 cookies and trackers', () => {
    const appHost = new URL(process.env.APP_URL!).host;

    test(
        'should set no cookie, storage or third-party request before the visitor chooses',
        { tag: '@regression' },
        async ({ page, context, catalogPage, legalPage, cookieBanner }) => {
            const hostsSeen = watchRequestHosts(page);

            await test.step('WHEN a visitor opens two pages without touching the banner', async () => {
                await catalogPage.open();
                await legalPage.open(AppRoutes.HELP);
            });

            await test.step('THEN the banner is still asked for a choice', async () => {
                await expect(cookieBanner.banner).toBeVisible();
            });

            await test.step('THEN there is no cookie, no storage key and only first-party traffic', async () => {
                expect(await cookieNames(context)).toEqual([]);
                expect(await storageKeys(page)).toEqual([]);
                expect(hostsSeen()).toEqual([appHost]);
            });
        }
    );

    test(
        'should keep only essential cookies and stay quiet after Reject non-essential',
        { tag: '@regression' },
        async ({ page, context, catalogPage, cookieBanner }) => {
            test.fail(
                true,
                '#16 (COOK-3) Reject non-essential is not remembered: no cookie is set and the banner returns'
            );
            const hostsSeen = watchRequestHosts(page);

            await test.step('WHEN the visitor rejects non-essential cookies', async () => {
                await catalogPage.open();
                await cookieBanner.rejectButton.click();
                await expect(cookieBanner.banner).toBeHidden();
            });

            await test.step('THEN only essential cookies exist and traffic is first-party', async () => {
                const names = await cookieNames(context);

                expect(names).toContain('mp_consent');
                for (const name of names)
                    expect(ESSENTIAL_COOKIES).toContain(name);
                expect(hostsSeen()).toEqual([appHost]);
            });

            await test.step('THEN the banner does not come back after a reload', async () => {
                await page.reload();
                await expect(cookieBanner.banner).toBeHidden();
            });
        }
    );

    test(
        'should remember Accept all and set no cookie beyond the essential ones',
        { tag: '@regression' },
        async ({ page, context, catalogPage, cookieBanner }) => {
            await test.step('WHEN the visitor accepts all cookies', async () => {
                await catalogPage.open();
                await cookieBanner.acceptButton.click();
                await expect(cookieBanner.banner).toBeHidden();
            });

            await test.step('THEN the choice is stored as a cookie and nothing else is added', async () => {
                const names = await cookieNames(context);

                expect(names).toContain('mp_consent');
                for (const name of names)
                    expect(ESSENTIAL_COOKIES).toContain(name);
            });

            await test.step('THEN the banner does not come back after a reload', async () => {
                await page.reload();
                await expect(cookieBanner.banner).toBeHidden();
            });
        }
    );
});
