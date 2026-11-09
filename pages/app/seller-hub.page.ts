import { Locator, Page } from '@playwright/test';
import { AppRoutes } from '../../enums/app/app';
import { waitForHydration } from '../../helpers/util/hydration';

/**
 * Page Object for the Seller hub: the dashboard (`/seller`) and the seller's
 * orders (`/seller/orders`).
 */
export class SellerHubPage {
    constructor(private readonly page: Page) {}

    // The dashboard figures have no accessible link to their label, so the
    // app's test ids are the stable hook.
    get revenue(): Locator {
        return this.page.getByTestId('kpi-revenue');
    }

    get orders(): Locator {
        return this.page.getByTestId('kpi-orders');
    }

    get units(): Locator {
        return this.page.getByTestId('kpi-units');
    }

    get averageOrderValue(): Locator {
        return this.page.getByTestId('kpi-aov');
    }

    get netEarnings(): Locator {
        return this.page.getByTestId('kpi-net');
    }

    /**
     * One order card on the seller's orders page.
     *
     * @param {string} orderId - Order id.
     */
    orderRow(orderId: string): Locator {
        return this.page
            .getByTestId('seller-order-row')
            .filter({ hasText: '#' + orderId });
    }

    /**
     * The marketplace fee shown on one order card.
     *
     * @param {string} orderId - Order id.
     */
    orderFee(orderId: string): Locator {
        return this.orderRow(orderId).getByTestId('order-fee');
    }

    /**
     * The seller's earnings shown on one order card.
     *
     * @param {string} orderId - Order id.
     */
    orderEarnings(orderId: string): Locator {
        return this.orderRow(orderId).getByTestId('order-earn');
    }

    /**
     * Opens the dashboard.
     */
    async openDashboard(): Promise<void> {
        await this.open(AppRoutes.SELLER);
    }

    /**
     * Opens the seller's orders.
     */
    async openOrders(): Promise<void> {
        await this.open(AppRoutes.SELLER_ORDERS);
    }

    private async open(route: string): Promise<void> {
        const url = new URL(route, process.env.APP_URL!);
        await this.page.goto(url.href, { waitUntil: 'domcontentloaded' });
        await waitForHydration(this.page.getByTestId('seller-shop-name'));
    }
}
