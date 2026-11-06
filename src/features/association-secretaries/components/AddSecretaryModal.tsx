import { Button, FieldError, Form, Input, Label, Modal, TextField, toast } from "@heroui/react";
import { useState } from "react";
import { sanitizeDigitsInput } from "@/lib/digits";
import { getErrorMessage } from "@/lib/http";
import { useAddAssociationSecretary } from "../hooks/useAssociationSecretaries";

type AddSecretaryModalProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

const dialogClassName = "w-full max-w-[calc(100vw-2rem)] rounded-[28px] p-6 sm:max-w-[480px]";
const inputClassName = "h-10 rounded-xl bg-(--field-muted) text-sm shadow-none";
const MIN_NAME_LENGTH = 3;
const PHONE_LENGTH = 11;

/** Docs: `/ap/agents/20/add` now takes the secretary's `name` + `phone`, not association member ids. */
export function AddSecretaryModal({ isOpen, onOpenChange }: AddSecretaryModalProps) {
  const addSecretary = useAddAssociationSecretary();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const nameError =
    fullName.trim().length < MIN_NAME_LENGTH ? "نام و نام خانوادگی را کامل وارد کنید" : null;
  const phoneError =
    phone.length !== PHONE_LENGTH || !phone.startsWith("09") ? "شماره موبایل معتبر نیست" : null;

  const reset = () => {
    setFullName("");
    setPhone("");
    setIsSubmitted(false);
  };

  const submit = () => {
    setIsSubmitted(true);
    if (nameError || phoneError || addSecretary.isPending) return;

    addSecretary.mutate(
      { fullName: fullName.trim(), phone },
      {
        onSuccess: () => {
          toast.success("دبیر با موفقیت اضافه شد");
          reset();
          onOpenChange(false);
        },
        onError: (error) => toast.danger(getErrorMessage(error, "افزودن دبیر انجام نشد")),
      },
    );
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && addSecretary.isPending) return;
    if (!open) {
      reset();
      addSecretary.reset();
    }
    onOpenChange(open);
  };

  return (
    <Modal.Backdrop
      isDismissable={!addSecretary.isPending}
      isKeyboardDismissDisabled={addSecretary.isPending}
      isOpen={isOpen}
      variant="blur"
      onOpenChange={handleOpenChange}
    >
      <Modal.Container placement="center">
        <Modal.Dialog className={dialogClassName}>
          <Modal.CloseTrigger
            className="start-auto end-5 top-5"
            isDisabled={addSecretary.isPending}
          />
          <Modal.Header>
            <Modal.Heading className="text-lg font-bold">افزودن دبیر</Modal.Heading>
          </Modal.Header>

          <Form
            className="contents"
            validationBehavior="aria"
            onSubmit={(event) => {
              event.preventDefault();
              submit();
            }}
          >
            <Modal.Body className="mt-2 flex flex-col gap-4 py-2">
              <TextField
                autoFocus
                isDisabled={addSecretary.isPending}
                isInvalid={isSubmitted && !!nameError}
                name="fullName"
                value={fullName}
                onChange={setFullName}
              >
                <Label className="text-sm font-bold">نام و نام خانوادگی</Label>
                <Input className={inputClassName} placeholder="نام و نام خانوادگی" />
                <FieldError>{isSubmitted ? nameError : null}</FieldError>
              </TextField>

              <TextField
                isDisabled={addSecretary.isPending}
                isInvalid={isSubmitted && !!phoneError}
                name="phone"
                value={phone}
                onChange={(value) => setPhone(sanitizeDigitsInput(value).slice(0, PHONE_LENGTH))}
              >
                <Label className="text-sm font-bold">شماره موبایل</Label>
                <Input
                  autoComplete="off"
                  className={`${inputClassName} input-ltr-type`}
                  inputMode="numeric"
                  maxLength={PHONE_LENGTH}
                  pattern="[0-9]*"
                  placeholder="09010001100"
                />
                <FieldError>{isSubmitted ? phoneError : null}</FieldError>
              </TextField>
            </Modal.Body>

            <Modal.Footer className="mt-4 justify-start gap-2">
              <Button className="rounded-full px-5" isPending={addSecretary.isPending} type="submit">
                تأیید
              </Button>
              <Button
                className="rounded-full px-5"
                isDisabled={addSecretary.isPending}
                slot="close"
                variant="secondary"
              >
                لغو
              </Button>
            </Modal.Footer>
          </Form>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
