import { useState } from "react";
import { sanitizeDigitsInput } from "@/lib/digits";
import { isValidJalaliDate, sanitizeJalaliInput } from "@/lib/date";
import { isValidNationalCode } from "@/lib/national-code";
import { isValidPhone, sanitizePhoneInput } from "@/lib/phone";
import type { MemberKind } from "@/shared/types/membership";
import { useCreateMember } from "./useCardIssuanceMutations";

type UseAddMemberFormOptions = {
  onSuccess: () => void;
};

const MIN_NAME_LENGTH = 3;
const MIN_COMPANY_LENGTH = 2;
const MIN_CARD_NO_LENGTH = 6;
const MAX_CARD_NO_LENGTH = 16;

export const memberKindOptions: Array<{ value: MemberKind; label: string }> = [
  { value: "natural", label: "حقیقی" },
  { value: "legal", label: "حقوقی" },
];

export function useAddMemberForm({ onSuccess }: UseAddMemberFormOptions) {
  const createMember = useCreateMember();
  const [kind, setKind] = useState<MemberKind>("natural");
  const [fullName, setFullName] = useState("");
  const [phone, setPhoneValue] = useState("");
  const [nationalCode, setNationalCodeValue] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [managerName, setManagerName] = useState("");
  const [managerNationalId, setManagerNationalIdValue] = useState("");
  const [cardNo, setCardNoValue] = useState("");
  const [expiresAt, setExpiresAtValue] = useState("");
  const [commercialExpiresAt, setCommercialExpiresAtValue] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const isLegal = kind === "legal";

  const isNameValid = fullName.trim().length >= MIN_NAME_LENGTH;
  const isNationalCodeValid = isValidNationalCode(nationalCode);
  const isPhoneValid = isValidPhone(phone);
  const isCompanyValid = !isLegal || companyName.trim().length >= MIN_COMPANY_LENGTH;
  const isManagerNameValid = !isLegal || managerName.trim().length >= MIN_NAME_LENGTH;
  const isNationalIdValid = !isLegal || managerNationalId === "" || isValidNationalCode(managerNationalId);
  const isCardNoValid = cardNo.length >= MIN_CARD_NO_LENGTH && cardNo.length <= MAX_CARD_NO_LENGTH;
  const isExpiryValid = isValidJalaliDate(expiresAt);
  const isCommercialExpiryValid = isValidJalaliDate(commercialExpiresAt);

  const isValid =
    isNameValid &&
    isNationalCodeValid &&
    isPhoneValid &&
    isCompanyValid &&
    isManagerNameValid &&
    isNationalIdValid &&
    isCardNoValid &&
    isExpiryValid &&
    isCommercialExpiryValid;

  const reset = () => {
    setKind("natural");
    setFullName("");
    setPhoneValue("");
    setNationalCodeValue("");
    setCompanyName("");
    setManagerName("");
    setManagerNationalIdValue("");
    setCardNoValue("");
    setExpiresAtValue("");
    setCommercialExpiresAtValue("");
    setIsSubmitted(false);
  };

  const submit = () => {
    setIsSubmitted(true);
    if (!isValid || createMember.isPending) return;

    createMember.mutate(
      {
        fullName: fullName.trim(),
        nationalCode,
        phone,
        card: {
          kind,
          name: isLegal ? companyName.trim() : fullName.trim(),
          nationalCode,
          commerceExpiresAt: commercialExpiresAt,
          cardNo,
          expiresAt,
          managerName: isLegal ? managerName.trim() : undefined,
          managerNationalId: isLegal ? managerNationalId : undefined,
        },
      },
      {
        onSuccess: () => {
          reset();
          onSuccess();
        },
      },
    );
  };

  return {
    kind,
    setKind,
    isLegal,
    fullName,
    setFullName,
    companyName,
    setCompanyName,
    managerName,
    setManagerName,
    managerNationalId,
    setManagerNationalId: (value: string) => setManagerNationalIdValue(sanitizeDigitsInput(value)),
    nationalCode,
    setNationalCode: (value: string) => setNationalCodeValue(sanitizeDigitsInput(value)),
    phone,
    setPhone: (value: string) => setPhoneValue(sanitizePhoneInput(value)),
    cardNo,
    setCardNo: (value: string) => setCardNoValue(sanitizeDigitsInput(value)),
    expiresAt,
    setExpiresAt: (value: string) => setExpiresAtValue(sanitizeJalaliInput(value)),
    commercialExpiresAt,
    setCommercialExpiresAt: (value: string) => setCommercialExpiresAtValue(sanitizeJalaliInput(value)),
    fullNameError: isSubmitted && !isNameValid ? "نام و نام خانوادگی را کامل وارد کنید" : null,
    nationalCodeError:
      isSubmitted && !isNationalCodeValid ? "کد ملی معتبر نیست" : null,
    phoneError: isSubmitted && !isPhoneValid ? "شماره موبایل معتبر نیست" : null,
    companyNameError: isSubmitted && !isCompanyValid ? "نام شرکت را وارد کنید" : null,
    managerNameError: isSubmitted && !isManagerNameValid ? "نام مدیرعامل را کامل وارد کنید" : null,
    managerNationalIdError:
      isSubmitted && !isNationalIdValid ? "کد ملی مدیرعامل معتبر نیست" : null,
    cardNoError:
      isSubmitted && !isCardNoValid
        ? `شماره کارت باید ${MIN_CARD_NO_LENGTH} تا ${MAX_CARD_NO_LENGTH} رقم باشد`
        : null,
    commercialExpiresAtError:
      isSubmitted && !isCommercialExpiryValid
        ? commercialExpiresAt === ""
          ? "تاریخ انقضای کارت بازرگانی الزامی است"
          : "تاریخ انقضای کارت بازرگانی را به شکل 1404/03/12 وارد کنید"
        : null,
    expiresAtError: isSubmitted && !isExpiryValid
      ? expiresAt === ""
        ? "تاریخ انقضا الزامی است"
        : "تاریخ انقضا را به شکل 1404/03/12 وارد کنید"
      : null,
    isSubmitting: createMember.isPending,
    submit,
    reset,
  };
}
