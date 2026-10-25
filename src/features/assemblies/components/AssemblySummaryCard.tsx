import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { formatJalali } from "@/lib/date";
import { usePollRemainingTime } from "../hooks/usePollRemainingTime";
import type { AssemblyDetail } from "../types";
import { AssemblyStatusBadge } from "./AssemblyStatusBadge";
import { RemainingTimeBoxes } from "./RemainingTimeBoxes";

type AssemblySummaryCardProps = {
  assembly: AssemblyDetail;
  /** Overrides the default status pill label (e.g. organizations role copy). */
  statusLabel?: string;
};

function Field({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-1.5 lg:gap-2", className)}>
      <span className="text-xs text-muted sm:text-sm">{label}</span>
      <span className="text-sm font-bold leading-6 break-words lg:text-xl">{children}</span>
    </div>
  );
}

export function AssemblySummaryCard({ assembly, statusLabel }: AssemblySummaryCardProps) {
  const remaining = usePollRemainingTime(assembly.newsDate);
  const badgeLabel =
    statusLabel ?? (assembly.status === "running" ? "درحال رای گیری" : undefined);

  return (
    <article className="flex flex-1 items-center rounded-[20px] bg-white px-4 py-5 shadow-(--box-shadow) sm:px-6 xl:min-h-[184px] xl:rounded-[16px] xl:px-8">
      <div className="grid w-full grid-cols-2 gap-x-4 gap-y-6 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-6">
        <Field className="col-start-1 row-start-1" label="عنوان مجمع">
          {assembly.title}
        </Field>
        <Field className="col-start-2 row-start-1 lg:col-start-2" label="تعداد دستورها">
          <span className="text-lg" dir="ltr">
            {assembly.agendas.length}
          </span>
        </Field>
        <Field className="col-start-2 row-start-2 lg:col-start-2 lg:row-start-2" label="تارگت">
          {assembly.association}
        </Field>
        <Field className="col-start-1 row-start-2 lg:col-start-1 lg:row-start-2" label="وضعیت">
          <AssemblyStatusBadge
            className="h-5 w-fit px-2.5 text-caption lg:h-6"
            label={badgeLabel}
            status={assembly.status}
          />
        </Field>
        <Field className="col-start-2 row-start-3 mt-2 lg:col-start-3 lg:row-start-2 lg:mt-0" label="زمان باقیمانده">
          <RemainingTimeBoxes days={remaining.days} hours={remaining.hours} />
        </Field>
        <Field className="col-start-1 row-start-3 mt-2 lg:col-start-3 lg:row-start-1 lg:mt-0" label="روز رای گیری">
          <span dir="ltr">{formatJalali(assembly.newsDate)}</span>
        </Field>
      </div>
    </article>
  );
}
