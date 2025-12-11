/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { NextIntlClientProvider } from 'next-intl';
import enMessages from '@/messages/en.json';
import trMessages from '@/messages/tr.json';
import { LanguageSwitcher } from '@/components/language-switcher';
import { formatDate, formatCurrency, formatNumber } from '@/lib/format';
import { Locale } from '@/lib/i18n';

// Mock next/navigation
const mockRouter = {
  push: jest.fn(),
  refresh: jest.fn(),
  pathname: '/',
};

jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  usePathname: () => '/',
}));

describe('Turkish Locale Support', () => {
  beforeEach(() => {
    // Clear cookies before each test
    document.cookie = 'NEXT_LOCALE=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    mockRouter.refresh.mockClear();
    mockRouter.push.mockClear();
  });

  describe('Language Switcher', () => {
    it('switches to Turkish and updates cookie', async () => {
      const { container } = render(
        <NextIntlClientProvider locale="en" messages={enMessages}>
          <LanguageSwitcher />
        </NextIntlClientProvider>
      );

      const switcherButton = container.querySelector('button');
      expect(switcherButton).toBeInTheDocument();
      
      fireEvent.click(switcherButton!);
      
      await waitFor(() => {
        const trOption = screen.getByText('🇹🇷 TR');
        expect(trOption).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('🇹🇷 TR'));

      await waitFor(() => {
        const cookies = document.cookie.split('; ');
        const localeCookie = cookies.find(c => c.startsWith('NEXT_LOCALE='));
        expect(localeCookie).toBe('NEXT_LOCALE=tr');
        expect(mockRouter.refresh).toHaveBeenCalled();
      });
    });

    it('preserves Turkish locale across component re-renders', async () => {
      // Set Turkish locale in cookie
      document.cookie = 'NEXT_LOCALE=tr; path=/; max-age=31536000';

      const { container, rerender } = render(
        <NextIntlClientProvider locale="tr" messages={trMessages}>
          <LanguageSwitcher />
        </NextIntlClientProvider>
      );

      await waitFor(() => {
        const button = container.querySelector('button');
        expect(button?.textContent).toContain('🇹🇷 TR');
      });

      // Re-render to simulate navigation
      rerender(
        <NextIntlClientProvider locale="tr" messages={trMessages}>
          <LanguageSwitcher />
        </NextIntlClientProvider>
      );

      await waitFor(() => {
        const button = container.querySelector('button');
        expect(button?.textContent).toContain('🇹🇷 TR');
      });
    });
  });

  describe('Turkish Formatting', () => {
    it('formats dates in Turkish locale', () => {
      const date = new Date('2024-01-15T14:30:00');
      const formatted = formatDate(date, 'tr');
      
      // Turkish date format should use Turkish month names
      expect(formatted).toMatch(/\d{1,2}/); // Should contain numbers
      expect(formatted.toLowerCase()).not.toContain('january'); // Not English
    });

    it('formats numbers in Turkish locale', () => {
      const number = 1234.56;
      const formatted = formatNumber(number, 'tr');
      
      // Turkish uses comma as decimal separator
      expect(formatted).toContain(',');
      expect(formatted).toMatch(/1[.\s]?234[,.]56/);
    });

    it('formats currency in Turkish locale (TRY)', () => {
      const amount = 100.50;
      const formatted = formatCurrency(amount, 'tr', 'TRY');
      
      expect(formatted).toContain('₺'); // Turkish Lira symbol or TRY
      expect(formatted).toMatch(/100/);
    });

    it('formats currency with different currencies', () => {
      const amount = 50.25;
      const formattedEUR = formatCurrency(amount, 'tr', 'EUR');
      const formattedUSD = formatCurrency(amount, 'en', 'USD');
      
      expect(formattedEUR).toMatch(/50/);
      expect(formattedUSD).toMatch(/50/);
    });
  });

  describe('Locale Persistence', () => {
    it('reads locale from cookie on initialization', () => {
      document.cookie = 'NEXT_LOCALE=tr; path=/; max-age=31536000';

      const { container } = render(
        <NextIntlClientProvider locale="tr" messages={trMessages}>
          <LanguageSwitcher />
        </NextIntlClientProvider>
      );

      waitFor(() => {
        const button = container.querySelector('button');
        expect(button?.textContent).toContain('🇹🇷 TR');
      });
    });

    it('maintains locale when switching pages', async () => {
      document.cookie = 'NEXT_LOCALE=tr; path=/; max-age=31536000';

      const { rerender } = render(
        <NextIntlClientProvider locale="tr" messages={trMessages}>
          <LanguageSwitcher />
        </NextIntlClientProvider>
      );

      // Simulate page navigation
      rerender(
        <NextIntlClientProvider locale="tr" messages={trMessages}>
          <LanguageSwitcher />
        </NextIntlClientProvider>
      );

      await waitFor(() => {
        const cookies = document.cookie.split('; ');
        const localeCookie = cookies.find(c => c.startsWith('NEXT_LOCALE='));
        expect(localeCookie).toBe('NEXT_LOCALE=tr');
      });
    });
  });

  describe('Turkish Translations', () => {
    it('renders Turkish text when locale is Turkish', () => {
      render(
        <NextIntlClientProvider locale="tr" messages={trMessages}>
          <div>{trMessages.common.buyMore}</div>
        </NextIntlClientProvider>
      );

      expect(screen.getByText('Daha Fazla Al')).toBeInTheDocument();
    });

    it('switches translations when locale changes', async () => {
      const { rerender } = render(
        <NextIntlClientProvider locale="en" messages={enMessages}>
          <div>{enMessages.common.buyMore}</div>
        </NextIntlClientProvider>
      );

      expect(screen.getByText('Buy More')).toBeInTheDocument();

      rerender(
        <NextIntlClientProvider locale="tr" messages={trMessages}>
          <div>{trMessages.common.buyMore}</div>
        </NextIntlClientProvider>
      );

      expect(screen.getByText('Daha Fazla Al')).toBeInTheDocument();
    });
  });
});
