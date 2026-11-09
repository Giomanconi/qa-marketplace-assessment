import { Locator, Page } from '@playwright/test';
import { AppRoutes } from '../../enums/app/app';
import { waitForHydration } from '../../helpers/util/hydration';

/**
 * Page Object for the cart page (`/cart`): promo code and order summary.
 */
export class CartPage {
    constructor(private readonly page: Page) {}

    // Present with or without a coupon, so it works as the hydration marker.
    get checkoutLink(): Locator {
        return this.page.getByRole('link', { name: 'Checkout' });
    }

    get removeCouponButton(): Locator {
        return this.page.getByRole('button', { name: /^Remove code/ });
    }

    // The summary values have no accessible link to their label, so the
    // app's test ids are the stable hook.
    get subtotal(): Locator {
        return this.page.getByTestId('cart-subtotal');
    }

    get discount(): Locator {
        return this.page.getByTestId('cart-discount');
    }

    get shipping(): Locator {
        return this.page.getByTestId('cart-shipping');
    }

    get tax(): Locator {
        return this.page.getByTestId('cart-tax');
    }

    get total(): Locator {
        return this.page.getByTestId('cart-total');
    }

    /**
     * Opens the cart and waits for hydration, otherwise the first click is lost.
     */
    async open(): Promise<void> {
        const url = new URL(AppRoutes.CART, process.env.APP_URL!);
        await this.page.goto(url.href, { waitUntil: 'domcontentloaded' });
        await waitForHydration(this.checkoutLink);
    }

    /**
     * Adds one unit to a cart line.
     *
     * @param {string} title - Product title.
     */
    async increaseQuantity(title: string): Promise<void> {
        await this.page
            .getByRole('button', { name: 'Increase quantity of ' + title })
            .click();
    }

    /**
     * Takes one unit from a cart line.
     *
     * @param {string} title - Product title.
     */
    async decreaseQuantity(title: string): Promise<void> {
        await this.page
            .getByRole('button', { name: 'Decrease quantity of ' + title })
            .click();
    }

    /**
     * Removes the cart line of the given product.
     *
     * @param {string} title - Product title.
     */
    async removeItem(title: string): Promise<void> {
        await this.page
            .getByTestId('cart-line')
            .filter({ hasText: title })
            .getByRole('button', { name: 'Remove' })
            .click();
    }
}
