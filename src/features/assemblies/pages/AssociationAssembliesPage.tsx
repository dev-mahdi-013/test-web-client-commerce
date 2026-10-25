import { AddCircleIcon } from "@solar-icons/react/linear/add-circle";
import { Button } from "@heroui/react";
import { useState } from "react";
import { SimplePagination } from "@/shared/components/SimplePagination";
import { ASSEMBLIES_PAGE_SIZE, organizationsStatusOptions } from "../config";
import { AddAssociationAssemblyModal } from "../association-head/components/AddAssociationAssemblyModal";
import { useAssemblies } from "../hooks/useAssemblies";
import { OrganizationsAssembliesTable } from "../organizations/components/OrganizationsAssembliesTable";
import { OrganizationsAssembliesToolbar } from "../organizations/components/OrganizationsAssembliesToolbar";
import type { AssemblyStatus } from "../types";

const ALL = "all";
const addButtonClassName = "h-9 gap-2 rounded-full ps-4 pe-2 text-note";
const DETAIL_BASE_PATH = "/association/assemblies";

/** Assemblies list for the association-head (رئیس انجمن مجامع) role. */
export function AssociationAssembliesPage() {
  const [status, setStatus] = useState(ALL);
  const [isAddOpen, setAddOpen] = useState(false);
  const [page, setPage] = useState(1);

  // The association-president list is already scoped to the active association.
  const assemblies = useAssemblies({
    page,
    status: status === ALL ? undefined : (status as AssemblyStatus),
  });

  const items = assemblies.data?.items ?? [];
  const currentPage = assemblies.data?.page ?? page;
  const totalPages = assemblies.data?.totalPages ?? 1;
  const startIndex = (currentPage - 1) * (assemblies.data?.pageSize ?? ASSEMBLIES_PAGE_SIZE) + 1;

  return (
    <>
      <section
        aria-label="لیست مجامع"
        className="flex h-[551px] max-w-full flex-col overflow-hidden rounded-[28px] bg-(--panel) p-3 sm:p-4 lg:h-[640px] 2xl:h-[700px] max-lg:mb-4"
      >
        <OrganizationsAssembliesToolbar
          action={
            <Button className={addButtonClassName} size="sm" onPress={() => setAddOpen(true)}>
              <span className="max-sm:hidden">افزودن مجمع</span>
              <span className="sm:hidden">افزودن</span>
              <AddCircleIcon className="size-5" />
            </Button>
          }
          association={ALL}
          associationOptions={[]}
          showAssociationFilter={false}
          status={status}
          statusOptions={[{ value: ALL, label: "همه وضعیت‌ها" }, ...organizationsStatusOptions]}
          onAssociationChange={() => undefined}
          onStatusChange={(value) => {
            setStatus(value);
            setPage(1);
          }}
        />

        <OrganizationsAssembliesTable
          assemblies={items}
          detailBasePath={DETAIL_BASE_PATH}
          isLoading={assemblies.isPending}
          startIndex={startIndex}
        />

        <div className="px-1 pt-4">
          <SimplePagination
            isDisabled={assemblies.isFetching}
            page={currentPage}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      </section>

      <AddAssociationAssemblyModal isOpen={isAddOpen} onOpenChange={setAddOpen} />
    </>
  );
}
