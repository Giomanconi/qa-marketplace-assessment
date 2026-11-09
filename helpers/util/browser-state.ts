import type { BrowserContext, Page } from '@playwright/test';

/**
 * Records the host of every request the page makes, so a test can check that
 * nothing talks to a third party. Call it before navigating.
 *
 * @param {Page} page - The page to watch.
 * @returns {() => string[]} Reads the distinct hosts seen so far.
 */
export function watchRequestHosts(page: Page): () => string[] {
    const hosts = new Set<string>();
    page.on('request', (request) => hosts.add(new URL(request.url()).host));
    return () => [...hosts];
}

/**
 * Records the full URL of every request the page makes. Call it before
 * navigating.
 *
 * @param {Page} page - The page to watch.
 * @returns {() => string[]} Reads the URLs seen so far.
 */
export function watchRequestUrls(page: Page): () => string[] {
    const urls: string[] = [];
    page.on('request', (request) => urls.push(request.url()));
    return () => urls;
}

/**
 * Names of the cookies set in the browser.
 *
 * @param {BrowserContext} context - The browser context.
 * @returns {Promise<string[]>} Cookie names.
 */
export async function cookieNames(context: BrowserContext): Promise<string[]> {
    return (await context.cookies()).map((cookie) => cookie.name);
}

/**
 * Keys stored in localStorage and sessionStorage of the page.
 *
 * @param {Page} page - A loaded page.
 * @returns {Promise<string[]>} Storage keys.
 */
export async function storageKeys(page: Page): Promise<string[]> {
    return page.evaluate(() => [
        ...Object.keys(localStorage),
        ...Object.keys(sessionStorage),
    ]);
}

/**
 * Tells whether the page can be scrolled sideways, which means something is
 * wider than the screen (TC-10).
 *
 * @param {Page} page - A loaded page.
 * @param {number} tolerancePx - Pixels of overflow to ignore (sub-pixel rounding).
 * @returns {Promise<boolean>} True when the page is wider than the viewport.
 */
export async function scrollsSideways(
    page: Page,
    tolerancePx: number
): Promise<boolean> {
    return page.evaluate(
        (tolerance) =>
            document.documentElement.scrollWidth - tolerance >
            document.documentElement.clientWidth,
        tolerancePx
    );
}
