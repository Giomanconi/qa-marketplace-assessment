import { Locator, Page } from '@playwright/test';

/** The MarketNest header, used from the page objects as `nav`. */
export class NavigationComponent {
    constructor(private readonly page: Page) {}

    get container(): Locator {
        return this.page.getByRole('navigation');
    }

    /** The cart link; its text is the number of items in the cart. */
    get cartLink(): Locator {
        return this.container.getByRole('link', { name: 'Cart' });
    }

    /** The total quantity of items in the cart. */
    get cartCount(): Locator {
        return this.page.getByTestId('cart-count');
    }

    /** Only shown while signed out. */
    get signInLink(): Locator {
        return this.container.getByRole('link', { name: 'Sign in' });
    }

    /** Only shown while signed in; reads "Hi, <first name>". */
    get accountLink(): Locator {
        return this.container.getByRole('link', { name: /^Hi, / });
    }
}
