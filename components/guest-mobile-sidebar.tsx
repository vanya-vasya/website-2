"use client";

import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/language-switcher";

export const GuestMobileSidebar = () => {
  const t = useTranslations();

  const routes = [
    {
      label: t("nav.home"),
      href: "#home",
    },
    {
      label: t("nav.features"),
      href: "#features",
    },
    {
      label: t("nav.faq"),
      href: "#faq",
    },
    {
      label: t("nav.solutions"),
      href: "#solutions",
    },
    {
      label: t("nav.testimonials"),
      href: "#testimonials",
    },
  ];

  return (
    <Sheet>
    <SheetTrigger asChild>
      <Button variant="sidebar" size="icon" className="lg:hidden text-white">
        <Menu stroke="currentColor" />
      </Button>
    </SheetTrigger>
      <SheetContent side="left" className="p-0 border-r-0">
        <div className="space-y-4 py-6 px-6 flex flex-col h-full bg-[#0f172a] sm:ring-1 sm:ring-[#3c3c77] text-white border-none">
          <div className="px-3 py-2 flex-1">
            <Link href="/dashboard" className="flex items-center pl-3 mb-14">
              <Image width={"150"} height={"60"} className="mr-4" alt="Nerbixa Logo" src="/logos/nerbixa-logo.png" />
            </Link>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-gray-500/10">
                <div className="space-y-2 py-6">
                  {routes.map((route) => (
                    <Link
                      key={route.href}
                      href={route.href}
                      className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-[#a1aac9] hover:text-white"
                    >
                      <div className="flex items-center flex-1">
                        {route.label}
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="py-6">
                <SignedIn>
                <Link 
                  href="/dashboard"
                  className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-[#a1aac9] hover:text-white"
                >
                  {t("common.dashboard")}
                </Link>
                </SignedIn>
                <SignedOut>
                <Link 
                  href="/dashboard"
                  className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-[#a1aac9] hover:text-white"
                >
                  {t("common.signInSignUp")}
                </Link>
                </SignedOut>
                <div className="mt-4 -mx-3 px-3">
                  <LanguageSwitcher variant="minimal" />
                </div>
              </div>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
