import { Button, FieldError, Form, Input, Label, Modal, TextField } from "@heroui/react";
import { JalaliDateField } from "@/shared/components/JalaliDateField";
import { SelectField } from "@/shared/components/SelectField";
import { ASSEMBLY_TITLE_MAX_CHARS, assemblyUnitOptions } from "../../config";
import { useAddAssemblyForm } from "../../hooks/useAddAssemblyForm";
import type { AssemblyUnit } from "../../types";

type AddAssociationAssemblyModalProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

const inputClassName = "h-9 rounded-xl bg-(--field-muted) text-sm shadow-none";
const buttonClassName = "h-9 rounded-full px-4";
const dialogClassName = "w-full max-w-[calc(100vw-2rem)] rounded-[28px] p-6 sm:max-w-[441px]";

/** Add-assembly modal for association-head — title, voting day, unit (no target). */
export function AddAssociationAssemblyModal({ isOpen, onOpenChange }: AddAssociationAssemblyModalProps) {
  const form = useAddAssemblyForm({ onSuccess: () => onOpenChange(false) });

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
        <Modal.Dialog className={dialogClassName}>
          <Modal.CloseTrigger className="start-auto end-5 top-5" isDisabled={form.isSubmitting} />
          <Modal.Header>
            <Modal.Heading className="text-xl font-bold text-foreground">افزودن مجمع</Modal.Heading>
          </Modal.Header>

          <Form
            className="contents"
            validationBehavior="aria"
            onSubmit={(event) => {
              event.preventDefault();
              form.submit();
            }}
          >
            <Modal.Body className="mt-4 flex flex-col gap-5 py-2">
              <TextField
                autoFocus
                isDisabled={form.isSubmitting}
                isInvalid={!!form.titleError}
                name="title"
                value={form.title}
                onChange={form.setTitle}
              >
                <Label className="text-sm font-bold text-foreground">عنوان مجمع</Label>
                <Input
                  className={`${inputClassName} mt-[2px]`}
                  maxLength={ASSEMBLY_TITLE_MAX_CHARS}
                  placeholder="عنوان مجمع"
                />
                <FieldError>{form.titleError}</FieldError>
              </TextField>

              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-bold text-foreground">روز رأی‌گیری</span>
                <JalaliDateField
                  className={inputClassName}
                  label="روز رأی‌گیری"
                  value={form.votingDay}
                  onChange={form.setVotingDay}
                />
                {form.dateError && <p className="text-xs text-danger">{form.dateError}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-bold text-foreground">واجدین</span>
                <SelectField
                  className={`${inputClassName} w-full`}
                  isDisabled={form.isSubmitting}
                  label="واجدین"
                  options={assemblyUnitOptions}
                  value={form.unit}
                  onChange={(value) => form.setUnit(value as AssemblyUnit)}
                />
              </div>
            </Modal.Body>

            <Modal.Footer className="mt-10 justify-start gap-2">
              <Button className={buttonClassName} isPending={form.isSubmitting} type="submit">
                تأیید
              </Button>
              <Button className={buttonClassName} isDisabled={form.isSubmitting} slot="close" variant="secondary">
                لغو
              </Button>
            </Modal.Footer>
          </Form>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
