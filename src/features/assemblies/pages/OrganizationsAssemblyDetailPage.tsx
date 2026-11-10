import { Spinner, toast } from "@heroui/react";
import { useMemo, useState } from "react";
import { useParams } from "react-router";
import { getErrorMessage } from "@/lib/http";
import { SectionHeading } from "@/shared/components/SectionHeading";
import { useHeaderActions } from "@/shared/hooks/useHeaderActions";
import { AssemblySummaryCard } from "../components/AssemblySummaryCard";
import { VotersRingCard } from "../components/VotersRingCard";
import { organizationsStatusMeta } from "../config";
import { useAssembly } from "../hooks/useAssemblies";
import { useAssemblyOwnerCheck } from "../hooks/useAssemblyOwnerCheck";
import {
  useAddAgenda,
  useAddAgendaCandidate,
  useRemoveAgenda,
  useRemoveAgendaCandidate,
  useUpdateAgenda,
  useUpdateAssemblyStatus,
} from "../hooks/useAssemblyMutations";
import { AddAgendaForm } from "../organizations/components/AddAgendaForm";
import { AssemblyHeaderActions } from "../organizations/components/AssemblyHeaderActions";
import { IssueSlipModal } from "../organizations/components/IssueSlipModal";
import { OrganizationsAgendaCard } from "../organizations/components/OrganizationsAgendaCard";

/** Assembly detail for the organizations (امور تشکل‌ها) role. */
export function OrganizationsAssemblyDetailPage() {
  const { assemblyId = "" } = useParams();
  const assembly = useAssembly(assemblyId || null);
  const detail = assembly.data;
  const updateStatus = useUpdateAssemblyStatus();
  const addAgenda = useAddAgenda(assemblyId);
  const removeAgenda = useRemoveAgenda(assemblyId);
  const removeCandidate = useRemoveAgendaCandidate(assemblyId);
  const updateAgenda = useUpdateAgenda(assemblyId);
  const addCandidate = useAddAgendaCandidate(assemblyId);
  const [isSlipOpen, setSlipOpen] = useState(false);

  const statusBusy = updateStatus.isPending;

  const isOwner = useAssemblyOwnerCheck();
  const isCreatedByCurrentUser = detail ? isOwner(detail) : false;

  const headerActions = useMemo(() => {
    if (!detail) return null;
    // The service only issues QR auth letters for approved polls that can start voting.
    const canIssueSlip =
      isCreatedByCurrentUser &&
      (detail.status === "published" || detail.status === "running");
    return (
      <AssemblyHeaderActions
        hasAgendas={detail.agendas.length > 0}
        isCreatedByCurrentUser={isCreatedByCurrentUser}
        isPending={statusBusy}
        status={detail.status}
        onIssueSlip={canIssueSlip ? () => setSlipOpen(true) : undefined}
        onEnd={() => {
          updateStatus.mutate(
            { assemblyId: detail.id, status: "finished" },
            { onSuccess: () => toast.success("مجمع پایان یافت") },
          );
        }}
        onStart={() => {
          const nextStatus =
            detail.status === "pending"
              ? "canceled"
              : detail.status === "canceled"
                ? "published"
                : "running";
          updateStatus.mutate(
            { assemblyId: detail.id, status: nextStatus },
            {
              onSuccess: (updatedAssembly) => {
                if (updatedAssembly?.status === "canceled") {
                  toast.success("مجمع برای بازبینی ارسال شد");
                } else if (updatedAssembly?.status === "published") {
                  toast.success("مجمع تأیید شد");
                } else if (updatedAssembly?.status === "running") {
                  toast.success("مجمع شروع شد");
                }
              },
            },
          );
        }}
      />
    );
  }, [detail, isCreatedByCurrentUser, statusBusy, updateStatus]);

  useHeaderActions(headerActions);

  if (assembly.isPending) {
    return (
      <div className="flex h-60 items-center justify-center rounded-[28px] bg-(--panel)">
        <Spinner size="sm" />
      </div>
    );
  }

  if (assembly.isError) {
    return (
      <p className="flex h-60 items-center justify-center rounded-[28px] bg-(--panel) text-sm text-muted">
        {getErrorMessage(assembly.error, "دریافت اطلاعات مجمع انجام نشد")}
      </p>
    );
  }

  if (!detail) {
    return (
      <p className="flex h-60 items-center justify-center rounded-[28px] bg-(--panel) text-sm text-muted">
        مجمعی پیدا نشد
      </p>
    );
  }

  // Add-agenda box, edit pencil and delete icons: only for the owner, and only
  // in "پیش‌نویس" (pending) and "در انتظار" (published).
  const canManageAgenda =
    isCreatedByCurrentUser && (detail.status === "pending" || detail.status === "published");
  const canEditAgendaFields = canManageAgenda;
  const canAddAgenda = canManageAgenda;

  return (
    <div className="flex flex-col gap-6 rounded-3xl bg-(--panel-cards) px-4 py-5 sm:px-6 xl:px-10">
      <section aria-label="اطلاعات عمومی مجمع" className="flex flex-col gap-4">
        <SectionHeading className="lg:text-base">اطلاعات عمومی مجمع</SectionHeading>
        <div className="flex flex-col gap-3 xl:flex-row xl:items-stretch xl:gap-6">
          <AssemblySummaryCard
            assembly={detail}
            statusLabel={organizationsStatusMeta[detail.status].label}
          />
          <VotersRingCard
            className="w-full rounded-[20px] bg-white px-4 py-5 shadow-(--box-shadow) sm:px-6 xl:w-auto xl:min-h-[184px] xl:shrink-0 xl:rounded-[16px] xl:px-8"
            voters={detail.voterStats}
          />
        </div>
      </section>

      <section aria-label="دستورهای مجمع" className="flex flex-col gap-4">
        <SectionHeading className="lg:text-base">دستورهای مجمع</SectionHeading>
        {canAddAgenda && (
          <>
            <h3 className="text-right text-sm font-medium text-foreground">افزودن دستور</h3>
            <AddAgendaForm
              assemblyUnit={detail.unit}
              isPending={addAgenda.isPending}
              onSubmit={(input) => {
                addAgenda.mutate(input);
              }}
            />
          </>
        )}
        <div className="grid gap-3 xl:grid-cols-2 2xl:gap-6">
          {detail.agendas.map((agenda) => (
            <OrganizationsAgendaCard
              key={agenda.id}
              associationId={detail.associationId}
              agenda={agenda}
              canEditFields={canEditAgendaFields}
              isDeleteBusy={removeAgenda.isPending || removeCandidate.isPending}
              isRemovingAgenda={removeAgenda.isPending && removeAgenda.variables === agenda.id}
              removingCandidateId={
                removeCandidate.isPending && removeCandidate.variables.agendaId === agenda.id
                  ? removeCandidate.variables.candidateId
                  : null
              }
              isAddingCandidate={addCandidate.isPending && addCandidate.variables.agendaId === agenda.id}
              isEditable={canManageAgenda}
              onRemoveAgenda={(agendaId, onSuccess) =>
                removeAgenda.mutate(agendaId, { onSuccess })
              }
              onUpdateAgenda={(agendaId, input) => updateAgenda.mutate({ agendaId, input })}
              onAddCandidate={(agendaId, candidate, onSuccess) =>
                addCandidate.mutate({ agendaId, candidate }, { onSuccess })
              }
              onRemoveCandidate={(agendaId, candidateId, onSuccess) =>
                removeCandidate.mutate({ agendaId, candidateId }, { onSuccess })
              }
            />
          ))}
        </div>
      </section>

      <IssueSlipModal
        assemblyId={detail.id}
        isOpen={isSlipOpen}
        onOpenChange={setSlipOpen}
      />
    </div>
  );
}
