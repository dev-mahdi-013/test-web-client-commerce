import { CloseCircleIcon } from "@solar-icons/react/linear/close-circle";
import { Button, useOverlayState } from "@heroui/react";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { useRemoveCard } from "../hooks/useCardIssuanceMutations";

type DeleteCardButtonProps = {
  memberId: string;
  cardId: string;
  cardNo: string;
  /** Called after the card was removed on the server. */
  onRemoved?: (cardId: string) => void;
};

export function DeleteCardButton({ memberId, cardId, cardNo, onRemoved }: DeleteCardButtonProps) {
  const confirm = useOverlayState();
  const removeCard = useRemoveCard(memberId);

  return (
    <>
      <Button
        aria-label={`حذف کارت ${cardNo}`}
        className="h-9 gap-1.5 rounded-full bg-(--card-expiry-alert) ps-1.5 pe-4 text-xs font-bold text-white"
        isDisabled={removeCard.isPending}
        size="sm"
        onPress={confirm.open}
      >
        <CloseCircleIcon className="size-6" />
        <span className="mt-1 font-bold"> حذف کارت</span>
      </Button>

      <ConfirmModal
        confirmLabel="حذف"
        isOpen={confirm.isOpen}
        isPending={removeCard.isPending}
        message="آیا حذف را تأیید می‌کنید؟"
        onConfirm={() => {
          removeCard.mutate(cardId, {
            onSuccess: () => {
              confirm.close();
              onRemoved?.(cardId);
            },
          });
        }}
        onOpenChange={confirm.setOpen}
      />
    </>
  );
}
