import type { Metadata } from "next";
import { Send } from "lucide-react";
import { SubmitForm } from "@/components/triage/SubmitForm";
import { PageShell } from "@/components/layout/PageShell";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata: Metadata = {
  // Resolves to: "Submit Inquiry | eduInUK Triage"
  title: "Submit Inquiry",
  description: "Submit a student support inquiry for AI-assisted classification and automated resource signposting.",
};

export default function SubmitPage() {
  return (
    <PageShell paddingY="lg">
      <PageHeader
        icon={<Send className="size-5" />}
        title="Student Support Services"
        description="Describe your query and get immediate guidance, resource links, or direct escalation to a qualified staff advisor."
      />
      <SubmitForm />
    </PageShell>
  );
}
