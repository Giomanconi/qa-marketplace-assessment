import { Locator, Page } from '@playwright/test';
import { AppRoutes } from '../../enums/app/app';
import type { UserData } from '../../helpers/api/types';
import { waitForHydration } from '../../helpers/util/hydration';

/**
 * Page Object for the registration form (`/register`), used for the consent
 * checks (GDPR-03).
 */
export class RegisterPage {
    constructor(private readonly page: Page) {}

    get createAccountButton(): Locator {
        return this.page.getByRole('button', { name: 'Create account' });
    }

    // Terms and marketing are two separate boxes with their own labels.
    get termsCheckbox(): Locator {
        return this.page.getByRole('checkbox', {
            name: 'I agree to the Terms of Service and Privacy Policy',
        });
    }

    get marketingCheckbox(): Locator {
        return this.page.getByRole('checkbox', {
            name: 'Email me offers and product news',
        });
    }

    /**
     * Fills the form, sets the marketing box and submits.
     *
     * @param {UserData} user - Synthetic user data.
     * @param {boolean} marketing - Whether the marketing box ends up ticked.
     */
    async register(user: UserData, marketing: boolean): Promise<void> {
        await this.page
            .getByRole('textbox', { name: 'First name' })
            .fill(user.firstName);
        await this.page
            .getByRole('textbox', { name: 'Last name' })
            .fill(user.lastName);
        await this.page
            .getByRole('textbox', { name: 'Email' })
            .fill(user.email);
        await this.page
            .getByRole('textbox', { name: 'Password', exact: true })
            .fill(user.password);
        await this.page
            .getByRole('textbox', { name: 'Confirm password' })
            .fill(user.password);
        await this.termsCheckbox.check();
        await this.marketingCheckbox.setChecked(marketing);
        await this.createAccountButton.click();
    }

    /**
     * Opens the registration form and waits until React has hydrated it, so
     * the checkbox states read afterwards are the real ones.
     */
    async open(): Promise<void> {
        const url = new URL(AppRoutes.REGISTER, process.env.APP_URL!);
        await this.page.goto(url.href, { waitUntil: 'domcontentloaded' });
        await waitForHydration(this.createAccountButton);
    }
}
