/** TC-07: price range and sort checked against the public catalog */
export const PRICE_FILTER = { min: 10, max: 50 };

/** TC-07 edge inputs: none may produce an error page */
export const EDGE_QUERIES = {
    empty: '',
    long: 'a'.repeat(200),
    special: `<>"'%`,
} as const;
