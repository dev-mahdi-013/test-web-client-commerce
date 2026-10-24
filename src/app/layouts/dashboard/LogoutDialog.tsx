import { Logout2Icon } from "@solar-icons/react/linear/logout-2";
import { Button, Modal } from "@heroui/react";

type LogoutDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onConfirm: () => void;
};

/** Sign-out confirmation, drawn as the centred card of the design. */
export function LogoutDialog({ isOpen, onOpenChange, onConfirm }: LogoutDialogProps) {
  return (
    <Modal.Backdrop isOpen={isOpen} variant="blur" onOpenChange={onOpenChange}>
      <Modal.Container placement="center">
        <Modal.Dialog
          aria-label="خروج از حساب کاربری"
          className="relative w-[344px] max-w-[calc(100vw-2rem)] rounded-[24px] p-6 shadow-(--box-shadow)"
        >
          <Modal.CloseTrigger className="start-auto end-4 top-4" />
          <Modal.Body className="flex flex-col items-center gap-5 p-0 pt-2 text-center">
            <Logout2Icon className="size-12 text-foreground" strokeWidth={1.6} />
            <div className="flex flex-col gap-2">
              <h2 className="text-body font-bold text-foreground">خروج از حساب کاربری</h2>
              <p className="text-xs leading-6 text-muted">آیا مطمئن به خروج از حساب کاربری خود هستید ؟</p>
            </div>
            <Button
              className="mt-1 h-11 w-full rounded-full text-sm font-bold"
              variant="danger"
              onPress={onConfirm}
            >
              خروج از حساب
            </Button>
          </Modal.Body>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
