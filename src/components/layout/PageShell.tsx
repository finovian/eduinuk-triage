import { cn } from "@/lib/utils";

interface PageShellProps {
  
  children: React.ReactNode;
  className?: string;
  maxWidth?: "5xl" | "6xl" | "7xl";
  paddingY?: "sm" | "md" | "lg";
}

const maxWidthMap = {
  "5xl": "max-w-5xl",
  "6xl": "max-w-6xl",
  "7xl": "max-w-7xl",
} as const;

const paddingMap = {
  sm: "py-6",
  md: "py-8",
  lg: "py-12",
} as const;

export function PageShell({
  children,
  className,
  maxWidth = "7xl",
  paddingY = "md",
}: PageShellProps) {
  return (
    <div
      className={cn(
        paddingMap[paddingY],
        "px-4 sm:px-6 lg:px-8 w-full"
      )}
    >
      <div className={cn(maxWidthMap[maxWidth], "mx-auto space-y-6", className)}>
        {children}
      </div>
    </div>
  );
}
