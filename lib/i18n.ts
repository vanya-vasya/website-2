export const locales = ['en', 'tr'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: '🇬🇧 EN',
  tr: '🇹🇷 TR',
};

export const localeFull: Record<Locale, string> = {
  en: 'English',
  tr: 'Türkçe',
};
