import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';

export const locales = ['en', 'tr'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

export default getRequestConfig(async () => {
  // Try to get locale from cookie first
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
      const browserLocale = acceptLanguage.split(',')[0].split('-')[0];
      if (locales.includes(browserLocale as Locale)) {
        locale = browserLocale as Locale;
      }
    }
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
