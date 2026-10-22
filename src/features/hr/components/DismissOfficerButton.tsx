import { TrashBinTrashIcon } from "@solar-icons/react/linear/trash-bin-trash";
import { Button, CloseButton, Popover, toast } from "@heroui/react";
import { useRef } from "react";
import { getErrorMessage } from "@/lib/http";
import { BlurBackdrop } from "@/shared/components/BlurBackdrop";
import { useDismissOfficer } from "../hooks/useOfficers";
import type { Officer, OfficerUnit } from "../types";

type DismissOfficerButtonProps = {
  officer: Officer;
  unit: OfficerUnit;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

export function DismissOfficerButton({ officer, unit, isOpen, onOpenChange }: DismissOfficerButtonProps) {
  const dismiss = useDismissOfficer(unit);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const handleOpenChange = (open: boolean) => {
    if (!open && dismiss.isPending) return;
    onOpenChange(open);
  };

  const confirm = () => {
    dismiss.mutate(officer, {
      onSuccess: () => {
        onOpenChange(false);
        toast.success(`${officer.fullName} عزل شد`);
      },
      onError: (error) => toast.danger(getErrorMessage(error)),
    });
  };

  return (
    <>
      <BlurBackdrop isOpen={isOpen} />
      <Popover isOpen={isOpen} onOpenChange={handleOpenChange}>
        <Button
          ref={triggerRef}
          aria-expanded={isOpen}
          aria-label={`عزل ${officer.fullName}`}
          className="h-8 min-w-[72px] gap-1.5 rounded-full px-4 text-[13px]"
          isDisabled={!!officer.dismissedAt}
          size="sm"
          variant="danger"
          onPress={() => handleOpenChange(!isOpen)}
        >
          <TrashBinTrashIcon className="size-4" />
          عزل
        </Button>
        <Popover.Content
          className="w-[256px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl! bg-white shadow-(--box-shadow)"
          isKeyboardDismissDisabled={dismiss.isPending}
          offset={8}
          placement="bottom end"
          shouldCloseOnInteractOutside={() => !dismiss.isPending}
          shouldFlip
          triggerRef={triggerRef}
        >
          <Popover.Dialog className="relative py-4 ps-4 pe-2 outline-none">
            <CloseButton
              className="absolute start-auto end-3 top-3"
              isDisabled={dismiss.isPending}
              onPress={() => handleOpenChange(false)}
            />
            <p className="text-sm">آیا عزل را تأیید میکنید؟</p>
            <div className="flex justify-start gap-2 pt-6">
              <Button
                className="rounded-full px-4"
                isDisabled={!!officer.dismissedAt}
                isPending={dismiss.isPending}
                size="sm"
                onPress={confirm}
              >
                عزل
              </Button>
              <Button
                className="rounded-full px-4"
                isDisabled={dismiss.isPending}
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
