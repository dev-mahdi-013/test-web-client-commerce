import { AddCircleIcon } from "@solar-icons/react/linear/add-circle";
import { Button, useOverlayState } from "@heroui/react";
import { useState } from "react";
import { SimplePagination } from "@/shared/components/SimplePagination";
import { OFFICERS_PAGE_SIZE } from "../config";
import { useOfficers } from "../hooks/useOfficers";
import type { OfficerUnit } from "../types";
import { AddOfficerModal } from "./AddOfficerModal";
import { OfficersTable } from "./OfficersTable";

type OfficerSectionProps = {
  unit: OfficerUnit;
  title: string;
};

export function OfficerSection({ unit, title }: OfficerSectionProps) {
  const [page, setPage] = useState(1);
  const addModal = useOverlayState();
  const officers = useOfficers({ unit, page, pageSize: OFFICERS_PAGE_SIZE });

  const items = officers.data?.items ?? [];
  const totalPages = officers.data?.totalPages ?? 1;
  const currentPage = officers.data?.page ?? page;
  const startIndex = (currentPage - 1) * OFFICERS_PAGE_SIZE + 1;

  return (
    <section
      className="flex h-[551px] max-w-full flex-col overflow-hidden rounded-[28px] bg-(--panel) p-3 sm:p-4 lg:h-[520px] 2xl:h-[700px] max-lg:last:mb-4"
      aria-label={title}
    >
      <header className="mb-3 flex shrink-0 items-center justify-between gap-3 px-1">
        <h2 className="flex items-center gap-2 text-[15px] font-normal">
          <span aria-hidden className="size-2 shrink-0 rounded-full bg-(--heading-bullet)" />
          {title}
        </h2>
        <Button className="h-8 gap-2 rounded-full ps-4 pe-2 text-[13px]" size="sm" onPress={addModal.open}>
          افزودن مأمور
          <AddCircleIcon className="size-5" />
        </Button>
      </header>

      <OfficersTable
        isLoading={officers.isPending}
        officers={items}
        startIndex={startIndex}
        title={title}
        unit={unit}
      />

      <div className="mt-auto shrink-0 px-1 pt-4">
        <SimplePagination
          isDisabled={officers.isFetching}
          page={currentPage}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>

      <AddOfficerModal isOpen={addModal.isOpen} unit={unit} onOpenChange={addModal.setOpen} />
    </section>
  );
}
