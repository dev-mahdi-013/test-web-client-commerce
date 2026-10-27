import { agendaKindLabel } from "../config";
import type { AssemblyAgenda } from "../types";
import { AgendaCandidatesTable } from "./AgendaCandidatesTable";
import { AssemblyDetailField } from "./AssemblyDetailField";

type AgendaCardProps = {
  agenda: AssemblyAgenda;
};

export function AgendaCard({ agenda }: AgendaCardProps) {
  return (
    <article className="relative flex flex-col overflow-hidden rounded-[20px] bg-white p-5 ps-7 shadow-(--box-shadow) sm:p-6 sm:ps-8">
      <span aria-hidden className="absolute inset-y-0 start-0 w-1.5 bg-accent" />

      <dl className="mb-6 grid grid-cols-3 gap-x-3 gap-y-5 sm:gap-x-8 sm:px-4">
        <AssemblyDetailField label="عنوان دستور" value={agenda.title} />
        <AssemblyDetailField label="نوع دستور" value={agendaKindLabel[agenda.kind]} />
        <AssemblyDetailField
          className="mr-auto w-[121px]"
          label="حداکثر تعداد انتخاب"
          value={agenda.minSelections}
        />
      </dl>

      <AgendaCandidatesTable agenda={agenda} />
    </article>
  );
}
