/**
 * Required fields of the API calls, verified against the live app. The API
 * answers a missing field with 400 and `fields.<name>`.
 */
export const REGISTER_REQUIRED_FIELDS = [
    'firstName',
    'lastName',
    'email',
    'password',
    'acceptTerms',
] as const;

export const PRODUCT_REQUIRED_FIELDS = [
    'title',
    'categoryId',
    'price',
    'stock',
    'status',
    'art',
] as const;
