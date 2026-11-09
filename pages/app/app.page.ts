import { expect, Locator, Page } from '@playwright/test';
import { appConfig } from '../../config/app';
import { AppRoutes } from '../../enums/app/app';
import { waitForHydration } from '../../helpers/util/hydration';
import { NavigationComponent } from '../components/navigation.component';

/** Home and login pages. The header lives in `NavigationComponent`. */
export class AppPage {
    readonly nav: NavigationComponent;

    constructor(private readonly page: Page) {
        this.nav = new NavigationComponent(page);
    }

    get loginHeading(): Locator {
        return this.page.getByRole('heading', { name: 'Welcome back' });
    }

    get emailInput(): Locator {
        return this.page.getByRole('textbox', { name: 'Email' });
    }

    get passwordInput(): Locator {
        return this.page.getByRole('textbox', { name: 'Password' });
    }

    get signInButton(): Locator {
        return this.page.getByRole('button', { name: 'Sign in' });
    }

    /**
     * The form error. Filtered by text because the page also has an empty
     * route announcer with role "alert".
     */
    errorAlert(message: string): Locator {
        return this.page.getByRole('alert').filter({ hasText: message });
    }

    private async open(route: AppRoutes): Promise<void> {
        await this.page.goto(new URL(route, process.env.APP_URL!).href, {
            waitUntil: 'domcontentloaded',
        });
    }

    async openHomePage(): Promise<void> {
        await this.open(AppRoutes.HOME);
    }

    /**
     * Waits for hydration too: the page is server-rendered, so text typed
     * earlier is wiped and an early click submits an empty form.
     */
    async openLoginPage(): Promise<void> {
        await this.open(AppRoutes.LOGIN);
        await waitForHydration(this.signInButton);
    }

    /** Submits the form. The caller asserts the outcome. */
    async login(email: string, password: string): Promise<void> {
        await this.emailInput.fill(email);
        await this.passwordInput.fill(password);
        await this.signInButton.click();
    }

    /** Submits the form and waits for the signed-in account link. */
    async loginAndVerify(email: string, password: string): Promise<void> {
        await this.login(email, password);
        await expect(this.nav.accountLink).toBeVisible({
            timeout: appConfig.loginOutcomeTimeout,
        });
    }
}
