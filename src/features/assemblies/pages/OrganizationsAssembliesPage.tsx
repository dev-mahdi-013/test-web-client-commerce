import { AddCircleIcon } from "@solar-icons/react/linear/add-circle";
import { Button } from "@heroui/react";
import { useState } from "react";
import { SimplePagination } from "@/shared/components/SimplePagination";
import { ASSEMBLIES_PAGE_SIZE, organizationsStatusOptions } from "../config";
import { useAssemblies } from "../hooks/useAssemblies";
import { useAssemblyAssociationOptions } from "../hooks/useAssemblyAssociationOptions";
import { AddAssemblyModal } from "../organizations/components/AddAssemblyModal";
import { OrganizationsAssembliesTable } from "../organizations/components/OrganizationsAssembliesTable";
import { OrganizationsAssembliesToolbar } from "../organizations/components/OrganizationsAssembliesToolbar";
import type { AssemblyStatus } from "../types";

const ALL = "all";
const addButtonClassName = "h-9 gap-2 rounded-full ps-4 pe-2 text-note";

/** Assemblies list for the organizations (امور تشکل‌ها) role. */
export function OrganizationsAssembliesPage() {
  const [association, setAssociation] = useState(ALL);
  const [status, setStatus] = useState(ALL);
  const [isAddOpen, setAddOpen] = useState(false);
  const [page, setPage] = useState(1);
  const associationOptions = useAssemblyAssociationOptions();

  const assemblies = useAssemblies({
    page,
    association: association === ALL ? undefined : association,
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
              افزودن مجمع
              <AddCircleIcon className="size-5" />
            </Button>
          }
          association={association}
          associationOptions={[
            { value: ALL, label: "همه انجمن‌ها" },
            ...(associationOptions.data ?? []),
          ]}
          status={status}
          statusOptions={[{ value: ALL, label: "همه وضعیت‌ها" }, ...organizationsStatusOptions]}
          onAssociationChange={(value) => {
            setAssociation(value);
            setPage(1);
          }}
          onStatusChange={(value) => {
            setStatus(value);
            setPage(1);
          }}
        />

        <OrganizationsAssembliesTable
          assemblies={items}
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

      <AddAssemblyModal isOpen={isAddOpen} onOpenChange={setAddOpen} />
    </>
  );
}
