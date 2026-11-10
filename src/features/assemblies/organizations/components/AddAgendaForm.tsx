import { Button, Input, Label, TextField } from "@heroui/react";
import { useState } from "react";
import { sanitizeDigitsInput } from "@/lib/digits";
import { SelectField } from "@/shared/components/SelectField";
import type { AgendaKind, AssemblyUnit, CreateAgendaInput } from "../../types";

type AddAgendaFormProps = {
  assemblyUnit: AssemblyUnit;
  isPending?: boolean;
  isDisabled?: boolean;
  onSubmit: (input: CreateAgendaInput) => void;
};

const fieldClassName = "h-9 rounded-[12px] bg-white text-sm ";
const selectClassName = "h-9 !h-9 rounded-[12px] bg-white text-sm shadow-(--box-shadow)";
const kindOptions: Array<{ value: AgendaKind; label: string }> = [
  { value: "person", label: "عضو" },
  { value: "text", label: "نوشته" },
];

/** Creates the agenda only; its candidates are added afterwards from the agenda card. */
export function AddAgendaForm({ assemblyUnit, isPending, isDisabled = false, onSubmit }: AddAgendaFormProps) {
  const [title, setTitle] = useState("");
  const [maxSelections, setMaxSelections] = useState("1");
  const [kind, setKind] = useState<AgendaKind>("person");
  const [error, setError] = useState<string | null>(null);
  const isFormDisabled = isPending || isDisabled;

  const handleSubmit = () => {
    if (isFormDisabled) return;
    const trimmedTitle = title.trim();
    const max = Number(maxSelections);
    if (!trimmedTitle) {
      setError("تیتر دستور را وارد کنید");
      return;
    }
    if (!Number.isFinite(max) || max < 1) {
      setError("حداکثر تعداد انتخاب معتبر نیست");
      return;
    }
    setError(null);
    onSubmit({
      title: trimmedTitle,
      maxSelections: max,
      kind,
      // واجدین انتخاب نمی‌شود؛ دستور هم‌واحد با خود مجمع ساخته می‌شود.
      unit: assemblyUnit,
      // کاندیداها بعد از ساخت دستور، از روی همین کارت اضافه می‌شوند.
      candidates: [],
    });

    setTitle("");
    setMaxSelections("1");
    setKind("person");
  };

  return (
    <div className="bg-transparent p-0 shadow-none max-lg:!pb-0">
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1.4fr)_110px_140px_auto] lg:items-end">
        <TextField isDisabled={isFormDisabled} value={title} onChange={setTitle}>
          <Label className="text-xs font-bold text-foreground">تیتر دستور</Label>
          <Input className={`${fieldClassName} mt-1`} placeholder="تیتر دستور" />
        </TextField>

        <TextField
          isDisabled={isFormDisabled}
          value={maxSelections}
          onChange={(value) => setMaxSelections(sanitizeDigitsInput(value))}
        >
          <Label className="text-xs font-bold text-foreground">حداکثر انتخاب</Label>
          <Input
            className="h-9 rounded-[12px] bg-white text-sm  input-ltr-type"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="3"
          />
        </TextField>

        <div className="flex flex-col gap-1">
          <span className="text-xs font-bold text-foreground">نوع کاندیدا</span>
          <SelectField
            className={selectClassName}
            isDisabled={isFormDisabled}
            label="نوع کاندیدا"
            options={kindOptions}
            popoverClassName="z-[var(--z-index-overlay)] max-sm:!w-[200px]"
            showBackdrop
            value={kind}
            onChange={(value) => setKind(value as AgendaKind)}
          />
        </div>

        <Button
          className="h-9 w-full gap-2 rounded-full px-4 lg:w-auto"
          isDisabled={isFormDisabled || !title.trim()}
          onPress={handleSubmit}
        >
          افزودن
        </Button>
      </div>

      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
    </div>
  );
}
