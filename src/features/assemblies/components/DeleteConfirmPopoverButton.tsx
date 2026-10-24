import { CloseIcon } from "@solar-icons/react/linear/close";
import { Button, CloseButton, Popover } from "@heroui/react";
import { useRef, useState } from "react";
import { OpaqueBackdrop } from "@/shared/components/OpaqueBackdrop";

type DeleteConfirmPopoverButtonProps = {
  label: string;
  isPending: boolean;
  isBusy?: boolean;
  size?: "default" | "compact";
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  onConfirm: (onSuccess: () => void) => void;
};

export function DeleteConfirmPopoverButton({
  label,
  isPending,
  isBusy = isPending,
  size = "default",
  isOpen: controlledIsOpen,
  onOpenChange,
  onConfirm,
}: DeleteConfirmPopoverButtonProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = controlledIsOpen ?? internalIsOpen;
  const triggerRef = useRef<HTMLButtonElement>(null);

  const handleOpenChange = (open: boolean) => {
    if (!open && isBusy) return;
    setInternalIsOpen(open);
    onOpenChange?.(open);
  };

  return (
    <>
      <OpaqueBackdrop isOpen={isOpen} />
      <Popover isOpen={isOpen} onOpenChange={handleOpenChange}>
        <Button
          ref={triggerRef}
          isIconOnly
          aria-expanded={isOpen}
          aria-label={label}
          className={`rounded-full bg-danger text-white ${size === "compact" ? "size-6 min-w-6" : "size-8 min-w-8"}`}
          isDisabled={isBusy}
          size="sm"
          onPress={() => handleOpenChange(!isOpen)}
        >
          <CloseIcon className={size === "compact" ? "size-3" : "size-4"} strokeWidth={2} />
        </Button>
        <Popover.Content
          className="w-[256px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl! bg-white shadow-(--box-shadow)"
          isKeyboardDismissDisabled={isBusy}
          offset={8}
          placement="bottom end"
          shouldCloseOnInteractOutside={() => !isBusy}
          shouldFlip
          triggerRef={triggerRef}
        >
          <Popover.Dialog className="relative py-4 ps-4 pe-2 outline-none">
            <CloseButton
              className="absolute start-auto end-3 top-3"
              isDisabled={isBusy}
              onPress={() => handleOpenChange(false)}
            />
            <p className="text-sm">آیا حذف را تأیید میکنید؟</p>
            <div className="flex justify-start gap-2 pt-6">
              <Button
                className="rounded-full px-4"
                isDisabled={isBusy}
                isPending={isPending}
                size="sm"
                variant="danger"
                onPress={() => onConfirm(() => handleOpenChange(false))}
              >
                حذف
              </Button>
              <Button
                className="rounded-full px-4"
                isDisabled={isBusy}
                size="sm"
                variant="secondary"
                onPress={() => handleOpenChange(false)}
              >
                لغو
              </Button>
            </div>
          </Popover.Dialog>
        </Popover.Content>
      </Popover>
    </>
  );
}
