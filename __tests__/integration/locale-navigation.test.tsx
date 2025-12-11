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

describe('Locale Persistence Across Navigation', () => {
  beforeEach(() => {
    document.cookie = 'NEXT_LOCALE=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    mockRouter.refresh.mockClear();
    mockRouter.push.mockClear();
  });

  it('preserves Turkish locale when navigating to dashboard', async () => {
    // Set Turkish locale
    document.cookie = 'NEXT_LOCALE=tr; path=/; max-age=31536000';

    render(
      <NextIntlClientProvider locale="tr" messages={trMessages}>
        <Header />
      </NextIntlClientProvider>
    );

    // Verify Turkish is set
    await waitFor(() => {
      const cookies = document.cookie.split('; ');
      const localeCookie = cookies.find(c => c.startsWith('NEXT_LOCALE='));
      expect(localeCookie).toBe('NEXT_LOCALE=tr');
    });

    // Simulate navigation to dashboard (this would normally be handled by Next.js routing)
    mockRouter.pathname = '/dashboard';
    
    // Re-render with new pathname
    render(
      <NextIntlClientProvider locale="tr" messages={trMessages}>
        <Header />
      </NextIntlClientProvider>
    );

    // Verify locale is still Turkish
    await waitFor(() => {
      const cookies = document.cookie.split('; ');
      const localeCookie = cookies.find(c => c.startsWith('NEXT_LOCALE='));
      expect(localeCookie).toBe('NEXT_LOCALE=tr');
    });
  });

  it('preserves Turkish locale when switching between products in header', async () => {
    document.cookie = 'NEXT_LOCALE=tr; path=/; max-age=31536000';

    const { rerender } = render(
      <NextIntlClientProvider locale="tr" messages={trMessages}>
        <Header />
      </NextIntlClientProvider>
    );

    // Simulate clicking between different products/components
    mockRouter.pathname = '/dashboard/video';
    rerender(
      <NextIntlClientProvider locale="tr" messages={trMessages}>
        <Header />
      </NextIntlClientProvider>
    );

    mockRouter.pathname = '/dashboard/image-generation';
    rerender(
      <NextIntlClientProvider locale="tr" messages={trMessages}>
        <Header />
      </NextIntlClientProvider>
    );

    // Verify locale persists
    await waitFor(() => {
      const cookies = document.cookie.split('; ');
      const localeCookie = cookies.find(c => c.startsWith('NEXT_LOCALE='));
      expect(localeCookie).toBe('NEXT_LOCALE=tr');
    });
  });

  it('preserves Turkish locale when navigating from landing to dashboard', async () => {
    document.cookie = 'NEXT_LOCALE=tr; path=/; max-age=31536000';

    // Render landing page
    const { rerender } = render(
      <NextIntlClientProvider locale="tr" messages={trMessages}>
        <Header />
      </NextIntlClientProvider>
    );

    // Navigate to dashboard
    mockRouter.pathname = '/dashboard';
    rerender(
      <NextIntlClientProvider locale="tr" messages={trMessages}>
        <Header />
      </NextIntlClientProvider>
    );

    // Verify locale persists
    await waitFor(() => {
      const cookies = document.cookie.split('; ');
      const localeCookie = cookies.find(c => c.startsWith('NEXT_LOCALE='));
      expect(localeCookie).toBe('NEXT_LOCALE=tr');
    });
  });

  it('language switcher updates locale and persists across navigation', async () => {
    const { container } = render(
      <NextIntlClientProvider locale="en" messages={enMessages}>
        <LanguageSwitcher />
      </NextIntlClientProvider>
    );

    // Switch to Turkish
    const switcherButton = container.querySelector('button');
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
    });

    // Simulate navigation
    mockRouter.pathname = '/dashboard';
    
    // Re-render
    render(
      <NextIntlClientProvider locale="tr" messages={trMessages}>
        <LanguageSwitcher />
      </NextIntlClientProvider>
    );

    // Verify Turkish still persists
    await waitFor(() => {
      const cookies = document.cookie.split('; ');
      const localeCookie = cookies.find(c => c.startsWith('NEXT_LOCALE='));
      expect(localeCookie).toBe('NEXT_LOCALE=tr');
    });
  });
});
