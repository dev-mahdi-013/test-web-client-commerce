import { Button, FieldError, Form, Input, Label, Modal, TextField } from "@heroui/react";
import { useAddOfficerForm } from "../hooks/useAddOfficerForm";
import type { OfficerUnit } from "../types";

type AddOfficerModalProps = {
  unit: OfficerUnit;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

const inputClassName = "h-10 rounded-xl bg-(--field-muted) text-sm shadow-none";

export function AddOfficerModal({ unit, isOpen, onOpenChange }: AddOfficerModalProps) {
  const form = useAddOfficerForm({ unit, onSuccess: () => onOpenChange(false) });

  const handleOpenChange = (open: boolean) => {
    if (!open && form.isSubmitting) return;
    if (!open) form.reset();
    onOpenChange(open);
  };

  return (
    <Modal.Backdrop
      isDismissable={!form.isSubmitting}
      isKeyboardDismissDisabled={form.isSubmitting}
      isOpen={isOpen}
      variant="blur"
      onOpenChange={handleOpenChange}
    >
      <Modal.Container placement="center">
        <Modal.Dialog className="w-full max-w-[calc(100vw-2rem)] rounded-[28px] p-6 sm:max-w-[440px]">
          <Modal.CloseTrigger className="start-auto end-5 top-5" isDisabled={form.isSubmitting} />
          <Modal.Header>
            <Modal.Heading className="text-lg font-bold">افزودن مأمور</Modal.Heading>
          </Modal.Header>

          <Form
            className="contents"
            validationBehavior="aria"
            onSubmit={(event) => {
              event.preventDefault();
              form.submit();
            }}
          >
            <Modal.Body className="mt-3 flex flex-col gap-5 py-2">
              <TextField
                autoFocus
                isDisabled={form.isSubmitting}
                isInvalid={!!form.fullNameError}
                name="fullName"
                value={form.fullName}
                onChange={form.setFullName}
              >
                <Label className="text-sm font-bold">نام و نام خانوادگی</Label>
                <Input className={inputClassName} placeholder="نام و نام خانوادگی" />
                <FieldError>{form.fullNameError}</FieldError>
              </TextField>

              <TextField
                isDisabled={form.isSubmitting}
                isInvalid={!!form.phoneError}
                name="phone"
                value={form.phone}
                onChange={form.setPhone}
              >
                <Label className="text-sm font-bold">شماره موبایل</Label>
                <Input
                  autoComplete="off"
                  className={`${inputClassName} input-ltr-type`}
                  inputMode="numeric"
                  maxLength={13}
                  pattern="[0-9]*"
                  placeholder="شماره موبایل"
                />
                <FieldError>{form.phoneError}</FieldError>
              </TextField>
            </Modal.Body>

            <Modal.Footer className="justify-start gap-2 mt-3">
              <Button className="rounded-full px-5" isPending={form.isSubmitting} type="submit">
                تأیید
              </Button>
              <Button className="rounded-full px-5" isDisabled={form.isSubmitting} slot="close" variant="secondary">
                لغو
              </Button>
            </Modal.Footer>
          </Form>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
