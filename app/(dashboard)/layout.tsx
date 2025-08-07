import { MainNav } from "@/components/main-nav";
import { MobileNav } from "@/components/mobile-nav";
import { UserButton } from "@clerk/nextjs";
import {
  getApiUsedGenerations,
  getApiAvailableGenerations,
} from "@/lib/api-limit";
import { UsageProgress } from "@/components/usage-progress";
import { AnimatedLayout, AnimatedPage } from "@/components/animated-layout";
import Link from "next/link";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const apiUsedGenerations = await getApiUsedGenerations();
  const apiAvailableGenerations = await getApiAvailableGenerations();

  return (
    <div className="h-auto relative dark min-h-screen bg-gradient-to-b from-black via-gray-950 to-gray-900">
      <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid-pattern.svg')] opacity-5 pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/10 via-purple-800/5 to-transparent pointer-events-none"></div>

      <AnimatedLayout>
        <div className="container flex h-20 items-center px-4 xl:px-0">
          <MobileNav
            initialUsedGenerations={apiUsedGenerations}
            initialAvailableGenerations={apiAvailableGenerations}
          />
          <div className="hidden xl:block flex-1">
            <MainNav
              initialUsedGenerations={apiUsedGenerations}
              initialAvailableGenerations={apiAvailableGenerations}
            />
          </div>
          <div className="ml-auto flex items-center space-x-4">
            <div className="hidden md:block w-[220px]">
              <UsageProgress
                initialUsedGenerations={apiUsedGenerations}
                initialAvailableGenerations={apiAvailableGenerations}
              />
            </div>
            <div className="rounded-full bg-indigo-500/10 border border-indigo-500/20 backdrop-filter backdrop-blur-sm">
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </AnimatedLayout>

      <main className="flex-1 py-12 lg:pt-16 relative z-10">
        <div className="container py-8 md:py-10">
          <AnimatedPage>{children}</AnimatedPage>
        </div>
      </main>

      <footer className="py-6 border-t border-indigo-900/20">
        <div className="container">
          <div className="px-4 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 space-y-2 md:space-y-0">
            <p>
              GROWTHPIXEL LTD (№16385052) <br /> Email: support@neuvisia.com{" "}
              <br />
              128 City Road, London, United Kingdom, EC1V 2NX, <br />
              Copyright © {new Date().getFullYear()}. All rights reserved.
            </p>
            <div className="flex space-x-4">
              <Link href="/privacy-policy" className="hover:text-gray-300">
                Privacy Policy
              </Link>
              <Link
                href="/terms-and-conditions"
                className="hover:text-gray-300"
              >
                Terms and Conditions
              </Link>
              <Link href="/return-policy" className="hover:text-gray-300">
                Return Policy
              </Link>
              <Link href="/cookies-policy" className="hover:text-gray-300">
                Cookies Policy
              </Link>
            </div>
          </div>
          <div className="flex justify-center mt-6">
            <img src="/cards.svg" alt="cards" width={300} height={100} />
          </div>
        </div>
      </footer>
    </div>
  );
}
