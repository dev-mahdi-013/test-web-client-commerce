import { Table } from "@heroui/react";
import type { ReactNode } from "react";
import type { AgendaCandidateInput, AssemblyAgenda } from "../types";
import { AgendaCandidateAddField } from "./AgendaCandidateAddField";
import { DeleteConfirmPopoverButton } from "./DeleteConfirmPopoverButton";

type AgendaCandidatesTableProps = {
  associationId?: string | null;
  agenda: AssemblyAgenda;
  isEditable?: boolean;
  isDeleteBusy?: boolean;
  removingCandidateId?: string | null;
  isAddingCandidate?: boolean;
  onAddCandidate?: (candidate: AgendaCandidateInput, onSuccess: () => void) => void;
  onRemoveCandidate?: (candidateId: string, onSuccess: () => void) => void;
  /** Optional leading cell (e.g. selection control) for each candidate row. */
  renderLeadingCell?: (candidateId: string) => ReactNode;
};

const headerClassName = "bg-(--panel-cards) text-start text-xs font-normal text-muted after:hidden";
const bodyClassName =
  "bg-(--background) [&_tr:first-child>td:first-child]:!rounded-ss-[10px] [&_tr:first-child>td:last-child]:!rounded-se-[10px] [&_tr:last-child>td:first-child]:!rounded-es-[10px] [&_tr:last-child>td:last-child]:!rounded-ee-[10px]";
const cellClassName =
  "border-b border-(--panel-cards) bg-(--background) py-3.5 text-sm font-normal whitespace-nowrap";

type TableRow =
  | { id: string; rowType: "add" }
  | {
      id: string;
      rowType: "candidate";
      name: string;
      cardNo: string | null;
      voterCount: number;
      voteCount: number;
      rowNumber: number;
    };

/** Shared candidates table with optional name + plus add row. */
export function AgendaCandidatesTable({
  associationId,
  agenda,
  isEditable = false,
  isDeleteBusy = false,
  removingCandidateId = null,
  isAddingCandidate = false,
  onAddCandidate,
  onRemoveCandidate,
  renderLeadingCell,
}: AgendaCandidatesTableProps) {
  const isPerson = agenda.kind === "person";
  const showAddRow = isEditable && Boolean(onAddCandidate);
  const showActions = isEditable && Boolean(onRemoveCandidate);

  const candidateRows: TableRow[] = agenda.candidates.map((candidate, index) => ({
    ...candidate,
    rowType: "candidate" as const,
    rowNumber: index + 1,
  }));

  const tableRows: TableRow[] = showAddRow
    ? [{ id: `${agenda.id}-add-candidate`, rowType: "add" }, ...candidateRows]
    : candidateRows;

  const columnCount =
    (showActions || Boolean(renderLeadingCell) ? 1 : 0) + 1 + (isPerson ? 1 : 0) + 2;

  return (
    <Table className="bg-transparent p-0" variant="secondary">
      <Table.ScrollContainer className="overflow-x-auto">
        <Table.Content
          aria-label={`کاندیداهای ${agenda.title}`}
          className={isPerson ? "min-w-[520px]" : "min-w-[400px]"}
        >
          <Table.Header>
            {(showActions || renderLeadingCell) && (
              <Table.Column className={`${headerClassName} w-16 text-center`}>
                {showActions ? "عملیات" : ""}
              </Table.Column>
            )}
            <Table.Column isRowHeader className={headerClassName}>
              نام و نام خانوادگی
            </Table.Column>
            {isPerson && <Table.Column className={headerClassName}>شماره کارت</Table.Column>}
            <Table.Column className={headerClassName}>رأی‌دهندگان</Table.Column>
            <Table.Column className={headerClassName}>آرای جمع شده</Table.Column>
          </Table.Header>
          <Table.Body
            className={bodyClassName}
            items={tableRows}
            renderEmptyState={() => (
              <div className="flex h-24 items-center justify-center text-sm text-muted">
                کاندیدایی ثبت نشده است
              </div>
            )}
          >
            {(row) => (
              <Table.Row id={row.id}>
                {row.rowType === "add" ? (
                  <Table.Cell
                    colSpan={columnCount}
                    className="border-(--panel-cards) !bg-transparent px-0 py-2"
                  >
                    <AgendaCandidateAddField
                      associationId={associationId}
                      isMember={isPerson}
                      existingNames={agenda.candidates.map((candidate) => candidate.name)}
                      existingIds={agenda.candidates.map((candidate) => candidate.id)}
                      existingMemberIds={agenda.candidates.flatMap((candidate) =>
                        candidate.memberId ? [candidate.memberId] : [],
                      )}
                      isPending={isAddingCandidate}
                      onAdd={(candidate, onSuccess) => onAddCandidate?.(candidate, onSuccess)}
                    />
                  </Table.Cell>
                ) : (
                  <>
                    {showActions && (
                      <Table.Cell className={`${cellClassName} text-center`}>
                        <DeleteConfirmPopoverButton
                          label={`حذف ${row.name}`}
                          isBusy={isDeleteBusy}
                          isPending={removingCandidateId === row.id}
                          size="compact"
                          onConfirm={(onSuccess) => onRemoveCandidate?.(row.id, onSuccess)}
                        />
                      </Table.Cell>
                    )}
                    {renderLeadingCell && !showActions && (
                      <Table.Cell className={`${cellClassName} text-center`}>
                        {renderLeadingCell(row.id)}
                      </Table.Cell>
                    )}
                    <Table.Cell className={`${cellClassName} font-bold`}>
                      {row.rowNumber}. {row.name}
                    </Table.Cell>
                    {isPerson && (
                      <Table.Cell className={cellClassName}>
                        <span dir="ltr">{row.cardNo ?? "------"}</span>
                      </Table.Cell>
                    )}
                    <Table.Cell className={cellClassName}>
                      <span dir="ltr">{row.voterCount}</span>
                    </Table.Cell>
                    <Table.Cell className={cellClassName}>
                      <span dir="ltr">{row.voteCount}</span>
                    </Table.Cell>
                  </>
                )}
              </Table.Row>
            )}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  );
}
