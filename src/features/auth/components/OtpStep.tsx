import { Button, Form, InputOTP, REGEXP_ONLY_DIGITS, Spinner } from "@heroui/react";
import { formatSeconds } from "@/shared/hooks/useCountdown";
import { toEnglishDigits } from "@/lib/digits";
import { OTP_LENGTH, useOtpForm } from "../hooks/useOtpForm";
import type { AuthSession } from "../types";

type OtpStepProps = {
  phone: string;
  resendIn: number;
  onVerified: (session: AuthSession) => void;
  onEditPhone: () => void;
  /** Sending a new code needs a fresh captcha, so this returns to the phone step */
  onResend: () => void;
  onNoRole: () => void;
};

const slotClassName = "size-[41px] rounded-xl border-0 bg-white shadow-none";

export function OtpStep({ phone, resendIn, onVerified, onEditPhone, onResend, onNoRole }: OtpStepProps) {
  const form = useOtpForm({ phone, resendIn, onVerified, onNoRole });

  return (
    <Form
      className="mt-14 flex flex-1 flex-col items-center"
      onSubmit={(event) => {
        event.preventDefault();
        form.submit();
      }}
    >
      <div className="flex flex-col items-start">
        <h1 className="text-[15px] font-bold leading-normal">کد تأیید را وارد کنید</h1>

        <p className="mt-2 text-sm font-normal leading-normal text-muted">
          کد به <span dir="ltr">{phone}</span> ارسال شد
          <button className="ms-2 cursor-pointer font-normal text-accent" type="button" onClick={onEditPhone}>
            ویرایش شماره
          </button>
        </p>

        <div className="mt-3" dir="ltr">
          <InputOTP
            autoFocus
            aria-label="کد تأیید"
            isDisabled={form.isVerifying}
            isInvalid={!!form.error}
            maxLength={OTP_LENGTH}
            name="code"
            pasteTransformer={(text) => toEnglishDigits(text).replace(/\D/g, "")}
            pattern={REGEXP_ONLY_DIGITS}
            value={form.code}
            onChange={form.changeCode}
            onComplete={form.submit}
          >
            <InputOTP.Group className="gap-1">
              {[0, 1, 2].map((index) => (
                <InputOTP.Slot key={index} className={slotClassName} index={index} />
              ))}
            </InputOTP.Group>
            <InputOTP.Separator className="w-2.5 bg-transparent" />
            <InputOTP.Group className="gap-1">
              {[3, 4, 5].map((index) => (
                <InputOTP.Slot key={index} className={slotClassName} index={index} />
              ))}
            </InputOTP.Group>
          </InputOTP>
        </div>

        {form.error && <p className="mt-2 text-sm text-danger">{form.error}</p>}

        <p className="mt-5 text-sm font-normal leading-normal text-muted">
          کد را دریافت نکردید؟{" "}
          {form.canResend ? (
            <button className="cursor-pointer font-normal text-accent" type="button" onClick={onResend}>
              بازارسال
            </button>
          ) : (
            <span className="font-normal">
              بازارسال تا <span dir="ltr">{formatSeconds(form.resendSeconds)}</span>
            </span>
          )}
        </p>
      </div>

      <Button
        className="mt-16 h-[39px] rounded-full px-6 text-[15px]"
        isDisabled={!form.isComplete}
        isPending={form.isVerifying}
        type="submit"
      >
        {form.isVerifying && <Spinner color="current" size="sm" />}
        وارد شوید
      </Button>
    </Form>
  );
}
