import { Locator, Page } from '@playwright/test';

/**
 * Component Object for the cookie consent banner shown on every page until the
 * visitor chooses.
 */
export class CookieBannerComponent {
    constructor(private readonly page: Page) {}

    get banner(): Locator {
        return this.page.getByRole('region', { name: 'Cookie consent' });
    }

    get rejectButton(): Locator {
        return this.banner.getByRole('button', {
            name: 'Reject non-essential',
        });
    }

    get acceptButton(): Locator {
        return this.banner.getByRole('button', { name: 'Accept all' });
    }

    // GDPR-02: a footer control to change the choice later. The app has none
    // today (#22), so this finds nothing until it is added. The name is a guess
    // at usual wordings (not "Cookie Policy"); adjust it to the real control.
    get changeChoiceControl(): Locator {
        const name =
            /cookie (settings|preferences|choices)|manage cookies|privacy choices/i;
        const footer = this.page.getByRole('contentinfo');
        return footer
            .getByRole('button', { name })
            .or(footer.getByRole('link', { name }));
    }
}
