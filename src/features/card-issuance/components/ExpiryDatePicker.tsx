import { PenIcon } from "@solar-icons/react/linear/pen";
import { Popover } from "@heroui/react";
import { useMemo, useRef, useState } from "react";
import { formatJalali, formatJalaliParts, toJalali } from "@/lib/date";
import { OpaqueBackdrop } from "@/shared/components/OpaqueBackdrop";
import { JalaliCalendar } from "@/shared/components/JalaliCalendar";
import type { MembershipCardData } from "@/shared/types/membership";
import { useAutoPopoverPlacement } from "@/shared/hooks/useAutoPopoverPlacement";
import { useExtendCardExpiry } from "../hooks/useCardIssuanceMutations";

type ExpiryDatePickerProps = {
  memberId: string;
  card: MembershipCardData;
};

export function ExpiryDatePicker({ memberId, card }: ExpiryDatePickerProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const initial = useMemo(() => {
    const date = card.expiresAt ? new Date(card.expiresAt) : new Date();
    return toJalali(Number.isNaN(date.getTime()) ? new Date() : date);
  }, [card.expiresAt]);
  const [isOpen, setOpen] = useState(false);
  const [selected, setSelected] = useState(initial);
  const { maxHeight, placement } = useAutoPopoverPlacement(isOpen, triggerRef, contentRef);
  const extendExpiry = useExtendCardExpiry(memberId);

  const handleOpenChange = (open: boolean) => {
    if (!open && extendExpiry.isPending) return;
    if (open) setSelected(initial);
    setOpen(open);
  };

  return (
    <>
      <OpaqueBackdrop isOpen={isOpen} />
      <Popover isOpen={isOpen} onOpenChange={handleOpenChange}>
        <button
          ref={triggerRef}
          aria-expanded={isOpen}
          aria-label="تغییر تاریخ انقضا"
          className="flex h-[33px] w-[118px] shrink-0 cursor-pointer items-center justify-between gap-1.5 rounded-full bg-white ps-3 pe-1 text-foreground"
          type="button"
          onClick={() => handleOpenChange(!isOpen)}
        >
          <span className="flex flex-col items-start leading-tight mr-auto">
            <span className="text-xs text-muted ">تاریخ انقضاء</span>
            <span className="text-[11px] font-bold" dir="ltr">
              {formatJalali(card.expiresAt)}
            </span>
          </span>
          <span className="flex size-[25px] shrink-0 items-center justify-center rounded-full border border-muted/40 text-muted">
            <PenIcon className="size-3.5" />
          </span>
        </button>
        <Popover.Content
          ref={contentRef}
          className="w-[280px] max-w-[calc(100vw-2rem)] overflow-y-auto rounded-2xl! bg-white shadow-(--box-shadow)"
          offset={8}
          placement={placement}
          style={{ maxHeight }}
          triggerRef={triggerRef}
        >
          <JalaliCalendar
            className="p-4"
            isPending={extendExpiry.isPending}
            value={selected}
            onCancel={() => setOpen(false)}
            onConfirm={() => {
              extendExpiry.mutate(
                { cardRoleId: card.id, expiresAt: formatJalaliParts(selected) },
                { onSuccess: () => setOpen(false) },
              );
            }}
            onSelect={setSelected}
          />
        </Popover.Content>
      </Popover>
    </>
  );
}
