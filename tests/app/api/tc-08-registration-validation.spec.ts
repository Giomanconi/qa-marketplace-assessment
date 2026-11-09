import { expect, test } from '../../../fixtures/pom/test-options';
import { attemptRegistration } from '../../../helpers/api/accounts';
import { buildUser } from '../../../test-data/factories/app/builders';
import {
    INVALID_EMAIL,
    MINIMUM_VALID_PASSWORD,
    REJECTED_PASSWORDS,
} from '../../../test-data/static/app/registration';

/**
 * TC-08 (ACC-1, ACC-2): registration validation and duplicate emails, through
 * the registration API. An account the app wrongly accepts is deleted by the
 * helper, so these tests leave nothing behind.
 */
test.describe('tc-08 registration validation', () => {
    for (const row of REJECTED_PASSWORDS) {
        test(
            `should reject a password with ${row.description} (case ${row.id})`,
            { tag: '@api' },
            async () => {
                test.fail(
                    row.id === 'a',
                    '#14 (ACC-1) a 7-character password is accepted (case a)'
                );
                const { status, body } = await attemptRegistration({
                    ...buildUser(),
                    password: row.value,
                });

                expect(status).toBe(400);
                expect(body.fields).toHaveProperty('password');
            }
        );
    }

    test(
        'should accept a password of exactly 8 characters with a letter and a number',
        { tag: '@api' },
        async () => {
            const { status } = await attemptRegistration({
                ...buildUser(),
                password: MINIMUM_VALID_PASSWORD,
            });

            expect(status).toBe(201);
        }
    );

    test(
        'should reject an email without a domain and create nothing',
        { tag: '@api' },
        async () => {
            const { status, body } = await attemptRegistration({
                ...buildUser(),
                email: INVALID_EMAIL,
            });

            expect(status).toBe(400);
            expect(body.fields).toHaveProperty('email');
        }
    );

    test(
        'should reject the same email in another letter case',
        { tag: '@api' },
        async ({ newUser }) => {
            test.fail(
                true,
                '#15 (ACC-2) the same email in another letter case creates a second account'
            );
            const { status, body } = await attemptRegistration({
                ...buildUser(),
                email: newUser.email.toUpperCase(),
            });

            expect(status).toBe(409);
            expect(body.fields).toHaveProperty('email');
        }
    );
});
