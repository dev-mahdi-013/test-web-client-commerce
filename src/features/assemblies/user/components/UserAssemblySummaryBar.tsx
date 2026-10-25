import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { formatJalali } from "@/lib/date";
import { AssemblyStatusBadge } from "../../components/AssemblyStatusBadge";
import { RemainingTimeBoxes } from "../../components/RemainingTimeBoxes";
import { usePollRemainingTime } from "../../hooks/usePollRemainingTime";
import type { AssemblyDetail } from "../../types";

type UserAssemblySummaryBarProps = {
  assembly: AssemblyDetail;
};

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <span className="text-xs text-muted sm:text-sm">{label}</span>
      <div className="text-sm font-bold leading-6 break-words sm:text-xl">{children}</div>
    </div>
  );
}

/** Flat summary strip at the top of the user voting screen. */
export function UserAssemblySummaryBar({ assembly }: UserAssemblySummaryBarProps) {
  const remaining = usePollRemainingTime(assembly.newsDate);

  return (
    <section
      aria-label="اطلاعات مجمع"
      className="grid grid-cols-2 gap-x-4 gap-y-5 rounded-[20px] bg-white px-4 py-5 shadow-(--box-shadow) sm:px-6 lg:grid-cols-3 lg:gap-x-8 xl:grid-cols-6"
    >
      <Field className="max-w-[96px] sm:max-w-none" label="عنوان مجمع">
        {assembly.title}
      </Field>
      <Field label="تعداد دستورها">
        <span dir="ltr">{assembly.agendas.length}</span>
      </Field>
      <Field className="max-w-[96px] sm:max-w-none" label="تارگت">
        {assembly.association}
      </Field>
      <Field label="وضعیت">
        <AssemblyStatusBadge
          className="h-6 w-fit px-2.5 text-caption"
          label={assembly.status === "running" ? "در حال برگزاری" : undefined}
          status={assembly.status}
        />
      </Field>
      <Field label="روز رای گیری">
        <span dir="ltr">{formatJalali(assembly.newsDate)}</span>
      </Field>
      <Field label="زمان باقیمانده">
        <RemainingTimeBoxes days={remaining.days} hours={remaining.hours} />
      </Field>
    </section>
  );
}
