/**
 * Checkout test data, verified against the live app. All values are synthetic.
 * The demo store accepts these test cards (shown in the "Demo store: test
 * cards" box under the card inputs) with any future expiry and any 3-digit CVC.
 * The State field needs a real 2-letter US state code.
 */
export const CHECKOUT_ADDRESS = {
    line1: '1 Test Street',
    city: 'Testville',
    state: 'WA',
    zip: '12345',
    phone: '5550100',
} as const;

export const TEST_CARDS = {
    approved: '4242 4242 4242 4242',
    declined: '4000 0000 0000 0002',
    insufficientFunds: '4000 0000 0000 9995',
} as const;

export const CARD_DETAILS = {
    name: 'Qa Tester',
    expiry: '12/30',
    cvc: '123',
} as const;

/** A published test number of a brand the store does not accept (PAY-1) */
export const UNSUPPORTED_CARD = '3056 9300 0902 0004';

/** TC-02: tracking number the seller enters when shipping */
export const TRACKING_NUMBER = '1Z999AA10123456784';
