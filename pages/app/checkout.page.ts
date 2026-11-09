import { Locator, Page } from '@playwright/test';
import { AppRoutes, Messages, ShippingMethod } from '../../enums/app/app';
import { waitForHydration } from '../../helpers/util/hydration';

/** Shipping address fields of the checkout form (full name is pre-filled). */
export type ShippingAddress = {
    line1: string;
    city: string;
    state: string;
    zip: string;
    phone: string;
};

/** Card fields of the checkout form. */
export type CardDetails = {
    number: string;
    name: string;
    expiry: string;
    cvc: string;
};

/**
 * Page Object for the checkout page (`/checkout`).
 */
export class CheckoutPage {
    constructor(private readonly page: Page) {}

    get addressLine1Input(): Locator {
        return this.page.getByRole('textbox', {
            name: 'Address line 1',
            exact: true,
        });
    }

    get cityInput(): Locator {
        return this.page.getByRole('textbox', { name: 'City', exact: true });
    }

    get stateInput(): Locator {
        return this.page.getByRole('textbox', { name: 'State', exact: true });
    }

    get zipInput(): Locator {
        return this.page.getByRole('textbox', {
            name: 'ZIP code',
            exact: true,
        });
    }

    get phoneInput(): Locator {
        return this.page.getByRole('textbox', { name: 'Phone', exact: true });
    }

    get cardNumberInput(): Locator {
        return this.page.getByRole('textbox', {
            name: 'Card number',
            exact: true,
        });
    }

    get cardNameInput(): Locator {
        return this.page.getByRole('textbox', {
            name: 'Name on card',
            exact: true,
        });
    }

    get cardExpiryInput(): Locator {
        return this.page.getByRole('textbox', {
            name: 'Expiry date',
            exact: true,
        });
    }

    get cardCvcInput(): Locator {
        return this.page.getByRole('textbox', {
            name: 'Security code (CVC)',
            exact: true,
        });
    }

    get placeOrderButton(): Locator {
        return this.page.getByRole('button', { name: 'Place order' });
    }

    // The delivery options are radios named with the label and the price.
    get standardOption(): Locator {
        return this.page.getByRole('radio', { name: /^Standard/ });
    }

    get expressOption(): Locator {
        return this.page.getByRole('radio', { name: /^Express/ });
    }

    // Price shown on the Express option.
    get expressOptionPrice(): Locator {
        return this.page.getByTestId('shipping-express-price');
    }

    // The summary values have no accessible link to their label, so the
    // app's test ids are the stable hook.
    get summaryDiscount(): Locator {
        return this.page.getByTestId('checkout-discount');
    }

    get summaryShipping(): Locator {
        return this.page.getByTestId('checkout-shipping');
    }

    get summaryTax(): Locator {
        return this.page.getByTestId('checkout-tax');
    }

    get summaryTotal(): Locator {
        return this.page.getByTestId('checkout-total');
    }

    // Payment error (for example the declined card).
    get cardDeclinedError(): Locator {
        return this.page
            .getByRole('alert')
            .filter({ hasText: Messages.CHECKOUT_CARD_DECLINED });
    }

    // Validation message under the card number field.
    get cardNumberError(): Locator {
        return this.page.getByTestId('error-number');
    }

    // Validation message under the ZIP field.
    get zipError(): Locator {
        return this.page.getByTestId('error-zip');
    }

    /**
     * Opens the checkout page (the cart must hold an item) and waits for hydration,
     * otherwise fields filled too early are reset.
     */
    async open(): Promise<void> {
        const url = new URL(AppRoutes.CHECKOUT, process.env.APP_URL!);
        await this.page.goto(url.href, { waitUntil: 'domcontentloaded' });
        await waitForHydration(this.placeOrderButton);
    }

    /**
     * Chooses the delivery method.
     *
     * @param {ShippingMethod} method - Standard or Express.
     */
    async selectShipping(method: ShippingMethod): Promise<void> {
        const option =
            method === ShippingMethod.EXPRESS
                ? this.expressOption
                : this.standardOption;
        await option.check();
    }

    /**
     * Fills the shipping address.
     *
     * @param {ShippingAddress} address - Address values.
     */
    async fillShipping(address: ShippingAddress): Promise<void> {
        await this.addressLine1Input.fill(address.line1);
        await this.cityInput.fill(address.city);
        await this.stateInput.fill(address.state);
        await this.zipInput.fill(address.zip);
        await this.phoneInput.fill(address.phone);
    }

    /**
     * Fills the card details.
     *
     * @param {CardDetails} card - Card values.
     */
    async fillCard(card: CardDetails): Promise<void> {
        await this.cardNumberInput.fill(card.number);
        await this.cardNameInput.fill(card.name);
        await this.cardExpiryInput.fill(card.expiry);
        await this.cardCvcInput.fill(card.cvc);
    }

    /**
     * Submits the order. Callers assert the outcome.
     */
    async placeOrder(): Promise<void> {
        await this.placeOrderButton.click();
    }

    /**
     * Double-clicks the order button, like an impatient customer.
     */
    async placeOrderDoubleClick(): Promise<void> {
        await this.placeOrderButton.dblclick();
    }
}
