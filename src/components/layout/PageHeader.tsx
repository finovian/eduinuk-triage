import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: React.ReactNode;
  description?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  icon,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-2",
        className
      )}
    >
      <div className="space-y-1 min-w-0">
        <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2 bg-linear-to-r from-zinc-800 to-zinc-600 dark:from-zinc-100 dark:to-zinc-300 bg-clip-text text-transparent">
          {icon && (
            <span
              className="text-emerald-600 dark:text-emerald-500 shrink-0"
              aria-hidden="true"
            >
              {icon}
            </span>
          )}
          {title}
        </h1>
        {description && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {actions && <div className="shrink-0">{actions}</div>}
    </div>
  );
}
