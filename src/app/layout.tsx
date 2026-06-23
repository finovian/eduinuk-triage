import type { Metadata } from "next";
import { Ubuntu, Ubuntu_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

/* Fonts  */
const ubuntuSans = Ubuntu({
  variable: "--font-ubuntu-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

const ubuntuMono = Ubuntu_Mono({
  variable: "--font-ubuntu-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});


export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  ),
  title: {

    default: "eduInUK Triage — AI Student Support System",
    template: "%s | eduInUK Triage",
  },
  description:
    "An AI-powered student support triage platform with automated inquiry classification, safeguarding rule enforcement, and an integrated staff case management workflow.",
  keywords: [
    "student support",
    "triage",
    "AI classification",
    "safeguarding",
    "education UK",
    "case management",
  ],
  openGraph: {
    type: "website",
    siteName: "eduInUK Triage",
    title: "eduInUK Triage — AI Student Support System",
    description:
      "AI-powered student support triage with automated classification, safety gates, and staff case management.",
  },
  robots: {
    index: false,
    follow: false,
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${ubuntuSans.variable} ${ubuntuMono.variable} antialiased`}
    >
      <body className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 transition-colors duration-300">

        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-emerald-600 focus:text-white focus:rounded-lg focus:font-semibold focus:text-sm focus:shadow-lg"
        >
          Skip to main content
        </a>

        <SiteHeader />

        <main id="main-content" className="flex-1 flex flex-col">
          {children}
        </main>


        <SiteFooter />
      </body>
    </html>
  );
}
