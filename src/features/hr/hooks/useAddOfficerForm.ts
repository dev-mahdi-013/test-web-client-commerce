import { toast } from "@heroui/react";
import { useState } from "react";
import { getErrorMessage } from "@/lib/http";
import { isValidPhone, normalizePhone, sanitizePhoneInput } from "@/lib/phone";
import type { OfficerUnit } from "../types";
import { useAddOfficer } from "./useOfficers";

type UseAddOfficerFormOptions = {
  unit: OfficerUnit;
  onSuccess: () => void;
};

export function useAddOfficerForm({ unit, onSuccess }: UseAddOfficerFormOptions) {
  const addOfficer = useAddOfficer(unit);

  const [fullName, setFullName] = useState("");
  const [phone, setPhoneValue] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const setPhone = (value: string) => setPhoneValue(sanitizePhoneInput(value));

  const fullNameError = isSubmitted && fullName.trim().length < 3 ? "نام و نام خانوادگی را کامل وارد کنید" : null;
  const phoneError = isSubmitted && !isValidPhone(phone) ? "شماره موبایل معتبر نیست" : null;

  const reset = () => {
    setFullName("");
    setPhoneValue("");
    setIsSubmitted(false);
    addOfficer.reset();
  };

  const submit = () => {
    setIsSubmitted(true);
    if (fullName.trim().length < 3 || !isValidPhone(phone)) return;

    addOfficer.mutate(
      { fullName: fullName.trim(), phone: normalizePhone(phone) },
      {
        onSuccess: () => {
          toast.success("مأمور با موفقیت اضافه شد");
          reset();
          onSuccess();
        },
        onError: (error) => toast.danger(getErrorMessage(error)),
      },
    );
  };

  return {
    fullName,
    setFullName,
    fullNameError,
    phone,
    setPhone,
    phoneError,
    isSubmitting: addOfficer.isPending,
    submit,
    reset,
  };
}
