import { Button, FieldError, Form, Input, Label, Modal, TextField } from "@heroui/react";
import { groupCardNumber } from "@/lib/digits";
import { JalaliDateField } from "@/shared/components/JalaliDateField";
import { SelectField } from "@/shared/components/SelectField";
import type { MemberKind } from "@/shared/types/membership";
import { memberKindOptions, useCardFieldsForm } from "../hooks/useCardFieldsForm";
import { useAddCard } from "../hooks/useCardIssuanceMutations";

type AddCardModalProps = {
  isOpen: boolean;
  memberId: string | null;
  memberName: string;
  onOpenChange: (isOpen: boolean) => void;
};

const inputClassName = "h-10 rounded-xl bg-(--field-muted) text-sm shadow-none";

export function AddCardModal({ isOpen, memberId, memberName, onOpenChange }: AddCardModalProps) {
  const form = useCardFieldsForm();
  const addCard = useAddCard(memberId ?? "");

  const handleOpenChange = (open: boolean) => {
    if (!open && addCard.isPending) return;
    if (!open) form.reset();
    onOpenChange(open);
  };

  return (
    <Modal.Backdrop
      isDismissable={!addCard.isPending}
      isKeyboardDismissDisabled={addCard.isPending}
      isOpen={isOpen}
      variant="blur"
      onOpenChange={handleOpenChange}
    >
      <Modal.Container placement="center">
        <Modal.Dialog className="w-full max-w-[calc(100vw-2rem)] rounded-[28px] p-6 sm:max-w-[480px]">
          <Modal.CloseTrigger className="start-auto end-5 top-5" isDisabled={addCard.isPending} />
          <Modal.Header>
            <Modal.Heading className="text-lg font-bold">افزودن کارت</Modal.Heading>
          </Modal.Header>

          <Form
            className="contents"
            validationBehavior="aria"
            onSubmit={(event) => {
              event.preventDefault();
              if (!memberId) return;
              form.submit(() => {
                addCard.mutate(
                  {
                    kind: form.kind,
                    name: form.isLegal ? form.companyName.trim() : memberName.trim() || form.cardNo,
                    cardNo: form.cardNo,
                    expiresAt: form.expiresAt,
                    managerName: form.isLegal ? form.managerName.trim() : undefined,
                    managerNationalId: form.isLegal ? form.managerNationalId : undefined,
                    nationalCode: form.isLegal ? undefined : form.nationalCode,
                    commerceExpiresAt: form.isLegal ? undefined : form.commercialExpiresAt || undefined,
                  },
                  {
                    onSuccess: () => {
                      form.reset();
                      onOpenChange(false);
                    },
                  },
                );
              });
            }}
          >
            <Modal.Body className="mt-3 grid grid-cols-1 gap-3 py-2 sm:grid-cols-2 sm:gap-4">
              <div className={`flex flex-col gap-1.5 ${form.isLegal ? "" : "sm:col-span-2"}`}>
                <span className="text-sm font-bold">نوع کارت</span>
                <SelectField
                  isDisabled={addCard.isPending}
                  label="نوع کارت"
                  options={memberKindOptions}
                  value={form.kind}
                  onChange={(value) => form.setKind(value as MemberKind)}
                />
              </div>

              {form.isLegal && (
                <TextField
                  isDisabled={addCard.isPending}
                  isInvalid={!!form.companyNameError}
                  name="companyName"
                  value={form.companyName}
                  onChange={form.setCompanyName}
                >
                  <Label className="text-sm font-bold">نام شرکت</Label>
                  <Input className={inputClassName} placeholder="نام شرکت" />
                  <FieldError>{form.companyNameError}</FieldError>
                </TextField>
              )}

              {form.isLegal && (
                <TextField
                  isDisabled={addCard.isPending}
                  isInvalid={!!form.managerNameError}
                  name="managerName"
                  value={form.managerName}
                  onChange={form.setManagerName}
                >
                  <Label className="text-sm font-bold">نام مدیرعامل</Label>
                  <Input className={inputClassName} placeholder="نام و نام خانوادگی" />
                  <FieldError>{form.managerNameError}</FieldError>
                </TextField>
              )}

              {form.isLegal && (
                <TextField
                  isDisabled={addCard.isPending}
                  isInvalid={!!form.managerNationalIdError}
                  name="managerNationalId"
                  value={form.managerNationalId}
                  onChange={form.setManagerNationalId}
                >
                  <Label className="text-sm font-bold">کد ملی مدیرعامل</Label>
                  <Input
                    autoComplete="off"
                    className={`${inputClassName} input-ltr-type`}
                    inputMode="numeric"
                    maxLength={10}
                    pattern="[0-9]*"
                    placeholder="کد ملی مدیرعامل"
                  />
                  <FieldError>{form.managerNationalIdError}</FieldError>
                </TextField>
              )}

              {!form.isLegal && (
                <TextField
                  className="sm:col-span-2"
                  isDisabled={addCard.isPending}
                  isInvalid={!!form.nationalCodeError}
                  name="nationalCode"
                  value={form.nationalCode}
                  onChange={form.setNationalCode}
                >
                  <Label className="text-sm font-bold">کد ملی</Label>
                  <Input
                    autoComplete="off"
                    className={`${inputClassName} input-ltr-type`}
                    inputMode="numeric"
                    maxLength={10}
                    pattern="[0-9]*"
                    placeholder="کد ملی"
                  />
                  <FieldError>{form.nationalCodeError}</FieldError>
                </TextField>
              )}

              <TextField
                className={form.isLegal ? undefined : "sm:col-span-2"}
                isDisabled={addCard.isPending}
                isInvalid={!!form.cardNoError}
                name="cardNo"
                value={groupCardNumber(form.cardNo)}
                onChange={form.setCardNo}
              >
                <Label className="text-sm font-bold">شماره کارت</Label>
                <Input
                  autoComplete="off"
                  className={`${inputClassName} input-ltr-type`}
                  inputMode="numeric"
                  maxLength={19}
                  pattern="[0-9]*"
                  placeholder="شماره کارت"
                />
                <FieldError>{form.cardNoError}</FieldError>
              </TextField>

              <div className={`flex flex-col gap-1.5 ${form.isLegal ? "" : "sm:col-span-2"}`}>
                <span className="text-sm font-bold">تاریخ انقضا</span>
                <JalaliDateField
                  isInvalid={!!form.expiresAtError}
                  label="تاریخ انقضا"
                  value={form.expiresAt}
                  onChange={form.setExpiresAt}
                />
                {form.expiresAtError && <p className="text-xs text-danger">{form.expiresAtError}</p>}
              </div>

              {!form.isLegal && (
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <span className="text-sm font-bold">تاریخ انقضای کارت بازرگانی (اختیاری)</span>
                  <JalaliDateField
                    isInvalid={!!form.commercialExpiresAtError}
                    label="تاریخ انقضای کارت بازرگانی (اختیاری)"
                    value={form.commercialExpiresAt}
                    onChange={form.setCommercialExpiresAt}
                  />
                  {form.commercialExpiresAtError && (
                    <p className="text-xs text-danger">{form.commercialExpiresAtError}</p>
                  )}
                </div>
              )}
            </Modal.Body>

            <Modal.Footer className="mt-3 justify-start gap-2">
              <Button className="rounded-full px-5" isPending={addCard.isPending} type="submit">
                تأیید
              </Button>
              <Button className="rounded-full px-5" isDisabled={addCard.isPending} slot="close" variant="secondary">
                لغو
              </Button>
            </Modal.Footer>
          </Form>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
