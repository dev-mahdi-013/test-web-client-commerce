import { EyeIcon } from "@solar-icons/react/linear/eye";
import { CheckIcon } from "@solar-icons/react/linear/check";
import { CloseIcon } from "@solar-icons/react/linear/close";
import { PenIcon } from "@solar-icons/react/linear/pen";
import { Checkbox, Spinner, Table, toast } from "@heroui/react";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { InlineDatePicker } from "@/features/associations/components/InlineDatePicker";
import { cn } from "@/lib/cn";
import { formatJalali } from "@/lib/date";
import { SelectField } from "@/shared/components/SelectField";
import { TruncatedText } from "@/shared/components/TruncatedText";
import { AssemblyStatsColumnHeader, AssemblyStatsValue } from "../../components/AssemblyStatsValue";
import { AssemblyStatusBadge } from "../../components/AssemblyStatusBadge";
import {
  ASSEMBLY_CREATED_BY_MAX_CHARS,
  ASSEMBLY_TITLE_MAX_CHARS,
  assemblyCardTypeOptions,
  assemblyCreationUnitOptions,
  organizationsStatusMeta,
  isChamberCreator,
} from "../../config";
import { useUpdateAssemblyFields } from "../../hooks/useAssemblyMutations";
import { useAssemblyOwnerCheck } from "../../hooks/useAssemblyOwnerCheck";
import type { Assembly, AssemblyCardType, AssemblyUnit } from "../../types";
import { DeleteAssemblyButton } from "./DeleteAssemblyButton";

type OrganizationsAssembliesTableProps = {
  assemblies: Assembly[];
  startIndex: number;
  isLoading: boolean;
  /** Base path for the detail page, without trailing slash. */
  detailBasePath?: string;
  /** Show the delete icon in the actions column. */
  showDelete?: boolean;
  /** Hide the edit pencils on rows whose توسط is the chamber (association head/secretary only). */
  hideChamberPencils?: boolean;
  /** Blur the rest of the page while a row is edited (focus mode). Off unless a page opts in. */
  showEditBackdrop?: boolean;
};

const MIN_TITLE_LENGTH = 3;
const headerCellClassName = "text-start text-xs font-normal text-muted whitespace-nowrap";
const cellClassName = "text-sm whitespace-nowrap";
const editorInputClassName =
  "h-9 w-full rounded-xl bg-(--field-muted) px-3 text-sm font-normal text-foreground outline-none";
const actionButtonClassName =
  "inline-flex size-8 min-w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-white";

function stopRowPress(event: { stopPropagation: () => void }) {
  event.stopPropagation();
}

/** One circular icon button of the actions column. */
function RowActionButton({
  label,
  className,
  children,
  onPress,
}: {
  label: string;
  className: string;
  children: ReactNode;
  onPress: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(actionButtonClassName, className)}
      onPointerDown={stopRowPress}
      onClick={(event) => {
        stopRowPress(event);
        onPress();
      }}
    >
      {children}
    </button>
  );
}

function draftDateOf(assembly: Assembly) {
  return assembly.newsDate ? formatJalali(assembly.newsDate) : "";
}

export function OrganizationsAssembliesTable({
  assemblies,
  startIndex,
  isLoading,
  detailBasePath = "/organizations/assemblies",
  showDelete = true,
  hideChamberPencils = false,
  showEditBackdrop = false,
}: OrganizationsAssembliesTableProps) {
  const updateFields = useUpdateAssemblyFields();
  const isOwner = useAssemblyOwnerCheck();
  // The whole row is edited at once, so one draft set covers title, نوع کارت, واجدین and روز مجمع.
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftNewsDate, setDraftNewsDate] = useState("");
  const [draftUnit, setDraftUnit] = useState<AssemblyUnit>("حقیقی");
  const [draftCardType, setDraftCardType] = useState<AssemblyCardType>("همه");
  const [draftAllowOnlineVoting, setDraftAllowOnlineVoting] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Assembly | null>(null);

  const cancelEdit = () => setEditingId(null);

  // The edit controls widen the row, so pull it into view to keep the whole row (including ✓/✕) visible.
  const editingRowRef = useRef<HTMLTableRowElement | null>(null);
  useEffect(() => {
    if (!editingId) return;
    const frame = requestAnimationFrame(() => {
      editingRowRef.current?.scrollIntoView({ block: "nearest", inline: "nearest" });
    });
    return () => cancelAnimationFrame(frame);
  }, [editingId]);

  const startEdit = (assembly: Assembly) => {
    setEditingId(assembly.id);
    setDraftTitle(assembly.title);
    setDraftNewsDate(draftDateOf(assembly));
    setDraftUnit(assembly.unit);
    setDraftCardType(assembly.cardType);
    setDraftAllowOnlineVoting(assembly.allowOnlineVoting);
  };

  const confirmEdit = (assembly: Assembly) => {
    const title = draftTitle.trim();
    if (title.length < MIN_TITLE_LENGTH) {
      toast.danger("نام مجمع را کامل وارد کنید");
      return;
    }
    if (title.length > ASSEMBLY_TITLE_MAX_CHARS) {
      toast.danger(`عنوان مجمع حداکثر ${ASSEMBLY_TITLE_MAX_CHARS} کاراکتر است`);
      return;
    }

    const hasChanges =
      title !== assembly.title ||
      draftUnit !== assembly.unit ||
      draftCardType !== assembly.cardType ||
      draftAllowOnlineVoting !== assembly.allowOnlineVoting ||
      draftNewsDate !== draftDateOf(assembly);
    if (!hasChanges) {
      cancelEdit();
      return;
    }

    updateFields.mutate(
      {
        assemblyId: assembly.id,
        title,
        votingDay: draftNewsDate || undefined,
        unit: draftUnit,
        cardType: draftCardType,
        allowOnlineVoting: draftAllowOnlineVoting,
      },
      { onSuccess: () => cancelEdit() },
    );
  };

  const handleEditorKeyDown = (event: { key: string; preventDefault: () => void }, assembly: Assembly) => {
    if (event.key === "Enter") {
      event.preventDefault();
      confirmEdit(assembly);
    }
    if (event.key === "Escape") {
      event.preventDefault();
      cancelEdit();
    }
  };

  const rows = assemblies.map((assembly, index) => ({
    ...assembly,
    rowNumber: startIndex + index,
    isEditing: editingId === assembly.id,
  }));

  return (
    <>
      {/* Optional focus mode: everything except the row being edited goes behind a blur. */}
      {showEditBackdrop && editingId !== null && (
        <div
          aria-hidden
          className="animate-fade-in pointer-events-none fixed inset-0 z-[calc(var(--z-index-overlay)-1)] bg-black/60 backdrop-blur-md"
        />
      )}
      {/* The card sits above the blur while editing, so its vertical/horizontal scrollbars stay sharp and draggable. */}
      <div
        className={cn(
          "flex w-full max-w-full flex-1 flex-col overflow-hidden rounded-[20px] bg-white",
          showEditBackdrop && editingId !== null && "relative z-[var(--z-index-overlay)]",
        )}
      >
        <Table className="relative flex w-full flex-1 flex-col overflow-hidden bg-transparent p-0">
          <Table.ScrollContainer className="absolute inset-0 overflow-auto">
            <Table.Content aria-label="لیست مجامع" className="w-[1400px] bg-transparent">
              <Table.Header className="sticky top-0 z-10">
                <Table.Column className={headerCellClassName} isRowHeader>
                  عنوان
                </Table.Column>
                <Table.Column className={headerCellClassName}>وضعیت</Table.Column>
                <Table.Column className={headerCellClassName}>تارگت</Table.Column>
                <Table.Column className={headerCellClassName}>نوع کارت</Table.Column>
                <Table.Column className={headerCellClassName}>رأی‌گیری آنلاین</Table.Column>
                <Table.Column className={headerCellClassName}>توسط</Table.Column>
                <Table.Column className={headerCellClassName}>تاریخ ثبت</Table.Column>
                <Table.Column className={headerCellClassName}>روز مجمع</Table.Column>
                <Table.Column className={headerCellClassName}>زمان شروع</Table.Column>
                <Table.Column className={headerCellClassName}>زمان پایان</Table.Column>
                <Table.Column className={`${headerCellClassName} min-w-[200px] text-center`}>
                  <AssemblyStatsColumnHeader />
                </Table.Column>
                <Table.Column className={`${headerCellClassName} w-32 text-center`}>عملیات</Table.Column>
              </Table.Header>
              <Table.Body
                items={rows}
                renderEmptyState={() => (
                  <div className="flex h-40 items-center justify-center text-sm text-muted">
                    {isLoading ? <Spinner size="sm" /> : "مجمعی پیدا نشد"}
                  </div>
                )}
              >
                {(assembly) => {
                  const canEdit = isOwner(assembly);
                  // Running and finished votes can no longer be edited: their pencil keeps its space but is invisible.
                  const isLocked = assembly.status === "running" || assembly.status === "finished";
                  const chamberLocked = hideChamberPencils && isChamberCreator(assembly.createdBy);
                  const canEditPencil = canEdit && !isLocked && !chamberLocked;
                  // Chamber-created rows (توسط اتاق) never show delete for association roles.
                  const canDelete = showDelete && !chamberLocked;
                  const isEditing = assembly.isEditing;

                  return (
                    <Table.Row
                      ref={isEditing ? editingRowRef : undefined}
                      className={cn(
                        // Focus mode keeps the edited row and the table scrollbars sharp; other rows fade out.
                        showEditBackdrop &&
                          editingId !== null &&
                          !isEditing &&
                          "[&>td]:opacity-40 [&>td]:blur-[1.5px]",
                        showEditBackdrop &&
                          isEditing &&
                          "relative z-[var(--z-index-overlay)] [&>*]:bg-white",
                      )}
                      id={assembly.id}
                    >
                      <Table.Cell className={`${cellClassName} py-4`}>
                        <span className="inline-flex items-center gap-1">
                          <span>{assembly.rowNumber}.</span>
                          {isEditing ? (
                            <input
                              autoFocus
                              aria-label={`ویرایش عنوان ${assembly.title}`}
                              className={cn(editorInputClassName, "w-[172px]")}
                              maxLength={ASSEMBLY_TITLE_MAX_CHARS}
                              value={draftTitle}
                              onChange={(event) => setDraftTitle(event.target.value)}
                              onKeyDown={(event) => handleEditorKeyDown(event, assembly)}
                              onPointerDown={stopRowPress}
                            />
                          ) : (
                            <TruncatedText maxChars={ASSEMBLY_TITLE_MAX_CHARS} value={assembly.title} />
                          )}
                        </span>
                      </Table.Cell>
                      <Table.Cell>
                        <AssemblyStatusBadge
                          label={organizationsStatusMeta[assembly.status].label}
                          status={assembly.status}
                        />
                      </Table.Cell>
                      <Table.Cell className={cellClassName}>{assembly.association}</Table.Cell>
                      <Table.Cell className={cellClassName}>
                        {isEditing ? (<span className="inline-block w-[104px]"
                            onPointerDown={stopRowPress}
                          >
                            <SelectField
                              className="h-9 rounded-xl bg-(--field-muted) text-sm shadow-none"
                              label="نوع کارت"
                              options={assemblyCardTypeOptions}
                              popoverClassName="max-sm:!w-[140px]"
                              value={draftCardType}
                              onChange={(value) => setDraftCardType(value as AssemblyCardType)}
                            />
                          </span>
                        ) : (
                          assembly.cardType
                        )}
                      </Table.Cell>
                      <Table.Cell className={cn(cellClassName, isEditing && "text-center")}>
                        {isEditing ? (
                          <div
                            className="inline-flex justify-center"
                            onClick={stopRowPress}
                            onKeyDown={stopRowPress}
                            onPointerDown={stopRowPress}
                          >
                            <Checkbox
                              aria-label="اجازه رأی‌گیری آنلاین"
                              isSelected={draftAllowOnlineVoting}
                              onChange={setDraftAllowOnlineVoting}
                            >
                              <Checkbox.Content aria-label="اجازه رأی‌گیری آنلاین">
                                <Checkbox.Control className="!rounded-[4px]">
                                  <Checkbox.Indicator />
                                </Checkbox.Control>
                              </Checkbox.Content>
                            </Checkbox>
                          </div>
                        ) : assembly.allowOnlineVoting ? (
                          "غیرحضوری"
                        ) : (
                          "حضوری"
                        )}
                      </Table.Cell>
                      <Table.Cell className={cellClassName}>
                        <TruncatedText maxChars={ASSEMBLY_CREATED_BY_MAX_CHARS} value={assembly.createdBy} />
                      </Table.Cell>
                      <Table.Cell className={cellClassName}>
                        <span dir="ltr">{formatJalali(assembly.createdAt)}</span>
                      </Table.Cell>
                      <Table.Cell className={cellClassName}>
                        {isEditing ? (
                          <div onPointerDown={stopRowPress}>
                            <InlineDatePicker
                              label="روز مجمع"
                              value={draftNewsDate}
                              withBackdrop={!showEditBackdrop}
                              onChange={setDraftNewsDate}
                            />
                          </div>
                        ) : (
                          <span dir="ltr">{formatJalali(assembly.newsDate)}</span>
                        )}
                      </Table.Cell>
                      <Table.Cell className={cellClassName}>
                        <span dir="ltr">{assembly.startsAt}</span>
                      </Table.Cell>
                      <Table.Cell className={cellClassName}>
                        <span dir="ltr">{assembly.endsAt}</span>
                      </Table.Cell>
                      <Table.Cell className={`${cellClassName} text-center`}>
                        {isEditing ? (
                          <span className="inline-flex w-full justify-center">
                            <span className="inline-block w-[88px] max-sm:w-[96px]" onPointerDown={stopRowPress}>
                              <SelectField
                                className="h-9 rounded-xl bg-(--field-muted) text-sm shadow-none"
                                label="واجدین"
                                options={assemblyCreationUnitOptions}
                                popoverClassName="max-sm:!w-[200px]"
                                value={draftUnit}
                                onChange={(value) => setDraftUnit(value as AssemblyUnit)}
                              />
                            </span>
                          </span>
                        ) : (
                          <span className="inline-flex w-full justify-center">
                            <AssemblyStatsValue assembly={assembly} />
                          </span>
                        )}
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center justify-end gap-1.5">
                          {isEditing ? (
                            <>
                              <RowActionButton
                                className="bg-success"
                                label={`تأیید ویرایش ${assembly.title}`}
                                onPress={() => confirmEdit(assembly)}
                              >
                                <CheckIcon className="size-4" strokeWidth={2} />
                              </RowActionButton>
                              <RowActionButton
                                className="bg-danger"
                                label={`لغو ویرایش ${assembly.title}`}
                                onPress={cancelEdit}
                              >
                                <CloseIcon className="size-4" strokeWidth={2} />
                              </RowActionButton>
                            </>
                          ) : (
                            <>
                              <Link
                                aria-label={`مشاهده ${assembly.title}`}
                                className="inline-flex size-8 min-w-8 items-center justify-center rounded-full bg-accent text-white"
                                to={`${detailBasePath}/${assembly.id}`}
                                onClick={stopRowPress}
                                onPointerDown={stopRowPress}
                              >
                                <EyeIcon className="size-4" strokeWidth={2} />
                              </Link>
                              {canEditPencil && (
                                <RowActionButton
                                  className="bg-accent"
                                  label={`ویرایش ${assembly.title}`}
                                  onPress={() => startEdit(assembly)}
                                >
                                  <PenIcon className="size-4" />
                                </RowActionButton>
                              )}
                              <span
                                aria-hidden={!canDelete || undefined}
                                className={cn(!canDelete && "pointer-events-none opacity-0")}
                              >
                                <DeleteAssemblyButton
                                  assembly={assembly}
                                  isOpen={deleteTarget?.id === assembly.id}
                                  onOpenChange={(open) => setDeleteTarget(open ? assembly : null)}
                                />
                              </span>
                            </>
                          )}
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  );
                }}
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
        </Table>
      </div>
    </>
  );
}
