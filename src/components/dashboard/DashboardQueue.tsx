"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { CaseStatusBadge } from "@/components/ui/status-badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  AlertTriangle,
  ShieldAlert,
  CheckCircle,
  Clock,
  RefreshCw,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useCases, useDashboardStats } from "@/lib/query";
import type { CaseStatus, Urgency, Category } from "@/types/triage";

/** Human-readable labels for each status filter tab */
const STATUS_LABELS: Record<CaseStatus | "ALL", string> = {
  ALL: "All Cases",
  new: "New",
  in_progress: "In Progress",
  resolved: "Resolved",
};

export function DashboardQueue() {
  //  Filters 
  const [status, setStatus] = useState<CaseStatus | "ALL">("ALL");
  const [urgency, setUrgency] = useState<Urgency | "ALL">("ALL");
  const [category, setCategory] = useState<Category | "ALL">("ALL");
  const [safeguarding, setSafeguarding] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState("");

  //  TanStack Query 
  const casesFilters = {
    ...(status !== "ALL" ? { status } : {}),
    ...(urgency !== "ALL" ? { urgency } : {}),
    ...(category !== "ALL" ? { category } : {}),
    ...(safeguarding ? { safeguardingOnly: true } : {}),
    page,
    pageSize,
  };

  const {
    data: casesData,
    isLoading: casesLoading,
    isFetching: casesFetching,
    refetch: refetchCases,
  } = useCases(casesFilters);

  const {
    data: stats,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useDashboardStats();

  //  Derived 
  const cases = casesData?.cases ?? [];
  const total = casesData?.total ?? 0;

  // Client-side search applied on top of already-filtered server results
  const filteredCases = cases.filter(
    (c) =>
      c.studentName.toLowerCase().includes(search.toLowerCase()) ||
      c.university.toLowerCase().includes(search.toLowerCase()) ||
      c.course.toLowerCase().includes(search.toLowerCase()) ||
      c.id.toLowerCase().includes(search.toLowerCase())
  );

  const handleRefresh = () => {
    refetchCases();
    refetchStats();
  };

  const handleStatusChange = (s: CaseStatus | "ALL") => {
    setStatus(s);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Open */}
        <Card className="relative overflow-hidden border-zinc-200 dark:border-zinc-800 shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Total Open Cases
                </p>
                <h3 className="text-3xl font-extrabold tracking-tight">
                  {statsLoading ? <Loader2 className="size-5 animate-spin text-zinc-400" /> : stats?.totalOpen ?? 0}
                </h3>
              </div>
              <div className="p-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-500">
                <Clock className="size-5" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-300 dark:bg-zinc-700" />
          </CardContent>
        </Card>

        {/* Critical Open */}
        <Card className="relative overflow-hidden border-rose-100 dark:border-rose-950/40 shadow-sm bg-rose-500/2 dark:bg-rose-950/2">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider text-rose-500 dark:text-rose-400">
                  Critical Urgency
                </p>
                <h3 className="text-3xl font-extrabold tracking-tight text-rose-600 dark:text-rose-400">
                  {statsLoading ? <Loader2 className="size-5 animate-spin text-rose-400" /> : stats?.criticalOpen ?? 0}
                </h3>
              </div>
              <div className="p-2 bg-rose-100 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-900/40 rounded-lg text-rose-500 dark:text-rose-400">
                <AlertTriangle className="size-5 text-rose-600 dark:text-rose-400" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-rose-500" />
          </CardContent>
        </Card>

        {/* Safeguarding Flagged */}
        <Card className="relative overflow-hidden border-purple-100 dark:border-purple-950/40 shadow-sm bg-purple-500/2 dark:bg-purple-950/2">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider text-purple-500 dark:text-purple-400">
                  Safeguarding Flags
                </p>
                <h3 className="text-3xl font-extrabold tracking-tight text-purple-600 dark:text-purple-400">
                  {statsLoading ? <Loader2 className="size-5 animate-spin text-purple-400" /> : stats?.safeguardingOpen ?? 0}
                </h3>
              </div>
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-900/40 rounded-lg text-purple-500 dark:text-purple-400">
                <ShieldAlert className="size-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-500" />
          </CardContent>
        </Card>

        {/* Resolved Today */}
        <Card className="relative overflow-hidden border-emerald-100 dark:border-emerald-950/40 shadow-sm bg-emerald-500/2 dark:bg-emerald-950/2">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-500 dark:text-emerald-400">
                  Resolved Today
                </p>
                <h3 className="text-3xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400">
                  {statsLoading ? <Loader2 className="size-5 animate-spin text-emerald-400" /> : stats?.resolvedToday ?? 0}
                </h3>
              </div>
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-900/40 rounded-lg text-emerald-500 dark:text-emerald-400">
                <CheckCircle className="size-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500" />
          </CardContent>
        </Card>
      </div>

      {/* Main Queue Card */}
      <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <CardHeader className="pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              Inquiry Response Queue
              {/* Background refetch indicator — subtle spinner when data is being silently refreshed */}
              {casesFetching && !casesLoading && (
                <Loader2 className="size-3.5 text-zinc-400 animate-spin" aria-label="Refreshing..." />
              )}
            </CardTitle>
            <CardDescription className="text-xs">
              Review and manage incoming student cases. Urgent issues are pinned to the top of the queue.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="size-3.5" /> Refresh Queue
            </Button>
          </div>
        </CardHeader>

        {/* Filter Controls */}
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/5 flex flex-col md:flex-row md:items-center gap-4 justify-between">
          <div className="flex flex-wrap items-center gap-3">
            {/* Status tabs */}
            <div className="flex rounded-lg border border-zinc-200 dark:border-zinc-800 p-0.5 bg-zinc-100/50 dark:bg-zinc-900/50">
              {(["ALL", "new", "in_progress", "resolved"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md cursor-pointer transition-colors ${
                    status === s
                      ? "bg-white dark:bg-zinc-800 shadow-xs text-zinc-900 dark:text-zinc-50 border border-zinc-200/50 dark:border-zinc-700/50"
                      : "text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-300"
                  }`}
                >
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>

            {/* Category Filter */}
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value as any);
                setPage(1);
              }}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            >
              <option value="ALL">All Categories</option>
              <option value="academic">Academic</option>
              <option value="financial">Financial</option>
              <option value="visa_immigration">Visa/Immigration</option>
              <option value="housing">Housing</option>
              <option value="health_wellbeing">Health/Wellbeing</option>
              <option value="other">Other</option>
            </select>

            {/* Urgency Filter */}
            <select
              value={urgency}
              onChange={(e) => {
                setUrgency(e.target.value as any);
                setPage(1);
              }}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            >
              <option value="ALL">All Urgencies</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            {/* Safeguarding Toggle */}
            <label className="flex items-center gap-1.5 text-xs font-semibold select-none cursor-pointer">
              <input
                type="checkbox"
                checked={safeguarding}
                onChange={(e) => {
                  setSafeguarding(e.target.checked);
                  setPage(1);
                }}
                className="rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
                <ShieldAlert className="size-3.5 text-purple-500" /> Safeguarding Only
              </span>
            </label>
          </div>

          {/* Local Search input */}
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 size-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by student, uni, course..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Cases List */}
        <div className="overflow-x-auto w-full">
          {casesLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="size-8 text-emerald-500 animate-spin" />
              <p className="text-xs text-zinc-400 font-medium">Loading queue items...</p>
            </div>
          ) : filteredCases.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="mx-auto w-12 h-12 rounded-full border border-dashed border-zinc-300 dark:border-zinc-700 flex items-center justify-center text-zinc-400 dark:text-zinc-500 mb-3">
                <Filter className="size-5" />
              </div>
              <h3 className="font-semibold text-zinc-700 dark:text-zinc-300 text-sm">No cases found</h3>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 max-w-xs mx-auto">
                No cases matched your selected filter criteria or search phrase. Try resetting the filters.
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/10 text-zinc-500 dark:text-zinc-400 font-semibold select-none">
                  <th className="py-3 px-4 w-[16%]">Student Name</th>
                  <th className="py-3 px-4 w-[20%]">University / Course</th>
                  <th className="py-3 px-4 w-[14%]">Category</th>
                  <th className="py-3 px-4 w-[10%]">Urgency</th>
                  <th className="py-3 px-4 w-[10%]">Disposition</th>
                  <th className="py-3 px-4 w-[10%]">Status</th>
                  <th className="py-3 px-4 w-[12%]">Submitted At</th>
                  <th className="py-3 px-4 text-right w-[8%]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-150 dark:divide-zinc-800">
                {filteredCases.map((c) => {
                  const isCritical = c.urgency === "critical";
                  const isSafeguarding = c.safeguardingFlag;
                  const isEmergency = c.emergencySupport;

                  let borderClass = "";
                  if (isCritical || isEmergency) {
                    borderClass = "border-l-4 border-l-rose-500 bg-rose-50/10 dark:bg-rose-950/5";
                  } else if (isSafeguarding) {
                    borderClass = "border-l-4 border-l-purple-500 bg-purple-50/10 dark:bg-purple-950/5";
                  }

                  return (
                    <tr
                      key={c.id}
                      className={`hover:bg-zinc-50/60 dark:hover:bg-zinc-900/30 transition-colors ${borderClass}`}
                    >
                      <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-zinc-100">
                        <div className="flex flex-col">
                          <span>{c.studentName}</span>
                          <span className="text-[10px] text-zinc-400 font-mono mt-0.5">{c.id.slice(0, 8)}...</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-medium text-zinc-700 dark:text-zinc-300 truncate max-w-[200px]" title={c.university}>
                            {c.university}
                          </span>
                          <span className="text-[10px] text-zinc-400 truncate max-w-[200px]" title={`${c.course} (${c.yearOfStudy})`}>
                            {c.course} ({c.yearOfStudy})
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium capitalize text-zinc-600 dark:text-zinc-400">
                        {c.category.replace("_", " ")}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={c.urgency as any}>{c.urgency}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={c.disposition as any}>{c.disposition}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <CaseStatusBadge status={c.status} />
                      </td>
                      <td className="py-3 px-4 text-zinc-400 font-medium">
                        {new Date(c.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/dashboard/${c.id}`}
                          className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-500 font-bold hover:underline cursor-pointer"
                        >
                          View <ArrowRight className="size-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination controls */}
        {total > pageSize && (
          <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs font-semibold bg-zinc-50/10">
            <span className="text-zinc-400 dark:text-zinc-500">
              Showing {filteredCases.length} of {total} cases
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-8 w-8 p-0 flex items-center justify-center cursor-pointer"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <span className="px-2">Page {page}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => (p * pageSize < total ? p + 1 : p))}
                disabled={page * pageSize >= total}
                className="h-8 w-8 p-0 flex items-center justify-center cursor-pointer"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
