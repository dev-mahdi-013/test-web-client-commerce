import type { ReactNode } from "react";
import { SectionHeading } from "@/shared/components/SectionHeading";
import { AssemblyFilterChip, type FilterOption } from "../../components/AssemblyFilterChip";

type OrganizationsAssembliesToolbarProps = {
  association: string;
  associationOptions: FilterOption[];
  onAssociationChange: (value: string) => void;
  status: string;
  statusOptions: FilterOption[];
  onStatusChange: (value: string) => void;
  action?: ReactNode;
  /** Hidden where the list is already scoped to a single association. */
  showAssociationFilter?: boolean;
};

export function OrganizationsAssembliesToolbar({
  association,
  associationOptions,
  onAssociationChange,
  status,
  statusOptions,
  onStatusChange,
  action,
  showAssociationFilter = true,
}: OrganizationsAssembliesToolbarProps) {
  return (
    <header className="mb-3 px-1">
      <div className="flex flex-nowrap items-center justify-between gap-2 sm:gap-3">
        <div className="flex min-h-10 shrink-0 items-center">
          <SectionHeading>لیست مجامع</SectionHeading>
        </div>
        <div className="flex shrink-0 flex-nowrap items-center gap-2">
          {showAssociationFilter && (
            <AssemblyFilterChip
              label="انجمن"
              options={associationOptions}
              value={association}
              onChange={onAssociationChange}
            />
          )}
          <AssemblyFilterChip label="وضعیت" options={statusOptions} value={status} onChange={onStatusChange} />
          {action}
        </div>
      </div>
    </header>
  );
}
