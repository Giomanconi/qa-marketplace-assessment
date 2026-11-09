import { expect, test } from '../../../fixtures/pom/test-options';
import { fillCart, placeOrder } from '../../../helpers/api/checkout';
import {
    exportData,
    getAccount,
    getAddresses,
    updateAddress,
    updateProfile,
} from '../../../helpers/api/privacy';
import {
    EDITED_CITY,
    EDITED_FIRST_NAME,
    INVALID_ADDRESS_ZIP,
} from '../../../test-data/static/app/privacy';

/**
 * GDPR-05 (PRIV-4, Art. 16): corrections to the profile and to a saved address
 * are kept, show in the account and the export, and invalid values are
 * rejected with a field message.
 */
test.describe('gdpr-05 rectification', () => {
    test(
        'should keep a corrected first name and show it in the account and the export',
        { tag: '@api' },
        async ({ newUser }) => {
            await test.step('WHEN the user corrects the first name', async () => {
                const { status } = await updateProfile(newUser, {
                    firstName: EDITED_FIRST_NAME,
                });
                expect(status).toBe(200);
            });

            await test.step('THEN the account holds the new name', async () => {
                expect((await getAccount(newUser)).user.firstName).toBe(
                    EDITED_FIRST_NAME
                );
            });

            await test.step('THEN the export holds the new name', async () => {
                expect((await exportData(newUser)).text).toContain(
                    EDITED_FIRST_NAME
                );
            });
        }
    );

    test(
        'should reject an empty first name and keep the old one',
        { tag: '@api' },
        async ({ newUser }) => {
            await test.step('WHEN the first name is empty THEN it is rejected', async () => {
                const { status, body } = await updateProfile(newUser, {
                    firstName: '',
                });

                expect(status).toBe(400);
                expect(JSON.stringify(body)).toContain('firstName');
            });

            await test.step('THEN the account keeps the old name', async () => {
                expect((await getAccount(newUser)).user.firstName).toBe(
                    newUser.firstName
                );
            });
        }
    );

    test(
        'should keep a corrected city in the address book and reject an invalid ZIP',
        { tag: '@api' },
        async ({ newUser, product }) => {
            const addressId =
                await test.step('GIVEN the user has a saved address', async () => {
                    await fillCart(newUser, product.id);
                    await placeOrder(newUser, { saveAddress: true });
                    return (await getAddresses(newUser))[0].id;
                });

            await test.step('WHEN the city is corrected', async () => {
                const { status } = await updateAddress(newUser, addressId, {
                    city: EDITED_CITY,
                });

                expect(status).toBe(200);
            });

            await test.step('THEN the address book shows it', async () => {
                expect((await getAddresses(newUser))[0].city).toBe(EDITED_CITY);
            });

            await test.step('WHEN the ZIP is not valid THEN the change is rejected', async () => {
                const { status, body } = await updateAddress(
                    newUser,
                    addressId,
                    { zip: INVALID_ADDRESS_ZIP }
                );

                expect(status).toBe(400);
                expect(JSON.stringify(body)).toContain('zip');
            });
        }
    );
});
