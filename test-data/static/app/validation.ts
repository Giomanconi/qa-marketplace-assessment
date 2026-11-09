/** A ZIP code the checkout must reject (letters instead of 5 digits) */
export const INVALID_ZIP = 'ABCDE';

/** GDPR-01: the only cookies the site may set (consent choice and session) */
export const ESSENTIAL_COOKIES = ['mp_consent', 'mp_session'] as const;

/** TC-10: the three screen sizes the layout is checked at */
export const VIEWPORTS = [
    { name: 'phone', width: 375, height: 812 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1440, height: 900 },
] as const;

/** TC-10: overflow below this many pixels is rounding, not a layout problem */
export const SIDEWAYS_TOLERANCE_PX = 2;
