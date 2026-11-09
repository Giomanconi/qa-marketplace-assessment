import { Locator, Page } from '@playwright/test';

/**
 * Page Object for the legal links in the footer and the pages they open
 * (Terms of Service at `/terms`, Privacy and Cookie policies in `/help`).
 */
export class LegalPage {
    constructor(private readonly page: Page) {}

    // The help page has a table of contents with the same link names.
    private get footer(): Locator {
        return this.page.getByRole('contentinfo');
    }

    get privacyLink(): Locator {
        return this.footer.getByRole('link', { name: 'Privacy Policy' });
    }

    get cookieLink(): Locator {
        return this.footer.getByRole('link', { name: 'Cookie Policy' });
    }

    /**
     * Opens a route and returns the HTTP status of the page.
     *
     * @param {string} route - Route path, for example `/terms`.
     * @returns {Promise<number>} The HTTP status (0 when there was no response).
     */
    async open(route: string): Promise<number> {
        const url = new URL(route, process.env.APP_URL!);
        const response = await this.page.goto(url.href, {
            waitUntil: 'domcontentloaded',
        });
        return response?.status() ?? 0;
    }
}
