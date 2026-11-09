/**
 * cleanup-accounts.setup.ts
 * Project `cleanup-accounts` (`npm run cleanup:accounts`): deletes accounts
 * that a crashed run left behind (GDPR erasure safety net).
 */
import { appConfig } from '../../config/app';
import { expect, test } from '../../fixtures/pom/test-options';
import { deletePendingAccounts } from '../../helpers/api/accounts';

test.describe('cleanup accounts', () => {
    test('no test account is left behind', async () => {
        test.setTimeout(appConfig.cleanupTimeout);

        const { failed } = await deletePendingAccounts();

        expect(failed).toBe(0);
    });
});
