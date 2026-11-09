import { mergeTests } from '@playwright/test';
import { test as accounts } from '../api/account-fixture';
import { test as pages } from './page-object-fixture';
import {
    HOST_FAILURE_ANNOTATION,
    isHostFailure,
} from '../../helpers/util/host-failure';

/**
 * The `test` every spec imports: page objects plus test accounts. After each
 * unexpected failure, it labels errors that look like the QA host (see
 * `helpers/util/host-failure.ts`), so the report tells them apart from defects.
 */
export const test = mergeTests(pages, accounts).extend<{
    labelHostFailures: void;
}>({
    labelHostFailures: [
        async ({}, use, testInfo): Promise<void> => {
            await use();
            const failedUnexpectedly =
                testInfo.status !== testInfo.expectedStatus &&
                testInfo.status !== 'skipped';
            const message = testInfo.errors
                .map((error) => error.message ?? '')
                .join('\n');
            if (failedUnexpectedly && isHostFailure(message)) {
                testInfo.annotations.push(HOST_FAILURE_ANNOTATION);
            }
        },
        { auto: true },
    ],
});

export { expect, request } from '@playwright/test';
