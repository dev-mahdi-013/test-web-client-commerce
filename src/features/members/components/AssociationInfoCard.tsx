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
      <span className="mb-1 block text-xs text-muted lg:text-sm">{label}</span>
      <span className="block text-base font-medium text-foreground lg:text-xl">{value}</span>
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
      <div className="grid grid-cols-2 lg:grid-cols-5">
        <InfoField
          className="col-span-2 border-(--panel-cards) px-3 py-3 max-lg:border-b-[3px] lg:col-span-1 lg:border-e-[3px]"
          label="نام انجمن"
          value={association?.name ?? "—"}
        />
        <InfoField
          className="flex flex-col justify-center border-(--panel-cards) px-3 py-3 max-lg:border-b-[3px] max-lg:border-e-[3px] lg:items-center lg:border-e-[3px] lg:py-2"
          label="تاریخ تأسیس"
          value={formatJalali(association?.foundedAt ?? null)}
        />
        <InfoField
          className="flex flex-col justify-center border-(--panel-cards) px-3 py-3 max-lg:border-b-[3px] lg:items-center lg:border-e-[3px] lg:py-2"
          label="تاریخ آخرین مجمع"
          value={formatJalali(association?.lastMeetingAt ?? null)}
        />
        <InfoField
          className="flex flex-col justify-center border-(--panel-cards) px-3 py-3 max-lg:border-e-[3px] lg:items-center lg:border-e-[3px] lg:py-2"
          label="دبیر"
          value={association?.secretaryName ?? "—"}
        />
        <InfoField
          className="flex flex-col justify-center px-3 py-3 lg:items-center lg:py-2"
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
