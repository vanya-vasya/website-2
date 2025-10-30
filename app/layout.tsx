import "./globals.css";
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter, Space_Grotesk } from "next/font/google";
import { cn } from "@/lib/utils";

import { ModalProvider } from "@/components/modal-provider";
import { ToasterProvider } from "@/components/toaster-provider";

import NextTopLoader from "nextjs-toploader";

import { GoogleAnalytics } from "@next/third-parties/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
});

export const metadata: Metadata = {
  title: "Nerbixa",
  description: "AI-powered creative tools for everyone",
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/logos/nerbixa-icon.png",
      },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Nerbixa",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://nerbixa.com",
    siteName: "Nerbixa",
    title: "Nerbixa - AI-powered creative tools",
    description: "AI-powered creative tools for everyone",
    images: [
      {
        url: "/logos/nerbixa-icon.png",
        width: 512,
        height: 512,
        alt: "Nerbixa",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Nerbixa - AI-powered creative tools",
    description: "AI-powered creative tools for everyone",
    images: ["/logos/nerbixa-icon.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignInUrl="/dashboard"
      afterSignUpUrl="/dashboard"
    >
      <html lang="en" suppressHydrationWarning>
        <body
          className={cn(
            "min-h-screen bg-background font-sans antialiased",
            inter.variable,
            spaceGrotesk.variable
          )}
        >
          <GoogleAnalytics gaId="G-DYY23NK5V1" />
          <ModalProvider />
          <ToasterProvider />
          <NextTopLoader color="#3c3c77" showSpinner={false} />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
