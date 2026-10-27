import { useState } from "react";
import { isValidJalaliDate, sanitizeJalaliInput } from "@/lib/date";
import { sanitizeDigitsInput } from "@/lib/digits";
import { isValidNationalCode } from "@/lib/national-code";
import type { MemberKind } from "@/shared/types/membership";

const MIN_COMPANY_LENGTH = 2;
const MIN_MANAGER_NAME_LENGTH = 3;
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
  const [nationalCode, setNationalCodeValue] = useState("");
  const [managerNationalId, setManagerNationalIdValue] = useState("");
  const [cardNo, setCardNoValue] = useState("");
  const [expiresAt, setExpiresAtValue] = useState("");
  const [commercialExpiresAt, setCommercialExpiresAtValue] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const isLegal = kind === "legal";

  const isCompanyValid = !isLegal || companyName.trim().length >= MIN_COMPANY_LENGTH;
  const isManagerNameValid = !isLegal || managerName.trim().length >= MIN_MANAGER_NAME_LENGTH;
  const isNationalCodeValid = isLegal || isValidNationalCode(nationalCode);
  const isNationalIdValid = !isLegal || isValidNationalCode(managerNationalId);
  const isCardNoValid = cardNo.length >= MIN_CARD_NO_LENGTH && cardNo.length <= MAX_CARD_NO_LENGTH;
  const isExpiryValid = isValidJalaliDate(expiresAt);
  // Commerce card expiry is optional for both kinds; when provided, it must be a valid date.
  const isCommercialExpiryValid = commercialExpiresAt === "" || isValidJalaliDate(commercialExpiresAt);

  const isValid =
    isCompanyValid &&
    isNationalCodeValid &&
    isManagerNameValid &&
    isNationalIdValid &&
    isCardNoValid &&
    isExpiryValid &&
    isCommercialExpiryValid;

  const reset = () => {
    setKind("natural");
    setCompanyName("");
    setNationalCodeValue("");
    setManagerName("");
    setManagerNationalIdValue("");
    setCardNoValue("");
    setExpiresAtValue("");
    setCommercialExpiresAtValue("");
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
    nationalCode,
    setNationalCode: (value: string) => setNationalCodeValue(sanitizeDigitsInput(value)),
    managerName,
    setManagerName,
    managerNationalId,
    setManagerNationalId: (value: string) => setManagerNationalIdValue(sanitizeDigitsInput(value)),
    cardNo,
    setCardNo: (value: string) => setCardNoValue(sanitizeDigitsInput(value)),
    expiresAt,
    setExpiresAt: (value: string) => setExpiresAtValue(sanitizeJalaliInput(value)),
    commercialExpiresAt,
    setCommercialExpiresAt: (value: string) => setCommercialExpiresAtValue(sanitizeJalaliInput(value)),
    isValid,
    companyNameError: isSubmitted && !isCompanyValid ? "نام شرکت را وارد کنید" : null,
    nationalCodeError: isSubmitted && !isNationalCodeValid ? "کد ملی معتبر نیست" : null,
    managerNameError: isSubmitted && !isManagerNameValid ? "نام مدیرعامل را کامل وارد کنید" : null,
    managerNationalIdError:
      isSubmitted && !isNationalIdValid
        ? managerNationalId === ""
          ? "کد ملی مدیرعامل الزامی است"
          : "کد ملی مدیرعامل معتبر نیست"
        : null,
    cardNoError:
      isSubmitted && !isCardNoValid
        ? `شماره کارت باید ${MIN_CARD_NO_LENGTH} تا ${MAX_CARD_NO_LENGTH} رقم باشد`
        : null,
    expiresAtError: isSubmitted && !isExpiryValid
      ? expiresAt === ""
        ? "تاریخ انقضا الزامی است"
        : "تاریخ انقضا را به شکل 1404/03/12 وارد کنید"
      : null,
    commercialExpiresAtError:
      isSubmitted && !isCommercialExpiryValid
        ? "تاریخ انقضای کارت بازرگانی را به شکل 1404/03/12 وارد کنید"
        : null,
    submit,
    reset,
  };
}
