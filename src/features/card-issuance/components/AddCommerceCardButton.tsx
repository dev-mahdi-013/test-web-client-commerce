import { AddCircleIcon } from "@solar-icons/react/linear/add-circle";
import { Button, Popover } from "@heroui/react";
import { useRef, useState } from "react";
import { formatJalaliParts, toJalali } from "@/lib/date";
import { JalaliCalendar } from "@/shared/components/JalaliCalendar";
import { OpaqueBackdrop } from "@/shared/components/OpaqueBackdrop";
import { useAutoPopoverPlacement } from "@/shared/hooks/useAutoPopoverPlacement";
import { useAddCommerceCard } from "../hooks/useCardIssuanceMutations";

type AddCommerceCardButtonProps = {
  memberId: string;
  cardId: string;
  onSuccess?: () => void | Promise<void>;
};

export function AddCommerceCardButton({ memberId, cardId, onSuccess }: AddCommerceCardButtonProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isOpen, setOpen] = useState(false);
  const [selected, setSelected] = useState(() => toJalali(new Date()));
  const { maxHeight, placement } = useAutoPopoverPlacement(isOpen, triggerRef, contentRef);
  const addCommerce = useAddCommerceCard(memberId);

  const handleOpenChange = (open: boolean) => {
    if (!open && addCommerce.isPending) return;
    if (open) setSelected(toJalali(new Date()));
    setOpen(open);
  };

  return (
    <>
      <OpaqueBackdrop isOpen={isOpen} />
      <Popover isOpen={isOpen} onOpenChange={handleOpenChange}>
        <Button
          ref={triggerRef}
          aria-expanded={isOpen}
          aria-label="افزودن کارت بازرگانی"
          className="h-9 gap-2 rounded-full ps-4 pe-2 text-note"
          size="sm"
          onPress={() => handleOpenChange(!isOpen)}
        >
          افزودن
          <AddCircleIcon className="size-5" />
        </Button>
        <Popover.Content
          ref={contentRef}
          className="w-[280px] max-w-[calc(100vw-2rem)] overflow-y-auto rounded-2xl! bg-white text-foreground shadow-(--box-shadow)"
          offset={8}
          placement={placement}
          style={{ maxHeight }}
          triggerRef={triggerRef}
        >
          <p className="px-4 pt-4 text-sm font-bold">تاریخ انقضای کارت بازرگانی</p>
          <JalaliCalendar
            className="p-4 pt-3"
            isPending={addCommerce.isPending}
            value={selected}
            onCancel={() => setOpen(false)}
            onConfirm={() => {
              addCommerce.mutate(
                { cardRoleId: cardId, expiresAt: formatJalaliParts(selected) },
                {
                  onSuccess: async () => {
                    setOpen(false);
                    await onSuccess?.();
                  },
                },
              );
            }}
            onSelect={setSelected}
          />
        </Popover.Content>
      </Popover>
    </>
  );
}
