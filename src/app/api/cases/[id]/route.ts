/**
 * GET + PATCH /api/cases/[id]
 
 * GET: Returns the full details of a specific case, including internal notes,
 * reasoning, and raw AI response. Only for staff access.
 
 * PATCH: Updates a case's status, assignee, or staff notes.
 */

import { NextRequest, NextResponse } from "next/server";
import { getCaseById, updateCase } from "@/lib/db/cases";
import { CaseUpdateSchema } from "@/lib/triage/schema";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const item = await getCaseById(id);

    if (!item) {
      return NextResponse.json(
        { error: "Case not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(item);
  } catch (err) {
    console.error("[GET /api/cases/[id]] Error:", err);
    return NextResponse.json(
      { error: "Failed to retrieve case." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const parsed = CaseUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          issues: parsed.error.flatten().fieldErrors,
        },
        { status: 422 }
      );
    }

    // Check if case exists first
    const existing = await getCaseById(id);
    if (!existing) {
      return NextResponse.json(
        { error: "Case not found" },
        { status: 404 }
      );
    }

    const updated = await updateCase(id, parsed.data);

    return NextResponse.json(updated);
  } catch (err) {
    console.error("[PATCH /api/cases/[id]] Error:", err);
    return NextResponse.json(
      { error: "Failed to update case" },
      { status: 500 }
    );
  }
}
