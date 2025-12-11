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
import Image from "next/image";
import { LanguageSwitcher } from "@/components/language-switcher";
import { PolicyLinks } from "@/components/policy-links";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const apiUsedGenerations = await getApiUsedGenerations();
  const apiAvailableGenerations = await getApiAvailableGenerations();

  return (
    <div className="h-auto relative min-h-screen bg-white">

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
            <div className="hidden sm:block">
              <LanguageSwitcher />
            </div>
            <div className="dashboard-clerk-avatar rounded-full bg-indigo-500/10 border border-indigo-500/20 backdrop-filter backdrop-blur-sm hover:bg-indigo-500/10 hover:border-indigo-500/20 hover:shadow-none active:bg-indigo-500/10 focus:outline-none focus:ring-0">
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

      <footer className="py-6 border-t border-gray-200 bg-white">
        <div className="container">
          <div className="px-4 flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <p
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
            GUΑRΑΝТЕЕD GRЕΑТ SЕRVIСЕ LТD (№15982295) <br /> Email: support@nerbixa.com{" "}
              <br />
              Dept 6162 43 Owston Road, Carcroft, Doncaster, United Kingdom, DN6 8DA, <br />
              Copyright © {new Date().getFullYear()}. All rights reserved.
            </p>
            <div className="flex space-x-4">
              <PolicyLinks />
            </div>
          </div>
          <div className="flex justify-center mt-6">
            <Image src="/cards.svg" alt="cards" width={300} height={100} />
          </div>
        </div>
      </footer>
    </div>
  );
}
