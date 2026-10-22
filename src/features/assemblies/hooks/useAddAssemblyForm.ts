import { useEffect, useState } from "react";
import { currentCommerceScope } from "@/lib/commerce-scope";
import { formatJalaliParts, isValidJalaliDate, toJalali } from "@/lib/date";
import { ASSEMBLY_TITLE_MAX_CHARS } from "../config";
import type { AssemblyUnit, CreateAssemblyInput } from "../types";
import { useAssemblyAssociationOptions } from "./useAssemblyAssociationOptions";
import { useCreateAssembly } from "./useAssemblyMutations";

type UseAddAssemblyFormOptions = {
  onSuccess: () => void;
};

const MIN_TITLE_LENGTH = 3;

function titleErrorMessage(title: string) {
  const length = title.trim().length;
  if (length > ASSEMBLY_TITLE_MAX_CHARS) return `عنوان مجمع حداکثر ${ASSEMBLY_TITLE_MAX_CHARS} کاراکتر است`;
  return "عنوان مجمع را کامل وارد کنید";
}

function today() {
  return formatJalaliParts(toJalali(new Date()));
}

export function useAddAssemblyForm({ onSuccess }: UseAddAssemblyFormOptions) {
  const createAssembly = useCreateAssembly();
  const associations = useAssemblyAssociationOptions();
  const options = associations.data ?? [];

  const [title, setTitle] = useState("");
  const [votingDay, setVotingDay] = useState(today);
  const [associationId, setAssociationId] = useState("");
  const [unit, setUnit] = useState<AssemblyUnit>("حقوقی");
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (!associationId && options[0]) setAssociationId(options[0].value);
  }, [associationId, options]);

  const isTitleValid =
    title.trim().length >= MIN_TITLE_LENGTH && title.trim().length <= ASSEMBLY_TITLE_MAX_CHARS;
  const isDateValid = isValidJalaliDate(votingDay);
  // The association-president poll is bound to the active association server-side.
  const isAssociationValid = currentCommerceScope() === "ap" || associationId.trim().length > 0;

  const reset = () => {
    setTitle("");
    setVotingDay(today());
    setAssociationId(options[0]?.value ?? "");
    setUnit("حقوقی");
    setIsSubmitted(false);
  };

  const submit = () => {
    setIsSubmitted(true);
    if (!isTitleValid || !isDateValid || !isAssociationValid || createAssembly.isPending) return;

    const input: CreateAssemblyInput = {
      title: title.trim(),
      votingDay,
      associationId,
      unit,
    };

    createAssembly.mutate(input, {
      onSuccess: () => {
        reset();
        onSuccess();
      },
    });
  };

  return {
    title,
    setTitle,
    votingDay,
    setVotingDay,
    associationId,
    setAssociationId,
    associationOptions: options,
    associationsLoading: associations.isPending,
    unit,
    setUnit,
    titleError: isSubmitted && !isTitleValid ? titleErrorMessage(title) : null,
    dateError: isSubmitted && !isDateValid ? "روز رأی‌گیری را انتخاب کنید" : null,
    associationError: isSubmitted && !isAssociationValid ? "تارگت را انتخاب کنید" : null,
    isSubmitting: createAssembly.isPending,
    submit,
    reset,
  };
}
