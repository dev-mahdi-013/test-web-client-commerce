import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { formatJalali } from "@/lib/date";
import { useLtrEllipsisWhenTruncated } from "@/shared/hooks/useLtrEllipsisWhenTruncated";
import { memberKindLabel, type MembershipCardData } from "@/shared/types/membership";
import { ChamberMark } from "./ChamberMark";

const activeBackground = "bg-(image:--card-active) [--card-label:rgb(0_0_0/0.38)]";
const expiredBackground = "bg-(image:--card-expired) [--card-label:rgb(0_0_0/0.32)]";

function formatCardNo(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.length === 6 ? `${digits.slice(0, 3)} ${digits.slice(3)}` : value;
}

type CardFieldProps = {
  label: string;
  value: ReactNode;
  className?: string;
  labelClassName?: string;
  /** When true, forces LTR only while truncated so ellipsis sits on the right. */
  ltrEllipsisWhenTruncated?: boolean;
  /** Re-measure truncation when this identity changes (e.g. card number). */
  contentKey?: string;
};

export function CardField({
  label,
  value,
  className,
  labelClassName,
  ltrEllipsisWhenTruncated = false,
  contentKey,
}: CardFieldProps) {
  const truncation = useLtrEllipsisWhenTruncated(ltrEllipsisWhenTruncated, contentKey);

  return (
    <div className={cn("", className)}>
      <p className={cn("text-[11px] text-(--card-label)", labelClassName)}>{label}</p>
      <p ref={truncation.ref} className="mt-0.5 truncate text-[13px] font-bold" dir={truncation.dir}>
        {value}
      </p>
    </div>
  );
}

export function CardExpiry({ expiresAt }: { expiresAt: string | null }) {
  return (
    <CardField
      className="shrink-0 text-end"
      label="تاریخ انقضا"
      value={<span dir="ltr">{formatJalali(expiresAt || null)}</span>}
    />
  );
}

type MembershipCardProps = {
  card: MembershipCardData;
  footer: ReactNode;
  children?: ReactNode;
  dimWhenExpired?: boolean;
  className?: string;
};

export function MembershipCard({ card, footer, children, dimWhenExpired = true, className }: MembershipCardProps) {
  const isLegal = card.kind === "legal";

  return (
    <article
      className={cn(
        "overflow-hidden rounded-[20px] text-white shadow-(--box-shadow)",
        card.expired && dimWhenExpired ? expiredBackground : activeBackground,
        className,
      )}
    >
      <div className="grid grid-cols-3 gap-x-3 gap-y-4 px-4 pt-4 pb-5">
        <CardField label="نوع کارت" value={memberKindLabel[card.kind]} />
        {isLegal ? <CardField label="مدیر عامل" value={card.managerName ?? "—"} /> : <span />}
        <ChamberMark className="size-9 justify-self-end" />

        <CardField label={isLegal ? "نام شرکت" : "نام"} value={card.holderName} />
        {isLegal ? (
          <CardField
            contentKey={card.managerNationalId ?? undefined}
            label="کد ملی مدیر عامل"
            labelClassName="whitespace-nowrap text-[10px]"
            ltrEllipsisWhenTruncated
            value={<span dir="ltr">{card.managerNationalId ?? "—"}</span>}
          />
        ) : (
          <span />
        )}
        <CardField
          className="text-end"
          contentKey={card.cardNo}
          label="شماره کارت"
          ltrEllipsisWhenTruncated
          value={
            <span className="[word-spacing:0.35em]" dir="ltr">
              {formatCardNo(card.cardNo)}
            </span>
          }
        />
      </div>

      <div className="bg-white/8 px-4 py-3">
        <div className="flex min-h-9 items-center justify-between gap-3">{footer}</div>
        {children}
      </div>
    </article>
  );
}

export function MembershipCardPlaceholder() {
  const bar = "h-2 rounded-full bg-white/60";

  return (
    <div aria-hidden className={cn("overflow-hidden rounded-[20px] shadow-(--box-shadow)", expiredBackground)}>
      <div className="grid grid-cols-3 gap-x-3 gap-y-5 px-4 pt-4 pb-5">
        <div className="flex flex-col gap-1.5">
          <span className={cn(bar, "w-10")} />
          <span className={cn(bar, "w-16")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <span className={cn(bar, "w-12")} />
          <span className={cn(bar, "w-20")} />
        </div>
        <ChamberMark className="size-9 justify-self-end" />
        <div className="flex flex-col gap-1.5">
          <span className={cn(bar, "w-12")} />
          <span className={cn(bar, "w-20")} />
        </div>
        <div className="flex flex-col gap-1.5">
          <span className={cn(bar, "w-14")} />
          <span className={cn(bar, "w-16")} />
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span className={cn(bar, "w-10")} />
          <span className={cn(bar, "w-14")} />
        </div>
      </div>
      <div className="flex min-h-15 items-center justify-between gap-3 bg-white/8 px-4 py-3">
        <span className="h-9 w-32 rounded-full bg-white/50" />
        <div className="flex flex-col items-end gap-1.5">
          <span className={cn(bar, "w-10")} />
          <span className={cn(bar, "w-14")} />
        </div>
      </div>
    </div>
  );
}
