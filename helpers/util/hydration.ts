import { expect } from '@playwright/test';
import type { Locator } from '@playwright/test';

/**
 * Waits until React has hydrated the page that holds `control`.
 *
 * MarketNest is server-rendered: text typed (or a button clicked) before
 * hydration is reset or ignored, which makes forms flaky on the slow QA host.
 * React marks hydrated DOM nodes with a `__reactProps$...` key, the only
 * hydration signal the page exposes.
 *
 * @param {Locator} control - Any control on the page, such as its submit button.
 */
export async function waitForHydration(control: Locator): Promise<void> {
    await expect
        .poll(() =>
            control.evaluate((element) =>
                Object.keys(element).some((key) =>
                    key.startsWith('__reactProps')
                )
            )
        )
        .toBe(true);
}
