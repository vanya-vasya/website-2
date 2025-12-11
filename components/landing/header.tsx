"use client";
import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { GuestMobileSidebar } from "@/components/guest-mobile-sidebar";
import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/language-switcher";

const Header = () => {
  const t = useTranslations();

  const routes = [
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

  return (
    <header className="bg-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-3 lg:px-6 gap-1">
        <div className="flex">
          <Link href="/" className="-m-1.5 p-1.5">
            <Image width={"98"} height={"39"} src="/logos/nerbixa-logo.png" alt="Nerbixa Logo"/>
          </Link>
        </div>
        <div className="flex gap-x-12 ml-12">
          <div className="nav-container">
            {routes.map((route) => (
              <Link
                key={route.name}
                href={route.href}
                className="nav-link"
              >
                {route.name}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex lg:flex-1 lg:justify-end items-center gap-4">
          <div className="flex">
            <ul className="main-header__login-sing-up">
              <li>
                <SignedIn>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      href="/dashboard"
                      className="nav-link"
                    >
                      {t("common.dashboard")}
                    </Link>
                  </motion.div>
                </SignedIn>
                <SignedOut>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      href="/dashboard"
                      className="nav-link"
                    >
                      {t("common.signInSignUp")}
                    </Link>
                  </motion.div>
                </SignedOut>
              </li>
            </ul>
          </div>
          <LanguageSwitcher className="hidden sm:block" />
          <GuestMobileSidebar />
        </div>
      </nav>

      <style jsx global>{`
        :root {
          --nav-font: Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          --contact-font: Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }

        .nav-container {
          display: flex;
          background-color: #f8fafc;
          border-radius: 9999px;
          padding: 4px;
          gap: 4px;
        }

        .nav-link {
          font-family: var(--contact-font);
          font-weight: 600;
          font-size: 16px;
          line-height: 1.1;
          letter-spacing: 0.01em;
          text-transform: none;
          color: #0f172a;
          padding: 8px 16px;
          border-radius: 9999px;
          transition: all 500ms ease-in-out;
        }

        .main-header__login-sing-up .nav-link {
          font-family: var(--contact-font) !important;
          font-weight: 600 !important;
          font-size: 16px !important;
          line-height: 1.1 !important;
          letter-spacing: 0.01em !important;
          text-transform: none !important;
          color: #0f172a !important;
          padding: 8px 16px !important;
          border-radius: 9999px !important;
          border: none !important;
        }

        .nav-link:hover {
          background: linear-gradient(to right, #22d3ee, #3b82f6, #4f46e5);
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
          text-decoration: none;
        }
      `}</style>
    </header>
  );
};

export default Header;
