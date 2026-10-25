import { useAssociations } from "@/features/associations/hooks/useAssociations";
import { cn } from "@/lib/cn";
import { formatJalali } from "@/lib/date";
import { useMembers } from "../hooks/useMembers";

type AssociationInfoCardProps = {
  className?: string;
};

type InfoFieldProps = {
  label: string;
  value: string;
  className?: string;
};

function InfoField({ label, value, className }: InfoFieldProps) {
  return (
    <div className={className}>
      <span className="mb-1 block text-sm text-muted">{label}</span>
      <span className="block text-xl font-medium text-foreground">{value}</span>
    </div>
  );
}

export function AssociationInfoCard({ className }: AssociationInfoCardProps) {
  const associations = useAssociations({ page: 1 });
  const members = useMembers({ page: 1 });
  const association = associations.data?.items[0];

  return (
    <section
      aria-label="اطلاعات انجمن"
      className={cn(
        "flex min-h-[133px] flex-col justify-center rounded-[10px] bg-white px-4 py-5 sm:px-6 lg:shadow-[0px_2px_8px_0px_#0000000F]",
        className,
      )}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
        <InfoField className="border-(--panel-cards) px-3 py-3 max-sm:border-b-[3px] sm:border-e-[3px]" label="نام انجمن" value={association?.name ?? "—"} />
        <InfoField
          className="hidden flex-col items-center justify-center border-e-[3px] border-(--panel-cards) px-3 py-2 lg:flex"
          label="تاریخ تأسیس"
          value={formatJalali(association?.foundedAt ?? null)}
        />
        <InfoField
          className="hidden flex-col items-center justify-center border-e-[3px] border-(--panel-cards) px-3 py-2 lg:flex"
          label="تاریخ آخرین مجمع"
          value={formatJalali(association?.lastMeetingAt ?? null)}
        />
        <InfoField
          className="flex flex-col justify-center border-(--panel-cards) px-3 py-2 lg:items-center lg:border-e-[3px]"
          label="دبیر"
          value={association?.secretaryName ?? "—"}
        />
        <InfoField
          className="hidden flex-col items-center justify-center px-3 py-2 lg:flex"
          label="تعداد اعضا"
          value={members.data ? `${members.data.total} نفر` : "—"}
        />
      </div>
      {(associations.isError || members.isError) && (
        <p className="mt-2 px-3 text-xs text-danger" role="alert">
          بارگذاری برخی از اطلاعات انجمن ناموفق بود.
        </p>
      )}
    </section>
  );
}
