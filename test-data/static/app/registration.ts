/**
 * TC-08 (ACC-1): password rules are at least 8 characters with a letter and a
 * number. These are throwaway test values for accounts that are rejected or
 * deleted straight away.
 */
export const REJECTED_PASSWORDS = [
    {
        id: 'a',
        description: '7 characters with a letter and a number',
        value: 'Abc1234',
    },
    { id: 'b1', description: '8 letters, no number', value: 'abcdefgh' },
    { id: 'b2', description: '8 digits, no letter', value: '12345678' },
] as const;

/** TC-08 case c: exactly 8 characters with a letter and a number is accepted */
export const MINIMUM_VALID_PASSWORD = 'abcd1234';

/** TC-08 case d: an email without the domain part */
export const INVALID_EMAIL = 'not-an-email';
