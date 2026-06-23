import type { Metadata } from "next";
import { Ticket } from "lucide-react";
import { CaseDetailView } from "@/components/dashboard/CaseDetailView";
import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata: Metadata = {
  // Resolves to: "Case Detail | eduInUK Triage"
  title: "Case Detail",
  description: "Detailed triage case review: classification results, safety rule audit log, and staff workflow controls.",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CasePage({ params }: PageProps) {
  const { id } = await params;

  return (
    <PageShell>
      <PageHeader
        icon={<Ticket className="size-5" />}
        title="Detailed Case Assessment"
        description="Classification results, safety rule audit logs, and internal staff workflow updates for this inquiry."
      />
      <CaseDetailView id={id} />
    </PageShell>
  );
}
