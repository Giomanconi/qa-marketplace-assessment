import { expect, test } from '../../../fixtures/pom/test-options';
import { ApiEndpoints } from '../../../enums/app/app';
import { apiCall } from '../../../helpers/api/client';
import { deleteAccount, sendRegistration } from '../../../helpers/api/accounts';
import { buildUser } from '../../../test-data/factories/app/builders';
import { REGISTER_REQUIRED_FIELDS } from '../../../test-data/static/app/apiValidation';

type RegisterBody = { user: { id: string; email: string } };
type ErrorBody = { error: string; fields: Record<string, string> };

test.describe('api accounts', () => {
    test(
        'should register a new user and log them in',
        { tag: '@api' },
        async ({ anonymousApi }) => {
            const user = buildUser();

            const { status, body } =
                await test.step('WHEN a new user registers', () =>
                    sendRegistration<RegisterBody>(anonymousApi, {
                        ...user,
                        acceptTerms: true,
                        marketingOptIn: false,
                    }));

            await test.step('THEN the user is created and the session is logged in', async () => {
                expect(status).toBe(201);
                expect(body.user.email).toBe(user.email);

                const me = await apiCall(
                    anonymousApi,
                    'GET',
                    ApiEndpoints.ACCOUNT
                );
                expect(me.status).toBe(200);
            });

            await test.step('TEARDOWN the account is deleted', () =>
                deleteAccount({
                    ...user,
                    id: body.user.id,
                    api: anonymousApi,
                }));
        }
    );

    test(
        'should reject a second registration with the same email',
        { tag: '@api' },
        async ({ anonymousApi, buyer }) => {
            const { status, body } = await sendRegistration<ErrorBody>(
                anonymousApi,
                { ...buildUser(), email: buyer.email, acceptTerms: true }
            );

            expect(status).toBe(409);
            expect(body.fields).toHaveProperty('email');
        }
    );

    for (const field of REGISTER_REQUIRED_FIELDS) {
        test(
            `should reject registration without ${field}`,
            { tag: '@api' },
            async ({ anonymousApi }) => {
                const payload: Record<string, unknown> = {
                    ...buildUser(),
                    acceptTerms: true,
                };
                delete payload[field];

                const { status, body } = await sendRegistration<ErrorBody>(
                    anonymousApi,
                    payload
                );

                expect(status).toBe(400);
                expect(body.fields).toHaveProperty(field);
            }
        );
    }

    test(
        'should not delete an account when the password is wrong',
        { tag: '@api' },
        async ({ newUser }) => {
            const { status } = await apiCall(
                newUser.api,
                'DELETE',
                ApiEndpoints.ACCOUNT,
                { confirm: 'DELETE', password: 'Wrong-password-1' }
            );
            expect(status).toBe(403);

            const me = await apiCall(newUser.api, 'GET', ApiEndpoints.ACCOUNT);
            expect(me.status).toBe(200);
        }
    );
});
