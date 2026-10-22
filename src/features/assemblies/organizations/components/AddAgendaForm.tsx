import { AddIcon } from "@solar-icons/react/linear/add";
import { CloseIcon } from "@solar-icons/react/linear/close";
import { Button, Input, Label, TextField } from "@heroui/react";
import { useState } from "react";
import { SelectField } from "@/shared/components/SelectField";
import { assemblyUnitOptions } from "../../config";
import type { AgendaKind, AssemblyUnit, CreateAgendaInput } from "../../types";

type DraftCandidate = {
  id: string;
  name: string;
};

type AddAgendaFormProps = {
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

export function AddAgendaForm({ isPending, isDisabled = false, onSubmit }: AddAgendaFormProps) {
  const [title, setTitle] = useState("");
  const [maxSelections, setMaxSelections] = useState("3");
  const [kind, setKind] = useState<AgendaKind>("person");
  const [unit, setUnit] = useState<AssemblyUnit>("حقیقی");
  const [candidateQuery, setCandidateQuery] = useState("");
  const [candidates, setCandidates] = useState<DraftCandidate[]>([]);
  const [error, setError] = useState<string | null>(null);
  const isFormDisabled = isPending || isDisabled;

  const addCandidate = () => {
    if (isFormDisabled) return;
    const name = candidateQuery.trim();
    if (!name) return;
    if (candidates.some((candidate) => candidate.name === name)) {
      setCandidateQuery("");
      return;
    }
    setCandidates((current) => [...current, { id: `${Date.now()}-${name}`, name }]);
    setCandidateQuery("");
  };

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
    if (kind === "person" && candidates.length === 0) {
      setError("نام کاندیدا را وارد کنید");
      return;
    }
    setError(null);
    onSubmit({
      title: trimmedTitle,
      maxSelections: max,
      kind,
      unit,
      candidates:
        kind === "person"
          ? candidates.map((candidate) => ({ name: candidate.name }))
          : [{ name: trimmedTitle }],
    });

    setTitle("");
    setMaxSelections("3");
    setKind("person");
    setUnit("حقیقی");
    setCandidates([]);
    setCandidateQuery("");
  };

  return (
    <div
      className="bg-transparent p-0 shadow-none max-lg:!pb-0"
      style={{ paddingBottom: candidates.length > 0 ? `${candidates.length * 32 + 44}px` : undefined }}
    >
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1.4fr)_110px_140px_140px_minmax(0,1.2fr)_auto] lg:items-end">
        <TextField isDisabled={isFormDisabled} value={title} onChange={setTitle}>
          <Label className="text-xs font-bold text-foreground">تیتر دستور</Label>
          <Input className={`${fieldClassName} mt-1`} placeholder="تیتر دستور" />
        </TextField>

        <TextField isDisabled={isFormDisabled} value={maxSelections} onChange={setMaxSelections}>
          <Label className="text-xs font-bold text-foreground">حداکثر انتخاب</Label>
          <Input
            className="h-9 rounded-[12px] bg-white text-sm  input-ltr-type"
            inputMode="numeric"
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

        <div className="flex flex-col gap-1">
          <span className="text-xs font-bold text-foreground">واجدین</span>
          <SelectField
            className={selectClassName}
            isDisabled={isFormDisabled}
            label="واجدین"
            options={assemblyUnitOptions}
            popoverClassName="z-[var(--z-index-overlay)] max-sm:!w-[200px]"
            showBackdrop
            value={unit}
            onChange={(value) => setUnit(value as AssemblyUnit)}
          />
        </div>

        <div className="relative flex flex-col gap-1">
          <span className="text-xs font-bold text-foreground">افزودن کاندیدا</span>
          <div className="relative">
            <TextField isDisabled={isFormDisabled} value={candidateQuery} onChange={setCandidateQuery}>
              <Input
                className={`${fieldClassName} pe-10`}
                placeholder="جستجو و انتخاب نام"
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addCandidate();
                  }
                }}
              />
            </TextField>
            <Button
              isIconOnly
              aria-label="افزودن کاندیدا"
              className="absolute end-1 top-1/2 size-6 min-w-6 -translate-y-1/2 rounded-full bg-accent p-0 text-white"
              isDisabled={isFormDisabled || !candidateQuery.trim()}
              size="sm"
              onPress={addCandidate}
            >
              <AddIcon className="h-[37px] w-5 text-white" />
            </Button>
          </div>
          {candidates.length > 0 && (
            <ul className="mt-2 flex w-full flex-col gap-2 rounded-xl bg-(--field-muted) p-2 lg:absolute lg:end-0 lg:top-full lg:z-10">
              {candidates.map((candidate) => (
                <li
                  key={candidate.id}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-1.5 text-xs leading-none shadow-(--box-shadow)"
                >
                  <button
                    aria-label={`حذف ${candidate.name}`}
                    className="flex size-5 min-w-5 items-center justify-center rounded-full bg-danger text-white transition-colors hover:bg-danger/80"
                    disabled={isFormDisabled}
                    type="button"
                    onClick={() => setCandidates((current) => current.filter((item) => item.id !== candidate.id))}
                  >
                    <CloseIcon className="size-2.5" strokeWidth={2} />
                  </button>
                  <span className="leading-none">{candidate.name}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <Button
          className="h-9 w-full gap-2 rounded-full px-4 lg:w-auto"
          isDisabled={isFormDisabled || !title.trim() || (kind === "person" && candidates.length === 0)}
          onPress={handleSubmit}
        >
          افزودن
        </Button>
      </div>

      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
    </div>
  );
}
