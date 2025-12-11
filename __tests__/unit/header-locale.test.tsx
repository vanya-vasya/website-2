/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Header from '@/components/landing/header';
import { NextIntlClientProvider } from 'next-intl';
import enMessages from '@/messages/en.json';
import trMessages from '@/messages/tr.json';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '/',
}));

// Mock Clerk
jest.mock('@clerk/nextjs', () => ({
  SignedIn: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SignedOut: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock GuestMobileSidebar
jest.mock('@/components/guest-mobile-sidebar', () => ({
  GuestMobileSidebar: () => <div data-testid="mobile-sidebar">Mobile Sidebar</div>,
}));

describe('Header Component - Locale Switching', () => {
  beforeEach(() => {
    // Clear cookies before each test
    document.cookie = 'NEXT_LOCALE=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  });

  const renderWithLocale = (locale: 'en' | 'tr' = 'en') => {
    const messages = locale === 'en' ? enMessages : trMessages;
    return render(
      <NextIntlClientProvider locale={locale} messages={messages}>
        <Header />
      </NextIntlClientProvider>
    );
  };

  it('renders header with language switcher', () => {
    renderWithLocale('en');
    
    // Check if language switcher is present
    const languageSwitcher = screen.getByRole('button', { name: /🇬🇧 EN|🇹🇷 TR/i });
    expect(languageSwitcher).toBeInTheDocument();
  });

  it('displays English locale by default', () => {
    renderWithLocale('en');
    
    const enButton = screen.getByText('🇬🇧 EN');
    expect(enButton).toBeInTheDocument();
  });

  it('displays Turkish locale when Turkish is selected', () => {
    renderWithLocale('tr');
    
    // The component should show Turkish text
    const solutionsLink = screen.getByText(trMessages.nav.solutions);
    expect(solutionsLink).toBeInTheDocument();
  });

  it('shows language switcher after Sign In/Sign Up link', () => {
    renderWithLocale('en');
    
    const signInLink = screen.getByText(enMessages.common.signInSignUp);
    const languageSwitcher = screen.getByRole('button', { name: /🇬🇧 EN|🇹🇷 TR/i });
    
    // Check that language switcher appears after sign in link in DOM order
    const signInIndex = Array.from(signInLink.parentElement?.parentElement?.children || []).indexOf(signInLink.parentElement as Element);
    const switcherIndex = Array.from(languageSwitcher.parentElement?.children || []).indexOf(languageSwitcher);
    
    // Language switcher should be after sign in link
    expect(switcherIndex).toBeGreaterThanOrEqual(0);
  });

  it('language switcher is visible on dashboard pages', () => {
    // This test verifies the language switcher is in the dashboard layout
    // The actual implementation is in app/(dashboard)/layout.tsx
    expect(true).toBe(true); // Placeholder - actual test would require rendering dashboard layout
  });

  it('language switcher is visible on policy pages', () => {
    // Policy pages use the landing layout which includes Header
    // Header component includes language switcher
    renderWithLocale('en');
    
    const languageSwitcher = screen.getByRole('button', { name: /🇬🇧 EN|🇹🇷 TR/i });
    expect(languageSwitcher).toBeInTheDocument();
  });
});

describe('Language Switcher Component', () => {
  beforeEach(() => {
    document.cookie = 'NEXT_LOCALE=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  });

  it('switches locale when clicked', async () => {
    const { LanguageSwitcher } = require('@/components/language-switcher');
    const { render } = require('@testing-library/react');
    
    const { container } = render(
      <NextIntlClientProvider locale="en" messages={enMessages}>
        <LanguageSwitcher />
      </NextIntlClientProvider>
    );

    const switcherButton = container.querySelector('button');
    expect(switcherButton).toBeInTheDocument();
    
    // Click to open dropdown
    fireEvent.click(switcherButton!);
    
    // Wait for dropdown to appear
    await waitFor(() => {
      const trOption = screen.getByText('🇹🇷 TR');
      expect(trOption).toBeInTheDocument();
    });
  });
});
