import { useState } from "react";
import { formatJalaliParts, isValidJalaliDate, toJalali } from "@/lib/date";
import type { Association } from "../types";
import { useCreateAssociation } from "./useAssociationMutations";

type UseAddAssociationFormOptions = {
  onSuccess: (association: Association) => void;
};

const MIN_NAME_LENGTH = 3;

function today() {
  return formatJalaliParts(toJalali(new Date()));
}

export function useAddAssociationForm({ onSuccess }: UseAddAssociationFormOptions) {
  const createAssociation = useCreateAssociation();
  const [name, setName] = useState("");
  const [date, setDate] = useState(today);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const isNameValid = name.trim().length >= MIN_NAME_LENGTH;
  const isDateValid = isValidJalaliDate(date);

  const reset = () => {
    setName("");
    setDate(today());
    setIsSubmitted(false);
  };

  const submit = () => {
    setIsSubmitted(true);
    if (!isNameValid || !isDateValid || createAssociation.isPending) return;

    createAssociation.mutate(
      { name: name.trim(), foundedAt: date },
      {
        onSuccess: (association) => {
          reset();
          onSuccess(association);
        },
      },
    );
  };

  return {
    name,
    setName,
    date,
    setDate,
    nameError: isSubmitted && !isNameValid ? "نام انجمن را کامل وارد کنید" : null,
    dateError: isSubmitted && !isDateValid ? "تاریخ تأسیس را انتخاب کنید" : null,
    isSubmitting: createAssociation.isPending,
    submit,
    reset,
  };
}
