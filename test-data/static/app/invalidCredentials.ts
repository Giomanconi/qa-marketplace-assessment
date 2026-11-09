/**
 * Failed login attempts. `expectedError` names the kind of error; the spec
 * turns it into the message text from the `Messages` enum.
 */
export const INVALID_LOGIN_ATTEMPTS = [
    {
        description: 'empty email and password',
        email: '',
        password: '',
        expectedError: 'fields-required',
    },
    {
        description: 'malformed email',
        email: 'not-an-email',
        password: 'WrongPassword123!',
        expectedError: 'invalid-credentials',
    },
    {
        description: 'unregistered email with wrong password',
        email: 'nobody-registered@example.com',
        password: 'WrongPassword123!',
        expectedError: 'invalid-credentials',
    },
] as const;
