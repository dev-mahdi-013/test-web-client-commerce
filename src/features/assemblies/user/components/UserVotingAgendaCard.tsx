import { Button, Table, toast } from "@heroui/react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { agendaKindLabel } from "../../config";
import type { AssemblyAgenda } from "../../types";
import { AssemblyDetailField } from "../../components/AssemblyDetailField";

type UserVotingAgendaCardProps = {
  agenda: AssemblyAgenda;
  isPending?: boolean;
  /** Selection remembered locally after a successful vote, used when the server does not return one. */
  fallbackSelectedIds?: string[];
  /** Unconfirmed selection kept by the page, so it survives moving between agendas. */
  draftSelectedIds?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  /** Fired once the selection reaches the maximum; the page uses it to open the next agenda. */
  onSelectionComplete?: () => void;
  onConfirm?: (selectedIds: string[]) => void;
};

const headerClassName = "bg-(--panel-cards) text-start text-xs font-normal text-muted after:hidden";
const bodyClassName =
  "bg-(--background) [&_tr:first-child>td:first-child]:!rounded-ss-[10px] [&_tr:first-child>td:last-child]:!rounded-se-[10px] [&_tr:last-child>td:first-child]:!rounded-es-[10px] [&_tr:last-child>td:last-child]:!rounded-ee-[10px]";
const cellClassName =
  "border-b border-(--panel-cards) bg-(--background) py-3.5 text-sm font-normal whitespace-nowrap";

function SelectionDot({ selected }: { selected: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex size-[18px] shrink-0 items-center justify-center rounded-full border-2 transition-colors",
        selected ? "border-accent bg-accent" : "border-[#d5d8de] bg-white",
      )}
    >
      {selected && <span className="size-[7px] rounded-full bg-white" />}
    </span>
  );
}

/** Voting agenda card — meta fields + chamber AgendaCard table with selectable rows. */
export function UserVotingAgendaCard({
  agenda,
  isPending,
  fallbackSelectedIds,
  draftSelectedIds,
  onSelectionChange,
  onSelectionComplete,
  onConfirm,
}: UserVotingAgendaCardProps) {
  const isPerson = agenda.kind === "person";
  const maxSelections = agenda.minSelections;
  const isVoteDisabled = isPending || agenda.hasVoted === true;
  const votedIds = agenda.votedOptionIds?.length ? agenda.votedOptionIds : (fallbackSelectedIds ?? []);
  const votedKey = votedIds.join("|");
  const [selectedIds, setSelectedIds] = useState<string[]>(
    votedIds.length > 0 ? votedIds : (draftSelectedIds ?? []),
  );
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
    },
    [],
  );

  // Show what was already voted (e.g. after the agenda refetches or the user comes back).
  useEffect(() => {
    if (votedKey) setSelectedIds(votedKey.split("|"));
  }, [votedKey]);

  const rows = agenda.candidates.map((candidate, index) => ({
    ...candidate,
    rowNumber: index + 1,
  }));

  const applySelection = (next: string[]) => {
    setSelectedIds(next);
    onSelectionChange?.(next);

    // Selection is full: briefly show it, then move on to the next agenda.
    if (next.length === maxSelections && onSelectionComplete) {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
      advanceTimer.current = setTimeout(onSelectionComplete, 300);
    }
  };

  const toggle = (candidateId: string) => {
    if (isVoteDisabled) return;

    // Single choice: clicking any row simply selects that one (replacing the previous).
    if (maxSelections === 1) {
      applySelection([candidateId]);
      return;
    }

    if (selectedIds.includes(candidateId)) {
      const next = selectedIds.filter((id) => id !== candidateId);
      setSelectedIds(next);
      onSelectionChange?.(next);
      return;
    }
    if (selectedIds.length >= maxSelections) {
      toast.danger(`حداکثر ${maxSelections} نفر قابل انتخاب است`);
      return;
    }
    applySelection([...selectedIds, candidateId]);
  };

  const handleConfirm = () => {
    if (isVoteDisabled) return;
    if (selectedIds.length === 0) {
      toast.danger("حداقل یک گزینه را انتخاب کنید");
      return;
    }
    onConfirm?.(selectedIds);
  };

  return (
    <article className="relative z-10 flex h-full  w-full max-w-none flex-col overflow-hidden rounded-[20px] bg-white px-4 py-5 ps-7 shadow-(--box-shadow) sm:max-w-[468px] sm:rounded-2xl sm:px-6 sm:py-7 sm:ps-9">
      <span aria-hidden className="absolute inset-y-0 start-0 w-[7px] bg-accent sm:w-[10px]" />

      <dl className="grid shrink-0 grid-cols-2 gap-x-3 gap-y-4 sm:gap-x-6 sm:gap-y-6">
        <AssemblyDetailField
          className="max-w-[105px] items-start text-start sm:max-w-none"
          label="عنوان دستور"
          value={agenda.title}
          valueClassName="text-sm sm:text-[15px]"
        />
        <AssemblyDetailField
          className="w-full max-w-[120px] items-start justify-self-end text-end sm:w-[120px]"
          label="نوع حضور"
          value={agenda.unit}
        />
        <AssemblyDetailField
          className="items-start text-start"
          label="نوع رای‌گیری"
          value={agendaKindLabel[agenda.kind]}
        />
        <AssemblyDetailField
          className="w-full max-w-[120px] items-start justify-self-end text-end sm:w-[120px]"
          label="حداکثر تعداد انتخاب"
          value={maxSelections}
        />
      </dl>

      <Table className="mt-4   flex-1 bg-transparent p-0 sm:mt-6" variant="secondary">
        <Table.ScrollContainer className="  overflow-x-auto overflow-y-auto">
          <Table.Content
            aria-label={`کاندیداهای ${agenda.title}`}
            className={isPerson ? " sm:min-w-[320px]" : " sm:min-w-[240px]"}
          >
            <Table.Header>
              <Table.Column isRowHeader className={headerClassName}>
                نام و نام خانوادگی
              </Table.Column>
              {isPerson && <Table.Column className={headerClassName}>شماره کارت</Table.Column>}
            </Table.Header>
            <Table.Body className={bodyClassName} items={rows}>
              {(candidate) => {
                const selected = selectedIds.includes(candidate.id);
                return (
                  <Table.Row id={candidate.id}>
                    <Table.Cell className={`${cellClassName} font-bold`}>
                      <button
                        aria-pressed={selected}
                        className={cn(
                          "flex items-center gap-2.5 text-start",
                          isVoteDisabled ? "cursor-not-allowed" : "cursor-pointer",
                        )}
                        disabled={isVoteDisabled}
                        type="button"
                        onClick={() => toggle(candidate.id)}
                      >
                        <SelectionDot selected={selected} />
                        <span className="truncate">
                          {candidate.rowNumber}. {candidate.name}
                        </span>
                      </button>
                    </Table.Cell>
                    {isPerson && (
                      <Table.Cell className={cellClassName}>
                        <button
                          aria-pressed={selected}
                          className={cn(
                            "w-full text-start",
                            isVoteDisabled ? "cursor-not-allowed" : "cursor-pointer",
                          )}
                          disabled={isVoteDisabled}
                          type="button"
                          onClick={() => toggle(candidate.id)}
                        >
                          <span dir="ltr">{candidate.cardNo ?? "------"}</span>
                        </button>
                      </Table.Cell>
                    )}
                  </Table.Row>
                );
              }}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table>

      <div className="mt-5 flex shrink-0 justify-start sm:mt-7">
        <Button
          className="h-10 min-w-[148px] rounded-full px-8 text-sm font-medium"
          isDisabled={isVoteDisabled}
          isPending={isPending}
          onPress={handleConfirm}
        >
          تأیید
        </Button>
      </div>
    </article>
  );
}
