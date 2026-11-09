import { Locator, Page } from '@playwright/test';
import { Messages } from '../../enums/app/app';

/**
 * Page Object for the order confirmation page (`/orders/{id}/confirmation`).
 */
export class OrderConfirmationPage {
    constructor(private readonly page: Page) {}

    get thankYouHeading(): Locator {
        return this.page.getByRole('heading', {
            name: new RegExp(Messages.ORDER_CONFIRMED),
        });
    }

    get paymentApproved(): Locator {
        return this.page.getByText(Messages.PAYMENT_APPROVED);
    }

    // The confirmation prints some amounts without trailing zeros ($3.6), so
    // tests compare the shipping and the total, which keep two decimals here.
    get shipping(): Locator {
        return this.page.getByTestId('confirmation-shipping');
    }

    get total(): Locator {
        return this.page.getByTestId('confirmation-total');
    }

    /**
     * An ordered item in the order details.
     *
     * @param {string} title - Product title.
     */
    orderedItem(title: string): Locator {
        return this.page.getByText(title, { exact: true });
    }
}
