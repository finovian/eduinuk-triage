/**
 * POST /api/triage
 * Accepts a student support request, runs the full triage pipeline,
 * and returns only the client-safe fields:
 *   { caseId, disposition, urgency, studentReply, clarifyingQuestion }
 */

import { NextRequest, NextResponse } from "next/server";
import { StudentRequestSchema } from "@/lib/triage/schema";
import { runTriage } from "@/lib/triage/service";

export async function POST(request: NextRequest) {

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in request body" },
      { status: 400 }
    );
  }

  const parsed = StudentRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        issues: parsed.error.flatten().fieldErrors,
      },
      { status: 422 }
    );
  }

  // 2. Run triage pipeline 
  let result;
  try {
    result = await runTriage(parsed.data);
  } catch (err) {
    // Only DB persistence failures reach here
    console.error("[POST /api/triage] Unhandled error:", err);
    return NextResponse.json(
      { error: "An internal error occurred. Please try again." },
      { status: 500 }
    );
  }

  // 3. Return client-safe fields only
  // reasoning, staffSummary, rawLlmResponse, overrideReasons are intentionally excluded
  return NextResponse.json({
    caseId: result.caseId,
    disposition: result.disposition,
    urgency: result.urgency,
    studentReply: result.student_reply,
    clarifyingQuestion: result.clarifying_question,
  });
}
