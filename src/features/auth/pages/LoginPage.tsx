import { useState } from "react";
import { useNavigate } from "react-router";
import { useMediaQuery } from "@/shared/hooks/useMediaQuery";
import { OtpStep } from "../components/OtpStep";
import { PhoneStep } from "../components/PhoneStep";
import { DesktopLoginLayout } from "../layouts/DesktopLoginLayout";
import { MobileLoginLayout } from "../layouts/MobileLoginLayout";

/** Matches the `lg` breakpoint of the app; desktop and mobile logins are separate layouts. */
const DESKTOP_QUERY = "(min-width: 1024px)";

type OtpState = {
  phone: string;
  resendIn: number;
};

export function LoginPage() {
  const navigate = useNavigate();
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const [otpState, setOtpState] = useState<OtpState | null>(null);
  const [phone, setPhone] = useState("");

  const steps = otpState ? (
    <OtpStep
      phone={otpState.phone}
      resendIn={otpState.resendIn}
      onEditPhone={() => setOtpState(null)}
      onResend={() => setOtpState(null)}
      onNoRole={() => setOtpState(null)}
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
  );

  return isDesktop ? <DesktopLoginLayout>{steps}</DesktopLoginLayout> : <MobileLoginLayout>{steps}</MobileLoginLayout>;
}
