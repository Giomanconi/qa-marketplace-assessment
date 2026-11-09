import { expect, test } from '../../../fixtures/pom/test-options';
import { ApiEndpoints } from '../../../enums/app/app';
import {
    buildProduct,
    buildShop,
    buildUser,
} from '../../../test-data/factories/app/builders';
import { apiCall } from '../../../helpers/api/client';
import { deleteAccount, registerUser } from '../../../helpers/api/accounts';
import {
    createProduct,
    createShop,
    deleteProduct,
} from '../../../helpers/api/selling';

test.describe('api account, shop and product lifecycle', () => {
    test(
        'should create and delete a user, a shop and a product',
        { tag: '@api' },
        async () => {
            const user = await test.step('GIVEN a new registered user', () =>
                registerUser(buildUser()));

            const product = buildProduct();
            let productId = '';

            await test.step('WHEN the user opens a shop and lists a product', async () => {
                await createShop(user, buildShop());
                productId = await createProduct(user, product);
            });

            await test.step('THEN the product is publicly readable', async () => {
                const { status, body } = await apiCall<{
                    product: { title: string };
                }>(user.api, 'GET', `${ApiEndpoints.PRODUCTS}/${productId}`);
                expect(status).toBe(200);
                expect(body.product.title).toBe(product.title);
            });

            await test.step('WHEN the product and the account are deleted', async () => {
                await deleteProduct(user, productId);
                await deleteAccount(user);
            });

            await test.step('THEN the old session no longer works', async () => {
                const { status } = await apiCall(
                    user.api,
                    'GET',
                    ApiEndpoints.ACCOUNT
                );
                expect(status).toBe(401);
            });
        }
    );
});
