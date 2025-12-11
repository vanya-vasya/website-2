import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';
import { locales, defaultLocale, type Locale } from '@/lib/i18n';

// Re-export for backwards compatibility
export { locales, defaultLocale, type Locale };

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
