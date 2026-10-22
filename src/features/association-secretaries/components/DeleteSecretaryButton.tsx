import { TrashBinTrashIcon } from "@solar-icons/react/linear/trash-bin-trash";
import { Button, CloseButton, Popover } from "@heroui/react";
import { useRef } from "react";
import { BlurBackdrop } from "@/shared/components/BlurBackdrop";
import type { AssociationSecretary } from "../types";

type DeleteSecretaryButtonProps = {
  secretary: AssociationSecretary;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onDelete: (secretary: AssociationSecretary) => void;
};

/** Same dismiss control as HR officers; calls association secretary remove. */
export function DeleteSecretaryButton({
  secretary,
  isOpen,
  onOpenChange,
  onDelete,
}: DeleteSecretaryButtonProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <BlurBackdrop isOpen={isOpen} />
      <Popover isOpen={isOpen} onOpenChange={onOpenChange}>
        <Button
          ref={triggerRef}
          aria-expanded={isOpen}
          aria-label={`عزل ${secretary.fullName}`}
          className="h-8 min-w-[72px] gap-1.5 rounded-full px-4 text-[13px]"
          isDisabled={!!secretary.dismissedAt}
          size="sm"
          variant="danger"
          onPress={() => onOpenChange(!isOpen)}
        >
          <TrashBinTrashIcon className="size-4" />
          عزل
        </Button>
        <Popover.Content
          className="w-[256px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl! bg-white shadow-(--box-shadow)"
          offset={8}
          placement="bottom end"
          shouldFlip
          triggerRef={triggerRef}
        >
          <Popover.Dialog className="relative py-4 ps-4 pe-2 outline-none">
            <CloseButton className="absolute start-auto end-3 top-3" onPress={() => onOpenChange(false)} />
            <p className="text-sm">آیا عزل را تأیید میکنید؟</p>
            <div className="flex justify-start gap-2 pt-6">
              <Button
                className="rounded-full px-4"
                isDisabled={!!secretary.dismissedAt}
                size="sm"
                onPress={() => {
                  onDelete(secretary);
                  onOpenChange(false);
                }}
              >
                عزل
              </Button>
              <Button className="rounded-full px-4" size="sm" variant="secondary" onPress={() => onOpenChange(false)}>
                لغو
              </Button>
            </div>
          </Popover.Dialog>
        </Popover.Content>
      </Popover>
    </>
  );
}
