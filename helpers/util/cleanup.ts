import type { TestInfo } from '@playwright/test';

/**
 * Runs one cleanup step of a fixture without failing the test. The QA host
 * fails requests on purpose, and a failed delete is not a result of the test:
 * a test whose checks passed must not turn red because its cleanup timed out.
 *
 * A failure is recorded as a `cleanup failed` annotation in the report. An
 * account that could not be deleted stays in `.auth/accounts`, so the
 * `cleanup-accounts` project deletes it at the end of the run (and fails if it
 * still cannot).
 *
 * @param {TestInfo} testInfo - The test (or worker) the fixture belongs to.
 * @param {string} what - What the step cleans up, for the annotation.
 * @param {() => Promise<unknown>} step - The cleanup call.
 */
export async function cleanUp(
    testInfo: TestInfo,
    what: string,
    step: () => Promise<unknown>
): Promise<void> {
    try {
        await step();
    } catch (error) {
        // First line only: the rest of a Playwright error is the call log.
        const reason = String(
            error instanceof Error ? error.message : error
        ).split('\n')[0];
        testInfo.annotations.push({
            type: 'cleanup failed',
            description: `${what}: ${reason}`,
        });
    }
}
