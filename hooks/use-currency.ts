"use client";

import { useState, useEffect, useCallback } from "react";

export type FooterCurrency = "USD" | "EUR" | "GBP";

const CURRENCY_STORAGE_KEY = "nerbixa-selected-currency";
const DEFAULT_CURRENCY: FooterCurrency = "EUR";

export interface CurrencyOption {
  code: FooterCurrency;
  name: string;
  symbol: string;
  flag: string;
  country: string;
}

export const currencyOptions: CurrencyOption[] = [
  {
    code: "USD",
    name: "US Dollar",
    symbol: "$",
    flag: "🇺🇸",
    country: "United States",
  },
  {
    code: "EUR",
    name: "Euro",
    symbol: "€",
    flag: "🇪🇺",
    country: "European Union",
  },
  {
    code: "GBP",
    name: "British Pound",
    symbol: "£",
    flag: "🇬🇧",
    country: "United Kingdom",
  },
];

export const useCurrency = () => {
  const [currency, setCurrencyState] = useState<FooterCurrency>(DEFAULT_CURRENCY);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load currency from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(CURRENCY_STORAGE_KEY);
    if (stored && ["USD", "EUR", "GBP"].includes(stored)) {
      setCurrencyState(stored as FooterCurrency);
    }
    setIsLoaded(true);
  }, []);

  // Set currency and persist to localStorage
  const setCurrency = useCallback((newCurrency: FooterCurrency) => {
    setCurrencyState(newCurrency);
    localStorage.setItem(CURRENCY_STORAGE_KEY, newCurrency);
  }, []);

  // Get current currency option details
  const currentOption = currencyOptions.find((opt) => opt.code === currency) || currencyOptions[1];

  return {
    currency,
    setCurrency,
    currentOption,
    currencyOptions,
    isLoaded,
  };
};
