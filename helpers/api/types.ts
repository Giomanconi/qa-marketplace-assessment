import type { APIRequestContext } from '@playwright/test';

/** Data needed to register a user. All values are synthetic (GDPR). */
export type UserData = {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
};

/** Data needed to open a shop. */
export type ShopData = {
    name: string;
    description: string;
    location: string;
};

/** Data needed to list a product. `price` is in dollars. */
export type ProductData = {
    title: string;
    description: string;
    categoryId: string;
    price: number;
    stock: number;
    status: string;
    art: { icon: string; hue: number };
};

/** A registered user plus the API session (cookie jar) that belongs to it. */
export type TestUser = UserData & {
    id: string;
    api: APIRequestContext;
};

/** Anything with a logged-in API session; every seller call needs only this. */
export type Session = Pick<TestUser, 'api'>;

/** Result of a raw API call. */
export type ApiResult<T = unknown> = {
    status: number;
    body: T;
};
