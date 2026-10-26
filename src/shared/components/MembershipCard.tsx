import { Button } from "@heroui/react";
import { AddCircleIcon } from "@solar-icons/react/linear/add-circle";
import { useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { formatJalali } from "@/lib/date";
import { useTruncation } from "@/shared/hooks/useTruncation";
import { TruncationTooltip } from "./TruncationTooltip";
import { memberKindLabel, type MembershipCardData } from "@/shared/types/membership";
import { ChamberMark } from "./ChamberMark";

const activeBackground = "bg-(image:--card-active) [--card-label:rgb(0_0_0/0.38)]";
const expiredBackground = "bg-(image:--card-expired) [--card-label:rgb(0_0_0/0.32)]";
const accentSurface = "bg-(image:--card-accent)";
const missingSurface = "bg-(image:--card-missing)";
const accentLabel = "rgb(255 255 255 / 0.62)";

function formatCardNo(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.length === 6 ? `${digits.slice(0, 3)} ${digits.slice(3)}` : value;
}

type CardFieldProps = {
  label: string;
  value: ReactNode;
  className?: string;
  labelClassName?: string;
  ltrEllipsisWhenTruncated?: boolean;
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
  const truncation = useTruncation<HTMLSpanElement>(ltrEllipsisWhenTruncated, contentKey);
  const labelTruncation = useTruncation<HTMLSpanElement>(false);

  return (
    <div className={cn("", className)}>
      <TruncationTooltip content={label} isTruncated={labelTruncation.isTruncated}>
        <span
          ref={labelTruncation.ref}
          className={cn("block text-caption text-(--card-label) transition-colors duration-300", labelClassName)}
        >
          {label}
        </span>
      </TruncationTooltip>
      <TruncationTooltip content={value} isTruncated={truncation.isTruncated}>
        <span ref={truncation.ref} className="mt-0.5 block truncate text-note font-bold" dir={truncation.dir}>
          {value}
        </span>
      </TruncationTooltip>
    </div>
  );
}

export function CardAssociationName({ name }: { name: string }) {
  const truncation = useTruncation<HTMLSpanElement>(false, name);

  return (
    <TruncationTooltip content={name} isTruncated={truncation.isTruncated}>
      <span ref={truncation.ref} className="block truncate">
        {name}
      </span>
    </TruncationTooltip>
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

function CommerceBody({ card, footer }: { card: MembershipCardData; footer?: ReactNode }) {
  const expired = Boolean(card.commerceExpiresAt) && new Date(card.commerceExpiresAt ?? "").getTime() < Date.now();

  return (
    <>
      <div className="grid grid-cols-3 gap-x-3 gap-y-4 px-4 pt-4 pb-5">
        <CardField label="نوع کارت" value={memberKindLabel[card.kind]} />
        <span />
        <ChamberMark className="size-9 justify-self-end" />

        <CardField label="نام" value={card.holderName} />
        <span />
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
        {footer ? (
          <div className="flex min-h-9 flex-wrap items-center justify-between gap-x-3 gap-y-2">{footer}</div>
        ) : (
          <div className="flex min-h-9 items-center justify-between gap-3">
            <CardField label="تاریخ انقضای بازرگانی" value={<span dir="ltr">{formatJalali(card.commerceExpiresAt)}</span>} />
            <span className="text-caption font-bold">{expired ? "منقضی شده" : "فعال"}</span>
          </div>
        )}
      </div>
    </>
  );
}

function MissingCommerceBody({ footer, onAddCommerceCard }: { footer?: ReactNode; onAddCommerceCard?: () => void }) {
  return (
    <>
      <div className="min-h-[118px]" />
      <div className="bg-white/8 px-4 py-3">
        <div className="flex min-h-9 items-center justify-between gap-3">
          {footer ?? (
            <Button className="h-9 gap-2 rounded-full ps-4 pe-2 text-note" size="sm" onPress={onAddCommerceCard}>
              افزودن
              <AddCircleIcon className="size-5" />
            </Button>
          )}
          <span aria-hidden className="h-9 w-32 rounded-full bg-white/40" />
        </div>
      </div>
    </>
  );
}

type MembershipCardProps = {
  card: MembershipCardData;
  footer: ReactNode;
  children?: ReactNode;
  dimWhenExpired?: boolean;
  className?: string;
  stacked?: boolean;
  onAddCommerceCard?: () => void;
  commerceFooter?: ReactNode;
  missingCommerceFooter?: ReactNode;
};

export function MembershipCard({
  card,
  footer,
  children,
  dimWhenExpired = true,
  className,
  stacked = false,
  onAddCommerceCard,
  commerceFooter,
  missingCommerceFooter,
}: MembershipCardProps) {
  const isLegal = card.kind === "legal";
  const deck = stacked;
  const commerceSurface = card.hasCommerceCard ? accentSurface : missingSurface;
  const [blueInFront, setBlueInFront] = useState(false);
  const commerceInFront = deck && blueInFront;
  const cardBackground = card.expired && dimWhenExpired ? expiredBackground : activeBackground;

  const content = (
    <article
      className={cn(
        "overflow-hidden rounded-[20px] text-white shadow-(--box-shadow)",
        cardBackground,
        deck && "relative isolate transition-transform duration-300 ease-out",
        deck && blueInFront && "-translate-x-3",
        className,
      )}
      style={deck && blueInFront ? ({ "--card-label": accentLabel } as CSSProperties) : undefined}
    >
      {deck && (
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 -z-10 transition-opacity duration-300 ease-out",
            commerceSurface,
            blueInFront ? "opacity-100" : "opacity-0",
          )}
        />
      )}
      {commerceInFront ? (
        card.hasCommerceCard ? (
          <CommerceBody card={card} footer={commerceFooter} />
        ) : (
          <MissingCommerceBody footer={missingCommerceFooter} onAddCommerceCard={onAddCommerceCard} />
        )
      ) : (
        <>
      <div className="grid grid-cols-3 gap-x-3 gap-y-4 px-4 pt-4 pb-5">
        <CardField label="نوع کارت" value={memberKindLabel[card.kind]} />
        {isLegal ? <CardField label="مدیر عامل" value={card.managerName ?? "—"} /> : <span />}
        <ChamberMark className="size-9 justify-self-end" />

        <CardField label={isLegal ? "نام شرکت" : "نام"} value={card.holderName} />
        {isLegal ? (
          <CardField
            contentKey={card.managerNationalId ?? undefined}
            label="کد ملی مدیر عامل"
            labelClassName="truncate text-micro"
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
        <div className="flex min-h-9 flex-wrap items-center justify-between gap-x-3 gap-y-2">{footer}</div>
        {children}
      </div>
        </>
      )}
    </article>
  );

  if (!deck) return content;

  return (
    <div className="relative isolate pl-3">
      <button
        aria-label="جابه‌جایی کارت‌ها"
        aria-pressed={blueInFront}
        className={cn(
          "absolute top-3 bottom-0 left-0 right-3 -z-10 cursor-pointer overflow-hidden rounded-[20px] shadow-(--box-shadow) transition-transform duration-300 ease-out",
          blueInFront && "translate-x-3",
        )}
        type="button"
        onClick={() => setBlueInFront((inFront) => !inFront)}
      >
        <span
          aria-hidden
          className={cn(
            "absolute inset-0 transition-opacity duration-300 ease-out",
            cardBackground,
            blueInFront ? "opacity-100" : "opacity-0",
          )}
        />
        <span
          aria-hidden
          className={cn(
            "absolute inset-0 transition-opacity duration-300 ease-out",
            commerceSurface,
            blueInFront ? "opacity-0" : "opacity-100",
          )}
        />
      </button>
      {content}
    </div>
  );
}

export function MembershipCardPlaceholder() {
  const bar = "h-2 rounded-full bg-white/60";

  return (
    <div
      aria-hidden
      className={cn("w-full max-w-100 overflow-hidden rounded-[20px] shadow-(--box-shadow) 2xl:max-w-none", expiredBackground)}
    >
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
