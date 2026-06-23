/**
 * GET /api/cases
 
 * Fetches cases from the database.
 * Supports filters: status, urgency, disposition, and safeguarding (boolean).
 * Pagination is supported using page and pageSize.
 
 * Sorts critical/safeguarding first, then by createdAt DESC.
 */

import { NextRequest, NextResponse } from "next/server";
import { getCases } from "@/lib/db/cases";
import type { CaseStatus, Urgency, Category, Disposition } from "@/types/triage";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const status = searchParams.get("status") as CaseStatus | undefined;
    const urgency = searchParams.get("urgency") as Urgency | undefined;
    const category = searchParams.get("category") as Category | undefined;
    const disposition = searchParams.get("disposition") as Disposition | undefined;
    const safeguardingOnly = searchParams.get("safeguarding") === "true";

    console.log("[GET /api/cases] Params parsed:", { status, urgency, category, disposition, safeguardingOnly });

    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") ?? "25", 10);

    const result = await getCases({
      status,
      urgency,
      category,
      disposition,
      safeguardingOnly,
      page,
      pageSize,
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("[GET /api/cases] Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch cases." },
      { status: 500 }
    );
  }
}
