import { expect, test } from '../../../fixtures/pom/test-options';
import { ApiEndpoints } from '../../../enums/app/app';
import { apiCall } from '../../../helpers/api/client';
import {
    buildProduct,
    buildShop,
} from '../../../test-data/factories/app/builders';
import { PRODUCT_REQUIRED_FIELDS } from '../../../test-data/static/app/apiValidation';

type ErrorBody = { error: string; fields: Record<string, string> };

test.describe('api shops', () => {
    test(
        'should open a shop for a user and allow only one',
        { tag: '@api' },
        async ({ newUser }) => {
            const shop = buildShop();

            await test.step('WHEN the user opens a shop', async () => {
                const { status, body } = await apiCall<{
                    shop: { name: string };
                }>(newUser.api, 'POST', ApiEndpoints.SHOP, shop);
                expect(status).toBe(201);
                expect(body.shop.name).toBe(shop.name);
            });

            await test.step('THEN a second shop is rejected', async () => {
                const { status } = await apiCall(
                    newUser.api,
                    'POST',
                    ApiEndpoints.SHOP,
                    buildShop()
                );
                expect(status).toBe(409);
            });
        }
    );

    test(
        'should reject a shop without a name',
        { tag: '@api' },
        async ({ newUser }) => {
            const { status, body } = await apiCall<ErrorBody>(
                newUser.api,
                'POST',
                ApiEndpoints.SHOP,
                { ...buildShop(), name: '' }
            );

            expect(status).toBe(400);
            expect(body.fields).toHaveProperty('name');
        }
    );
});

test.describe('api products', () => {
    test(
        'should create a product, read it publicly and delete it',
        { tag: '@api' },
        async ({ seller }) => {
            const data = buildProduct();
            let productId = '';

            await test.step('WHEN the seller lists a product', async () => {
                const { status, body } = await apiCall<{
                    product: { id: string };
                }>(seller.api, 'POST', ApiEndpoints.SELLER_PRODUCTS, data);
                expect(status).toBe(201);
                productId = body.product.id;
            });

            await test.step('THEN anyone can read it by id', async () => {
                const { status, body } = await apiCall<{
                    product: { title: string };
                }>(seller.api, 'GET', `${ApiEndpoints.PRODUCTS}/${productId}`);
                expect(status).toBe(200);
                expect(body.product.title).toBe(data.title);
            });

            await test.step('WHEN the seller deletes it', async () => {
                const { status } = await apiCall(
                    seller.api,
                    'DELETE',
                    `${ApiEndpoints.SELLER_PRODUCTS}/${productId}`
                );
                expect(status).toBe(200);
            });

            await test.step('THEN deleting it again returns not found', async () => {
                const { status } = await apiCall(
                    seller.api,
                    'DELETE',
                    `${ApiEndpoints.SELLER_PRODUCTS}/${productId}`
                );
                expect(status).toBe(404);
            });
        }
    );

    for (const field of PRODUCT_REQUIRED_FIELDS) {
        test(
            `should reject a product without ${field}`,
            { tag: '@api' },
            async ({ seller }) => {
                const payload: Record<string, unknown> = { ...buildProduct() };
                delete payload[field];

                const { status, body } = await apiCall<ErrorBody>(
                    seller.api,
                    'POST',
                    ApiEndpoints.SELLER_PRODUCTS,
                    payload
                );

                expect(status).toBe(400);
                expect(body.fields).toHaveProperty(field);
            }
        );
    }

    test(
        'should require a signed-in user to create a product',
        { tag: '@api' },
        async ({ anonymousApi }) => {
            const { status } = await apiCall(
                anonymousApi,
                'POST',
                ApiEndpoints.SELLER_PRODUCTS,
                buildProduct()
            );

            expect(status).toBe(401);
        }
    );
});
