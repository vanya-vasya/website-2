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

// Locale-specific formatting configurations (shared between server and client)
export const localeConfig: Record<Locale, {
  dateTime: Intl.DateTimeFormatOptions;
  number: Intl.NumberFormatOptions;
  currency: Intl.NumberFormatOptions;
  localeString: string;
}> = {
  en: {
    dateTime: {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    },
    number: {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
    currency: {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
    localeString: 'en-US',
  },
  tr: {
    dateTime: {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    },
    number: {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
    currency: {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
    localeString: 'tr-TR',
  },
};
