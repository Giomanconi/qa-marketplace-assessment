import { test as base } from '@playwright/test';
import type { APIRequestContext } from '@playwright/test';
import {
    deleteAccount,
    deleteByCredentials,
    registerUser,
    trackAccount,
    workerAccount,
} from '../../helpers/api/accounts';
import { newApiSession } from '../../helpers/api/client';
import {
    createProduct,
    createShop,
    deleteProduct,
} from '../../helpers/api/selling';
import type { ProductData, TestUser, UserData } from '../../helpers/api/types';
import { cleanUp } from '../../helpers/util/cleanup';
import {
    buildProduct,
    buildShop,
    buildUser,
} from '../../test-data/factories/app/builders';

/** A product created through the API, with the id the app gave it. */
export type CreatedProduct = ProductData & { id: string };

/** A seller used by one test only, with a way to list products in its shop. */
export type SoloSeller = {
    seller: TestUser;
    listProduct: (price: number) => Promise<CreatedProduct>;
};

type AccountFixtures = {
    /**
     * A seller that belongs to this test alone (new user and shop), deleted
     * after it. Use it when the test reads shop-wide totals, such as the
     * Seller hub, that other tests' orders would change.
     */
    soloSeller: SoloSeller;
    /**
     * Data for a user that the test registers itself through the form. It is
     * recorded first and deleted after the test, if the app did create it.
     */
    formUser: UserData;
    /** A logged-out API session, for requests made without a user. */
    anonymousApi: APIRequestContext;
    /** A throwaway user (no shop) created for this test and deleted after it. */
    newUser: TestUser;
    /** A product listed in the seller's shop; deleted after the test. */
    product: CreatedProduct;
    /**
     * Lists a product at the given price (dollars) in the seller's shop and
     * returns it. Call it more than once for several products; all are deleted
     * after the test.
     */
    createPricedProduct: (
        price: number,
        overrides?: Partial<ProductData>
    ) => Promise<CreatedProduct>;
    /** Logs the browser in as the given user by copying their API cookie. */
    signInAs: (user: TestUser) => Promise<void>;
};

type AccountWorkerFixtures = {
    /** This worker's own seller: a new user with a shop. */
    seller: TestUser;
    /**
     * This worker's own buyer: a new user without a shop. Every test on the
     * worker shares it, so use it only for checks that change nothing (no cart,
     * order or profile change); use `newUser` for anything else.
     */
    buyer: TestUser;
};

/**
 * Account fixtures. Worker-scoped accounts belong to one worker slot, so no two
 * workers ever share a user, and none of them is the main account from `.env`
 * (that one is for exploration only). They outlive a worker restart and are
 * deleted by the `cleanup-accounts` project at the end of the run. Every other
 * account is deleted when its fixture ends (teardown).
 *
 * Every cleanup step runs through `cleanUp`: a failed delete is noted in the
 * report instead of failing the test, and does not stop the steps after it.
 */
export const test = base.extend<AccountFixtures, AccountWorkerFixtures>({
    seller: [
        async ({}, use, workerInfo): Promise<void> => {
            const seller = await workerAccount(
                'seller',
                workerInfo.parallelIndex,
                buildUser,
                (user) => createShop(user, buildShop())
            );

            await use(seller);

            await seller.api.dispose();
        },
        { scope: 'worker' },
    ],

    buyer: [
        async ({}, use, workerInfo): Promise<void> => {
            const buyer = await workerAccount(
                'buyer',
                workerInfo.parallelIndex,
                buildUser
            );

            await use(buyer);

            await buyer.api.dispose();
        },
        { scope: 'worker' },
    ],

    formUser: async ({}, use, testInfo): Promise<void> => {
        const user = buildUser();
        trackAccount(user);

        await use(user);

        await cleanUp(testInfo, 'delete the form user', () =>
            deleteByCredentials(user)
        );
    },

    anonymousApi: async ({}, use): Promise<void> => {
        const api = await newApiSession();

        await use(api);

        await api.dispose();
    },

    newUser: async ({}, use, testInfo): Promise<void> => {
        const user = await registerUser(buildUser());

        await use(user);

        await cleanUp(testInfo, 'delete the new user', () =>
            deleteAccount(user)
        );
        await user.api.dispose();
    },

    product: async ({ seller }, use, testInfo): Promise<void> => {
        const data = buildProduct();
        const id = await createProduct(seller, data);

        await use({ ...data, id });

        await cleanUp(testInfo, `delete product ${id}`, () =>
            deleteProduct(seller, id)
        );
    },

    soloSeller: async ({}, use, testInfo): Promise<void> => {
        const seller = await registerUser(buildUser());
        await createShop(seller, buildShop());
        const listed: string[] = [];

        await use({
            seller,
            listProduct: async (price: number): Promise<CreatedProduct> => {
                const data = buildProduct({ price });
                const id = await createProduct(seller, data);
                listed.push(id);
                return { ...data, id };
            },
        });

        for (const id of listed) {
            await cleanUp(testInfo, `delete product ${id}`, () =>
                deleteProduct(seller, id)
            );
        }
        await cleanUp(testInfo, 'delete the solo seller', () =>
            deleteAccount(seller)
        );
        await seller.api.dispose();
    },

    createPricedProduct: async ({ seller }, use, testInfo): Promise<void> => {
        const created: string[] = [];

        await use(async (price, overrides): Promise<CreatedProduct> => {
            const data = buildProduct({ price, ...overrides });
            const id = await createProduct(seller, data);
            created.push(id);
            return { ...data, id };
        });

        for (const id of created) {
            await cleanUp(testInfo, `delete product ${id}`, () =>
                deleteProduct(seller, id)
            );
        }
    },

    signInAs: async ({ context }, use) => {
        await use(async (user: TestUser) => {
            const { cookies } = await user.api.storageState();
            await context.addCookies(cookies);
        });
    },
});
