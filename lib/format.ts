import { Locale, localeConfig } from '@/lib/i18n';

/**
 * Format a date according to the current locale
 */
export const formatDate = (date: Date | string, locale: Locale = 'en'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const config = localeConfig[locale];
  
  return new Intl.DateTimeFormat(config.localeString, {
    ...config.dateTime,
    timeZone: 'Europe/Istanbul',
  }).format(dateObj);
};

/**
 * Format a number according to the current locale
 */
export const formatNumber = (value: number, locale: Locale = 'en'): string => {
  const config = localeConfig[locale];
  return new Intl.NumberFormat(config.localeString, config.number).format(value);
};

/**
 * Format a currency value according to the current locale
 */
export const formatCurrency = (value: number, locale: Locale = 'en', currency?: string): string => {
  const config = localeConfig[locale];
  const currencyOptions = currency 
    ? { ...config.currency, currency }
    : config.currency;
  
  return new Intl.NumberFormat(config.localeString, currencyOptions).format(value);
};

/**
 * Format a date to a short format (e.g., "Jan 15, 2024" or "15 Oca 2024")
 */
export const formatDateShort = (date: Date | string, locale: Locale = 'en'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const config = localeConfig[locale];
  
  return new Intl.DateTimeFormat(config.localeString, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'Europe/Istanbul',
  }).format(dateObj);
};

/**
 * Format a relative time (e.g., "2 hours ago" or "2 saat önce")
 */
export const formatRelativeTime = (date: Date | string, locale: Locale = 'en'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
  
  const rtf = new Intl.RelativeTimeFormat(locale === 'tr' ? 'tr-TR' : 'en-US', { numeric: 'auto' });
  
  if (Math.abs(diffInSeconds) < 60) {
    return rtf.format(-diffInSeconds, 'second');
  } else if (Math.abs(diffInSeconds) < 3600) {
    return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
  } else if (Math.abs(diffInSeconds) < 86400) {
    return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
  } else {
    return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
  }
};
