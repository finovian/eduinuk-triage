import Link from "next/link";
import { GraduationCap } from "lucide-react";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="border-t border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50"
      role="contentinfo"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
       
        <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
          <GraduationCap className="size-4 text-emerald-500 shrink-0" />
          <span className="text-xs font-semibold">eduInUK Triage</span>
        </div>

   
        <p className="text-xs text-zinc-400 dark:text-zinc-500 text-center order-last sm:order-none">
          &copy; {year} eduInUK Triage System. Built for developer assessment.
        </p>

        <nav
          aria-label="Footer navigation"
          className="flex items-center gap-4 text-xs font-medium text-zinc-400 dark:text-zinc-500"
        >
          <Link
            href="/"
            className="hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
          >
            Home
          </Link>
          <Link
            href="/submit"
            className="hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
          >
            Submit Inquiry
          </Link>
          <Link
            href="/dashboard"
            className="hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
          >
            Staff Dashboard
          </Link>
        </nav>
      </div>
    </footer>
  );
}
