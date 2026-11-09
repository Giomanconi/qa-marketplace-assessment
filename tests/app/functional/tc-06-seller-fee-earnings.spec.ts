import { expect, test } from '../../../fixtures/pom/test-options';
import { fillCart, placeOrder } from '../../../helpers/api/checkout';
import { cancelOrder } from '../../../helpers/api/orders';
import { usd } from '../../../helpers/util/money';
import {
    HUB_KEPT_ORDER,
    SELLER_FEE_EXAMPLE,
} from '../../../test-data/static/app/pricing';

/**
 * TC-06 (SELL-3, SELL-4, SELL-5): the marketplace fee is 10% of the item price
 * only, and cancelled orders count nowhere in the Seller hub. Each test has its
 * own seller, because the hub totals add up every order of the shop.
 */
test.describe('tc-06 seller fee and earnings', () => {
    test(
        'should charge a fee of 10% of the item price and pay the rest to the seller',
        { tag: '@regression' },
        async ({ newUser, soloSeller, signInAs, sellerHubPage }) => {
            test.fail(
                true,
                '#12 (SELL-3) the fee is taken on the whole order total, not the item price'
            );

            const orderId =
                await test.step('GIVEN a buyer ordered a $40 item (shipping and tax on top)', async () => {
                    const item = await soloSeller.listProduct(
                        SELLER_FEE_EXAMPLE.itemPrice
                    );
                    await fillCart(newUser, item.id);
                    return placeOrder(newUser);
                });

            await test.step('WHEN the seller opens the order in the Seller hub', async () => {
                await signInAs(soloSeller.seller);
                await sellerHubPage.openOrders();
            });

            await test.step('THEN the fee is $4.00 and the earnings are $36.00', async () => {
                await expect(sellerHubPage.orderFee(orderId)).toContainText(
                    usd(SELLER_FEE_EXAMPLE.fee)
                );
                await expect(sellerHubPage.orderEarnings(orderId)).toHaveText(
                    usd(SELLER_FEE_EXAMPLE.earnings)
                );
            });

            await test.step('THEN the dashboard net earnings match', async () => {
                await sellerHubPage.openDashboard();
                await expect(sellerHubPage.netEarnings).toHaveText(
                    usd(SELLER_FEE_EXAMPLE.earnings)
                );
            });
        }
    );

    test(
        'should leave a cancelled order out of the Seller hub figures',
        { tag: '@regression' },
        async ({ newUser, soloSeller, signInAs, sellerHubPage }) => {
            test.fail(
                true,
                '#13 (SELL-5) the Seller hub counts cancelled orders'
            );

            await test.step('GIVEN one order kept and one similar order cancelled', async () => {
                const item = await soloSeller.listProduct(
                    SELLER_FEE_EXAMPLE.itemPrice
                );
                await fillCart(newUser, item.id);
                await placeOrder(newUser);
                await fillCart(newUser, item.id);
                const cancelledId = await placeOrder(newUser);
                expect((await cancelOrder(newUser, cancelledId)).status).toBe(
                    200
                );
            });

            await test.step('WHEN the seller opens the dashboard', async () => {
                await signInAs(soloSeller.seller);
                await sellerHubPage.openDashboard();
            });

            await test.step('THEN revenue, orders, units and average order value count only the kept order', async () => {
                await expect(sellerHubPage.revenue).toHaveText(
                    usd(SELLER_FEE_EXAMPLE.itemPrice)
                );
                await expect(sellerHubPage.orders).toHaveText(
                    HUB_KEPT_ORDER.orders
                );
                await expect(sellerHubPage.units).toHaveText(
                    HUB_KEPT_ORDER.units
                );
                await expect(sellerHubPage.averageOrderValue).toHaveText(
                    usd(SELLER_FEE_EXAMPLE.itemPrice)
                );
            });
        }
    );
});
