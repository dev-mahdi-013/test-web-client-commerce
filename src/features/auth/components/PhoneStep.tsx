import { Button, FieldError, Form, Input, Spinner, TextField } from "@heroui/react";
import { usePhoneForm } from "../hooks/usePhoneForm";
import { CaptchaField } from "./CaptchaField";

type PhoneStepProps = {
  initialPhone?: string;
  onCodeSent: (phone: string, resendIn: number) => void;
};

export function PhoneStep({ initialPhone, onCodeSent }: PhoneStepProps) {
  const form = usePhoneForm({ initialPhone, onCodeSent });

  return (
    <Form
      className="flex flex-col gap-7"
      validationBehavior="aria"
      onSubmit={(event) => {
        event.preventDefault();
        form.submit();
      }}
    >
      <p className="-mx-2 mb-1 text-center sm:-mx-5 text-[13px] leading-6 text-[#333]">
        برای ورود به حساب کاربری شماره موبایل خود را وارد نمایید ورود شما به معنای پذیرش شرایط و حریم خصوصی هدهد است
      </p>

      <TextField
        autoFocus
        isDisabled={form.isSubmitting}
        isInvalid={!!form.phoneError}
        name="phone"
        value={form.phone}
        onChange={form.setPhone}
        aria-label="شماره تماس"
      >
        <Input
          autoComplete="tel"
          className="input-ltr-type h-[37px] rounded-xl text-sm"
          inputMode="numeric"
          maxLength={13}
          pattern="[0-9]*"
          placeholder="شماره تماس"
        />
        <FieldError>{form.phoneError}</FieldError>
      </TextField>

      <CaptchaField
        captcha={form.captcha}
        error={form.captchaError}
        isDisabled={form.isSubmitting}
        value={form.captchaValue}
        onChange={form.setCaptchaValue}
      />

      <Button
        className="mt-[15px] h-[39px] self-end rounded-full px-6 text-[15px]"
        isDisabled={!form.canSubmit}
        isPending={form.isSubmitting}
        type="submit"
      >
        {form.isSubmitting && <Spinner color="current" size="sm" />}
        ارسال کد
      </Button>
    </Form>
  );
}
