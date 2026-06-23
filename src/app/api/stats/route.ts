/**
 * GET /api/stats
 
 * Returns overall statistics for the staff dashboard:
 *  - totalOpen: Open or In Review cases
 *  - criticalOpen: Open or In Review cases with Critical urgency
 *  - safeguardingOpen: Open or In Review cases with safeguarding flag set
 *  - resolvedToday: Cases resolved today (UTC)
 */

import { NextRequest, NextResponse } from "next/server";
import { getCaseStats } from "@/lib/db/cases";

export async function GET(request: NextRequest) {
  try {
    const stats = await getCaseStats();
    return NextResponse.json(stats);
  } catch (err) {
    console.error("[GET /api/stats] Error:", err);
    return NextResponse.json(
      { error: "Failed to load statistics" },
      { status: 500 }
    );
  }
}
