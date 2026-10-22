import { cn } from "@/lib/cn";
import { statusMeta } from "../config";
import type { AssemblyStatus } from "../types";

type AssemblyStatusBadgeProps = {
  status: AssemblyStatus;
  className?: string;
  label?: string;
};

export function AssemblyStatusBadge({ status, className, label }: AssemblyStatusBadgeProps) {
  const meta = statusMeta[status];

  return (
    <span
      className={cn(
        "inline-flex h-5 shrink-0 items-center rounded-full px-2 text-[9px] font-bold whitespace-nowrap",
        meta.className,
        className,
      )}
    >
      {label ?? meta.label}
    </span>
  );
}
