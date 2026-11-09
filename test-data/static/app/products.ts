/**
 * Fixed values the product API requires, verified against the live app.
 * `categoryId` is one of c1..c6 (c1 = Electronics); `art` is the image icon
 * (a name from the app's icon list) with a hue from 0 to 359.
 */
export const PRODUCT_DEFAULTS = {
    categoryId: 'c1',
    status: 'active',
    art: { icon: 'Keyboard', hue: 121 },
} as const;
