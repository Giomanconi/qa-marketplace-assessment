import { expect, test } from '../../../fixtures/pom/test-options';
import { OrderStatus } from '../../../enums/app/app';
import { fillCart, placeOrder } from '../../../helpers/api/checkout';
import {
    cancelOrder,
    getOrder,
    getProductStock,
} from '../../../helpers/api/orders';
import { shipOrder } from '../../../helpers/api/selling';
import { usd } from '../../../helpers/util/money';
import { TRACKING_NUMBER } from '../../../test-data/static/app/checkout';

/**
 * TC-02 (ORD-3, ORD-4): a Processing order can be cancelled, which refunds the
 * full total and returns the stock; a Shipped order cannot be cancelled, in
 * the UI or by a direct request. Orders are placed through the API.
 */
test.describe('tc-02 cancel an order', () => {
    test(
        'should cancel a Processing order and offer the full total as refund',
        { tag: '@e2e' },
        async ({ newUser, signInAs, product, orderDetailPage }) => {
            const orderId =
                await test.step('GIVEN a Processing order', async () => {
                    await fillCart(newUser, product.id);
                    return placeOrder(newUser);
                });

            const total = (await getOrder(newUser, orderId)).total;

            await test.step('WHEN the buyer cancels it in the UI', async () => {
                await signInAs(newUser);
                await orderDetailPage.open(orderId);
                await orderDetailPage.openCancelDialog();
                await expect(orderDetailPage.cancelDialog).toContainText(
                    usd(total)
                );
                await orderDetailPage.confirmCancelButton.click();
            });

            await test.step('THEN the order is Cancelled in the page and in the API', async () => {
                await expect(orderDetailPage.status).toHaveText(
                    new RegExp(OrderStatus.CANCELLED, 'i')
                );
                expect((await getOrder(newUser, orderId)).status).toBe(
                    OrderStatus.CANCELLED
                );
            });
        }
    );

    test(
        'should return the ordered units to stock when the order is cancelled',
        { tag: '@regression' },
        async ({ newUser, seller, product }) => {
            test.fail(
                true,
                '#9 (ORD-4) cancelling does not return the items to stock'
            );

            const orderId =
                await test.step('GIVEN a Processing order that took one unit from stock', async () => {
                    await fillCart(newUser, product.id);
                    return placeOrder(newUser);
                });

            await test.step('WHEN the order is cancelled', async () => {
                expect((await cancelOrder(newUser, orderId)).status).toBe(200);
            });

            await test.step('THEN the stock is back to its original value', async () => {
                expect(await getProductStock(seller, product.id)).toBe(
                    product.stock
                );
            });
        }
    );

    test(
        'should refuse to cancel a Shipped order, in the UI and by a direct request',
        { tag: '@regression' },
        async ({ newUser, seller, signInAs, product, orderDetailPage }) => {
            test.fail(
                true,
                '#8 (ORD-3) the server accepts cancelling a Shipped order'
            );

            const orderId =
                await test.step('GIVEN an order the seller has shipped', async () => {
                    await fillCart(newUser, product.id);
                    const id = await placeOrder(newUser);
                    expect(
                        (await shipOrder(seller, id, TRACKING_NUMBER)).status
                    ).toBe(200);
                    return id;
                });

            await test.step('THEN the order page offers no cancel button', async () => {
                await signInAs(newUser);
                await orderDetailPage.open(orderId);
                await expect(orderDetailPage.status).toHaveText(
                    new RegExp(OrderStatus.SHIPPED, 'i')
                );
                await expect(orderDetailPage.cancelButton).toBeHidden();
            });

            await test.step('THEN a direct cancel request is rejected and the order stays Shipped', async () => {
                const result = await cancelOrder(newUser, orderId);

                expect(result.status).toBeGreaterThanOrEqual(400);
                expect((await getOrder(newUser, orderId)).status).toBe(
                    OrderStatus.SHIPPED
                );
            });
        }
    );
});
