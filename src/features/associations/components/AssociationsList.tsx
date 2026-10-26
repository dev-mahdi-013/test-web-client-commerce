import { PenIcon } from "@solar-icons/react/linear/pen";
import { Spinner, Table, toast } from "@heroui/react";
import {
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { cn } from "@/lib/cn";
import { formatJalali } from "@/lib/date";
import { getErrorMessage } from "@/lib/http";
import { InlineEditControl } from "@/shared/components/InlineEditControl";
import { InlineSelectEdit } from "@/shared/components/InlineSelectEdit";
import type { SelectFieldOption } from "@/shared/components/SelectField";
import { selectableRowClassName, singleSelectionProps } from "@/shared/components/tableSelection";
import type { Association, AssociationDraft, AssociationMember } from "../types";
import { useAllAssociationMembers } from "../hooks/useAssociations";
import { InlineDatePicker } from "./InlineDatePicker";

type AssociationsListProps = {
  associations: Association[];
  selectedId: string | null;
  startIndex: number;
  isLoading: boolean;
  isSaving: boolean;
  canEdit: boolean;
  onSave: (id: string, draft: AssociationDraft, onSuccess: () => void) => void;
  onChangeBoss: (associationId: string, member: AssociationMember, onSuccess: () => void) => void;
  onSelect: (id: string) => void;
};

type EditField = "name" | "foundedAt" | "presidentName";

const MIN_NAME_LENGTH = 3;

const headerCellClassName = "text-start text-xs font-normal text-muted";
const cellClassName = "text-sm whitespace-nowrap";
function stopRowPress(event: MouseEvent | ReactPointerEvent) {
  event.stopPropagation();
}

function nameLabel(name: string | null) {
  return name ?? "------";
}

function toDraft(association: Association): AssociationDraft {
  return {
    name: association.name,
    foundedAt: association.foundedAt ? formatJalali(association.foundedAt) : "",
  };
}

function memberOptions(members: AssociationMember[]): SelectFieldOption[] {
  return members.map((member) => ({ value: member.id, label: member.fullName }));
}

/** Match `presidentId` / name to the composite `memberId.memberRoleId` option value. */
function presidentOptionValue(association: Association, members: AssociationMember[]) {
  if (association.presidentId) {
    const byId = members.find((member) => member.id.split(".")[0] === association.presidentId);
    if (byId) return byId.id;
  }
  if (association.presidentName) {
    const byName = members.find((member) => member.fullName === association.presidentName);
    if (byName) return byName.id;
  }
  return members[0]?.id ?? "";
}

function PencilButton({
  label,
  onEdit,
  isDisabled = false,
}: {
  label: string;
  onEdit: () => void;
  isDisabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        "inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-accent text-white",
        isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
      )}
      disabled={isDisabled}
      onPointerDown={stopRowPress}
      onClick={(event) => {
        stopRowPress(event);
        onEdit();
      }}
    >
      <PenIcon className=" size-3.5" />
    </button>
  );
}

export function AssociationsTable({
  associations,
  selectedId,
  isLoading,
  isSaving,
  canEdit,
  onSave,
  onChangeBoss,
  onSelect,
}: AssociationsListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<EditField | null>(null);
  const [draft, setDraft] = useState<AssociationDraft>({ name: "", foundedAt: "" });
  const [presidentDraft, setPresidentDraft] = useState("");
  const editorRef = useRef<HTMLDivElement>(null);
  const editAssociationId = editingField === "presidentName" ? editingId : null;
  const editMembersQuery = useAllAssociationMembers(editAssociationId);
  const editMembers = editMembersQuery.data ?? [];

  const startEdit = (association: Association, field: EditField) => {
    if (isSaving) return;
    setDraft(toDraft(association));
    setEditingId(association.id);
    setEditingField(field);
    if (field === "presidentName") {
      setPresidentDraft("");
    }
  };

  useEffect(() => {
    // Wait for the refetch that starts when the picker opens, so the draft is not built from the cached list.
    if (editingField !== "presidentName" || !editingId || editMembersQuery.isFetching) return;
    if (editMembersQuery.isError) return;
    if (editMembers.length === 0) {
      toast.danger("عضوی برای انتخاب نیست");
      closeEdit();
      return;
    }
    const association = associations.find((item) => item.id === editingId);
    if (!association) return;
    setPresidentDraft((current) => current || presidentOptionValue(association, editMembers));
  }, [
    associations,
    editMembers,
    editMembersQuery.isError,
    editMembersQuery.isFetching,
    editingField,
    editingId,
  ]);

  const closeEdit = () => {
    setEditingId(null);
    setEditingField(null);
  };

  const cancelEdit = () => {
    if (isSaving) return;
    closeEdit();
  };

  useEffect(() => {
    if (editingField !== "name" || isSaving) return;

    const closeOnOutsidePointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !editorRef.current?.contains(event.target)) {
        closeEdit();
      }
    };

    document.addEventListener("pointerdown", closeOnOutsidePointerDown, true);
    return () => document.removeEventListener("pointerdown", closeOnOutsidePointerDown, true);
  }, [editingField, isSaving]);

  const confirmEdit = (association: Association) => {
    if (isSaving) return;
    const name = draft.name.trim();
    if (name.length < MIN_NAME_LENGTH) {
      toast.danger("نام انجمن را کامل وارد کنید");
      return;
    }
    onSave(association.id, { ...draft, name }, closeEdit);
  };

  const saveDate = (association: Association, foundedAt: string) => {
    if (isSaving) return;
    const next = { ...toDraft(association), ...draft, foundedAt };
    onSave(
      association.id,
      { ...next, name: next.name.trim() || association.name },
      closeEdit,
    );
  };

  const saveBoss = (association: Association) => {
    if (isSaving || editMembersQuery.isFetching) return;
    if (editMembersQuery.isError) {
      toast.danger(getErrorMessage(editMembersQuery.error, "دریافت اعضای انجمن انجام نشد"));
      return;
    }
    if (!presidentDraft) {
      toast.danger("رئیس انجمن را انتخاب کنید");
      return;
    }
    const member = editMembers.find((item) => item.id === presidentDraft);
    if (!member) {
      toast.danger("این شخص عضو انجمن نیست");
      return;
    }
    if (member.id.split(".")[0] === association.presidentId) {
      closeEdit();
      return;
    }
    onChangeBoss(association.id, member, closeEdit);
  };

  // Include the open field on the row so the table collection re-renders that cell.
  const rows = associations.map((association) => ({
    ...association,
    editingField: editingId === association.id ? editingField : null,
  }));

  return (
    <>
      <Table className="flex  flex-1 flex-col bg-transparent p-0">
        <Table.ScrollContainer className=" flex-1 overflow-y-auto">
          <Table.Content
            aria-label="انجمن ها"
            className="min-w-[760px]"
            {...singleSelectionProps(selectedId, onSelect)}
          >
            <Table.Header className="sticky top-0 z-10">
              <Table.Column isRowHeader className={headerCellClassName}>
                نام انجمن
              </Table.Column>
              <Table.Column className={headerCellClassName}>تاریخ تأسیس</Table.Column>
              <Table.Column className={headerCellClassName}>تاریخ آخرین انجمن</Table.Column>
              <Table.Column className={headerCellClassName}>رئیس</Table.Column>
              <Table.Column className={headerCellClassName}>دبیر</Table.Column>
            </Table.Header>
            <Table.Body
              items={rows}
              renderEmptyState={() => (
                <div className="flex h-40 items-center justify-center text-sm text-muted">
                  {isLoading ? <Spinner size="sm" /> : "انجمنی پیدا نشد"}
                </div>
              )}
            >
              {(association) => {
                const field = association.editingField;

                return (
                  <Table.Row id={association.id} className={selectableRowClassName}>
                    <Table.Cell className={cn("py-4", cellClassName)}>
                      {field === "name" ? (
                        <div className="flex items-center gap-2">
                          <InlineEditControl
                            className={cn("w-[300px]", isSaving && "pointer-events-none opacity-60")}
                            editorRef={editorRef}
                            autoFocus
                            handleKeyboard={false}
                            isOpen
                            inputClassName="text-sm"
                            placeholder="نام انجمن"
                            stopPropagation
                            value={draft.name}
                            onCancel={cancelEdit}
                            onChange={(name) => setDraft((current) => ({ ...current, name }))}
                            onConfirm={() => confirmEdit(association)}
                          />
                          {isSaving && <Spinner size="sm" />}
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-2">
                          {canEdit && (
                            <PencilButton
                              label={`ویرایش نام ${association.name}`}
                              onEdit={() => startEdit(association, "name")}
                            />
                          )}
                          <span>{association.name}</span>
                        </span>
                      )}
                    </Table.Cell>

                    <Table.Cell className={cellClassName}>
                      {field === "foundedAt" ? (
                        <div className={cn(isSaving && "pointer-events-none opacity-60")} onPointerDown={stopRowPress}>
                          <InlineDatePicker
                            autoOpen
                            label="تاریخ تأسیس"
                            value={draft.foundedAt}
                            onCancel={cancelEdit}
                            onChange={(foundedAt) => saveDate(association, foundedAt)}
                          />
                          {isSaving && <Spinner className="ms-2 inline-flex" size="sm" />}
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-2">
                          {canEdit && (
                            <PencilButton
                              label={`ویرایش تاریخ ${association.name}`}
                              onEdit={() => startEdit(association, "foundedAt")}
                            />
                          )}
                          <span dir="ltr">{formatJalali(association.foundedAt)}</span>
                        </span>
                      )}
                    </Table.Cell>

                    <Table.Cell className={cellClassName}>
                      <span dir="ltr">{formatJalali(association.lastMeetingAt)}</span>
                    </Table.Cell>

                    <Table.Cell className={cellClassName}>
                      <div className="flex items-center gap-2">
                        {field === "presidentName" && editMembersQuery.isLoading ? (
                          <Spinner size="sm" />
                        ) : field === "presidentName" && editMembersQuery.isError ? (
                          <span className="max-w-48 text-xs text-danger">
                            {getErrorMessage(editMembersQuery.error, "دریافت اعضای انجمن انجام نشد")}
                          </span>
                        ) : (
                          <InlineSelectEdit
                            accessibleName="رئیس انجمن"
                            canEdit={canEdit}
                            className="w-[220px]"
                            displayValue={
                              <span className={cn(!association.presidentName && "text-muted")}>
                                {nameLabel(association.presidentName)}
                              </span>
                            }
                            editLabel={`ویرایش رئیس ${association.name}`}
                            isDisabled={isSaving}
                            isEditing={field === "presidentName" && editMembers.length > 0}
                            options={memberOptions(editMembers)}
                            selectPopoverClassName="max-sm:!w-[240px]"
                            value={presidentDraft}
                            onCancel={cancelEdit}
                            onChange={setPresidentDraft}
                            onConfirm={() => saveBoss(association)}
                            onStartEdit={() => startEdit(association, "presidentName")}
                          />
                        )}
                        {isSaving && field === "presidentName" ? <Spinner size="sm" /> : null}
                      </div>
                    </Table.Cell>

                    <Table.Cell className={cn(cellClassName, !association.secretaryName && "text-muted")}>
                      {nameLabel(association.secretaryName)}
                    </Table.Cell>
                  </Table.Row>
                );
              }}
            </Table.Body>
            </Table.Content>
        </Table.ScrollContainer>
      </Table>
    </>
  );
}
