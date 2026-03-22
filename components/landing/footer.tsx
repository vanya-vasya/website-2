"use client";

import { Building, FileText, Mail, MapPin, Instagram, Phone, ChevronDown, Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState, useRef, useEffect, useCallback } from "react";
import { useCurrency, currencyOptions, type FooterCurrency } from "@/hooks/use-currency";

const Footer = () => {
  const t = useTranslations();
  const date = new Date();
  const year = date.getFullYear();
  
  const { currency, setCurrency, currentOption, isLoaded } = useCurrency();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const routes = [
    {
      name: t("nav.home"),
      href: "/#home",
    },
    {
      name: t("nav.faq"),
      href: "/faq",
    },
    {
      name: t("nav.solutions"),
      href: "/#solutions",
    },
    {
      name: t("nav.products"),
      href: "/#features",
    },
    {
      name: t("nav.whyUs"),
      href: "/#testimonials",
    },
  ];

  const importantLinks = [
    {
      name: t("footer.privacyPolicy"),
      href: "/privacy-policy",
    },
    {
      name: t("footer.termsAndConditions"),
      href: "/terms-and-conditions",
    },
    {
      name: t("footer.returnPolicy"),
      href: "/return-policy",
    },
    {
      name: t("footer.cookiesPolicy"),
      href: "/cookies-policy",
    },
  ];

  // Company information - always in English, not translated
  const companyDetails = [
    {
      name: "Company: GUΑRΑΝТЕЕD GRЕΑТ SЕRVIСЕ LТD",
      icon: Building,
    },
    {
      name: "Company Number: 15982295",
      icon: FileText,
    },
    {
      name: "Phone Number: +44 7537167307",
      icon: Phone,
    },
    {
      name: "support@nerbixa.com",
      icon: Mail,
    },
    {
      name: "Dept 6162 43 Owston Road, Carcroft, Doncaster, United Kingdom, DN6 8DA",
      icon: MapPin,
    },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        setFocusedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!isDropdownOpen) {
      if (event.key === "Enter" || event.key === " " || event.key === "ArrowDown") {
        event.preventDefault();
        setIsDropdownOpen(true);
        setFocusedIndex(0);
      }
      return;
    }

    switch (event.key) {
      case "Escape":
        event.preventDefault();
        setIsDropdownOpen(false);
        setFocusedIndex(-1);
        buttonRef.current?.focus();
        break;
      case "ArrowDown":
        event.preventDefault();
        setFocusedIndex((prev) => (prev + 1) % currencyOptions.length);
        break;
      case "ArrowUp":
        event.preventDefault();
        setFocusedIndex((prev) => (prev - 1 + currencyOptions.length) % currencyOptions.length);
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < currencyOptions.length) {
          handleSelectCurrency(currencyOptions[focusedIndex].code);
        }
        break;
      case "Tab":
        setIsDropdownOpen(false);
        setFocusedIndex(-1);
        break;
      case "Home":
        event.preventDefault();
        setFocusedIndex(0);
        break;
      case "End":
        event.preventDefault();
        setFocusedIndex(currencyOptions.length - 1);
        break;
    }
  }, [isDropdownOpen, focusedIndex]);

  // Focus the option when focusedIndex changes
  useEffect(() => {
    if (focusedIndex >= 0 && optionRefs.current[focusedIndex]) {
      optionRefs.current[focusedIndex]?.focus();
    }
  }, [focusedIndex]);

  const handleToggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
    if (!isDropdownOpen) {
      const currentIndex = currencyOptions.findIndex((opt) => opt.code === currency);
      setFocusedIndex(currentIndex >= 0 ? currentIndex : 0);
    }
  };

  const handleSelectCurrency = (code: FooterCurrency) => {
    setCurrency(code);
    setIsDropdownOpen(false);
    setFocusedIndex(-1);
    buttonRef.current?.focus();
  };

  return (
    <footer className="main-footer w-full bg-white">
      <div className="main-footer__top max-w-[1350px] mx-auto">
        <div className="px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <div className="pr-4 pl-4">
              <div className="footer-widget__column footer-widget__about">
                <div className="footer-widget__logo">
                  <Image width={"98"} height={"39"} src="/logos/nerbixa-logo.png" alt="Nerbixa Logo" />
                </div>
                <p 
                  className="footer-widget__about-text"
                  style={{
                    fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                    fontWeight: 600,
                    lineHeight: 1.2,
                    letterSpacing: '0.01em',
                    textTransform: 'none',
                    color: '#0f172a'
                  }}
                >
                  {t("footer.description")}
                </p>
              </div>
            </div>

            <div className="pr-4 pl-4 pt-6 md:pt-0">
              <div className="footer-widget__column footer-widget__company">
                <div className="footer-widget__title-box">
                  <h3 
                    className="footer-widget__title"
                    style={{
                      fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                      lineHeight: 1.2,
                      letterSpacing: '0.01em',
                      textTransform: 'none',
                      color: '#0f172a'
                    }}
                  >{t("footer.menu")}</h3>
                </div>
                <div className="footer-widget__resources-list-box">
                  <ul className="footer-widget__resources-list">
                    {routes.map((route) => (
                      <li key={route.name}>
                        <Link 
                          href={route.href}
                          style={{
                            fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                            fontWeight: 600,
                            lineHeight: 1.2,
                            letterSpacing: '0.01em',
                            textTransform: 'none',
                            color: '#0f172a'
                          }}
                        >{route.name}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            <div className="pr-4 pl-4 pt-6 xl:pt-0">
              <div className="footer-widget__column footer-widget__resources">
                <div className="footer-widget__title-box">
                  <h3 
                    className="footer-widget__title"
                    style={{
                      fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                      lineHeight: 1.2,
                      letterSpacing: '0.01em',
                      textTransform: 'none',
                      color: '#0f172a'
                    }}
                  >{t("footer.links")}</h3>
                </div>
                <div className="footer-widget__resources-list-box">
                  <ul className="footer-widget__resources-list">
                    {importantLinks.map((link) => (
                      <li key={link.name}>
                        <Link 
                          href={link.href}
                          style={{
                            fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                            fontWeight: 600,
                            lineHeight: 1.2,
                            letterSpacing: '0.01em',
                            textTransform: 'none',
                            color: '#0f172a'
                          }}
                        >{link.name}</Link>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6">
                    <a
                      href="https://www.instagram.com/nerbixa.ai?igsh=aGx1aDBjZnFoMjU0"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Instagram"
                      title="Instagram"
                      className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white hover:opacity-90 transition-opacity duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                      tabIndex={0}
                    >
                      <Instagram className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div className="pr-4 pl-4 pt-6 xl:pt-0">
              <div className="footer-widget__column footer-widget__resources">
                <div className="footer-widget__title-box">
                  <h3 
                    className="footer-widget__title"
                    style={{
                      fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                      lineHeight: 1.2,
                      letterSpacing: '0.01em',
                      textTransform: 'none',
                      color: '#0f172a'
                    }}
                  >{t("footer.company")}</h3>
                </div>
                <div className="footer-widget__company-list-box">
                  <ul className="space-y-4">
                    {companyDetails.map((detail) => (
                      <li 
                        key={detail.name} 
                        className="flex text-sm"
                        style={{
                          fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                          fontWeight: 600,
                          lineHeight: 1.2,
                          letterSpacing: '0.01em',
                          textTransform: 'none',
                          color: '#0f172a'
                        }}
                      >
                        <detail.icon className="h-5 w-5 mr-3 min-w-fit" />
                        {detail.name}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="main-footer__bottom max-w-[1350px] mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center px-4 mx-4 gap-4">
          <div>
            <p 
              className="text-center sm:text-left"
              style={{
                fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                fontWeight: 600,
                lineHeight: 1.2,
                letterSpacing: '0.01em',
                textTransform: 'none',
                color: '#0f172a'
              }}
            >
              {t("footer.copyright", { year })}
            </p>
          </div>
          
          {/* Currency Selector Dropdown */}
          <div 
            ref={dropdownRef} 
            className="relative"
            onKeyDown={handleKeyDown}
          >
            <button
              ref={buttonRef}
              type="button"
              onClick={handleToggleDropdown}
              aria-haspopup="listbox"
              aria-expanded={isDropdownOpen}
              aria-label={`Select currency. Current: ${currentOption.name}`}
              className="flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 min-w-[140px]"
              style={{
                fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                color: '#0f172a'
              }}
              tabIndex={0}
            >
              <span className="text-lg" role="img" aria-label={currentOption.country}>
                {isLoaded ? currentOption.flag : "🌐"}
              </span>
              <span className="flex-1 text-left">
                {isLoaded ? `${currentOption.code} (${currentOption.symbol})` : "..."}
              </span>
              <ChevronDown 
                className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} 
                aria-hidden="true"
              />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div
                role="listbox"
                aria-label="Select currency"
                aria-activedescendant={focusedIndex >= 0 ? `currency-option-${currencyOptions[focusedIndex].code}` : undefined}
                className="absolute bottom-full mb-2 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50 min-w-[180px]"
              >
                {currencyOptions.map((option, index) => {
                  const isSelected = currency === option.code;
                  const isFocused = focusedIndex === index;
                  
                  return (
                    <button
                      key={option.code}
                      ref={(el) => { optionRefs.current[index] = el; }}
                      id={`currency-option-${option.code}`}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSelectCurrency(option.code)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors duration-150 text-left ${
                        isFocused ? "bg-blue-50" : ""
                      } ${isSelected ? "bg-blue-100" : "hover:bg-gray-50"}`}
                      style={{
                        fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                        color: '#0f172a'
                      }}
                      tabIndex={-1}
                    >
                      <span className="text-xl" role="img" aria-label={option.country}>
                        {option.flag}
                      </span>
                      <span className="flex-1">
                        {option.code} - {option.name}
                      </span>
                      {isSelected && (
                        <Check className="w-4 h-4 text-blue-600" aria-hidden="true" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        <div className="mt-6 flex justify-center">
          <Image
            src="/cards.svg"
            alt="cards"
            width={300}
            height={100}
            className=""
          />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
