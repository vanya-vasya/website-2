import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';

export const locales = ['en', 'tr'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

// Locale-specific formatting configurations
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

export default getRequestConfig(async () => {
  // Try to get locale from cookie first (highest priority)
  const cookieStore = cookies();
  const localeCookie = cookieStore.get('NEXT_LOCALE')?.value as Locale | undefined;
  
  // Validate the locale from cookie
  let locale: Locale = defaultLocale;
  
  if (localeCookie && locales.includes(localeCookie)) {
    locale = localeCookie;
  } else {
    // Try to detect from Accept-Language header
    const headersList = headers();
    const acceptLanguage = headersList.get('accept-language');
    
    if (acceptLanguage) {
      // Check for full locale match first (e.g., tr-TR)
      const fullLocale = acceptLanguage.split(',')[0].toLowerCase();
      if (fullLocale.startsWith('tr')) {
        locale = 'tr';
      } else if (fullLocale.startsWith('en')) {
        locale = 'en';
      } else {
        // Fallback to language code only
        const browserLocale = acceptLanguage.split(',')[0].split('-')[0];
        if (locales.includes(browserLocale as Locale)) {
          locale = browserLocale as Locale;
        }
      }
    }
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
    // Provide timezone for date formatting
    timeZone: 'Europe/Istanbul',
  };
});
