"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GraduationCap,
  ArrowLeft,
  LayoutDashboard,
  Send,
  ChevronRight,
} from "lucide-react";

export function SiteHeader() {
  const pathname = usePathname();

  const isHome = pathname === "/";
  const isSubmit = pathname === "/submit";
  const isDashboard = pathname === "/dashboard";
  const isDashboardDetail =
    pathname.startsWith("/dashboard/") && pathname !== "/dashboard";

  return (
    <header
      className="sticky top-0 z-40 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/85 dark:bg-zinc-950/85 backdrop-blur-md"
      role="banner"
    >
      <div className="max-w-7xl mx-auto h-14 px-4 sm:px-6 lg:px-8 flex items-center gap-4">
      
        <Link
          href="/"
          className="flex items-center gap-2 group rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 shrink-0"
          aria-label="eduInUK Triage — Return to home"
        >
          <GraduationCap className="size-6 text-emerald-600 dark:text-emerald-500 group-hover:scale-110 transition-transform duration-200" />
          <span className="font-bold tracking-tight text-zinc-900 dark:text-zinc-50 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-200">
            eduInUK Triage
          </span>
        </Link>

    
        {isDashboardDetail && (
          <nav
            aria-label="Breadcrumb"
            className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-500"
          >
            <Link
              href="/"
              className="hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
            >
              Home
            </Link>
            <ChevronRight className="size-3 shrink-0" />
            <Link
              href="/dashboard"
              className="hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
            >
              Dashboard
            </Link>
            <ChevronRight className="size-3 shrink-0" />
            <span className="text-zinc-600 dark:text-zinc-300 font-medium">
              Case Detail
            </span>
          </nav>
        )}

       
        <nav
          aria-label="Primary navigation"
          className="flex items-center gap-2 sm:gap-3 ml-auto"
        >
          {/* Home page: show portals */}
          {isHome && (
            <>
              <Link
                href="/submit"
                className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors"
              >
                <Send className="size-3.5" />
                Submit Inquiry
              </Link>
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 text-xs sm:text-sm font-bold px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white transition-colors shadow-sm"
              >
                <LayoutDashboard className="size-3.5 shrink-0" />
                <span className="hidden sm:inline">Staff Dashboard</span>
                <span className="sm:hidden">Dashboard</span>
              </Link>
            </>
          )}

          {/* Submit / Dashboard: back to home */}
          {(isSubmit || isDashboard) && (
            <Link
              href="/"
              className="flex items-center gap-1.5 text-sm font-semibold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors"
            >
              <ArrowLeft className="size-4 shrink-0" />
              <span className="hidden sm:inline">Back to Home</span>
              <span className="sm:hidden">Home</span>
            </Link>
          )}

          {/* Case detail: back to dashboard */}
          {isDashboardDetail && (
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 text-sm font-semibold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors"
            >
              <ArrowLeft className="size-4 shrink-0" />
              <span className="hidden sm:inline">Back to Dashboard</span>
              <span className="sm:hidden">Queue</span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
