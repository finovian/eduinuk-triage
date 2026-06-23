import { cn } from "@/lib/utils";
import type { CaseStatus } from "@/types/triage";

/** Visual config per status value */
const STATUS_CONFIG: Record<
  CaseStatus,
  { label: string; className: string }
> = {
  new: {
    label: "New",
    className:
      "bg-amber-100/60 text-amber-700 border-amber-200/60 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/40",
  },
  in_progress: {
    label: "In Progress",
    className:
      "bg-indigo-100/60 text-indigo-700 border-indigo-200/60 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-900/40",
  },
  resolved: {
    label: "Resolved",
    className:
      "bg-emerald-100/60 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40",
  },
};

interface CaseStatusBadgeProps {
  status: CaseStatus;
  className?: string;
}

/**
 * CaseStatusBadge — displays a colour-coded pill for a CaseStatus value.
 *
 * Extracts the inline conditional style block that was previously duplicated
 * in DashboardQueue and CaseDetailView.
 */
export function CaseStatusBadge({ status, className }: CaseStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    className:
      "bg-zinc-100/50 text-zinc-500 border-zinc-200 dark:bg-zinc-800/40 dark:text-zinc-500 dark:border-zinc-700/50",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
