import type { Metadata } from "next";
import { LayoutDashboard } from "lucide-react";
import { DashboardQueue } from "@/components/dashboard/DashboardQueue";
import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata: Metadata = {
  title: "Staff Dashboard",
  description: "Monitor and manage the student support inquiry queue. Review AI triage output, case statuses, and safety rule overrides.",
};

export default function DashboardPage() {
  return (
    <PageShell>
      <PageHeader
        icon={<LayoutDashboard className="size-5" />}
        title="Staff Worklist Dashboard"
        description="Welcome back, Advisor. Respond to inquiries, review automated triaging rules, and manage case statuses."
      />
      <DashboardQueue />
    </PageShell>
  );
}
