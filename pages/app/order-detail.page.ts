import { Locator, Page } from '@playwright/test';
import { AppRoutes } from '../../enums/app/app';
import { waitForHydration } from '../../helpers/util/hydration';

/**
 * Page Object for the order detail page (`/orders/{id}`).
 */
export class OrderDetailPage {
    constructor(private readonly page: Page) {}

    get status(): Locator {
        return this.page.getByTestId('order-status');
    }

    get cancelButton(): Locator {
        return this.page.getByRole('button', {
            name: 'Cancel order',
            exact: true,
        });
    }

    get cancelDialog(): Locator {
        return this.page.getByRole('dialog');
    }

    get confirmCancelButton(): Locator {
        return this.page
            .getByRole('dialog')
            .getByRole('button', { name: 'Yes, cancel order' });
    }

    // The payment summary values have no accessible link to their label, so
    // the app's test ids are the stable hook.
    get subtotal(): Locator {
        return this.page.getByTestId('order-subtotal');
    }

    get discount(): Locator {
        return this.page.getByTestId('order-discount');
    }

    get shipping(): Locator {
        return this.page.getByTestId('order-shipping');
    }

    get tax(): Locator {
        return this.page.getByTestId('order-tax');
    }

    get total(): Locator {
        return this.page.getByTestId('order-total');
    }

    /**
     * Opens the order detail page.
     *
     * @param {string} orderId - Order id.
     */
    async open(orderId: string): Promise<void> {
        const url = new URL(
            AppRoutes.ORDERS + '/' + orderId,
            process.env.APP_URL!
        );
        await this.page.goto(url.href, { waitUntil: 'domcontentloaded' });
        await waitForHydration(this.status);
    }

    /**
     * Opens the cancel confirmation dialog without confirming.
     */
    async openCancelDialog(): Promise<void> {
        await this.cancelButton.click();
    }
}
