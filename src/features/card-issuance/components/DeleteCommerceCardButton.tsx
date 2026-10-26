import { CloseCircleIcon } from "@solar-icons/react/linear/close-circle";
import { Button, useOverlayState } from "@heroui/react";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { useDisableCommerceCard } from "../hooks/useCardIssuanceMutations";

type DeleteCommerceCardButtonProps = {
  memberId: string;
  cardId: string;
  cardNo: string;
  onSuccess?: () => void | Promise<void>;
};

export function DeleteCommerceCardButton({ memberId, cardId, cardNo, onSuccess }: DeleteCommerceCardButtonProps) {
  const confirm = useOverlayState();
  const disableCommerce = useDisableCommerceCard(memberId);

  return (
    <>
      <Button
        aria-label={`حذف کارت بازرگانی ${cardNo}`}
        className="h-9 gap-1.5 rounded-full bg-(--card-expiry-alert) ps-1.5 pe-4 text-xs font-bold text-white"
        isDisabled={disableCommerce.isPending}
        size="sm"
        onPress={confirm.open}
      >
        <CloseCircleIcon className="size-6" />
        <span className="mt-1 font-bold">حذف کارت</span>
      </Button>

      <ConfirmModal
        confirmLabel="حذف"
        isOpen={confirm.isOpen}
        isPending={disableCommerce.isPending}
        message="آیا حذف را تأیید می‌کنید؟"
        onConfirm={() => {
          disableCommerce.mutate(cardId, {
            onSuccess: async () => {
              confirm.close();
              await onSuccess?.();
            },
          });
        }}
        onOpenChange={confirm.setOpen}
      />
    </>
  );
}
