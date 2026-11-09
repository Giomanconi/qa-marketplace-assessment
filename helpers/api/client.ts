import { request } from '@playwright/test';
import type { APIRequestContext } from '@playwright/test';
import { appConfig } from '../../config/app';
import type { ApiResult } from './types';

/**
 * Opens an API session: a request context with its own cookie jar.
 * One session = one logged-in user, so users never share cookies.
 *
 * @returns {Promise<APIRequestContext>} A fresh session pointing at APP_URL.
 */
export async function newApiSession(): Promise<APIRequestContext> {
    return request.newContext({
        baseURL: process.env.APP_URL!,
        timeout: appConfig.apiRequestTimeout,
    });
}

/**
 * Sends one JSON API request and returns the status and parsed body.
 * The QA host fails some requests on purpose, so a network error or a 5xx is
 * retried (up to `appConfig.apiMaxAttempts`). A 4xx is a real answer and is
 * returned at once, so validation errors fail fast.
 *
 * Only call this for requests that are safe to repeat, or check the outcome
 * before retrying (see `registerUser`).
 *
 * @param {APIRequestContext} api - The user's session.
 * @param {'GET' | 'POST' | 'PATCH' | 'DELETE'} method - HTTP method.
 * @param {string} path - Path from `ApiEndpoints`, relative to APP_URL.
 * @param {object} [data] - JSON body.
 * @returns {Promise<ApiResult<T>>} Status code and parsed JSON body.
 */
export async function apiCall<T = unknown>(
    api: APIRequestContext,
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
    path: string,
    data?: object
): Promise<ApiResult<T>> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= appConfig.apiMaxAttempts; attempt++) {
        try {
            const response = await api.fetch(path, { method, data });
            if (response.status() >= 500) {
                lastError = new Error(
                    `${method} ${path} -> ${response.status()}`
                );
                continue;
            }
            const body = (await response.json().catch(() => null)) as T;
            return { status: response.status(), body };
        } catch (error) {
            lastError = error;
        }
    }

    throw lastError;
}

/**
 * GETs a path that must answer 200. The QA host sometimes fails a read on
 * purpose (even with a 404), so a non-200 is retried before giving up.
 *
 * @param {APIRequestContext} api - The user's session.
 * @param {string} path - Path from `ApiEndpoints`, relative to APP_URL.
 * @returns {Promise<T>} The parsed JSON body.
 */
export async function getOk<T>(
    api: APIRequestContext,
    path: string
): Promise<T> {
    let status = 0;
    for (let attempt = 1; attempt <= appConfig.apiMaxAttempts; attempt++) {
        const result = await apiCall<T>(api, 'GET', path);
        if (result.status === 200) return result.body;
        status = result.status;
    }
    throw new Error('GET ' + path + ' failed with status ' + status);
}

/**
 * GETs a page that must answer 200 and returns its HTML. Retried like `getOk`,
 * so a test that looks for what is absent from a page never passes on an error
 * page.
 *
 * @param {APIRequestContext} api - The session.
 * @param {string} path - Route, relative to APP_URL.
 * @returns {Promise<string>} The page HTML.
 */
export async function getPageOk(
    api: APIRequestContext,
    path: string
): Promise<string> {
    let status = 0;
    for (let attempt = 1; attempt <= appConfig.apiMaxAttempts; attempt++) {
        const response = await api.get(path);
        if (response.status() === 200) return response.text();
        status = response.status();
    }
    throw new Error('GET ' + path + ' failed with status ' + status);
}

/**
 * Requests the site over plain HTTP (no redirect followed) to see where the
 * server sends the visitor.
 *
 * @param {string} path - Path to request, for example `/`.
 * @returns {Promise<{ status: number; location: string }>} Status and the Location header.
 */
export async function getOverPlainHttp(
    path: string
): Promise<{ status: number; location: string }> {
    const api = await request.newContext({
        timeout: appConfig.apiRequestTimeout,
    });
    try {
        const url = new URL(path, process.env.APP_URL!);
        url.protocol = 'http:';
        const response = await api.get(url.href, { maxRedirects: 0 });
        return {
            status: response.status(),
            location: response.headers()['location'] ?? '',
        };
    } finally {
        await api.dispose();
    }
}
