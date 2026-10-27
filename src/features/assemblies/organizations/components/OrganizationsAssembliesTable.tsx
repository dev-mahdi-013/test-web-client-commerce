import { EyeIcon } from "@solar-icons/react/linear/eye";
import { PenIcon } from "@solar-icons/react/linear/pen";
import { Spinner, Table, toast } from "@heroui/react";
import {
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { Link } from "react-router";
import { InlineDatePicker } from "@/features/associations/components/InlineDatePicker";
import { cn } from "@/lib/cn";
import { formatJalali } from "@/lib/date";
import { InlineEditControl } from "@/shared/components/InlineEditControl";
import { InlineSelectEdit } from "@/shared/components/InlineSelectEdit";
import { TruncatedText } from "@/shared/components/TruncatedText";
import { AssemblyStatsColumnHeader, AssemblyStatsValue } from "../../components/AssemblyStatsValue";
import { AssemblyStatusBadge } from "../../components/AssemblyStatusBadge";
import {
  ASSEMBLY_CREATED_BY_MAX_CHARS,
  ASSEMBLY_TITLE_MAX_CHARS,
  assemblyCardTypeOptions,
  assemblyUnitOptions,
  organizationsStatusMeta,
} from "../../config";
import {
  useUpdateAssemblyCardType,
  useUpdateAssemblyNewsDate,
  useUpdateAssemblyTitle,
  useUpdateAssemblyUnit,
} from "../../hooks/useAssemblyMutations";
import { useAssemblyOwnerCheck } from "../../hooks/useAssemblyOwnerCheck";
import type { Assembly, AssemblyCardType, AssemblyUnit } from "../../types";
import { DeleteAssemblyButton } from "./DeleteAssemblyButton";

type OrganizationsAssembliesTableProps = {
  assemblies: Assembly[];
  startIndex: number;
  isLoading: boolean;
  /** Base path for the detail page, without trailing slash. */
  detailBasePath?: string;
};

type EditField = "title" | "newsDate" | "unit" | "cardType";

const MIN_TITLE_LENGTH = 3;
const headerCellClassName = "text-start text-xs font-normal text-muted whitespace-nowrap";
const cellClassName = "text-sm whitespace-nowrap";

function stopRowPress(event: MouseEvent | ReactPointerEvent) {
  event.stopPropagation();
}

function PencilButton({
  label,
  isHidden = false,
  onEdit,
}: {
  label: string;
  /** Non-owners: keep the pencil's space but make it invisible and unclickable. */
  isHidden?: boolean;
  onEdit: () => void;
}) {
  return (
    <button
      type="button"
      aria-hidden={isHidden || undefined}
      aria-label={label}
      className={cn(
        "inline-flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-full bg-accent text-white",
        isHidden && "pointer-events-none opacity-0",
      )}
      tabIndex={isHidden ? -1 : undefined}
      onPointerDown={stopRowPress}
      onClick={(event) => {
        stopRowPress(event);
        onEdit();
      }}
    >
      <PenIcon className="size-3.5" />
    </button>
  );
}

/** Pencil first in DOM so in RTL it sits on the visual right. */
function EditableCell({ action, children }: { action: ReactNode; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2">
      {action}
      {children}
    </span>
  );
}

export function OrganizationsAssembliesTable({
  assemblies,
  startIndex,
  isLoading,
  detailBasePath = "/organizations/assemblies",
}: OrganizationsAssembliesTableProps) {
  const updateTitle = useUpdateAssemblyTitle();
  const updateNewsDate = useUpdateAssemblyNewsDate();
  const updateUnit = useUpdateAssemblyUnit();
  const updateCardType = useUpdateAssemblyCardType();
  const isOwner = useAssemblyOwnerCheck();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<EditField | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftNewsDate, setDraftNewsDate] = useState("");
  const [draftUnit, setDraftUnit] = useState<AssemblyUnit>("حقیقی");
  const [draftCardType, setDraftCardType] = useState<AssemblyCardType>("همه");
  const [deleteTarget, setDeleteTarget] = useState<Assembly | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  const cancelEdit = () => {
    setEditingId(null);
    setEditingField(null);
  };

  const startEdit = (assembly: Assembly, field: EditField) => {
    setEditingId(assembly.id);
    setEditingField(field);
    setDraftTitle(assembly.title);
    setDraftNewsDate(assembly.newsDate ? formatJalali(assembly.newsDate) : "");
    setDraftUnit(assembly.unit);
    setDraftCardType(assembly.cardType);
  };

  useEffect(() => {
    if (editingField !== "title") return;

    const closeOnOutsidePointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !editorRef.current?.contains(event.target)) {
        cancelEdit();
      }
    };

    document.addEventListener("pointerdown", closeOnOutsidePointerDown, true);
    return () => document.removeEventListener("pointerdown", closeOnOutsidePointerDown, true);
  }, [editingField]);

  const confirmTitle = (assembly: Assembly) => {
    const title = draftTitle.trim();
    if (title.length < MIN_TITLE_LENGTH) {
      toast.danger("نام مجمع را کامل وارد کنید");
      return;
    }
    if (title.length > ASSEMBLY_TITLE_MAX_CHARS) {
      toast.danger(`عنوان مجمع حداکثر ${ASSEMBLY_TITLE_MAX_CHARS} کاراکتر است`);
      return;
    }
    if (title === assembly.title) {
      cancelEdit();
      return;
    }
    updateTitle.mutate(
      { assemblyId: assembly.id, title },
      {
        onSuccess: () => {
          toast.success("عنوان مجمع به‌روزرسانی شد");
          cancelEdit();
        },
      },
    );
  };

  const saveNewsDate = (assembly: Assembly, votingDay: string) => {
    updateNewsDate.mutate(
      { assemblyId: assembly.id, votingDay },
      {
        onSuccess: () => {
          toast.success("روز رأی‌گیری به‌روزرسانی شد");
          cancelEdit();
        },
      },
    );
  };

  const confirmUnit = (assembly: Assembly) => {
    if (draftUnit === assembly.unit) {
      cancelEdit();
      return;
    }

    updateUnit.mutate(
      { assemblyId: assembly.id, unit: draftUnit },
      {
        onSuccess: () => {
          cancelEdit();
        },
      },
    );
  };

  const confirmCardType = (assembly: Assembly) => {
    if (draftCardType === assembly.cardType) {
      cancelEdit();
      return;
    }

    updateCardType.mutate(
      { assemblyId: assembly.id, cardType: draftCardType },
      {
        onSuccess: () => {
          cancelEdit();
        },
      },
    );
  };

  const rows = assemblies.map((assembly, index) => ({
    ...assembly,
    rowNumber: startIndex + index,
    editingField: editingId === assembly.id ? editingField : null,
  }));

  return (
    <>
      <div className="flex w-full max-w-full flex-1 flex-col overflow-hidden rounded-[20px] bg-white">
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
                <Table.Column className={headerCellClassName}>توسط</Table.Column>
                <Table.Column className={headerCellClassName}>تاریخ ثبت</Table.Column>
                <Table.Column className={headerCellClassName}>روز رای‌گیری</Table.Column>
                <Table.Column className={headerCellClassName}>زمان شروع</Table.Column>
                <Table.Column className={headerCellClassName}>زمان پایان</Table.Column>
                <Table.Column className={`${headerCellClassName} min-w-[200px] text-center`}>
                  <AssemblyStatsColumnHeader />
                </Table.Column>
                <Table.Column className={`${headerCellClassName} w-28 text-center`}>عملیات</Table.Column>
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
                  const field = assembly.editingField;
                  const canEdit = isOwner(assembly);
                  // Running and finished votes can no longer be edited: their pencils keep their space but are invisible.
                  const isLocked = assembly.status === "running" || assembly.status === "finished";
                  const canEditPencil = canEdit && !isLocked;

                  return (
                    <Table.Row id={assembly.id}>
                      <Table.Cell className={`${cellClassName} py-4`}>
                        {field === "title" ? (
                          <InlineEditControl
                            autoFocus
                            className="w-[220px]"
                            editorRef={editorRef}
                            isOpen
                            maxLength={ASSEMBLY_TITLE_MAX_CHARS}
                            placeholder="نام مجمع"
                            stopPropagation
                            value={draftTitle}
                            onCancel={cancelEdit}
                            onChange={setDraftTitle}
                            onConfirm={() => confirmTitle(assembly)}
                          />
                        ) : (
                          <EditableCell
                            action={
                              <PencilButton
                                isHidden={!canEditPencil}
                                label={`ویرایش عنوان ${assembly.title}`}
                                onEdit={() => startEdit(assembly, "title")}
                              />
                            }
                          >
                            <span className="inline-flex items-center gap-1">
                              <span>{assembly.rowNumber}.</span>
                              <TruncatedText maxChars={ASSEMBLY_TITLE_MAX_CHARS} value={assembly.title} />
                            </span>
                          </EditableCell>
                        )}
                      </Table.Cell>
                      <Table.Cell>
                        <AssemblyStatusBadge
                          label={organizationsStatusMeta[assembly.status].label}
                          status={assembly.status}
                        />
                      </Table.Cell>
                      <Table.Cell className={cellClassName}>{assembly.association}</Table.Cell>
                      <Table.Cell className={cellClassName}>
                        <InlineSelectEdit
                          accessibleName="نوع کارت"
                          displayValue={assembly.cardType}
                          editLabel={`ویرایش نوع کارت ${assembly.title}`}
                          isEditing={field === "cardType"}
                          isHidden={!canEditPencil}
                          options={assemblyCardTypeOptions}
                          value={draftCardType}
                          onCancel={cancelEdit}
                          onChange={(value) => setDraftCardType(value as AssemblyCardType)}
                          onConfirm={() => confirmCardType(assembly)}
                          onStartEdit={() => startEdit(assembly, "cardType")}
                        />
                      </Table.Cell>
                      <Table.Cell className={cellClassName}>
                        <TruncatedText maxChars={ASSEMBLY_CREATED_BY_MAX_CHARS} value={assembly.createdBy} />
                      </Table.Cell>
                      <Table.Cell className={cellClassName}>
                        <span dir="ltr">{formatJalali(assembly.createdAt)}</span>
                      </Table.Cell>
                      <Table.Cell className={cellClassName}>
                        {field === "newsDate" ? (
                          <div onPointerDown={stopRowPress}>
                            <InlineDatePicker
                              autoOpen
                              label="روز رای‌گیری"
                              value={draftNewsDate}
                              onCancel={cancelEdit}
                              onChange={(votingDay) => saveNewsDate(assembly, votingDay)}
                            />
                          </div>
                        ) : (
                          <EditableCell
                            action={
                              <PencilButton
                                isHidden={!canEditPencil}
                                label={`ویرایش روز رای‌گیری ${assembly.title}`}
                                onEdit={() => startEdit(assembly, "newsDate")}
                              />
                            }
                          >
                            <span dir="ltr">{formatJalali(assembly.newsDate)}</span>
                          </EditableCell>
                        )}
                      </Table.Cell>
                      <Table.Cell className={cellClassName}>
                        <span dir="ltr">{assembly.startsAt}</span>
                      </Table.Cell>
                      <Table.Cell className={cellClassName}>
                        <span dir="ltr">{assembly.endsAt}</span>
                      </Table.Cell>
                      <Table.Cell className={`${cellClassName} text-center`}>
                        <span className="inline-flex w-full justify-start">
                          <InlineSelectEdit
                            accessibleName="واجدین"
                            isHidden={!canEditPencil}
                            className="w-[220px]"
                            displayValue={<AssemblyStatsValue assembly={assembly} />}
                            editLabel={`ویرایش واجدین ${assembly.title}`}
                            isEditing={field === "unit"}
                            options={assemblyUnitOptions}
                            selectPopoverClassName="max-sm:!w-[200px]"
                            value={draftUnit}
                            onCancel={cancelEdit}
                            onChange={(value) => setDraftUnit(value as AssemblyUnit)}
                            onConfirm={() => confirmUnit(assembly)}
                            onStartEdit={() => startEdit(assembly, "unit")}
                          />
                        </span>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center justify-center gap-1.5">
                          <Link
                            aria-label={`مشاهده ${assembly.title}`}
                            className="inline-flex size-8 min-w-8 items-center justify-center rounded-full bg-accent text-white"
                            to={`${detailBasePath}/${assembly.id}`}
                            onClick={stopRowPress}
                            onPointerDown={stopRowPress}
                          >
                            <EyeIcon className="size-4" strokeWidth={2} />
                          </Link>
                          {canEdit && (
                            <DeleteAssemblyButton
                              assembly={assembly}
                              isOpen={deleteTarget?.id === assembly.id}
                              onOpenChange={(open) => setDeleteTarget(open ? assembly : null)}
                            />
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
