"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { locales, localeNames, Locale } from "@/lib/i18n";

interface LanguageSwitcherProps {
  className?: string;
  variant?: "default" | "minimal";
}

export const LanguageSwitcher = ({ 
  className = "", 
  variant = "default" 
}: LanguageSwitcherProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [currentLocale, setCurrentLocale] = useState<Locale>("en");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Get current locale from cookie
    const localeCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("NEXT_LOCALE="))
      ?.split("=")[1] as Locale | undefined;

    if (localeCookie && locales.includes(localeCookie)) {
      setCurrentLocale(localeCookie);
    }
  }, [pathname]); // Re-check locale when pathname changes

  const handleLocaleChange = (newLocale: Locale) => {
    // Set cookie for the new locale with secure options
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
    setCurrentLocale(newLocale);
    setIsOpen(false);

    // Preserve locale across navigation by refreshing the page
    // This ensures the locale cookie is read by the server on the next request
    startTransition(() => {
      // Update the current URL to trigger a refresh while preserving the path
      router.refresh();
      
      // Also update the HTML lang attribute
      if (typeof document !== 'undefined') {
        document.documentElement.lang = newLocale === 'tr' ? 'tr' : 'en';
      }
    });
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleKeyDown = (e: React.KeyboardEvent, locale?: Locale) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (locale) {
        handleLocaleChange(locale);
      } else {
        toggleDropdown();
      }
    }
    if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  if (variant === "minimal") {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        {locales.map((locale) => (
          <button
            key={locale}
            onClick={() => handleLocaleChange(locale)}
            onKeyDown={(e) => handleKeyDown(e, locale)}
            disabled={isPending}
            tabIndex={0}
            aria-label={`Switch to ${locale === "en" ? "English" : "Turkish"}`}
            className={`
              px-2 py-1 text-sm font-medium rounded-md transition-all duration-200
              ${currentLocale === locale
                ? "bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
              }
              ${isPending ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
            `}
          >
            {localeNames[locale]}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={toggleDropdown}
        onKeyDown={(e) => handleKeyDown(e)}
        disabled={isPending}
        tabIndex={0}
        aria-label="Change language"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={`
          flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-full
          bg-slate-100 hover:bg-slate-200 text-slate-700
          transition-all duration-200 border border-slate-200
          ${isPending ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        `}
        style={{
          fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        }}
      >
        <span>{localeNames[currentLocale]}</span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop to close dropdown */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          
          {/* Dropdown menu */}
          <div
            role="listbox"
            aria-label="Select language"
            className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-slate-200 z-50 overflow-hidden"
          >
            {locales.map((locale) => (
              <button
                key={locale}
                role="option"
                aria-selected={currentLocale === locale}
                onClick={() => handleLocaleChange(locale)}
                onKeyDown={(e) => handleKeyDown(e, locale)}
                tabIndex={0}
                className={`
                  w-full px-4 py-2 text-left text-sm font-medium transition-colors duration-150
                  ${currentLocale === locale
                    ? "bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 text-white"
                    : "text-slate-700 hover:bg-slate-100"
                  }
                `}
                style={{
                  fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                }}
              >
                {localeNames[locale]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageSwitcher;
