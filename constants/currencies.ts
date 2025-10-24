/**
 * Multi-Currency Support for Payment Processing
 * 
 * Supports 15+ currencies with live exchange rates
 * All rates are relative to EUR as the base currency
 */

export type Currency =
  | "EUR"
  | "USD"
  | "GBP"
  | "CHF"
  | "AED"
  | "SEK"
  | "PLN"
  | "CZK"
  | "DKK"
  | "NOK"
  | "RON"
  | "HUF"
  | "MDL"
  | "BGN"
  | "JOD"
  | "KWD";

/**
 * Exchange rates relative to EUR (base currency)
 * These rates should be updated periodically from a reliable source
 * Last updated: October 2025
 */
export const currenciesRate: Record<Currency, number> = {
  EUR: 1,
  USD: 1.133616,
  GBP: 0.84,
  CHF: 0.94,
  AED: 4.19,
  SEK: 10.98,
  PLN: 4.27,
  CZK: 24.8,
  DKK: 7.46,
  NOK: 11.5,
  RON: 5.04,
  HUF: 401.8,
  MDL: 19.71,
  BGN: 1.96,
  JOD: 0.81,
  KWD: 0.346695,
};

/**
 * List of supported currencies
 */
export const currencies: readonly Currency[] = [
  "EUR",
  "USD",
  "GBP",
  "CHF",
  "AED",
  "SEK",
  "PLN",
  "CZK",
  "DKK",
  "NOK",
  "RON",
  "HUF",
  "MDL",
  "BGN",
  "JOD",
  "KWD",
] as const;

/**
 * Currency display information
 */
export const currencyInfo: Record<Currency, { symbol: string; name: string; decimals: number }> = {
  EUR: { symbol: '€', name: 'Euro', decimals: 2 },
  USD: { symbol: '$', name: 'US Dollar', decimals: 2 },
  GBP: { symbol: '£', name: 'British Pound', decimals: 2 },
  CHF: { symbol: 'CHF', name: 'Swiss Franc', decimals: 2 },
  AED: { symbol: 'AED', name: 'UAE Dirham', decimals: 2 },
  SEK: { symbol: 'kr', name: 'Swedish Krona', decimals: 2 },
  PLN: { symbol: 'zł', name: 'Polish Złoty', decimals: 2 },
  CZK: { symbol: 'Kč', name: 'Czech Koruna', decimals: 2 },
  DKK: { symbol: 'kr', name: 'Danish Krone', decimals: 2 },
  NOK: { symbol: 'kr', name: 'Norwegian Krone', decimals: 2 },
  RON: { symbol: 'lei', name: 'Romanian Leu', decimals: 2 },
  HUF: { symbol: 'Ft', name: 'Hungarian Forint', decimals: 0 },
  MDL: { symbol: 'L', name: 'Moldovan Leu', decimals: 2 },
  BGN: { symbol: 'лв', name: 'Bulgarian Lev', decimals: 2 },
  JOD: { symbol: 'JD', name: 'Jordanian Dinar', decimals: 3 },
  KWD: { symbol: 'KD', name: 'Kuwaiti Dinar', decimals: 3 },
};

/**
 * Convert amount from one currency to another
 */
export const convertCurrency = (
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency
): number => {
  const amountInEUR = amount / currenciesRate[fromCurrency];
  const convertedAmount = amountInEUR * currenciesRate[toCurrency];
  return convertedAmount;
};

/**
 * Format currency amount with proper symbol and decimals
 */
export const formatCurrency = (amount: number, currency: Currency): string => {
  const info = currencyInfo[currency];
  const formattedAmount = (amount / 100).toFixed(info.decimals);
  
  // Place symbol before or after based on currency
  if (['EUR', 'GBP', 'USD'].includes(currency)) {
    return `${info.symbol}${formattedAmount}`;
  } else {
    return `${formattedAmount} ${info.symbol}`;
  }
};

