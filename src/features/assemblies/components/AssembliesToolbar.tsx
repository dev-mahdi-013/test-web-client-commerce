import { SectionHeading } from "@/shared/components/SectionHeading";
import { SearchField } from "@/shared/components/SearchField";
import { AssemblyFilterChip, type FilterOption } from "./AssemblyFilterChip";

type AssembliesToolbarProps = {
  query?: string;
  onQueryChange?: (value: string) => void;
  searchError?: string | null;
  showSearch?: boolean;
  association?: string;
  associationOptions?: FilterOption[];
  onAssociationChange?: (value: string) => void;
  status?: string;
  statusOptions?: FilterOption[];
  onStatusChange?: (value: string) => void;
};

export function AssembliesToolbar({
  query = "",
  onQueryChange,
  searchError,
  showSearch = true,
  association,
  associationOptions,
  onAssociationChange,
  status,
  statusOptions,
  onStatusChange,
}: AssembliesToolbarProps) {
  const showAssociation =
    association != null && associationOptions != null && onAssociationChange != null;
  const showStatus = status != null && statusOptions != null && onStatusChange != null;

  return (
    <header className="mb-3 px-1">
      <div className="flex flex-nowrap items-center justify-between gap-2 sm:gap-3">
        <div className="flex min-h-10 shrink-0 items-center">
          <SectionHeading>لیست مجامع</SectionHeading>
        </div>
        {(showAssociation || showStatus) && (
          <div className="flex shrink-0 flex-nowrap items-center gap-2">
            {showAssociation && (
              <AssemblyFilterChip
                label="انجمن"
                options={associationOptions}
                value={association}
                onChange={onAssociationChange}
              />
            )}
            {showStatus && (
              <AssemblyFilterChip
                label="وضعیت"
                options={statusOptions}
                value={status}
                onChange={onStatusChange}
              />
            )}
          </div>
        )}
      </div>
      {showSearch && onQueryChange && (
        <SearchField
          className="animate-fade-in mt-3 lg:hidden"
          errorMessage={searchError}
          placeholder="عنوان"
          value={query}
          onChange={onQueryChange}
        />
      )}
    </header>
  );
}
