import * as fs from 'node:fs';
import * as path from 'node:path';
import { ApiEndpoints, LocalPaths } from '../../enums/app/app';
import { apiCall, newApiSession } from './client';
import type { ApiResult, TestUser, UserData } from './types';

type UserBody = { user: { id: string } };

/** The answer of the registration route: the user, or the field errors. */
export type RegisterAnswer = {
    user?: { id: string };
    error?: string;
    fields?: Record<string, string>;
};

/** Path of the "not deleted yet" file for one account. */
function pendingFile(email: string): string {
    return path.join(LocalPaths.PENDING_ACCOUNTS, `${email}.json`);
}

/**
 * Remembers an account until it is deleted, so a crashed run can be cleaned
 * up later. The file holds only synthetic credentials and lives in the
 * gitignored `.auth/` folder.
 */
function rememberAccount(user: Pick<UserData, 'email' | 'password'>): void {
    fs.mkdirSync(LocalPaths.PENDING_ACCOUNTS, { recursive: true });
    fs.writeFileSync(
        pendingFile(user.email),
        JSON.stringify({ email: user.email, password: user.password })
    );
}

/** Forgets an account once the app confirmed its deletion. */
function forgetAccount(email: string): void {
    fs.rmSync(pendingFile(email), { force: true });
}

/**
 * Appends one line to the permanent account log (synthetic credentials only,
 * gitignored). Unlike the pending files, lines are never removed, so there is
 * always a record of every account the tests created and what happened to it.
 */
function logAccount(
    user: Pick<UserData, 'email' | 'password'>,
    event: 'created' | 'deleted' | 'not-created'
): void {
    fs.mkdirSync(path.dirname(LocalPaths.ACCOUNT_REGISTRY), {
        recursive: true,
    });
    fs.appendFileSync(
        LocalPaths.ACCOUNT_REGISTRY,
        JSON.stringify({
            at: new Date().toISOString(),
            event,
            email: user.email,
            password: user.password,
        }) + '\n'
    );
}

/**
 * Logs a user in on the given session (the app answers with a session cookie).
 *
 * @param {TestUser['api']} api - Session that receives the cookie.
 * @param {Pick<UserData, 'email' | 'password'>} user - Credentials.
 * @returns {Promise<string>} The user id.
 */
export async function loginUser(
    api: TestUser['api'],
    user: Pick<UserData, 'email' | 'password'>
): Promise<string> {
    const { status, body } = await apiCall<UserBody>(
        api,
        'POST',
        ApiEndpoints.LOGIN,
        { email: user.email, password: user.password }
    );
    if (status !== 200) throw new Error(`Login failed with status ${status}`);
    return body.user.id;
}

/**
 * Creates a user through the API and leaves its session logged in.
 * If a retry after a server error finds the email already taken (409), the
 * first attempt did succeed, so the user is logged in instead.
 * Marketing opt-in stays off (data minimisation); terms must be accepted.
 * The account is remembered until `deleteAccount` removes it.
 *
 * @param {UserData} user - Synthetic user data from `buildUser`.
 * @returns {Promise<TestUser>} The user with its own logged-in API session.
 */
export async function registerUser(user: UserData): Promise<TestUser> {
    rememberAccount(user);
    const api = await newApiSession();
    const { status, body } = await apiCall<UserBody>(
        api,
        'POST',
        ApiEndpoints.REGISTER,
        {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            password: user.password,
            acceptTerms: true,
            marketingOptIn: false,
        }
    );

    if (status === 201) {
        logAccount(user, 'created');
        return { ...user, id: body.user.id, api };
    }
    if (status === 409) {
        // The email is new, so a 409 means a retried request did create it.
        logAccount(user, 'created');
        return { ...user, id: await loginUser(api, user), api };
    }

    forgetAccount(user.email);
    throw new Error(`Register failed with status ${status}`);
}

/**
 * Gets the account a worker slot keeps for a role. Playwright restarts a worker
 * after every failed test; the slot number survives that, so the new worker logs
 * in to the same account instead of creating another. A deleted account can
 * still log in (soft delete), so only an account not yet deleted is reused.
 * The end-of-run cleanup deletes these accounts.
 *
 * @param {string} role - Name of the role, such as seller.
 * @param {number} slot - The worker's `parallelIndex`.
 * @param {() => UserData} build - Builds the user data if a new account is needed.
 * @param {(user: TestUser) => Promise<unknown>} [prepare] - Setup for a new account.
 * @returns {Promise<TestUser>} The user with its own logged-in API session.
 */
export async function workerAccount(
    role: string,
    slot: number,
    build: () => UserData,
    prepare?: (user: TestUser) => Promise<unknown>
): Promise<TestUser> {
    const file = path.join(LocalPaths.WORKER_ACCOUNTS, `${role}-${slot}.json`);
    if (fs.existsSync(file)) {
        const saved = JSON.parse(fs.readFileSync(file, 'utf-8')) as UserData;
        if (fs.existsSync(pendingFile(saved.email))) {
            const api = await newApiSession();
            return { ...saved, id: await loginUser(api, saved), api };
        }
    }

    const data = build();
    const user = await registerUser(data);
    await prepare?.(user);
    fs.mkdirSync(LocalPaths.WORKER_ACCOUNTS, { recursive: true });
    fs.writeFileSync(file, JSON.stringify(data));
    return user;
}

/**
 * Deletes the user's account. The app soft-deletes it: the session stops
 * working but the record stays, so a new user must always use a new email.
 * Delete the user's products first; shops have no delete route.
 *
 * @param {TestUser} user - The user to delete.
 */
export async function deleteAccount(user: TestUser): Promise<void> {
    const { status } = await apiCall(user.api, 'DELETE', ApiEndpoints.ACCOUNT, {
        confirm: 'DELETE',
        password: user.password,
    });
    if (status !== 200)
        throw new Error(`Delete account failed with status ${status}`);
    forgetAccount(user.email);
    logAccount(user, 'deleted');
}

/**
 * Records an account that a test is about to create outside `registerUser`, for
 * example through the registration form. If it never gets created, the delete
 * below notes that in the log.
 *
 * @param {Pick<UserData, 'email' | 'password'>} user - Synthetic credentials.
 */
export function trackAccount(user: Pick<UserData, 'email' | 'password'>): void {
    rememberAccount(user);
    logAccount(user, 'created');
}

/**
 * Signs in with the given credentials and deletes the account. A 401 means the
 * account was never created, so the records are closed and nothing is deleted.
 *
 * @param {Pick<UserData, 'email' | 'password'>} user - Synthetic credentials.
 * @returns {Promise<boolean>} True when an account was deleted.
 */
export async function deleteByCredentials(
    user: Pick<UserData, 'email' | 'password'>
): Promise<boolean> {
    const api = await newApiSession();
    try {
        const login = await apiCall<UserBody>(api, 'POST', ApiEndpoints.LOGIN, {
            email: user.email,
            password: user.password,
        });
        if (login.status === 401) {
            forgetAccount(user.email);
            logAccount(user, 'not-created');
            return false;
        }
        if (login.status !== 200) throw new Error('Login ' + login.status);
        await deleteAccount({
            ...user,
            firstName: '',
            lastName: '',
            id: login.body.user.id,
            api,
        });
        return true;
    } finally {
        await api.dispose();
    }
}

/**
 * Deletes every account still remembered in `.auth/accounts` (leftovers of a
 * crashed run). Accounts that fail stay remembered for the next attempt.
 *
 * @returns {Promise<{ deleted: number; failed: number }>} Counts.
 */
export async function deletePendingAccounts(): Promise<{
    deleted: number;
    failed: number;
}> {
    const result = { deleted: 0, failed: 0 };
    if (!fs.existsSync(LocalPaths.PENDING_ACCOUNTS)) return result;

    for (const file of fs.readdirSync(LocalPaths.PENDING_ACCOUNTS)) {
        const saved = JSON.parse(
            fs.readFileSync(
                path.join(LocalPaths.PENDING_ACCOUNTS, file),
                'utf-8'
            )
        ) as Pick<UserData, 'email' | 'password'>;
        try {
            if (await deleteByCredentials(saved)) result.deleted++;
        } catch {
            result.failed++;
        }
    }
    fs.rmSync(LocalPaths.WORKER_ACCOUNTS, { recursive: true, force: true });

    return result;
}

/**
 * Sends a raw registration request. If the app creates the account (201) it is
 * recorded, so a test that bypasses `registerUser` still leaves a record, even
 * when it expected a rejection and the app was wrong.
 *
 * @param {TestUser['api']} api - Session that sends the request.
 * @param {Record<string, unknown>} payload - Registration body.
 * @returns {Promise<ApiResult<T>>} Status and body of the answer.
 */
export async function sendRegistration<T = RegisterAnswer>(
    api: TestUser['api'],
    payload: Record<string, unknown>
): Promise<ApiResult<T>> {
    const result = await apiCall<T>(
        api,
        'POST',
        ApiEndpoints.REGISTER,
        payload
    );
    if (result.status === 201) {
        trackAccount({
            email: String(payload.email),
            password: String(payload.password),
        });
    }
    return result;
}

/**
 * Tries to register with the given body and returns the raw answer. If the app
 * accepts it (201) the new account is deleted straight away, so a test that
 * expects a rejection never leaves an account behind when the app is wrong.
 *
 * @param {Pick<UserData, 'email' | 'password'> & Record<string, unknown>} data - Registration body.
 * @returns {Promise<ApiResult<RegisterAnswer>>} Status and body of the answer.
 */
export async function attemptRegistration(
    data: Pick<UserData, 'email' | 'password'> & Record<string, unknown>
): Promise<ApiResult<RegisterAnswer>> {
    const api = await newApiSession();
    try {
        const result = await sendRegistration(api, {
            acceptTerms: true,
            marketingOptIn: false,
            ...data,
        });
        if (result.status === 201 && result.body.user) {
            await deleteAccount({
                email: data.email,
                password: data.password,
                firstName: '',
                lastName: '',
                id: result.body.user.id,
                api,
            });
        }
        return result;
    } finally {
        await api.dispose();
    }
}
