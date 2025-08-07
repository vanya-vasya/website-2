"use client";
import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { GuestMobileSidebar } from "@/components/guest-mobile-sidebar";
import Image from "next/image";

const routes = [
  {
    name: "Home",
    href: "/#home",
  },
  {
    name: "Features",
    href: "/#features",
  },
  {
    name: "FAQ",
    href: "/#faq",
  },
  {
    name: "Solutions",
    href: "/#solutions",
  },
  {
    name: "Testimonials",
    href: "/#testimonials",
  },
];

const Header = () => {
  return (
    <header className="bg-slate-900">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8 gap-1">
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5">
            <Image width={"150"} height={"60"} src="/logo.png" alt=""/>
          </Link>
        </div>
        <div className="hidden lg:flex lg:gap-x-12">
          {routes.map((route) => (
            <Link
              key={route.name}
              href={route.href}
              className="text-sm font-semibold leading-6 text-[#a1aac9] hover:text-white ease-in-out duration-500"
            >
              {route.name}
            </Link>
          ))}
        </div>
        <div className="flex lg:flex-1 lg:justify-end">
          <div className="flex ">
            <ul className="main-header__login-sing-up">
              <li>
                <SignedIn>
                  <Link
                    href="/dashboard"
                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-[#a1aac9] hover:text-white"
                  >
                    Dashboard
                  </Link>
                </SignedIn>
                <SignedOut>
                  <Link
                    href="/dashboard"
                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-[#a1aac9] hover:text-white"
                  >
                    Sign In / Sign Up
                  </Link>
                </SignedOut>
              </li>
            </ul>
          </div>
          <GuestMobileSidebar />
        </div>
      </nav>
    </header>
  );
};

export default Header;
