"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { renderWithLinks } from "@/lib/renderWithLinks";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  ArrowLeft,
  Calendar,
  Mail,
  GraduationCap,
  AlertOctagon,
  ShieldAlert,
  ShieldCheck,
  Save,
  CheckCircle,
  FileText,
  User,
  Settings,
  HelpCircle,
  Activity,
} from "lucide-react";
import { useCaseDetail, useUpdateCase } from "@/lib/query";
import type { CaseStatus } from "@/types/triage";

export function CaseDetailView({ id }: { id: string }) {
  // TanStack Query 
  const {
    data: item,
    isLoading,
    isError,
    error,
  } = useCaseDetail(id);

  const updateCase = useUpdateCase(id);

  //  Local form state (mirrors server data after load) 
  const [status, setStatus] = useState<CaseStatus>("new");
  const [assignedTo, setAssignedTo] = useState("");
  const [staffNotes, setStaffNotes] = useState("");

  // Sync local form when server data first arrives (or updates)
  useEffect(() => {
    if (item) {
      setStatus(item.status);
      setAssignedTo(item.assignedTo ?? "");
      setStaffNotes(item.staffNotes ?? "");
    }
  }, [item]);

  //  Handlers 
  const handleSave = () => {
    updateCase.mutate({
      status,
      assignedTo: assignedTo.trim() || null,
      staffNotes: staffNotes.trim() || null,
    });
  };

  //  Loading state 
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <Loader2 className="size-8 text-emerald-500 animate-spin" />
        <p className="text-xs text-zinc-400 font-medium">Loading case details...</p>
      </div>
    );
  }

  // Error state 
  if (isError || !item) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
          <AlertOctagon className="size-6" />
        </div>
        <h3 className="text-lg font-bold">Error loading case</h3>
        <p className="text-sm text-zinc-500">
          {error instanceof Error ? error.message : "Case details not found."}
        </p>
        <Link href="/dashboard">
          <Button variant="outline" className="cursor-pointer mt-4">
            <ArrowLeft className="size-4 mr-1.5" /> Return to Queue
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link href="/dashboard">
          <Button variant="outline" className="flex items-center gap-1.5 cursor-pointer">
            <ArrowLeft className="size-4" /> Back to Queue
          </Button>
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-zinc-400 font-mono">Case ID: {item.id}</span>
          <Badge variant={item.disposition as any}>{item.disposition}</Badge>
          <Badge variant={item.urgency as any}>{item.urgency}</Badge>
          {item.safeguardingFlag && <Badge variant="critical">safeguarding</Badge>}
          {item.emergencySupport && <Badge variant="critical">emergency</Badge>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left side: Case context, messages, audit logs */}
        <div className="lg:col-span-8 space-y-6">
          {/* Student request details */}
          <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <CardHeader className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/10 py-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <User className="size-4.5 text-zinc-500" />
                  <CardTitle className="text-sm font-bold">Student Context</CardTitle>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
                  <Calendar className="size-3.5" />
                  <span>Submitted {new Date(item.createdAt).toLocaleString()}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-semibold">
                <div className="space-y-1">
                  <span className="text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block text-[10px]">Name</span>
                  <span className="text-zinc-800 dark:text-zinc-200">{item.studentName}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block text-[10px]">Email</span>
                  <span className="text-zinc-800 dark:text-zinc-200 flex items-center gap-1">
                    <Mail className="size-3 text-zinc-400" /> {item.studentEmail}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block text-[10px]">University</span>
                  <span className="text-zinc-800 dark:text-zinc-200 flex items-center gap-1">
                    <GraduationCap className="size-3 text-zinc-400" /> {item.university}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block text-[10px]">Course / Year</span>
                  <span className="text-zinc-800 dark:text-zinc-200 truncate block">
                    {item.course} ({item.yearOfStudy})
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <span className="text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block text-[10px] font-semibold">
                  Original Student Message
                </span>
                <div className="p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-xl text-sm leading-relaxed whitespace-pre-line text-zinc-800 dark:text-zinc-200">
                  {item.message}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Triage Output / Auto-Response */}
          <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <CardHeader className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/10 py-4">
              <div className="flex items-center gap-2">
                <FileText className="size-4.5 text-zinc-500" />
                <CardTitle className="text-sm font-bold">Automated Triage Output</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {/* Reasoning - INTERNAL AUDIT ONLY */}
              <div className="space-y-1 bg-amber-500/3 dark:bg-amber-500/2 border border-amber-500/15 p-3 rounded-lg text-xs leading-relaxed text-zinc-600 dark:text-zinc-400 font-medium">
                <span className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1 mb-1">
                  <Activity className="size-3.5" /> AI Reasoning (Internal Audit Only — Students Never See This)
                </span>
                {item.reasoning}
              </div>

              {/* Staff Summary */}
              {item.staffSummary && (
                <div className="space-y-1.5">
                  <span className="text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block text-[10px] font-semibold">
                    Staff Summary & Flags
                  </span>
                  <div className="p-4 bg-amber-500/5 dark:bg-amber-950/20 border border-amber-500/20 dark:border-amber-900/30 rounded-xl text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 font-medium whitespace-pre-line">
                    {item.staffSummary}
                  </div>
                </div>
              )}

              {/* Student reply */}
              {item.studentReply && (
                <div className="space-y-1.5">
                  <span className="text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block text-[10px] font-semibold">
                    Generated Reply (Sent or Signposted)
                  </span>
                  <div className="p-4 bg-emerald-500/5 dark:bg-emerald-950/10 border border-emerald-500/20 dark:border-emerald-900/30 rounded-xl text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 whitespace-pre-line">
                    {renderWithLinks(item.studentReply)}
                  </div>
                </div>
              )}

              {/* Clarifying Question */}
              {item.clarifyingQuestion && (
                <div className="space-y-1.5">
                  <span className="text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block text-[10px] font-semibold">
                    Generated Clarification Request
                  </span>
                  <div className="p-4 bg-indigo-500/5 dark:bg-indigo-950/10 border border-indigo-500/20 dark:border-indigo-900/30 rounded-xl text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                    <p className="font-semibold text-indigo-600 dark:text-indigo-400 mb-1">Clarifying Question:</p>
                    {item.clarifyingQuestion}
                  </div>
                </div>
              )}

              {/* Resources used */}
              {item.resourcesUsed.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  <span className="text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block text-[10px] font-semibold">
                    Resources Referenced
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {item.resourcesUsed.map((r, i) => (
                      <Badge key={i} variant="outline" className="font-medium text-xs py-1 border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
                        {r}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Audit trail / System Logs */}
          <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <CardHeader className="border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/10 py-3">
              <div className="flex items-center gap-2">
                <Settings className="size-4.5 text-zinc-500" />
                <CardTitle className="text-sm font-bold">System Triage Logs</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs font-semibold">
                <div className="space-y-1">
                  <span className="text-zinc-400 dark:text-zinc-500 uppercase block text-[10px]">AI Model Used</span>
                  <span className="text-zinc-800 dark:text-zinc-200 font-mono bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                    {item.modelUsed}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-zinc-400 dark:text-zinc-500 uppercase block text-[10px]">Pre-Check Triggered</span>
                  <span className={`inline-flex items-center gap-1 ${item.preCheckTriggered ? "text-rose-600 dark:text-rose-400" : "text-zinc-500"}`}>
                    {item.preCheckTriggered ? (
                      <><ShieldAlert className="size-3.5" /> Yes (Short-Circuit)</>
                    ) : (
                      <><ShieldCheck className="size-3.5 text-emerald-500" /> No</>
                    )}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-zinc-400 dark:text-zinc-500 uppercase block text-[10px]">Post-Check Override</span>
                  <span className={`inline-flex items-center gap-1 ${item.postCheckApplied ? "text-amber-600 dark:text-amber-400" : "text-zinc-500"}`}>
                    {item.postCheckApplied ? (
                      <><ShieldAlert className="size-3.5 text-amber-500" /> Yes (Enforced Overrides)</>
                    ) : (
                      "No (AI output trusted)"
                    )}
                  </span>
                </div>
              </div>

              {item.postCheckApplied && item.overrideReasons.length > 0 && (
                <div className="mt-4 p-3 bg-amber-500/5 dark:bg-amber-950/20 border border-amber-500/15 rounded-lg text-xs leading-relaxed text-zinc-600 dark:text-zinc-400 font-semibold space-y-1">
                  <p className="font-bold text-amber-700 dark:text-amber-400">Rules Applied:</p>
                  <ul className="list-disc pl-4 space-y-0.5 font-mono">
                    {item.overrideReasons.map((reason, idx) => (
                      <li key={idx}>{reason}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right side: Staff Workflow Form */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-zinc-200 dark:border-zinc-800 shadow-md sticky top-20 overflow-hidden">
            <div className="h-1.5 bg-emerald-600" />
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <CheckCircle className="size-4.5 text-emerald-600" /> Case Management
              </CardTitle>
              <CardDescription className="text-xs">
                Update status, assign case owner, or record internal staff notes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">

              {/* Mutation error banner */}
              {updateCase.isError && (
                <div className="text-xs font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 p-3 rounded-lg flex items-center gap-1.5">
                  <AlertOctagon className="size-3.5 shrink-0" />
                  {updateCase.error instanceof Error ? updateCase.error.message : "Failed to save updates."}
                </div>
              )}

              {/* Mutation success banner */}
              {updateCase.isSuccess && (
                <div className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 p-3 rounded-lg flex items-center gap-1.5">
                  <CheckCircle className="size-3.5 shrink-0" />
                  Case updated successfully.
                </div>
              )}

              {/* Status */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Case Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as CaseStatus)}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-semibold"
                >
                  <option value="new">New</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>

              {/* Assigned To */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Assigned Advisor
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sarah Connor"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                />
              </div>

              {/* Staff Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold flex justify-between">
                  <span>Advisor Internal Notes</span>
                  <span className="text-[10px] text-zinc-400 font-medium lowercase">Staff view only</span>
                </label>
                <textarea
                  rows={6}
                  placeholder="Record calls, meetings, follow-up actions or case details here..."
                  value={staffNotes}
                  onChange={(e) => setStaffNotes(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-zinc-700 dark:text-zinc-300"
                />
              </div>

              {item.resolvedAt && (
                <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-450 bg-emerald-500/5 p-3 border border-emerald-500/15 rounded-lg flex items-center gap-1.5">
                  <CheckCircle className="size-4 shrink-0" />
                  <span>Resolved on {new Date(item.resolvedAt).toLocaleString()}</span>
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t border-zinc-100 dark:border-zinc-800 p-4 bg-zinc-50/50 dark:bg-zinc-900/10">
              <Button
                onClick={handleSave}
                disabled={updateCase.isPending}
                className="w-full h-10 font-bold bg-emerald-600 dark:bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
              >
                {updateCase.isPending ? (
                  <><Loader2 className="size-4 animate-spin" /> Saving updates...</>
                ) : (
                  <><Save className="size-4" /> Save Case Updates</>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
