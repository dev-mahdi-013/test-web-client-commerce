import { useState } from "react";
import { isValidJalaliDate, sanitizeJalaliInput } from "@/lib/date";
import { sanitizeDigitsInput } from "@/lib/digits";
import type { MemberKind } from "@/shared/types/membership";

const MIN_COMPANY_LENGTH = 2;
const MIN_MANAGER_NAME_LENGTH = 3;
const NATIONAL_ID_LENGTH = 10;
const MIN_CARD_NO_LENGTH = 6;
const MAX_CARD_NO_LENGTH = 16;

export const memberKindOptions: Array<{ value: MemberKind; label: string }> = [
  { value: "natural", label: "حقیقی" },
  { value: "legal", label: "حقوقی" },
];

export function useCardFieldsForm() {
  const [kind, setKind] = useState<MemberKind>("natural");
  const [companyName, setCompanyName] = useState("");
  const [managerName, setManagerName] = useState("");
  const [managerNationalId, setManagerNationalIdValue] = useState("");
  const [cardNo, setCardNoValue] = useState("");
  const [expiresAt, setExpiresAtValue] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const isLegal = kind === "legal";

  const isCompanyValid = !isLegal || companyName.trim().length >= MIN_COMPANY_LENGTH;
  const isManagerNameValid = !isLegal || managerName.trim().length >= MIN_MANAGER_NAME_LENGTH;
  const isNationalIdValid =
    !isLegal || managerNationalId === "" || managerNationalId.length === NATIONAL_ID_LENGTH;
  const isCardNoValid = cardNo.length >= MIN_CARD_NO_LENGTH && cardNo.length <= MAX_CARD_NO_LENGTH;
  const isExpiryValid = isValidJalaliDate(expiresAt);

  const isValid =
    isCompanyValid && isManagerNameValid && isNationalIdValid && isCardNoValid && isExpiryValid;

  const reset = () => {
    setKind("natural");
    setCompanyName("");
    setManagerName("");
    setManagerNationalIdValue("");
    setCardNoValue("");
    setExpiresAtValue("");
    setIsSubmitted(false);
  };

  /** Marks every field as touched and runs `onValid` only when they all pass. */
  const submit = (onValid: () => void) => {
    setIsSubmitted(true);
    if (isValid) onValid();
  };

  return {
    kind,
    setKind,
    isLegal,
    companyName,
    setCompanyName,
    managerName,
    setManagerName,
    managerNationalId,
    setManagerNationalId: (value: string) => setManagerNationalIdValue(sanitizeDigitsInput(value)),
    cardNo,
    setCardNo: (value: string) => setCardNoValue(sanitizeDigitsInput(value)),
    expiresAt,
    setExpiresAt: (value: string) => setExpiresAtValue(sanitizeJalaliInput(value)),
    isValid,
    companyNameError: isSubmitted && !isCompanyValid ? "نام شرکت را وارد کنید" : null,
    managerNameError: isSubmitted && !isManagerNameValid ? "نام مدیرعامل را کامل وارد کنید" : null,
    managerNationalIdError:
      isSubmitted && !isNationalIdValid ? `کد ملی باید ${NATIONAL_ID_LENGTH} رقم باشد` : null,
    cardNoError:
      isSubmitted && !isCardNoValid
        ? `شماره کارت باید ${MIN_CARD_NO_LENGTH} تا ${MAX_CARD_NO_LENGTH} رقم باشد`
        : null,
    expiresAtError: isSubmitted && !isExpiryValid ? "تاریخ انقضا را به شکل 1404/03/12 وارد کنید" : null,
    submit,
    reset,
  };
}
