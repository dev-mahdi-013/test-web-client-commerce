import { toast } from "@heroui/react";
import { agendaKindLabel } from "../../config";
import type { AgendaCandidateInput, AssemblyAgenda, UpdateAgendaInput } from "../../types";
import { AgendaCandidatesTable } from "../../components/AgendaCandidatesTable";
import { AssemblyDetailField } from "../../components/AssemblyDetailField";
import { DeleteConfirmPopoverButton } from "../../components/DeleteConfirmPopoverButton";
import { AgendaInlineEditField } from "./AgendaInlineEditField";

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

/** Agenda card for organizations role — same layout as AgendaCard, with delete actions. */
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
  return (
    <article className="relative flex flex-col overflow-hidden rounded-[20px] bg-white p-4 shadow-(--box-shadow) sm:p-6 sm:ps-8">
      <span aria-hidden className="absolute inset-y-0 start-0 w-[10px] bg-accent" />

      <div className="relative mb-4">
        {isEditable && onRemoveAgenda && (
          <div className="absolute left-0 top-0 z-10">
            <DeleteConfirmPopoverButton
              label={`حذف دستور ${agenda.title}`}
              isBusy={isDeleteBusy}
              isPending={isRemovingAgenda}
              size="compact"
              onConfirm={(onSuccess) => onRemoveAgenda(agenda.id, onSuccess)}
            />
          </div>
        )}
        <dl
          className={
            isEditable
              ? "mt-6 grid grid-cols-3 gap-x-3 gap-y-5 px-0 sm:mt-3 sm:gap-x-8 sm:px-4 sm:pe-8"
              : "mt-6 grid grid-cols-3 gap-x-3 gap-y-5 px-0 sm:mt-3 sm:gap-x-8 sm:px-4"
          }
        >
          <AgendaInlineEditField
            accessibleName="عنوان دستور"
            className="col-span-3"
            editor={{ type: "text" }}
            isEditable={canEditFields}
            label="عنوان دستور"
            valueMinWidth={207}
            value={agenda.title}
            onSave={(value) => {
              const title = value.trim();
              if (title.length < 3) {
                toast.danger("عنوان دستور را کامل وارد کنید");
                return false;
              }
              if (title !== agenda.title) onUpdateAgenda?.(agenda.id, { title });
              return true;
            }}
          />
          <AssemblyDetailField label="نوع دستور" value={agendaKindLabel[agenda.kind]} />
          <AgendaInlineEditField
            accessibleName="حداکثر تعداد انتخاب"
            className={canEditFields ? "mr-auto" : "mr-auto w-[121px]"}
            editor={{ type: "number" }}
            isEditable={canEditFields}
            label="حداکثر تعداد انتخاب"
            valueMinWidth={118}
            value={String(agenda.minSelections)}
            onSave={(value) => {
              const minSelections = Number(value);
              if (!Number.isInteger(minSelections) || minSelections < 1) {
                toast.danger("حداکثر تعداد انتخاب معتبر نیست");
                return false;
              }
              if (minSelections !== agenda.minSelections) {
                onUpdateAgenda?.(agenda.id, { minSelections });
              }
              return true;
            }}
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
