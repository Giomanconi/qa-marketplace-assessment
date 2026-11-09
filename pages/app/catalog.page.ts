import { Locator, Page } from '@playwright/test';
import { AppRoutes } from '../../enums/app/app';
import { waitForHydration } from '../../helpers/util/hydration';

/**
 * Page Object for the catalog (`/products`) and the header search box.
 */
export class CatalogPage {
    constructor(private readonly page: Page) {}

    get searchBox(): Locator {
        return this.page.getByRole('searchbox', { name: 'Search products' });
    }

    get title(): Locator {
        return this.page.getByTestId('catalog-title');
    }

    get pagination(): Locator {
        return this.page.getByRole('navigation', { name: 'Pagination' });
    }

    /**
     * The title of a product card in the results.
     *
     * @param {string} productTitle - Product title.
     */
    productCard(productTitle: string): Locator {
        return this.page
            .getByTestId('product-card-title')
            .filter({ hasText: productTitle });
    }

    /**
     * Opens the catalog and waits for hydration of the search box.
     */
    async open(): Promise<void> {
        const url = new URL(AppRoutes.PRODUCTS, process.env.APP_URL!);
        await this.page.goto(url.href, { waitUntil: 'domcontentloaded' });
        await waitForHydration(this.searchBox);
    }

    /**
     * Searches with the header search box.
     *
     * @param {string} query - Text to search.
     */
    async search(query: string): Promise<void> {
        await this.searchBox.fill(query);
        await this.searchBox.press('Enter');
    }
}
