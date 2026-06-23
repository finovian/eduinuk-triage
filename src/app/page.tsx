import React from "react";
import Link from "next/link";
import { ArrowRight, ShieldAlert, Sparkles, CheckCircle2 } from "lucide-react";

export default function Home() {
  return (

    <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
    
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-emerald-500/5 via-transparent to-transparent"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,var(--tw-gradient-stops))] from-indigo-500/5 via-transparent to-transparent"
        aria-hidden="true"
      />

      
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-12">

      
        <div className="text-center space-y-4">
         

          <h1 className="text-4xl sm:text-5xl font-black tracking-tight bg-linear-to-r from-emerald-600 via-teal-600 to-indigo-600 bg-clip-text text-transparent">
            eduInUK Triage
          </h1>

          <p className="text-base sm:text-lg text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto leading-relaxed">
            A next-generation AI-assisted student support classification system
            with safety gates and automated resource signposting.
          </p>
        </div>

        {/* ── Portal gateways ── */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 w-full"
          role="list"
          aria-label="Application portals"
        >
          {/* Student portal */}
          <Link
            href="/submit"
            role="listitem"
            className="group block h-full border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500/50 hover:shadow-lg dark:hover:border-emerald-500/30 rounded-2xl p-6 sm:p-8 bg-white dark:bg-zinc-900/80 transition-all duration-300 flex flex-col justify-between space-y-6 relative overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
          >
            <div
              className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full pointer-events-none transition-transform duration-300 group-hover:scale-125"
              aria-hidden="true"
            />
            <div className="space-y-4">
              <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl w-fit">
                <Sparkles className="size-6" aria-hidden="true" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold group-hover:text-emerald-600 transition-colors">
                  Submit Inquiry
                  <span className="ml-2 text-xs font-semibold text-zinc-400 dark:text-zinc-500 normal-case tracking-normal">
                    Student Portal
                  </span>
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Access the student inquiry form. Receive immediate AI-generated
                  signposts, resource matches, and safe status replies.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm font-bold text-emerald-600 group-hover:translate-x-1.5 transition-transform duration-200">
              Open Student Portal <ArrowRight className="size-4" aria-hidden="true" />
            </div>
          </Link>

          {/* Staff dashboard */}
          <Link
            href="/dashboard"
            role="listitem"
            className="group block h-full border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500/50 hover:shadow-lg dark:hover:border-indigo-500/30 rounded-2xl p-6 sm:p-8 bg-white dark:bg-zinc-900/80 transition-all duration-300 flex flex-col justify-between space-y-6 relative overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          >
            <div
              className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-bl-full pointer-events-none transition-transform duration-300 group-hover:scale-125"
              aria-hidden="true"
            />
            <div className="space-y-4">
              <div className="p-3 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl w-fit">
                <ShieldAlert className="size-6" aria-hidden="true" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold group-hover:text-indigo-600 transition-colors">
                  Advisor Worklist
                  <span className="ml-2 text-xs font-semibold text-zinc-400 dark:text-zinc-500 normal-case tracking-normal">
                    Staff Dashboard
                  </span>
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Monitor case queues, review AI reasoning and safety overrides,
                  record internal notes, and manage case lifecycle statuses.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm font-bold text-indigo-600 group-hover:translate-x-1.5 transition-transform duration-200">
              Open Staff Dashboard <ArrowRight className="size-4" aria-hidden="true" />
            </div>
          </Link>
        </div>

        {/* ── Feature highlights ── */}
        <div
          className="w-full border-t border-zinc-200 dark:border-zinc-800 pt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-zinc-500 dark:text-zinc-400"
          aria-label="Key features"
        >
          {[
            {
              title: "Automated Triage Pipeline",
              body: "AI analyses category, urgency level, and safeguarding risks per inquiry.",
            },
            {
              title: "Pre- & Post-Check Rules",
              body: "Hardcoded keyword blocks and output overrides enforce safeguarding compliance.",
            },
            {
              title: "Detailed Audit Trails",
              body: "Full LLM responses, rule triggers, and override records persisted to PostgreSQL.",
            },
          ].map(({ title, body }) => (
            <div key={title} className="flex gap-2.5 items-start">
              <CheckCircle2
                className="size-4.5 text-emerald-500 shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <div>
                <p className="font-bold text-zinc-700 dark:text-zinc-300">{title}</p>
                <p className="mt-0.5 leading-relaxed">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
