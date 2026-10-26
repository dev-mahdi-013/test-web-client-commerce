import { Button, FieldError, Form, Input, Label, Modal, TextField } from "@heroui/react";
import { JalaliDateField } from "@/shared/components/JalaliDateField";
import { groupCardNumber } from "@/lib/digits";
import { SelectField } from "@/shared/components/SelectField";
import type { MemberKind } from "@/shared/types/membership";
import { memberKindOptions, useAddMemberForm } from "../hooks/useAddMemberForm";

type AddMemberModalProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  title?: string;
  /** Picks the expiry date from a calendar instead of typing it. */
  pickExpiryDate?: boolean;
};

const inputClassName = "h-10 rounded-xl bg-(--field-muted) text-sm shadow-none";

export function AddMemberModal({
  isOpen,
  onOpenChange,
  title = "افزودن عضو اتاق",
  pickExpiryDate = false,
}: AddMemberModalProps) {
  const form = useAddMemberForm({ onSuccess: () => onOpenChange(false) });

  const handleOpenChange = (open: boolean) => {
    if (!open) form.reset();
    onOpenChange(open);
  };

  return (
    <Modal.Backdrop isOpen={isOpen} variant="blur" onOpenChange={handleOpenChange}>
      <Modal.Container placement="center">
        <Modal.Dialog className="w-full max-w-[calc(100vw-2rem)] rounded-[28px] p-6 sm:max-w-[480px]">
          <Modal.CloseTrigger className="start-auto end-5 top-5" />
          <Modal.Header>
            <Modal.Heading className="text-lg font-bold">{title}</Modal.Heading>
          </Modal.Header>

          <Form
            className="contents"
            validationBehavior="aria"
            onSubmit={(event) => {
              event.preventDefault();
              form.submit();
            }}
          >
            <Modal.Body className="mt-3 grid grid-cols-1 gap-3 py-2 sm:grid-cols-2 sm:gap-4">
              <TextField
                autoFocus
                className="sm:col-span-2"
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
                className="sm:col-span-2"
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

              <TextField
                className="sm:col-span-2"
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

              <div className={`flex flex-col gap-1.5 ${form.isLegal ? "" : "sm:col-span-2"}`}>
                <span className="text-sm font-bold">نوع کارت</span>
                <SelectField
                  label="نوع کارت"
                  options={memberKindOptions}
                  value={form.kind}
                  onChange={(value) => form.setKind(value as MemberKind)}
                />
              </div>

              {form.isLegal && (
                <TextField
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

              <TextField
                className={form.isLegal ? undefined : "sm:col-span-2"}
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

              {pickExpiryDate ? (
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
              ) : (
                <TextField
                  className={form.isLegal ? undefined : "sm:col-span-2"}
                  isInvalid={!!form.expiresAtError}
                  name="expiresAt"
                  value={form.expiresAt}
                  onChange={form.setExpiresAt}
                >
                  <Label className="text-sm font-bold">تاریخ انقضا</Label>
                  <Input
                    autoComplete="off"
                    className={`${inputClassName} input-ltr-type`}
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="1404/03/12"
                  />
                  <FieldError>{form.expiresAtError}</FieldError>
                </TextField>
              )}

              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <span className="text-sm font-bold">تاریخ انقضای کارت بازرگانی</span>
                <JalaliDateField
                  isInvalid={!!form.commercialExpiresAtError}
                  label="تاریخ انقضای کارت بازرگانی"
                  value={form.commercialExpiresAt}
                  onChange={form.setCommercialExpiresAt}
                />
                {form.commercialExpiresAtError && (
                  <p className="text-xs text-danger">{form.commercialExpiresAtError}</p>
                )}
              </div>
            </Modal.Body>

            <Modal.Footer className="mt-3 justify-start gap-2">
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
