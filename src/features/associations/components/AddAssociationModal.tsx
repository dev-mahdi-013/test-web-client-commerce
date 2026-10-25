import { Button, FieldError, Form, Input, Label, Modal, TextField, toast } from "@heroui/react";
import { useState } from "react";
import { JalaliDateField } from "@/shared/components/JalaliDateField";
import type { Association } from "../types";
import { useAddAssociationMember } from "../hooks/useAssociationMutations";
import { useAddAssociationForm } from "../hooks/useAddAssociationForm";
import { AssociationMemberPicker, type PickerMember } from "./AssociationMemberPicker";

type AddAssociationModalProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

const inputClassName = "h-9 rounded-xl bg-(--field-muted) text-sm shadow-none";
const buttonClassName = "h-9 rounded-full px-4";
const dialogClassName = "w-full max-w-[calc(100vw-2rem)] rounded-[28px] p-6 sm:max-w-[420px]";

export function AddAssociationModal({ isOpen, onOpenChange }: AddAssociationModalProps) {
  const [createdAssociation, setCreatedAssociation] = useState<Association | null>(null);
  const addMember = useAddAssociationMember(createdAssociation?.id ?? "");
  const form = useAddAssociationForm({ onSuccess: setCreatedAssociation });

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      form.reset();
      setCreatedAssociation(null);
    }
    onOpenChange(open);
  };

  const handleAddMember = (member: PickerMember, onSuccess: () => void) => {
    if (!createdAssociation) return;
    const [memberId = "", memberRoleId = ""] = member.key.split(".");
    if (!memberId || !memberRoleId) {
      toast.danger("اطلاعات عضو برای افزودن معتبر نیست");
      return;
    }
    addMember.mutate({ memberId, memberRoleId }, { onSuccess });
  };

  return (
    <Modal.Backdrop isOpen={isOpen} variant="blur" onOpenChange={handleOpenChange}>
      <Modal.Container placement="center">
        <Modal.Dialog className={dialogClassName}>
          <Modal.CloseTrigger className="start-auto end-5 top-5" />
          <Modal.Header>
            <Modal.Heading className="text-xl font-bold text-foreground">
              {createdAssociation ? "افزودن عضو انجمن" : "افزودن انجمن"}
            </Modal.Heading>
          </Modal.Header>

          {!createdAssociation ? (
            <Form
              className="contents"
              validationBehavior="aria"
              onSubmit={(event) => {
                event.preventDefault();
                form.submit();
              }}
            >
              <Modal.Body className="mt-4 flex flex-col gap-6 py-2">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_129px]">
                  <TextField
                    autoFocus
                    isInvalid={!!form.nameError}
                    name="name"
                    value={form.name}
                    onChange={form.setName}
                  >
                    <Label className="text-sm font-bold text-foreground">نام انجمن</Label>
                    <Input className={`${inputClassName} mt-[2px]`} placeholder="نام انجمن" />
                    <FieldError>{form.nameError}</FieldError>
                  </TextField>

                  <div className="flex flex-col gap-1.5">
                    <span className="text-sm font-bold text-foreground">تاریخ تأسیس</span>
                    <JalaliDateField
                      className={inputClassName}
                      label="تاریخ تأسیس انجمن"
                      value={form.date}
                      onChange={form.setDate}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Button className={buttonClassName} isPending={form.isSubmitting} type="submit">
                    ثبت انجمن
                  </Button>
                  <Button className={buttonClassName} isDisabled={form.isSubmitting} slot="close" variant="secondary">
                    لغو
                  </Button>
                </div>
              </Modal.Body>
            </Form>
          ) : (
            <Modal.Body className="mt-4 flex flex-col gap-6 py-2">
              <p className="text-sm text-muted">
                انجمن «{createdAssociation.name}» ثبت شد. حالا می‌توانید اعضای آن را اضافه کنید.
              </p>

              <AssociationMemberPicker
                key={createdAssociation.id}
                isAdding={addMember.isPending}
                onAdd={handleAddMember}
              />

              <Button className={buttonClassName} slot="close" variant="secondary">
                پایان
              </Button>
            </Modal.Body>
          )}
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
