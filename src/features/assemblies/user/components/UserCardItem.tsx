import { AltArrowDownIcon } from "@solar-icons/react/linear/alt-arrow-down";
import { Button, Spinner } from "@heroui/react";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { formatJalali } from "@/lib/date";
import { CardAssociationName, CardExpiry, MembershipCard } from "@/shared/components/MembershipCard";
import type { MembershipCardData } from "@/shared/types/membership";
import { useUserCardAssociations } from "../hooks/useUserCardAssociations";

type UserCardItemProps = {
  card: MembershipCardData;
};

/** Same green membership card as MembersPage, with associations from `/cm/joinedAssociations`. */
export function UserCardItem({ card }: UserCardItemProps) {
  const [isOpen, setOpen] = useState(false);
  const associations = useUserCardAssociations();

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
          {associations.isPending ? (
            <div className="flex h-16 items-center justify-center">
              <Spinner size="sm" />
            </div>
          ) : (associations.data ?? []).length === 0 ? (
            <p className="py-3 text-center text-xs text-white/80">انجمنی ثبت نشده است</p>
          ) : (
            <ul>
              {(associations.data ?? []).map((association) => (
                <li
                  key={association.id}
                  className="flex justify-between gap-3 border-t border-white/30 py-2 text-note font-medium"
                >
                  <CardAssociationName name={association.name} />
                  <span dir="ltr">{formatJalali(association.joinedAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </MembershipCard>
  );
}
