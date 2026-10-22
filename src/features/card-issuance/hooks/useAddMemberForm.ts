import { useState } from "react";
import { sanitizeDigitsInput } from "@/lib/digits";
import { isValidJalaliDate, sanitizeJalaliInput } from "@/lib/date";
import { isValidPhone, sanitizePhoneInput } from "@/lib/phone";
import type { MemberKind } from "@/shared/types/membership";
import { useCreateMember } from "./useCardIssuanceMutations";

type UseAddMemberFormOptions = {
  onSuccess: () => void;
};

const MIN_NAME_LENGTH = 3;
const MIN_COMPANY_LENGTH = 2;
const NATIONAL_ID_LENGTH = 10;
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
  const [companyName, setCompanyName] = useState("");
  const [managerName, setManagerName] = useState("");
  const [managerNationalId, setManagerNationalIdValue] = useState("");
  const [cardNo, setCardNoValue] = useState("");
  const [expiresAt, setExpiresAtValue] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const isLegal = kind === "legal";

  const isNameValid = fullName.trim().length >= MIN_NAME_LENGTH;
  const isPhoneValid = isValidPhone(phone);
  const isCompanyValid = !isLegal || companyName.trim().length >= MIN_COMPANY_LENGTH;
  const isManagerNameValid = !isLegal || managerName.trim().length >= MIN_NAME_LENGTH;
  const isNationalIdValid =
    !isLegal || managerNationalId === "" || managerNationalId.length === NATIONAL_ID_LENGTH;
  const isCardNoValid = cardNo.length >= MIN_CARD_NO_LENGTH && cardNo.length <= MAX_CARD_NO_LENGTH;
  const isExpiryValid = isValidJalaliDate(expiresAt);

  const isValid =
    isNameValid &&
    isPhoneValid &&
    isCompanyValid &&
    isManagerNameValid &&
    isNationalIdValid &&
    isCardNoValid &&
    isExpiryValid;

  const reset = () => {
    setKind("natural");
    setFullName("");
    setPhoneValue("");
    setCompanyName("");
    setManagerName("");
    setManagerNationalIdValue("");
    setCardNoValue("");
    setExpiresAtValue("");
    setIsSubmitted(false);
  };

  const submit = () => {
    setIsSubmitted(true);
    if (!isValid || createMember.isPending) return;

    createMember.mutate(
      {
        fullName: fullName.trim(),
        phone,
        card: {
          kind,
          name: isLegal ? companyName.trim() : fullName.trim(),
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
    phone,
    setPhone: (value: string) => setPhoneValue(sanitizePhoneInput(value)),
    cardNo,
    setCardNo: (value: string) => setCardNoValue(sanitizeDigitsInput(value)),
    expiresAt,
    setExpiresAt: (value: string) => setExpiresAtValue(sanitizeJalaliInput(value)),
    fullNameError: isSubmitted && !isNameValid ? "نام و نام خانوادگی را کامل وارد کنید" : null,
    phoneError: isSubmitted && !isPhoneValid ? "شماره موبایل معتبر نیست" : null,
    companyNameError: isSubmitted && !isCompanyValid ? "نام شرکت را وارد کنید" : null,
    managerNameError: isSubmitted && !isManagerNameValid ? "نام مدیرعامل را کامل وارد کنید" : null,
    managerNationalIdError:
      isSubmitted && !isNationalIdValid ? `کد ملی باید ${NATIONAL_ID_LENGTH} رقم باشد` : null,
    cardNoError:
      isSubmitted && !isCardNoValid
        ? `شماره کارت باید ${MIN_CARD_NO_LENGTH} تا ${MAX_CARD_NO_LENGTH} رقم باشد`
        : null,
    expiresAtError: isSubmitted && !isExpiryValid ? "تاریخ انقضا را به شکل 1404/03/12 وارد کنید" : null,
    isSubmitting: createMember.isPending,
    submit,
    reset,
  };
}
