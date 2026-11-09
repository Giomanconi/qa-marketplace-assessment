/** The site URL and the timeouts for the slow QA host. */
export const appConfig = {
    /** Frontend application URL loaded from the APP_URL env variable */
    appUrl: process.env.APP_URL!,
    /**
     * Timeout (ms) for the signed-in header to appear after a login submit.
     * The QA host is deliberately slow and flaky (2-5 s per request), so the
     * 10 s default expect timeout is too tight.
     */
    loginOutcomeTimeout: 30000,
    /** Timeout (ms) for the order confirmation to appear after Place order */
    checkoutOutcomeTimeout: 30000,
    /** Attempts for an API setup/teardown call that hits a network error or a 5xx */
    apiMaxAttempts: 3,
    /** Timeout (ms) for the cleanup of leftover accounts (one login and one delete each) */
    cleanupTimeout: 300000,
    /** Timeout (ms) for a single API setup/teardown request on the slow host */
    apiRequestTimeout: 30000,
};
