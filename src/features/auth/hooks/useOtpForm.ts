import { useState } from "react";
import { getErrorMessage } from "@/lib/http";
import { useCountdown } from "@/shared/hooks/useCountdown";
import type { AuthSession } from "../types";
import { useVerifyOtp } from "./useAuthMutations";

export const OTP_LENGTH = 6;

type UseOtpFormOptions = {
  phone: string;
  resendIn: number;
  onVerified: (session: AuthSession) => void;
};

export function useOtpForm({ phone, resendIn, onVerified }: UseOtpFormOptions) {
  const verifyOtp = useVerifyOtp();
  const countdown = useCountdown(resendIn);

  const [code, setCode] = useState("");

  const changeCode = (value: string) => {
    setCode(value);
    if (verifyOtp.isError) verifyOtp.reset();
  };

  const submit = (value = code) => {
    if (value.length !== OTP_LENGTH || verifyOtp.isPending) return;

    verifyOtp.mutate(
      { phone, code: value },
      {
        onSuccess: onVerified,
        onError: () => setCode(""),
      },
    );
  };

  return {
    code,
    changeCode,
    isComplete: code.length === OTP_LENGTH,
    error: verifyOtp.error ? getErrorMessage(verifyOtp.error) : null,
    isVerifying: verifyOtp.isPending,
    submit,
    resendSeconds: countdown.seconds,
    canResend: !countdown.isRunning,
  };
}
