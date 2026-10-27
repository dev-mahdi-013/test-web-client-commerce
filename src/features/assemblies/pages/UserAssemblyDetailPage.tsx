import { AltArrowLeftIcon } from "@solar-icons/react/linear/alt-arrow-left";
import { AltArrowRightIcon } from "@solar-icons/react/linear/alt-arrow-right";
import { Button, Spinner } from "@heroui/react";
import { useState, type ReactNode } from "react";
import { useParams } from "react-router";
import { cn } from "@/lib/cn";
import { ApiError, getErrorMessage } from "@/lib/http";
import { useAssembly } from "../hooks/useAssemblies";
import { AgendaCardStack } from "../user/components/AgendaCardStack";
import { UserAssemblySummaryBar } from "../user/components/UserAssemblySummaryBar";
import { UserVotingAgendaCard } from "../user/components/UserVotingAgendaCard";
import { useVoteAssembly } from "../user/hooks/useVoteAssembly";

const VOTING_NOT_STARTED_MESSAGE = "برای دسترسی به صفحه رأی‌گیری، مجمع باید شروع شده باشد";

/** Maps CM surveys/vote access errors to the copy the member should see on this page. */
function userVotingAccessMessage(error: unknown) {
  const raw = getErrorMessage(error, "").toLowerCase();
  const status = error instanceof ApiError ? error.status : 0;

  if (
    status === 409 ||
    raw.includes("wait to start") ||
    raw.includes("start voting") ||
    raw.includes("مجمع باید شروع") ||
    raw.includes("زمان رأی‌گیری")
  ) {
    return VOTING_NOT_STARTED_MESSAGE;
  }
  if (raw.includes("card expired") || raw.includes("کارت شما منقضی")) {
    return "کارت شما منقضی شده است و اجازه دسترسی به رأی‌گیری را ندارید";
  }
  if (raw.includes("not registered") || raw.includes("ثبت‌نام نشده")) {
    return "شما در این مجمع ثبت‌نام نشده‌اید و اجازه رأی ندارید";
  }
  if (raw.includes("poll not found") || raw.includes("مجمع پیدا نشد")) {
    return "مجمع پیدا نشد";
  }
  if (raw.includes("access") || raw.includes("دسترسی") || status === 403) {
    return getErrorMessage(error, "اجازه دسترسی به این مجمع را ندارید");
  }

  return getErrorMessage(error, "دریافت اطلاعات مجمع انجام نشد");
}

/** Voting detail for the user (کاربر) role — summary bar + stacked agenda cards. */
export function UserAssemblyDetailPage() {
  const { assemblyId } = useParams();
  const assembly = useAssembly(assemblyId ?? null);
  const detail = assembly.data;
  const [agendaIndex, setAgendaIndex] = useState(0);
  const vote = useVoteAssembly(assemblyId ?? "");
  const [votedByAgenda, setVotedByAgenda] = useState<Record<string, string[]>>({});
  const [draftsByAgenda, setDraftsByAgenda] = useState<Record<string, string[]>>({});

  if (assembly.isPending) {
    return (
      <div className="flex h-60 items-center justify-center rounded-[28px] bg-(--panel)">
        <Spinner size="sm" />
      </div>
    );
  }

  if (assembly.isError) {
    return (
      <p className="flex h-60 items-center justify-center rounded-[28px] bg-(--panel) px-4 text-center text-sm text-muted">
        {userVotingAccessMessage(assembly.error)}
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

  const agendas = detail.agendas;
  const currentAgenda = agendas[agendaIndex] ?? null;
  const canGoPrev = agendaIndex > 0;
  const canGoNext = agendaIndex < agendas.length - 1;

  return (
    <div className="flex flex-col gap-8 pb-6">
      <UserAssemblySummaryBar assembly={detail} />

      {agendas.length === 0 ? (
        <p className="rounded-[20px] bg-white px-4 py-10 text-center text-sm text-muted shadow-(--box-shadow)">
          دستوری برای رأی‌گیری آماده نیست
        </p>
      ) : currentAgenda ? (
        <section aria-label="دستور جلسه" className="relative flex flex-col items-center gap-6">
          <div className="flex w-full items-center justify-center sm:px-6 lg:px-10">
            <div className="mx-auto flex w-full max-w-none flex-col gap-4 sm:max-w-[468px] sm:gap-6">
              <p className="text-start text-[22px] font-medium sm:text-[28px]">
                دستور <span className="text-[32px] font-thin sm:text-[40px]">{agendaIndex + 1}</span>
              </p>

              <div className="flex w-full max-w-[520px] items-center justify-between gap-3 md:hidden">
                <Button
                  className="h-10 gap-2 rounded-full px-4 text-black"
                  isDisabled={!canGoNext}
                  size="sm"
                  variant="secondary"
                  onPress={() => setAgendaIndex((index) => Math.min(agendas.length - 1, index + 1))}
                >
                  <AltArrowRightIcon className="size-4" />
                  دستور بعدی
                </Button>
                <Button
                  className="h-10 gap-2 rounded-full px-4 text-black"
                  isDisabled={!canGoPrev}
                  size="sm"
                  variant="secondary"
                  onPress={() => setAgendaIndex((index) => Math.max(0, index - 1))}
                >
                  دستور قبلی
                  <AltArrowLeftIcon className="size-4" />
                </Button>
              </div>

              <AgendaCardStack agendaCount={agendas.length} agendaIndex={agendaIndex}>
                <UserVotingAgendaCard
                  key={currentAgenda.id}
                  agenda={currentAgenda}
                  fallbackSelectedIds={votedByAgenda[currentAgenda.id]}
                  draftSelectedIds={draftsByAgenda[currentAgenda.id]}
                  onSelectionChange={(ids) =>
                    setDraftsByAgenda((current) => ({ ...current, [currentAgenda.id]: ids }))
                  }
                  isPending={vote.isPending}
                  onConfirm={(voteOptions) =>
                    vote.mutate(
                      { surveyId: currentAgenda.id, voteOptions },
                      {
                        onSuccess: () => {
                          setVotedByAgenda((current) => ({
                            ...current,
                            [currentAgenda.id]: voteOptions,
                          }));
                          // After a registered vote, move on to the next agenda like the "دستور بعدی" button.
                          if (canGoNext) {
                            setAgendaIndex((index) => Math.min(agendas.length - 1, index + 1));
                          }
                        },
                      },
                    )
                  }
                />
              </AgendaCardStack>
            </div>
          </div>

          <div className="absolute mt-10 hidden h-full w-full px-12 md:flex">
            <NavCue
              disabled={!canGoNext}
              icon={<AltArrowRightIcon className="size-5" />}
              label="دستور بعدی"
              onPress={() => setAgendaIndex((index) => Math.min(agendas.length - 1, index + 1))}
            />
            <NavCue
              className="mr-auto flex-row-reverse text-xl"
              disabled={!canGoPrev}
              icon={<AltArrowLeftIcon className="size-5" />}
              label="دستور قبلی"
              onPress={() => setAgendaIndex((index) => Math.max(0, index - 1))}
            />
          </div>
        </section>
      ) : null}
    </div>
  );
}

function NavCue({
  label,
  icon,
  disabled,
  onPress,
  className,
}: {
  label: string;
  icon: ReactNode;
  disabled: boolean;
  onPress: () => void;
  className?: string;
}) {
  return (
    <Button
      aria-label={label}
      className={cn(
        "top-1/2 z-20 hidden h-auto -translate-y-1/2 flex-row items-center gap-2 bg-transparent px-2 py-3 text-xl font-medium text-black shadow-none md:flex",
        disabled && "opacity-30",
        className,
      )}
      isDisabled={disabled}
      variant="ghost"
      onPress={onPress}
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-(--field-muted) text-foreground">
        {icon}
      </span>
      <span className="whitespace-nowrap">{label}</span>
    </Button>
  );
}
