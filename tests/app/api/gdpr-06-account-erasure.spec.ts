import type { APIRequestContext } from '@playwright/test';
import { expect, test } from '../../../fixtures/pom/test-options';
import { ApiEndpoints, AppRoutes } from '../../../enums/app/app';
import {
    attemptRegistration,
    deleteAccount,
    registerUser,
} from '../../../helpers/api/accounts';
import { getPublicProduct } from '../../../helpers/api/catalog';
import { apiCall, getPageOk, newApiSession } from '../../../helpers/api/client';
import { buyAndReview } from '../../../helpers/api/privacy';
import type { TestUser } from '../../../helpers/api/types';
import { buildUser } from '../../../test-data/factories/app/builders';
import { CHECKOUT_ADDRESS } from '../../../test-data/static/app/checkout';
import { DELETED_USER_LABEL } from '../../../test-data/static/app/privacy';

/**
 * GDPR-06 (PRIV-5, Art. 17): after "Delete my account" the old session stops
 * working, the user cannot sign in, nothing can be exported, reviews show
 * "Deleted user", kept orders are anonymised and the same email can sign up
 * again. Each test makes its own user and deletes it inside the test (the
 * shared fixtures would delete it a second time). The app only soft deletes
 * (#18), so the emails stay used.
 */
test.describe('gdpr-06 account erasure', () => {
    const sessions: APIRequestContext[] = [];

    const notDeleted: TestUser[] = [];

    async function deletedUser(): Promise<TestUser> {
        const user = await registerUser(buildUser());
        sessions.push(user.api);
        await deleteAccount(user);
        return user;
    }

    async function freshSession(): Promise<APIRequestContext> {
        const api = await newApiSession();
        sessions.push(api);
        return api;
    }

    // Registers a buyer who reviews an item and deletes the account. If the slow
    // host stops the test before the delete, the afterEach still deletes it.
    async function buyerWhoReviewedAndLeft(
        seller: TestUser,
        productId: string
    ): Promise<TestUser> {
        const buyer = await registerUser(buildUser());
        sessions.push(buyer.api);
        notDeleted.push(buyer);
        await buyAndReview(buyer, seller, productId);
        await deleteAccount(buyer);
        notDeleted.splice(0);
        return buyer;
    }

    test.afterEach(async () => {
        await Promise.all(notDeleted.splice(0).map(deleteAccount));
        await Promise.all(sessions.splice(0).map((api) => api.dispose()));
    });

    test(
        'should end the session of the deleted account',
        { tag: '@api' },
        async () => {
            const user = await test.step(
                'GIVEN a deleted account',
                deletedUser
            );

            await test.step('THEN its old session is refused', async () => {
                const { status } = await apiCall(
                    user.api,
                    'GET',
                    ApiEndpoints.ACCOUNT
                );

                expect(status).toBe(401);
            });
        }
    );

    test(
        'should refuse a new sign-in to the deleted account',
        { tag: '@api' },
        async () => {
            test.fail(true, '#18 (PRIV-5) a deleted account can still sign in');

            const user = await test.step(
                'GIVEN a deleted account',
                deletedUser
            );

            await test.step('THEN signing in is refused', async () => {
                const { status } = await apiCall(
                    await freshSession(),
                    'POST',
                    ApiEndpoints.LOGIN,
                    { email: user.email, password: user.password }
                );

                expect(status).toBe(401);
            });
        }
    );

    test(
        'should give no data export to the deleted account',
        { tag: '@api' },
        async () => {
            test.fail(
                true,
                '#18 (PRIV-5) the data of a deleted account can still be exported'
            );

            const user = await test.step(
                'GIVEN a deleted account',
                deletedUser
            );

            const api = await freshSession();

            await test.step('WHEN someone tries to sign in with it', () =>
                apiCall(api, 'POST', ApiEndpoints.LOGIN, {
                    email: user.email,
                    password: user.password,
                }));

            await test.step('THEN no export is given', async () => {
                const { status } = await apiCall(
                    api,
                    'GET',
                    ApiEndpoints.ACCOUNT_EXPORT
                );

                expect(status).toBe(401);
            });
        }
    );

    test(
        'should let the same email sign up again',
        { tag: '@api' },
        async () => {
            test.fail(
                true,
                '#18 (PRIV-5) the email of a deleted account cannot register again (409)'
            );

            const user = await test.step(
                'GIVEN a deleted account',
                deletedUser
            );

            await test.step('THEN its email can register', async () => {
                const { status } = await attemptRegistration({
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    password: user.password,
                });

                expect(status).toBe(201);
            });
        }
    );

    test(
        'should show Deleted user on the reviews of the deleted account',
        { tag: '@api' },
        async ({ soloSeller, product, anonymousApi }) => {
            test.fail(
                true,
                "#18 (PRIV-5) reviews of a deleted account keep the author's name"
            );
            test.slow();
            const listed = await soloSeller.listProduct(product.price);

            await test.step('GIVEN a buyer reviewed an item and deleted the account', () =>
                buyerWhoReviewedAndLeft(soloSeller.seller, listed.id));

            await test.step('THEN the review shows Deleted user', async () => {
                const { product: answer } = await getPublicProduct(
                    { api: anonymousApi },
                    listed.id
                );

                expect(answer.reviews[0].authorName).toBe(DELETED_USER_LABEL);
            });
        }
    );

    test(
        'should anonymise the kept orders of the deleted account',
        { tag: '@api' },
        async ({ soloSeller, product }) => {
            test.fail(
                true,
                "#18 (PRIV-5) kept orders still show the deleted buyer's name and address to the seller"
            );
            test.slow();
            const listed = await soloSeller.listProduct(product.price);

            const buyer =
                await test.step('GIVEN a buyer received an order and deleted the account', () =>
                    buyerWhoReviewedAndLeft(soloSeller.seller, listed.id));

            await test.step('THEN the seller sees no name or address on the order', async () => {
                const page = await getPageOk(
                    soloSeller.seller.api,
                    AppRoutes.SELLER_ORDERS
                );

                expect(page).not.toContain(buyer.lastName);
                expect(page).not.toContain(CHECKOUT_ADDRESS.line1);
            });
        }
    );
});
