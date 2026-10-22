import { useState } from "react";
import { useNavigate } from "react-router";
import { AuthCard } from "../components/AuthCard";
import { OtpStep } from "../components/OtpStep";
import { PhoneStep } from "../components/PhoneStep";

type OtpState = {
  phone: string;
  resendIn: number;
};

export function LoginPage() {
  const navigate = useNavigate();
  const [otpState, setOtpState] = useState<OtpState | null>(null);
  const [phone, setPhone] = useState("");

  return (
    <main className="flex min-h-full items-center justify-center px-10 py-6 sm:p-6">
      <AuthCard>
        {otpState ? (
          <OtpStep
            phone={otpState.phone}
            resendIn={otpState.resendIn}
            onEditPhone={() => setOtpState(null)}
            onResend={() => setOtpState(null)}
            onVerified={() => navigate("/", { replace: true })}
          />
        ) : (
          <PhoneStep
            initialPhone={phone}
            onCodeSent={(sentTo, resendIn) => {
              setPhone(sentTo);
              setOtpState({ phone: sentTo, resendIn });
            }}
          />
        )}
      </AuthCard>
    </main>
  );
}
