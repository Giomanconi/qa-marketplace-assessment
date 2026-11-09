/**
 * Errors that usually come from the QA host, which is slow and fails requests
 * on purpose, rather than from a defect: a page load or API request that timed
 * out, a dropped connection, or a 5xx answer after the API helper's retries.
 * Assertion timeouts are left out on purpose: an element that never shows the
 * expected text is usually a real defect.
 */
const HOST_FAILURE_PATTERNS = [
    /\b(page\.goto|page\.reload|apiRequestContext\.\w+): Timeout \d+ms exceeded/,
    /net::ERR_|ECONNRESET|ECONNREFUSED|ETIMEDOUT|socket hang up/,
    /(-> |status |Login )5\d\d\b/,
];

/** Annotation added to a failed test whose error looks like a host failure. */
export const HOST_FAILURE_ANNOTATION = {
    type: 'host failure',
    description:
        'Looks like the QA host (timeout, dropped connection or 5xx), not a defect. Rerun before filing.',
};

/**
 * Tells whether an error message looks like a host failure.
 *
 * @param {string} message - The test error message.
 * @returns {boolean} True for a host timeout, network error or 5xx.
 */
export function isHostFailure(message: string): boolean {
    const plain = message.replace(/\u001b\[[0-9;]*m/g, '');
    return HOST_FAILURE_PATTERNS.some((pattern) => pattern.test(plain));
}
