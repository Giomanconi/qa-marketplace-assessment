/**
 * seed-main.setup.ts
 * Setup project `seed-main`: makes sure the main (exploration) account has its
 * seed items. Additive and idempotent. Skip it with `SEED_MAIN=0`.
 */
import { expect, test } from '../../fixtures/pom/test-options';
import { seedMainAccount } from '../../helpers/api/seed';

test.describe('seed main account', () => {
    test('seed items exist on the main account', async () => {
        test.skip(process.env.SEED_MAIN === '0', 'SEED_MAIN=0');

        const created = await seedMainAccount();

        expect(created).toBeGreaterThanOrEqual(0);
    });
});
