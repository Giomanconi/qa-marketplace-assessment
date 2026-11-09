import { Locator, Page } from '@playwright/test';
import { AppRoutes } from '../../enums/app/app';
import { waitForHydration } from '../../helpers/util/hydration';

/**
 * Page Object for a product page (`/products/{id}`).
 */
export class ProductPage {
    constructor(private readonly page: Page) {}

    get addToCartButton(): Locator {
        return this.page.getByRole('button', { name: 'Add to cart' });
    }

    // Replaces the Add to cart button when the product is out of stock.
    get outOfStockButton(): Locator {
        return this.page.getByRole('button', { name: 'Out of stock' });
    }

    /**
     * Opens the product page and waits for hydration (an earlier click is ignored).
     *
     * @param {string} productId - Id of the product.
     */
    async open(productId: string): Promise<void> {
        const url = new URL(
            `${AppRoutes.PRODUCTS}/${productId}`,
            process.env.APP_URL!
        );
        await this.page.goto(url.href, { waitUntil: 'domcontentloaded' });
        // The same button, whichever label it has (Add to cart or Out of stock).
        await waitForHydration(this.page.getByTestId('add-to-cart'));
    }

    /**
     * Adds one item to the cart. Callers wait for the cart count in the header (`nav.cartLink`).
     */
    async addToCart(): Promise<void> {
        await this.addToCartButton.click();
    }
}
