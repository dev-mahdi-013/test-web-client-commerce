import { Spinner } from "@heroui/react";
import { useParams } from "react-router";
import { getErrorMessage } from "@/lib/http";
import { SectionHeading } from "@/shared/components/SectionHeading";
import { AssemblySummaryCard } from "../components/AssemblySummaryCard";
import { VotersRingCard } from "../components/VotersRingCard";
import { useAssembly } from "../hooks/useAssemblies";
import { OrganizationsAgendaCard } from "../organizations/components/OrganizationsAgendaCard";

/** Assembly detail for the chamber-president role (read-only). */
export function ChamberAssemblyDetailPage() {
  const { assemblyId } = useParams();
  const assembly = useAssembly(assemblyId ?? null);
  const detail = assembly.data;

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

  return (
    <div className="flex flex-col gap-6 rounded-3xl bg-(--panel-cards) px-4 py-5 sm:px-6 xl:px-10">
      <section aria-label="اطلاعات عمومی مجمع" className="flex flex-col gap-4">
        <SectionHeading className="lg:text-base">اطلاعات عمومی مجمع</SectionHeading>
        <div className="flex flex-col gap-3 xl:flex-row xl:items-stretch xl:gap-6">
          <AssemblySummaryCard assembly={detail} />
          <VotersRingCard
            className="w-full rounded-[20px] bg-white px-4 py-5 shadow-(--box-shadow) sm:px-6 xl:w-auto xl:min-h-[184px] xl:shrink-0 xl:rounded-[16px] xl:px-8"
            voters={detail.voterStats}
          />
        </div>
      </section>

      <section aria-label="دستورهای مجمع" className="flex flex-col gap-4">
        <SectionHeading className="lg:text-base">دستورهای مجمع</SectionHeading>
        {detail.agendas.length === 0 ? (
          <p className="rounded-[20px] bg-white px-4 py-10 text-center text-sm text-muted shadow-(--box-shadow)">
            دستوری برای این مجمع ثبت نشده است
          </p>
        ) : (
          <div className="grid gap-3 xl:grid-cols-2 2xl:gap-6">
            {detail.agendas.map((agenda) => (
              <OrganizationsAgendaCard key={agenda.id} assemblyUnit={detail.unit} agenda={agenda} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
