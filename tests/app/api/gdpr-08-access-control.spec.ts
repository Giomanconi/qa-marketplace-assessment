import { expect, test } from '../../../fixtures/pom/test-options';
import {
    AppRoutes,
    ApiEndpoints,
    OrderStatus,
    SessionCookie,
} from '../../../enums/app/app';
import { fillCart, placeOrder } from '../../../helpers/api/checkout';
import { apiCall, getOverPlainHttp } from '../../../helpers/api/client';
import {
    HTTP_PERMANENT_REDIRECT,
    SESSION_COOKIE_FLAGS,
} from '../../../test-data/static/app/privacy';
import { cancelOrder, getOrder } from '../../../helpers/api/orders';
import { buildUser } from '../../../test-data/factories/app/builders';

/**
 * GDPR-08 (ACC-3, Art. 32): one user cannot reach another user's data, signed-out
 * visitors reach no personal data, and the forgot-password answer does not reveal
 * whether an email has an account. Buyer A is a throwaway user with an order;
 * buyer B is this worker's buyer. A's unique last name marks A's data in pages.
 */
test.describe('gdpr-08 access control', () => {
    test(
        'should not let another buyer cancel or open a buyer’s order',
        { tag: '@api' },
        async ({ newUser: buyerA, buyer: buyerB, product }) => {
            const orderId =
                await test.step('GIVEN buyer A has a Processing order', async () => {
                    await fillCart(buyerA, product.id);
                    return placeOrder(buyerA);
                });

            await test.step('THEN buyer B cannot cancel it and it stays Processing', async () => {
                const result = await cancelOrder(buyerB, orderId);

                expect(result.status).toBeGreaterThanOrEqual(400);
                expect((await getOrder(buyerA, orderId)).status).toBe(
                    OrderStatus.PROCESSING
                );
            });

            await test.step('THEN buyer B’s view of the order page shows none of A’s data', async () => {
                const response = await buyerB.api.get(
                    AppRoutes.ORDERS + '/' + orderId,
                    { maxRedirects: 0 }
                );

                expect(await response.text()).not.toContain(buyerA.lastName);
            });
        }
    );

    test(
        'should limit the data export to the user who asks',
        { tag: '@api' },
        async ({ newUser: buyerA, buyer: buyerB }) => {
            const response = await buyerB.api.get(ApiEndpoints.ACCOUNT_EXPORT);
            const text = await response.text();

            expect(response.status()).toBe(200);
            expect(text).toContain(buyerB.email);
            expect(text).not.toContain(buyerA.email);
        }
    );

    test(
        'should give a signed-out visitor no account data, orders or export',
        { tag: '@api' },
        async ({ anonymousApi, newUser: buyerA, product }) => {
            const orderId =
                await test.step('GIVEN buyer A has an order', async () => {
                    await fillCart(buyerA, product.id);
                    return placeOrder(buyerA);
                });

            await test.step('THEN the export and the account API refuse a signed-out request', async () => {
                const exported = await apiCall(
                    anonymousApi,
                    'GET',
                    ApiEndpoints.ACCOUNT_EXPORT
                );
                const account = await apiCall(
                    anonymousApi,
                    'GET',
                    ApiEndpoints.ACCOUNT
                );

                expect(exported.status).toBe(401);
                expect(account.status).toBe(401);
            });

            await test.step('THEN a signed-out cancel is refused and the order page shows no data', async () => {
                const cancelled = await apiCall(
                    anonymousApi,
                    'POST',
                    ApiEndpoints.ORDERS + '/' + orderId + '/cancel'
                );
                const page = await anonymousApi.get(
                    AppRoutes.ORDERS + '/' + orderId,
                    { maxRedirects: 0 }
                );

                expect(cancelled.status).toBe(401);
                expect(await page.text()).not.toContain(buyerA.lastName);
            });
        }
    );

    test(
        'should send a plain HTTP request to HTTPS',
        { tag: '@api' },
        async () => {
            const { status, location } = await getOverPlainHttp(AppRoutes.HOME);

            expect(status).toBe(HTTP_PERMANENT_REDIRECT);
            expect(location.startsWith('https://')).toBe(true);
        }
    );

    test(
        'should keep the session cookie away from page scripts and other sites',
        { tag: '@api' },
        async ({ newUser }) => {
            const { cookies } = await newUser.api.storageState();
            const session = cookies.find((c) => c.name === SessionCookie.NAME);

            expect(session?.httpOnly).toBe(true);
            expect(session?.sameSite).toBe(SESSION_COOKIE_FLAGS.sameSite);
        }
    );

    test(
        'should mark the session cookie Secure',
        { tag: '@api' },
        async ({ newUser }) => {
            test.fail(
                true,
                'Observation, not filed: the session cookie has no Secure flag'
            );
            const { cookies } = await newUser.api.storageState();
            const session = cookies.find((c) => c.name === SessionCookie.NAME);

            expect(session?.secure).toBe(true);
        }
    );

    test(
        'should answer the forgot-password request the same for known and unknown emails',
        { tag: '@api' },
        async ({ anonymousApi, buyer }) => {
            const known = await apiCall(
                anonymousApi,
                'POST',
                ApiEndpoints.FORGOT_PASSWORD,
                { email: buyer.email }
            );
            const unknown = await apiCall(
                anonymousApi,
                'POST',
                ApiEndpoints.FORGOT_PASSWORD,
                { email: buildUser().email }
            );

            expect(unknown.status).toBe(known.status);
            expect(unknown.body).toEqual(known.body);
        }
    );
});
