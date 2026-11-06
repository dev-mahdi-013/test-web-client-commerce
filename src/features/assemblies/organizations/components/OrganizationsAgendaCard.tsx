import { CheckIcon } from "@solar-icons/react/linear/check";
import { CloseIcon } from "@solar-icons/react/linear/close";
import { PenIcon } from "@solar-icons/react/linear/pen";
import { toast } from "@heroui/react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { agendaKindLabel } from "../../config";
import type { AgendaCandidateInput, AssemblyAgenda, UpdateAgendaInput } from "../../types";
import { AgendaCandidatesTable } from "../../components/AgendaCandidatesTable";
import { AssemblyDetailField } from "../../components/AssemblyDetailField";
import { DeleteConfirmPopoverButton } from "../../components/DeleteConfirmPopoverButton";

type OrganizationsAgendaCardProps = {
  associationId?: string | null;
  agenda: AssemblyAgenda;
  isEditable?: boolean;
  canEditFields?: boolean;
  isDeleteBusy?: boolean;
  isRemovingAgenda?: boolean;
  removingCandidateId?: string | null;
  isAddingCandidate?: boolean;
  onUpdateAgenda?: (agendaId: string, input: UpdateAgendaInput) => void;
  onAddCandidate?: (agendaId: string, candidate: AgendaCandidateInput, onSuccess: () => void) => void;
  onRemoveAgenda?: (agendaId: string, onSuccess: () => void) => void;
  onRemoveCandidate?: (agendaId: string, candidateId: string, onSuccess: () => void) => void;
};

const cardActionClassName =
  "inline-flex size-6 min-w-6 shrink-0 cursor-pointer items-center justify-center rounded-full text-white";
const editorInputClassName =
  "h-9 w-full rounded-xl bg-(--field-muted) px-3 text-sm font-normal text-foreground outline-none";

/** Agenda card for organizations role — same layout as AgendaCard, with card-level edit and delete actions. */
export function OrganizationsAgendaCard({
  associationId,
  agenda,
  isEditable = false,
  canEditFields = false,
  isDeleteBusy = false,
  isRemovingAgenda = false,
  removingCandidateId = null,
  isAddingCandidate = false,
  onUpdateAgenda,
  onAddCandidate,
  onRemoveAgenda,
  onRemoveCandidate,
}: OrganizationsAgendaCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(agenda.title);
  const [draftMaxSelections, setDraftMaxSelections] = useState(String(agenda.minSelections));

  // A closed card always shows the stored values, so cancel discards every draft at once.
  useEffect(() => {
    if (isEditing) return;
    setDraftTitle(agenda.title);
    setDraftMaxSelections(String(agenda.minSelections));
  }, [agenda.minSelections, agenda.title, isEditing]);

  const startEditing = () => {
    setDraftTitle(agenda.title);
    setDraftMaxSelections(String(agenda.minSelections));
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
  };

  const confirmEditing = () => {
    const title = draftTitle.trim();
    const maxSelections = Number(draftMaxSelections);
    if (title.length < 3) {
      toast.danger("عنوان دستور را کامل وارد کنید");
      return;
    }
    if (!Number.isInteger(maxSelections) || maxSelections < 1) {
      toast.danger("حداکثر تعداد انتخاب معتبر نیست");
      return;
    }
    if (title !== agenda.title || maxSelections !== agenda.minSelections) {
      onUpdateAgenda?.(agenda.id, { title, minSelections: maxSelections });
    }
    setIsEditing(false);
  };

  const handleEditorKeyDown = (event: { key: string; preventDefault: () => void }) => {
    if (event.key === "Enter") {
      event.preventDefault();
      confirmEditing();
    }
    if (event.key === "Escape") {
      event.preventDefault();
      cancelEditing();
    }
  };

  return (
    <article className="relative flex flex-col overflow-hidden rounded-[20px] bg-white p-4 shadow-(--box-shadow) sm:p-6 sm:ps-8">
      <span aria-hidden className="absolute inset-y-0 start-0 w-[10px] bg-accent" />

      <div className="relative mb-4">
        {/* Card-level actions stay at the visual left of the card. */}
        <div className="absolute left-0 top-0 z-10 flex items-center gap-1.5">
          {isEditing ? (
            <>
              <button
                type="button"
                aria-label="تأیید ویرایش"
                className={cn(cardActionClassName, "bg-success")}
                onClick={confirmEditing}
              >
                <CheckIcon className="size-3" strokeWidth={2} />
              </button>
              <button
                type="button"
                aria-label="لغو ویرایش"
                className={cn(cardActionClassName, "bg-danger")}
                onClick={cancelEditing}
              >
                <CloseIcon className="size-3" strokeWidth={2} />
              </button>
            </>
          ) : (
            <>
              {canEditFields && (
                <button
                  type="button"
                  aria-label={`ویرایش دستور ${agenda.title}`}
                  className={cn(cardActionClassName, "bg-accent")}
                  onClick={startEditing}
                >
                  <PenIcon className="size-3.5" />
                </button>
              )}
              {isEditable && onRemoveAgenda && (
                <DeleteConfirmPopoverButton
                  label={`حذف دستور ${agenda.title}`}
                  isBusy={isDeleteBusy}
                  isPending={isRemovingAgenda}
                  size="compact"
                  onConfirm={(onSuccess) => onRemoveAgenda(agenda.id, onSuccess)}
                />
              )}
            </>
          )}
        </div>

        <dl
          className={
            isEditable
              ? "mt-6 grid grid-cols-3 gap-x-3 gap-y-5 px-0 sm:mt-3 sm:gap-x-8 sm:px-4 sm:pe-8"
              : "mt-6 grid grid-cols-3 gap-x-3 gap-y-5 px-0 sm:mt-3 sm:gap-x-8 sm:px-4"
          }
        >
          <AssemblyDetailField
            className="col-span-3"
            label="عنوان دستور"
            value={
              isEditing ? (
                <input
                  autoFocus
                  aria-label="عنوان دستور"
                  className={editorInputClassName}
                  value={draftTitle}
                  onChange={(event) => setDraftTitle(event.target.value)}
                  onKeyDown={handleEditorKeyDown}
                />
              ) : (
                agenda.title
              )
            }
          />
          <AssemblyDetailField label="نوع دستور" value={agendaKindLabel[agenda.kind]} />
          <AssemblyDetailField
            className={isEditing ? "mr-auto w-[150px]" : "mr-auto w-[121px]"}
            label="حداکثر تعداد انتخاب"
            value={
              isEditing ? (
                <input
                  aria-label="حداکثر تعداد انتخاب"
                  className={cn(editorInputClassName, "input-ltr-type text-center")}
                  inputMode="numeric"
                  value={draftMaxSelections}
                  onChange={(event) =>
                    setDraftMaxSelections(event.target.value.replace(/\D/g, ""))
                  }
                  onKeyDown={handleEditorKeyDown}
                />
              ) : (
                agenda.minSelections
              )
            }
          />
        </dl>
      </div>

      <AgendaCandidatesTable
        associationId={associationId}
        agenda={agenda}
        isAddingCandidate={isAddingCandidate}
        isDeleteBusy={isDeleteBusy}
        isEditable={isEditable}
        removingCandidateId={removingCandidateId}
        onAddCandidate={
          isEditable && onAddCandidate
            ? (candidate, onSuccess) => onAddCandidate(agenda.id, candidate, onSuccess)
            : undefined
        }
        onRemoveCandidate={
          isEditable && onRemoveCandidate
            ? (candidateId, onSuccess) => onRemoveCandidate(agenda.id, candidateId, onSuccess)
            : undefined
        }
      />
    </article>
  );
}
