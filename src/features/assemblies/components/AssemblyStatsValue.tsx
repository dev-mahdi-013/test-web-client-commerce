import type { Assembly } from "../types";

type AssemblyStatsValueProps = {
  assembly: Assembly;
};

/**
 * `کل | نوع | حاضرین | رأی‌دهندگان`
 * from membersCount, eligibilityScope, registeredCount, votersCount.
 */
export function AssemblyStatsValue({ assembly }: AssemblyStatsValueProps) {
  const total = Number(assembly.voters.total) || 0;
  const present = Number(assembly.voters.present) || 0;
  const voted = Number(assembly.voters.voted) || 0;
  const parts = [total, assembly.unit, present, voted];

  return (
    <span
      aria-label={`آمار ${total} کل، ${assembly.unit}، ${present} حاضر، ${voted} رأی‌دهنده`}
      className="inline-flex items-center gap-1.5 whitespace-nowrap tabular-nums"
      dir="ltr"
    >
      {parts.map((part, index) => (
        <span key={`${part}-${index}`} className="inline-flex items-center gap-1.5">
          {index > 0 ? <span className="text-muted">|</span> : null}
          <span>{part}</span>
        </span>
      ))}
    </span>
  );
}

/** Shared column header for the stats cell. */
export function AssemblyStatsColumnHeader({ className }: { className?: string }) {
  return (
    <span className={className ?? "inline-flex w-full flex-col items-center gap-0.5 leading-tight"}>
      <span className="text-xs font-medium text-foreground">آمار</span>
      <span className="text-[10px] font-normal text-muted" dir="ltr">
        کل | نوع | حاضرین | رأی‌دهندگان
      </span>
    </span>
  );
}
