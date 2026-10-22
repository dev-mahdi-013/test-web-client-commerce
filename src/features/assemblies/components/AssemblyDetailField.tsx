import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type AssemblyDetailFieldProps = {
  label: string;
  value: ReactNode;
  className?: string;
  valueClassName?: string;
};

export function AssemblyDetailField({ label, value, className, valueClassName }: AssemblyDetailFieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <dt className="text-[11px] text-muted">{label}</dt>
      <dd className={cn("text-[13px] font-bold leading-6 break-words", valueClassName)}>{value}</dd>
    </div>
  );
}
