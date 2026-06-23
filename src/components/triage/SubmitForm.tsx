"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { StudentRequestSchema } from "@/lib/triage/schema";
import type { StudentRequest, TriageApiResponse } from "@/types/triage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Send, AlertCircle, HelpCircle, UserCheck } from "lucide-react";

export function SubmitForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TriageApiResponse | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StudentRequest>({
    resolver: zodResolver(StudentRequestSchema),
    defaultValues: {
      name: "",
      email: "",
      university: "",
      course: "",
      year_of_study: "Year 1",
      message: "",
    },
  });

  const onSubmit = async (data: StudentRequest) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/triage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const body = await response.json();

      if (!response.ok) {
        throw new Error(body.error || "Something went wrong. Please try again.");
      }

      setResult(body);
      reset({
        name: "",
        email: "",
        university: "",
        course: "",
        year_of_study: "Year 1",
        message: "",
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to submit request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
      {/* Form Card */}
      <Card className="md:col-span-7 shadow-lg border-zinc-200/80 dark:border-zinc-800/80 overflow-hidden">
        <div className="h-1.5 bg-linear-to-r from-emerald-500 via-teal-500 to-indigo-500" />
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-2xl font-bold tracking-tight">Student Support Triage Form</CardTitle>
          <CardDescription className="text-zinc-500 dark:text-zinc-400">
            Submit your support inquiry below. Our system will assess your request and signpost the right resource.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Alex Mercer"
                  {...register("name")}
                  className={`w-full px-3 py-2 text-sm rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${
                    errors.name ? "border-destructive focus:ring-destructive/20 focus:border-destructive" : ""
                  }`}
                />
                {errors.name && (
                  <p className="text-xs text-destructive flex items-center gap-1 font-medium mt-1">
                    <AlertCircle className="size-3" /> {errors.name.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  University Email Address
                </label>
                <input
                  type="email"
                  placeholder="alex.mercer@uni.ac.uk"
                  {...register("email")}
                  className={`w-full px-3 py-2 text-sm rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${
                    errors.email ? "border-destructive focus:ring-destructive/20 focus:border-destructive" : ""
                  }`}
                />
                {errors.email && (
                  <p className="text-xs text-destructive flex items-center gap-1 font-medium mt-1">
                    <AlertCircle className="size-3" /> {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* University */}
              <div className="space-y-1.5 sm:col-span-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  University
                </label>
                <input
                  type="text"
                  placeholder="UCL, Manchester..."
                  {...register("university")}
                  className={`w-full px-3 py-2 text-sm rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${
                    errors.university ? "border-destructive focus:ring-destructive/20 focus:border-destructive" : ""
                  }`}
                />
                {errors.university && (
                  <p className="text-xs text-destructive flex items-center gap-1 font-medium mt-1">
                    <AlertCircle className="size-3" /> {errors.university.message}
                  </p>
                )}
              </div>

              {/* Course */}
              <div className="space-y-1.5 sm:col-span-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Course / Program
                </label>
                <input
                  type="text"
                  placeholder="BSc Computer Science"
                  {...register("course")}
                  className={`w-full px-3 py-2 text-sm rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${
                    errors.course ? "border-destructive focus:ring-destructive/20 focus:border-destructive" : ""
                  }`}
                />
                {errors.course && (
                  <p className="text-xs text-destructive flex items-center gap-1 font-medium mt-1">
                    <AlertCircle className="size-3" /> {errors.course.message}
                  </p>
                )}
              </div>

              {/* Year of study */}
              <div className="space-y-1.5 sm:col-span-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Year of Study
                </label>
                <select
                  {...register("year_of_study")}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                >
                  <option value="Year 1">Year 1</option>
                  <option value="Year 2">Year 2</option>
                  <option value="Year 3">Year 3</option>
                  <option value="Year 4+">Year 4+</option>
                  <option value="Postgraduate Taught">Postgraduate Taught</option>
                  <option value="Postgraduate Research">Postgraduate Research</option>
                </select>
              </div>
            </div>

            {/* Message */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                How can we support you today?
              </label>
              <textarea
                rows={5}
                placeholder="Please describe your query in detail. Include any relevant details so we can assist you properly..."
                {...register("message")}
                className={`w-full px-3 py-2 text-sm rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${
                  errors.message ? "border-destructive focus:ring-destructive/20 focus:border-destructive" : ""
                }`}
              />
              <div className="flex justify-between items-center text-xs mt-1 font-medium">
                {errors.message ? (
                  <p className="text-destructive flex items-center gap-1">
                    <AlertCircle className="size-3" /> {errors.message.message}
                  </p>
                ) : (
                  <span className="text-zinc-400 dark:text-zinc-500">Min 10 characters, max 5000</span>
                )}
              </div>
            </div>

            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm flex items-start gap-2 font-medium">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-10 font-semibold bg-emerald-600 dark:bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Processing request...
                </>
              ) : (
                <>
                  <Send className="size-4" /> Submit Inquiry
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Result Panel */}
      <div className="md:col-span-5 h-full space-y-6">
        <Card className="h-full shadow-lg border-zinc-200/80 dark:border-zinc-800/80">
          <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <UserCheck className="size-5 text-emerald-500 dark:text-emerald-400" /> Triage Response
            </CardTitle>
            <CardDescription className="text-xs">
              Inline response generated by the triage system.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {!result && !loading && (
              <div className="flex flex-col items-center justify-center text-center py-12 px-4 space-y-4">
                <div className="p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full text-zinc-400 dark:text-zinc-500">
                  <HelpCircle className="size-10" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-semibold text-zinc-700 dark:text-zinc-300">Awaiting Submission</h4>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 max-w-xs mx-auto">
                    Fill out the form on the left to see the system classify and generate your support signposting instantly.
                  </p>
                </div>
              </div>
            )}

            {loading && (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 className="size-8 text-emerald-500 animate-spin" />
                <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
                  Classifying inquiry & checking safety rules...
                </p>
              </div>
            )}

            {result && (
              <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
           
                <div className="flex flex-wrap items-center gap-2 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                  <div className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 mr-1">Case:</div>
                  <code className="text-xs bg-zinc-50 dark:bg-zinc-900 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 font-mono text-zinc-700 dark:text-zinc-300 max-w-[120px] truncate">
                    {result.caseId}
                  </code>
                  <Badge variant={result.disposition}>
                    {result.disposition}
                  </Badge>
                  <Badge variant={result.urgency}>
                    {result.urgency}
                  </Badge>
                </div>

                {/* Reply Section */}
                {result.studentReply && (
                  <div className="space-y-2">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Message for Student
                    </h5>
                    <div className="p-4 bg-emerald-500/5 dark:bg-emerald-500/5 border border-emerald-500/20 dark:border-emerald-500/10 rounded-xl text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 whitespace-pre-line shadow-2xs">
                      {result.studentReply}
                    </div>
                  </div>
                )}

                {/* Clarifying Question Section */}
                {result.clarifyingQuestion && (
                  <div className="space-y-2">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-indigo-500 dark:text-indigo-400">
                      Clarification Required
                    </h5>
                    <div className="p-4 bg-indigo-500/5 dark:bg-indigo-500/5 border border-indigo-500/20 dark:border-indigo-500/10 rounded-xl text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 shadow-2xs">
                      <p className="font-semibold text-indigo-600 dark:text-indigo-400 mb-2 flex items-center gap-1.5">
                        Please answer the following:
                      </p>
                      {result.clarifyingQuestion}
                    </div>
                  </div>
                )}

                {/* Escalated Notification */}
                {result.disposition === "escalate" && (
                  <div className="p-4 bg-amber-500/5 dark:bg-amber-500/5 border border-amber-500/20 dark:border-amber-500/10 rounded-xl text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 flex gap-2">
                    <AlertCircle className="size-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-amber-600 dark:text-amber-400">Escalated to Staff Support</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                        Your request has been routed to our student support team for manual review. A qualified advisor will review your case and reply to your email address shortly.
                      </p>
                    </div>
                  </div>
                )}

                {/* Discard Notification */}
                {result.disposition === "discard" && (
                  <div className="p-4 bg-zinc-500/5 dark:bg-zinc-500/5 border border-zinc-500/15 rounded-xl text-sm leading-relaxed text-zinc-500 flex gap-2">
                    <AlertCircle className="size-5 text-zinc-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-zinc-600 dark:text-zinc-400">Request Categorised as Low-Priority</p>
                      <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                        This message did not appear to require student services support (e.g. spam, invalid query, or test message). No further actions are pending.
                      </p>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                  <span className="text-xs text-zinc-400 dark:text-zinc-500">
                    Test another query by submitting the form again.
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
