import { useState } from "react";
import { SimplePagination } from "@/shared/components/SimplePagination";
import { useSearchPagination } from "@/shared/hooks/useSearchPagination";
import { AssembliesTable } from "../components/AssembliesTable";
import { AssembliesToolbar } from "../components/AssembliesToolbar";
import { ASSEMBLIES_PAGE_SIZE, statusOptions } from "../config";
import { useAssemblies } from "../hooks/useAssemblies";
import { useAssemblyAssociationOptions } from "../hooks/useAssemblyAssociationOptions";
import type { AssemblyStatus } from "../types";

const ALL = "all";

/** List of assemblies for the chamber-president role (read-only). */
export function ChamberAssembliesPage() {
  const [association, setAssociation] = useState(ALL);
  const [status, setStatus] = useState(ALL);
  const { query, setQuery, debouncedQuery, searchError, page, setPage } = useSearchPagination(`${association}|${status}`);
  const associationOptions = useAssemblyAssociationOptions();

  const assemblies = useAssemblies({
    page,
    query: debouncedQuery,
    association: association === ALL ? undefined : association,
    status: status === ALL ? undefined : (status as AssemblyStatus),
  });

  const items = assemblies.data?.items ?? [];
  const currentPage = assemblies.data?.page ?? page;
  const totalPages = assemblies.data?.totalPages ?? 1;
  const startIndex = (currentPage - 1) * (assemblies.data?.pageSize ?? ASSEMBLIES_PAGE_SIZE) + 1;

  return (
    <section
      aria-label="لیست مجامع"
      className="flex h-[551px] max-w-full flex-col overflow-hidden rounded-[28px] bg-(--panel) p-3 sm:p-4 lg:h-[640px] 2xl:h-[700px] max-lg:mb-4"
    >
      <AssembliesToolbar
        association={association}
        associationOptions={[
          { value: ALL, label: "همه انجمن‌ها" },
          ...(associationOptions.data ?? []),
        ]}
        query={query}
        searchError={searchError}
        status={status}
        statusOptions={[{ value: ALL, label: "همه وضعیت‌ها" }, ...statusOptions]}
        onAssociationChange={setAssociation}
        onQueryChange={setQuery}
        onStatusChange={setStatus}
      />

      <AssembliesTable assemblies={items} isLoading={assemblies.isPending} startIndex={startIndex} />

      <div className="px-1 pt-4">
        <SimplePagination
          isDisabled={assemblies.isFetching}
          page={currentPage}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </section>
  );
}
