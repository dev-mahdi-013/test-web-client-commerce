import { AltArrowDownIcon } from "@solar-icons/react/linear/alt-arrow-down";
import { Button, Spinner } from "@heroui/react";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { formatJalali } from "@/lib/date";
import { getErrorMessage } from "@/lib/http";
import { CardAssociationName, CardExpiry, MembershipCard } from "@/shared/components/MembershipCard";
import type { MembershipCardData } from "@/shared/types/membership";
import { useCardAssociations } from "../hooks/useMembers";

type MemberCardItemProps = {
  memberId: string;
  card: MembershipCardData;
};

function CardAssociations({ memberId, cardId }: { memberId: string; cardId: string }) {
  const associations = useCardAssociations(memberId, cardId);

  if (associations.isPending) {
    return (
      <div className="flex justify-center border-t border-white/25 py-3">
        <Spinner color="current" size="sm" />
      </div>
    );
  }

  if (associations.isError) {
    return <p className="border-t border-white/25 py-2 text-xs">{getErrorMessage(associations.error)}</p>;
  }

  if (associations.data.length === 0) {
    return <p className="border-t border-white/25 py-2 text-xs">انجمنی ثبت نشده است</p>;
  }

  return (
    <ul>
      {associations.data.map((association) => (
        <li
          key={association.id}
          className="flex justify-between gap-3 border-t border-white/30 py-2 text-note font-medium"
        >
          <CardAssociationName name={association.name} />
          <span dir="ltr">{formatJalali(association.joinedAt)}</span>
        </li>
      ))}
    </ul>
  );
}

export function MemberCardItem({ memberId, card }: MemberCardItemProps) {
  const [isOpen, setOpen] = useState(false);

  return (
    <MembershipCard
      stacked
      card={card}
      commerceFooter={
        <div className="flex w-full justify-end">
          <CardExpiry expiresAt={card.commerceExpiresAt} />
        </div>
      }
      footer={
        <>
          {card.expired ? (
            <span aria-hidden className="h-9 w-36 rounded-full bg-white/35" />
          ) : (
            <Button
              aria-expanded={isOpen}
              className="h-9 gap-2 rounded-full bg-(--card-action) ps-4 pe-1.5 text-xs font-bold text-white"
              size="sm"
              onPress={() => setOpen((open) => !open)}
            >
              مشاهده انجمن ها
              <span className="flex size-6 items-center justify-center rounded-full border border-white/70">
                <AltArrowDownIcon className={cn("size-3.5 transition-transform", isOpen && "rotate-180")} />
              </span>
            </Button>
          )}
          <CardExpiry expiresAt={card.expiresAt} />
        </>
      }
      missingCommerceFooter={<span className="text-note font-bold">کارت بازرگانی ندارد</span>}
    >
      {isOpen && (
        <div className="animate-fade-in mt-3">
          <div className="flex justify-between pb-1.5 text-caption text-(--card-label)">
            <span>نام انجمن</span>
            <span>تاریخ عضویت</span>
          </div>
          <CardAssociations cardId={card.id} memberId={memberId} />
        </div>
      )}
    </MembershipCard>
  );
}
