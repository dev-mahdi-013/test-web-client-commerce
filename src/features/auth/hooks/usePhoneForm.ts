import { toast } from "@heroui/react";
import { useEffect, useState } from "react";
import { sanitizeDigitsInput, toEnglishDigits } from "@/lib/digits";
import { ApiError, getErrorMessage } from "@/lib/http";
import { isValidPhone, normalizePhone, sanitizePhoneInput } from "@/lib/phone";
import { useCaptcha } from "./useCaptcha";
import { useSendOtp } from "./useAuthMutations";

const CAPTCHA_LOAD_ERROR = "کد امنیتی بارگذاری نشد، دوباره تلاش کنید";

/** The Account Service answers a wrong captcha with 400, and that captcha can't be retried */
const WRONG_CAPTCHA_STATUS = 400;

type UsePhoneFormOptions = {
  initialPhone?: string;
  onCodeSent: (phone: string, resendIn: number) => void;
};

export function usePhoneForm({ initialPhone = "", onCodeSent }: UsePhoneFormOptions) {
  const captcha = useCaptcha();
  const sendOtp = useSendOtp();

  const [phone, setPhoneValue] = useState(sanitizePhoneInput(initialPhone));
  const [captchaValue, setCaptchaValueState] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const setPhone = (value: string) => setPhoneValue(sanitizePhoneInput(value));
  const setCaptchaValue = (value: string) => setCaptchaValueState(sanitizeDigitsInput(value));

  const phoneError = isSubmitted && !isValidPhone(phone) ? "شماره موبایل معتبر نیست" : null;
  const captchaError = captcha.isError
    ? CAPTCHA_LOAD_ERROR
    : isSubmitted && !captchaValue.trim()
      ? "کد امنیتی را وارد کنید"
      : null;

  useEffect(() => {
    if (!captcha.isError) return;
    toast.danger(getErrorMessage(captcha.error, CAPTCHA_LOAD_ERROR));
  }, [captcha.isError, captcha.failureCount, captcha.error]);

  const submit = () => {
    setIsSubmitted(true);
    if (!isValidPhone(phone) || !captchaValue.trim() || !captcha.data) return;

    const normalizedPhone = normalizePhone(phone);

    sendOtp.mutate(
      { phone: normalizedPhone, captchaId: captcha.data.id, captchaValue: toEnglishDigits(captchaValue.trim()) },
      {
        onSuccess: ({ resendIn }) => onCodeSent(normalizedPhone, resendIn),
        onError: (error) => {
          if (error instanceof ApiError && error.status === WRONG_CAPTCHA_STATUS) captcha.refetch();
          setCaptchaValue("");
          setIsSubmitted(false);
          toast.danger(getErrorMessage(error));
        },
      },
    );
  };

  return {
    phone,
    setPhone,
    phoneError,
    captchaValue,
    setCaptchaValue,
    captchaError,
    captcha,
    canSubmit: !!captcha.data && !captcha.isError,
    isSubmitting: sendOtp.isPending,
    submit,
  };
}
