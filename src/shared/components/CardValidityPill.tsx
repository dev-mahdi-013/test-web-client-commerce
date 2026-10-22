import { CheckCircleIcon } from "@solar-icons/react/linear/check-circle";
import { cn } from "@/lib/cn";
import { formatJalali } from "@/lib/date";
import type { MembershipCardData } from "@/shared/types/membership";

type CardValidityPillProps = {
  card: MembershipCardData;
  /** Shows the confirmed check icon, as the member lists do. */
  withIcon?: boolean;
};

/** The dark pill on a card footer that says when the membership expires. */
export function CardValidityPill({ card, withIcon = false }: CardValidityPillProps) {
  return (
    <span
      className={cn(
        "ms-auto flex h-8 items-center gap-2 rounded-full text-white",
        withIcon ? "px-3" : "px-3.5",
        card.expired ? "bg-(--card-expiry-alert)" : "bg-black/20",
      )}
    >
      {withIcon && <CheckCircleIcon className="size-4" />}
      <span className="text-[10px] text-white/80">تاریخ انقضاء</span>
      <span className="text-xs font-bold" dir="ltr">
        {formatJalali(card.expiresAt || null)}
      </span>
    </span>
  );
}
