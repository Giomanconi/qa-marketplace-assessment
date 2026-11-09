import { test as base } from '@playwright/test';
import { AppPage } from '../../pages/app/app.page';
import { CartPage } from '../../pages/app/cart.page';
import { CatalogPage } from '../../pages/app/catalog.page';
import { CheckoutPage } from '../../pages/app/checkout.page';
import { LegalPage } from '../../pages/app/legal.page';
import { OrderConfirmationPage } from '../../pages/app/order-confirmation.page';
import { OrderDetailPage } from '../../pages/app/order-detail.page';
import { ProductPage } from '../../pages/app/product.page';
import { RegisterPage } from '../../pages/app/register.page';
import { SellerHubPage } from '../../pages/app/seller-hub.page';
import { CookieBannerComponent } from '../../pages/components/cookie-banner.component';

type PageObjects = {
    appPage: AppPage;
    cartPage: CartPage;
    catalogPage: CatalogPage;
    checkoutPage: CheckoutPage;
    confirmationPage: OrderConfirmationPage;
    cookieBanner: CookieBannerComponent;
    legalPage: LegalPage;
    orderDetailPage: OrderDetailPage;
    productPage: ProductPage;
    registerPage: RegisterPage;
    sellerHubPage: SellerHubPage;
};

/** Gives each test the page objects it asks for, built on its own page. */
export const test = base.extend<PageObjects>({
    appPage: async ({ page }, use) => use(new AppPage(page)),
    cartPage: async ({ page }, use) => use(new CartPage(page)),
    catalogPage: async ({ page }, use) => use(new CatalogPage(page)),
    checkoutPage: async ({ page }, use) => use(new CheckoutPage(page)),
    confirmationPage: async ({ page }, use) =>
        use(new OrderConfirmationPage(page)),
    cookieBanner: async ({ page }, use) => use(new CookieBannerComponent(page)),
    legalPage: async ({ page }, use) => use(new LegalPage(page)),
    orderDetailPage: async ({ page }, use) => use(new OrderDetailPage(page)),
    productPage: async ({ page }, use) => use(new ProductPage(page)),
    registerPage: async ({ page }, use) => use(new RegisterPage(page)),
    sellerHubPage: async ({ page }, use) => use(new SellerHubPage(page)),
});
