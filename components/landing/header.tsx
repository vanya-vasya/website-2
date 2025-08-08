"use client";
import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { GuestMobileSidebar } from "@/components/guest-mobile-sidebar";
import Image from "next/image";
<<<<<<< HEAD
import { motion } from "framer-motion";

const routes = [
  {
=======

const routes = [
  {
    name: "Home",
    href: "/#home",
  },
  {
>>>>>>> a45294d20afb85227c67fa96878e37eab6509ebb
    name: "Features",
    href: "/#features",
  },
  {
<<<<<<< HEAD
    name: "How It Works",
    href: "/#how-it-works",
  },
  {
    name: "Pricing",
    href: "/#pricing",
  },
  {
    name: "Success Stories",
=======
    name: "FAQ",
    href: "/#faq",
  },
  {
    name: "Solutions",
    href: "/#solutions",
  },
  {
    name: "Testimonials",
>>>>>>> a45294d20afb85227c67fa96878e37eab6509ebb
    href: "/#testimonials",
  },
];

const Header = () => {
  return (
<<<<<<< HEAD
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/5 backdrop-blur-md border-b border-white/10"
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8">
        <motion.div 
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex lg:flex-1"
        >
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <span className="text-white font-bold text-lg">N</span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Neuvisia
            </span>
          </Link>
        </motion.div>

        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="hidden lg:flex lg:gap-x-8"
        >
          {routes.map((route, index) => (
            <Link
              key={route.name}
              href={route.href}
              className="relative text-sm font-medium text-slate-300 hover:text-white transition-colors duration-300 group"
            >
              {route.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 group-hover:w-full transition-all duration-300"></span>
            </Link>
          ))}
        </motion.div>

        <motion.div 
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex lg:flex-1 lg:justify-end items-center space-x-4"
        >
          <SignedIn>
            <Link
              href="/dashboard"
              className="hidden sm:block px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25"
            >
              Dashboard
            </Link>
          </SignedIn>
          <SignedOut>
            <div className="hidden sm:flex items-center space-x-3">
              <Link
                href="/sign-in"
                className="px-6 py-2.5 text-slate-300 font-medium hover:text-white transition-colors duration-300"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25"
              >
                Get Started
              </Link>
            </div>
          </SignedOut>
          
          <GuestMobileSidebar />
        </motion.div>
      </nav>
    </motion.header>
=======
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
>>>>>>> a45294d20afb85227c67fa96878e37eab6509ebb
  );
};

export default Header;
