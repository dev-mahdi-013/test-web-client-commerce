import { Button, Modal } from "@heroui/react";

type ConfirmModalProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  confirmVariant?: "danger" | "primary" | "secondary";
  isPending?: boolean;
  isDisabled?: boolean;
  onConfirm: () => void;
};

export function ConfirmModal({
  isOpen,
  onOpenChange,
  message,
  confirmLabel,
  cancelLabel = "لغو",
  confirmVariant = "primary",
  isPending = false,
  isDisabled = false,
  onConfirm,
}: ConfirmModalProps) {
  const handleOpenChange = (open: boolean) => {
    if (!open && isPending) return;
    onOpenChange(open);
  };

  return (
    <Modal.Backdrop
      isDismissable={!isPending}
      isKeyboardDismissDisabled={isPending}
      isOpen={isOpen}
      variant="blur"
      onOpenChange={handleOpenChange}
    >
      <Modal.Container placement="center">
        <Modal.Dialog className="relative w-[256px] max-w-[calc(100vw-2rem)] rounded-2xl py-4 ps-4 pe-2 shadow-(--box-shadow)">
          <Modal.CloseTrigger className="start-auto end-3 top-3" isDisabled={isPending} />
          <Modal.Body className="p-0">
            <p className="text-sm">{message}</p>
          </Modal.Body>
          <Modal.Footer className="justify-start gap-2 p-0 pt-4">
            <Button
              className="rounded-full px-4"
              isDisabled={isDisabled}
              isPending={isPending}
              size="sm"
              variant={confirmVariant}
              onPress={onConfirm}
            >
              {confirmLabel}
            </Button>
            <Button
              className="rounded-full px-4"
              isDisabled={isPending}
              size="sm"
              variant="secondary"
              onPress={() => handleOpenChange(false)}
            >
              {cancelLabel}
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
