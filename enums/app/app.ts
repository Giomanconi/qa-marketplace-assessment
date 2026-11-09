/** Common UI messages — every value verified against the live MarketNest app */
export enum Messages {
    /** Shown when the email, the password or both are empty */
    LOGIN_FIELDS_REQUIRED = 'Enter your email and password.',
    /** Shown for a malformed email, an unknown email or a wrong password */
    LOGIN_INVALID_CREDENTIALS = 'Incorrect email or password.',
    /** Checkout payment error for the declined test card */
    CHECKOUT_CARD_DECLINED = 'Your card was declined. Please use a different card or contact your bank.',
    /** Order confirmation page */
    ORDER_CONFIRMED = 'Thank you for your order',
    PAYMENT_APPROVED = 'Payment approved',
}

/** UI route paths */
export enum AppRoutes {
    HOME = '/',
    LOGIN = '/login',
    PRODUCTS = '/products',
    CART = '/cart',
    CHECKOUT = '/checkout',
    ORDERS = '/orders',
    SELLER = '/seller',
    SELLER_ORDERS = '/seller/orders',
    HELP = '/help',
    TERMS = '/terms',
    REGISTER = '/register',
    SHOPS = '/shops',
    ACCOUNT = '/account',
    ACCOUNT_PRIVACY = '/account/privacy',
}

/**
 * API endpoint paths — captured from the live app (there is no OpenAPI
 * document). The session is the `mp_session` cookie, not a token header.
 */
export enum ApiEndpoints {
    REGISTER = '/api/auth/register',
    LOGIN = '/api/auth/login',
    ACCOUNT = '/api/account',
    SHOP = '/api/seller/shop',
    SELLER_PRODUCTS = '/api/seller/products',
    PRODUCTS = '/api/products',
    ORDERS = '/api/orders',
    CART = '/api/cart',
    CART_ITEMS = '/api/cart/items',
    CART_COUPON = '/api/cart/coupon',
    CHECKOUT = '/api/checkout',
    SELLER_ORDERS = '/api/seller/orders',
    ACCOUNT_EXPORT = '/api/account/export',
    ACCOUNT_ADDRESSES = '/api/account/addresses',
    FORGOT_PASSWORD = '/api/auth/forgot-password',
}

/** Delivery methods of the checkout (the value the API expects) */
export enum ShippingMethod {
    STANDARD = 'standard',
    EXPRESS = 'express',
}

/** Order statuses as the API returns them */
export enum OrderStatus {
    PROCESSING = 'processing',
    SHIPPED = 'shipped',
    DELIVERED = 'delivered',
    CANCELLED = 'cancelled',
}

/**
 * Folder (gitignored) with one small file per account created by the tests that
 * is not deleted yet. It lets `npm run cleanup:accounts` erase leftovers of a
 * crashed run. Each file is removed as soon as its account is deleted.
 */
export enum LocalPaths {
    PENDING_ACCOUNTS = '.auth/accounts',
    /**
     * Gitignored log with one line per account event (created, deleted),
     * including the synthetic password. Never deleted by the tests; read it
     * with `npm run accounts:report`.
     */
    ACCOUNT_REGISTRY = '.auth/account-registry.jsonl',
    /** One file per worker slot and role, so a restarted worker reuses its accounts. */
    WORKER_ACCOUNTS = '.auth/worker-accounts',
}

/** Name of the session cookie the app sets on login and registration */
export enum SessionCookie {
    NAME = 'mp_session',
}
