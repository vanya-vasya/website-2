"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export const PolicyLinks = () => {
  const t = useTranslations();

  return (
    <>
      <Link 
        href="/privacy-policy" 
        className="hover:text-indigo-600"
        style={{
          fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          fontWeight: 600,
          fontSize: '14px',
          lineHeight: 1.2,
          letterSpacing: '0.01em',
          textTransform: 'none',
          color: '#0f172a'
        }}
      >
        {t("footer.privacyPolicy")}
      </Link>
      <Link
        href="/terms-and-conditions"
        className="hover:text-indigo-600"
        style={{
          fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          fontWeight: 600,
          fontSize: '14px',
          lineHeight: 1.2,
          letterSpacing: '0.01em',
          textTransform: 'none',
          color: '#0f172a'
        }}
      >
        {t("footer.termsAndConditions")}
      </Link>
      <Link 
        href="/return-policy" 
        className="hover:text-indigo-600"
        style={{
          fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          fontWeight: 600,
          fontSize: '14px',
          lineHeight: 1.2,
          letterSpacing: '0.01em',
          textTransform: 'none',
          color: '#0f172a'
        }}
      >
        {t("footer.returnPolicy")}
      </Link>
      <Link 
        href="/cookies-policy" 
        className="hover:text-indigo-600"
        style={{
          fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          fontWeight: 600,
          fontSize: '14px',
          lineHeight: 1.2,
          letterSpacing: '0.01em',
          textTransform: 'none',
          color: '#0f172a'
        }}
      >
        {t("footer.cookiesPolicy")}
      </Link>
    </>
  );
};
