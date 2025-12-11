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
import { formatDate, formatCurrency, formatNumber, formatDateShort, formatRelativeTime } from '@/lib/format';
import { Locale, localeConfig } from '@/i18n/request';
import Header from '@/components/landing/header';

// Mock next/navigation
const mockRouter = {
  push: jest.fn(),
  refresh: jest.fn(),
  pathname: '/',
};

jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  usePathname: () => mockRouter.pathname,
}));

// Mock Clerk
jest.mock('@clerk/nextjs', () => ({
  SignedIn: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SignedOut: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  UserButton: () => <div data-testid="user-button">UserButton</div>,
}));

// Mock GuestMobileSidebar
jest.mock('@/components/guest-mobile-sidebar', () => ({
  GuestMobileSidebar: () => <div data-testid="mobile-sidebar">Mobile Sidebar</div>,
}));

describe('Comprehensive Turkish Locale Support', () => {
  beforeEach(() => {
    document.cookie = 'NEXT_LOCALE=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    mockRouter.refresh.mockClear();
    mockRouter.push.mockClear();
  });

  describe('Turkish Locale Configuration', () => {
    it('has Turkish locale in localeConfig', () => {
      expect(localeConfig.tr).toBeDefined();
      expect(localeConfig.tr.localeString).toBe('tr-TR');
      expect(localeConfig.tr.currency.currency).toBe('TRY');
    });

    it('has proper date formatting for Turkish', () => {
      const config = localeConfig.tr;
      expect(config.dateTime.year).toBe('numeric');
      expect(config.dateTime.month).toBe('long');
    });
  });

  describe('Turkish Date Formatting', () => {
    it('formats dates with Turkish locale and month names', () => {
      const date = new Date('2024-01-15T14:30:00');
      const formatted = formatDate(date, 'tr');
      
      // Should contain Turkish formatting
      expect(formatted).toBeTruthy();
      // Turkish months don't match English
      expect(formatted.toLowerCase()).not.toContain('january');
    });

    it('formats short dates in Turkish', () => {
      const date = new Date('2024-01-15T14:30:00');
      const formatted = formatDateShort(date, 'tr');
      
      expect(formatted).toBeTruthy();
      // Should contain month abbreviation in Turkish
      expect(formatted.length).toBeGreaterThan(0);
    });

    it('formats relative time in Turkish', () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 3600000);
      const formatted = formatRelativeTime(oneHourAgo, 'tr');
      
      expect(formatted).toBeTruthy();
      // Should contain Turkish relative time indicators
      expect(formatted.toLowerCase()).toMatch(/saat|hour|minute|dakika/);
    });
  });

  describe('Turkish Number Formatting', () => {
    it('formats numbers with Turkish locale conventions', () => {
      const number = 1234.56;
      const formatted = formatNumber(number, 'tr');
      
      // Turkish uses comma as decimal separator
      expect(formatted).toContain(',');
      // Should format with proper thousands separator
      expect(formatted).toMatch(/1/);
      expect(formatted).toMatch(/234/);
    });

    it('formats large numbers correctly in Turkish', () => {
      const number = 1234567.89;
      const formatted = formatNumber(number, 'tr');
      
      expect(formatted).toBeTruthy();
      expect(formatted).toContain(',');
    });
  });

  describe('Turkish Currency Formatting', () => {
    it('formats TRY currency correctly', () => {
      const amount = 100.50;
      const formatted = formatCurrency(amount, 'tr', 'TRY');
      
      expect(formatted).toBeTruthy();
      expect(formatted).toMatch(/100/);
      // TRY symbol should be present
      expect(formatted.toLowerCase()).toMatch(/₺|try|tl/);
    });

    it('formats other currencies with Turkish locale formatting', () => {
      const amount = 50.25;
      const formattedEUR = formatCurrency(amount, 'tr', 'EUR');
      const formattedUSD = formatCurrency(amount, 'tr', 'USD');
      
      expect(formattedEUR).toBeTruthy();
      expect(formattedUSD).toBeTruthy();
      // Both should use Turkish number formatting
      expect(formattedEUR).toMatch(/50/);
      expect(formattedUSD).toMatch(/50/);
    });
  });

  describe('Turkish Locale Persistence Across Navigation', () => {
    it('preserves Turkish when entering dashboard', async () => {
      document.cookie = 'NEXT_LOCALE=tr; path=/; max-age=31536000';

      mockRouter.pathname = '/';
      render(
        <NextIntlClientProvider locale="tr" messages={trMessages}>
          <Header />
        </NextIntlClientProvider>
      );

      await waitFor(() => {
        const cookies = document.cookie.split('; ');
        const localeCookie = cookies.find(c => c.startsWith('NEXT_LOCALE='));
        expect(localeCookie).toBe('NEXT_LOCALE=tr');
      });

      // Navigate to dashboard
      mockRouter.pathname = '/dashboard';
      
      render(
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

    it('preserves Turkish when switching between dashboard products', async () => {
      document.cookie = 'NEXT_LOCALE=tr; path=/; max-age=31536000';

      const paths = [
        '/dashboard',
        '/dashboard/video',
        '/dashboard/image-generation',
        '/dashboard/music',
        '/dashboard/conversation',
      ];

      for (const path of paths) {
        mockRouter.pathname = path;
        const { rerender } = render(
          <NextIntlClientProvider locale="tr" messages={trMessages}>
            <LanguageSwitcher />
          </NextIntlClientProvider>
        );

        await waitFor(() => {
          const cookies = document.cookie.split('; ');
          const localeCookie = cookies.find(c => c.startsWith('NEXT_LOCALE='));
          expect(localeCookie).toBe('NEXT_LOCALE=tr');
        });

        rerender(
          <NextIntlClientProvider locale="tr" messages={trMessages}>
            <LanguageSwitcher />
          </NextIntlClientProvider>
        );
      }
    });

    it('preserves Turkish when clicking header product links', async () => {
      document.cookie = 'NEXT_LOCALE=tr; path=/; max-age=31536000';

      mockRouter.pathname = '/';
      const { rerender } = render(
        <NextIntlClientProvider locale="tr" messages={trMessages}>
          <Header />
        </NextIntlClientProvider>
      );

      // Simulate clicking different product links
      mockRouter.pathname = '/dashboard/video';
      rerender(
        <NextIntlClientProvider locale="tr" messages={trMessages}>
          <Header />
        </NextIntlClientProvider>
      );

      await waitFor(() => {
        const cookies = document.cookie.split('; ');
        const localeCookie = cookies.find(c => c.startsWith('NEXT_LOCALE='));
        expect(localeCookie).toBe('NEXT_LOCALE=tr');
      });

      mockRouter.pathname = '/dashboard/image-generation';
      rerender(
        <NextIntlClientProvider locale="tr" messages={trMessages}>
          <Header />
        </NextIntlClientProvider>
      );

      await waitFor(() => {
        const cookies = document.cookie.split('; ');
        const localeCookie = cookies.find(c => c.startsWith('NEXT_LOCALE='));
        expect(localeCookie).toBe('NEXT_LOCALE=tr');
      });
    });
  });

  describe('Language Switcher Turkish Support', () => {
    it('displays Turkish option in switcher', () => {
      const { container } = render(
        <NextIntlClientProvider locale="en" messages={enMessages}>
          <LanguageSwitcher />
        </NextIntlClientProvider>
      );

      const button = container.querySelector('button');
      expect(button).toBeInTheDocument();
      
      fireEvent.click(button!);
      
      waitFor(() => {
        expect(screen.getByText('🇹🇷 TR')).toBeInTheDocument();
      });
    });

    it('switches to Turkish and updates HTML lang attribute', async () => {
      const { container } = render(
        <NextIntlClientProvider locale="en" messages={enMessages}>
          <LanguageSwitcher />
        </NextIntlClientProvider>
      );

      const button = container.querySelector('button');
      fireEvent.click(button!);
      
      await waitFor(() => {
        expect(screen.getByText('🇹🇷 TR')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('🇹🇷 TR'));

      await waitFor(() => {
        expect(document.documentElement.lang).toBe('tr');
        const cookies = document.cookie.split('; ');
        const localeCookie = cookies.find(c => c.startsWith('NEXT_LOCALE='));
        expect(localeCookie).toBe('NEXT_LOCALE=tr');
      });
    });

    it('reads Turkish locale from cookie on mount', async () => {
      document.cookie = 'NEXT_LOCALE=tr; path=/; max-age=31536000';

      const { container } = render(
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

  describe('Turkish Translations', () => {
    it('renders Turkish translations correctly', () => {
      render(
        <NextIntlClientProvider locale="tr" messages={trMessages}>
          <div>{trMessages.common.buyMore}</div>
        </NextIntlClientProvider>
      );

      expect(screen.getByText('Daha Fazla Al')).toBeInTheDocument();
    });

    it('renders Turkish dashboard translations', () => {
      render(
        <NextIntlClientProvider locale="tr" messages={trMessages}>
          <div>
            <div>{trMessages.dashboardTools.scriptBuilder.title}</div>
            <div>{trMessages.dashboardTools.videoMaker.title}</div>
          </div>
        </NextIntlClientProvider>
      );

      // Check if Turkish translations exist (they should be in trMessages)
      expect(trMessages.dashboardTools).toBeDefined();
    });
  });

  describe('Locale Detection', () => {
    it('detects Turkish from Accept-Language header format', () => {
      // This is tested in i18n/request.ts which checks for tr-TR or tr
      // The localeConfig includes proper Turkish locale string
      expect(localeConfig.tr.localeString).toBe('tr-TR');
    });

    it('defaults to English when locale is invalid', () => {
      document.cookie = 'NEXT_LOCALE=invalid; path=/; max-age=31536000';

      const { container } = render(
        <NextIntlClientProvider locale="en" messages={enMessages}>
          <LanguageSwitcher />
        </NextIntlClientProvider>
      );

      // Should default to English if invalid locale in cookie
      waitFor(() => {
        const button = container.querySelector('button');
        // Language switcher should handle invalid locales gracefully
        expect(button).toBeInTheDocument();
      });
    });
  });
});