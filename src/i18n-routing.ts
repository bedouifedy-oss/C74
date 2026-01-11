export const locales = ['en', 'fr', 'ar-TN'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'ar-TN';
