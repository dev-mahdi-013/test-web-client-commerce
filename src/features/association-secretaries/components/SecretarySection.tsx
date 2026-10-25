import { AddCircleIcon } from "@solar-icons/react/linear/add-circle";
import { Button, toast, useOverlayState } from "@heroui/react";
import { useState } from "react";
import { getErrorMessage, isAccessDeniedError } from "@/lib/http";
import { SimplePagination } from "@/shared/components/SimplePagination";
import { SECRETARIES_PAGE_SIZE, SECRETARY_SECTION_TITLE } from "../config";
import { useAssociationSecretaries, useRemoveAssociationSecretary } from "../hooks/useAssociationSecretaries";
import type { AssociationSecretary } from "../types";
import { AddSecretaryModal } from "./AddSecretaryModal";
import { SecretariesTable } from "./SecretariesTable";

const ACCESS_DENIED_MESSAGE = "شما به این صفحه دسترسی ندارید";

/** Same card layout as HR `OfficerSection`; data from `/ap/agents/20`. */
export function SecretarySection() {
  const [page, setPage] = useState(1);
  const [accessDeniedAfterAction, setAccessDeniedAfterAction] = useState(false);
  const addModal = useOverlayState();
  const secretaries = useAssociationSecretaries({ page });
  const removeSecretary = useRemoveAssociationSecretary();

  const items = secretaries.data?.items ?? [];
  const totalPages = secretaries.data?.totalPages ?? 1;
  const currentPage = secretaries.data?.page ?? page;
  const startIndex = (currentPage - 1) * SECRETARIES_PAGE_SIZE + 1;
  const accessDenied =
    accessDeniedAfterAction || (secretaries.isError && isAccessDeniedError(secretaries.error));

  const handleDelete = (secretary: AssociationSecretary) => {
    removeSecretary.mutate(secretary, {
      onSuccess: async () => {
        toast.success(`${secretary.fullName} عزل شد`);
        // Refetch; if this role can no longer hit `/ap/agents`, show access denied on the page.
        const result = await secretaries.refetch();
        if (result.error && isAccessDeniedError(result.error)) {
          setAccessDeniedAfterAction(true);
        }
      },
      onError: (error) => {
        if (isAccessDeniedError(error)) {
          setAccessDeniedAfterAction(true);
          toast.danger(ACCESS_DENIED_MESSAGE);
          return;
        }
        toast.danger(getErrorMessage(error, "عزل دبیر انجام نشد"));
      },
    });
  };

  if (accessDenied) {
    return (
      <section
        aria-label={SECRETARY_SECTION_TITLE}
        className="flex h-[551px] max-w-full flex-col items-center justify-center overflow-hidden rounded-[28px] bg-(--panel) p-6 text-center lg:h-[520px] 2xl:h-[700px]"
      >
        <p className="text-sm text-muted">{ACCESS_DENIED_MESSAGE}</p>
      </section>
    );
  }

  return (
    <section
      className="flex h-[551px] max-w-full flex-col overflow-hidden rounded-[28px] bg-(--panel) p-3 sm:p-4 lg:h-[520px] 2xl:h-[700px] max-lg:last:mb-4"
      aria-label={SECRETARY_SECTION_TITLE}
    >
      <header className="mb-3 flex shrink-0 items-center justify-between gap-3 px-1">
        <h2 className="flex items-center gap-2 text-[15px] font-normal">
          <span aria-hidden className="size-2 shrink-0 rounded-full bg-(--heading-bullet)" />
          {SECRETARY_SECTION_TITLE}
        </h2>
        <Button className="h-8 gap-2 rounded-full ps-4 pe-2 text-note" size="sm" onPress={addModal.open}>
          افزودن دبیر
          <AddCircleIcon className="size-5" />
        </Button>
      </header>

      <SecretariesTable
        isLoading={secretaries.isPending}
        secretaries={items}
        startIndex={startIndex}
        title={SECRETARY_SECTION_TITLE}
        onDelete={handleDelete}
      />

      {secretaries.isError && (
        <p className="px-1 pt-2 text-xs text-danger" role="alert">
          {getErrorMessage(secretaries.error, "بارگذاری دبیران انجام نشد")}
        </p>
      )}

      <div className="mt-auto shrink-0 px-1 pt-4">
        <SimplePagination
          isDisabled={secretaries.isFetching}
          page={currentPage}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>

      <AddSecretaryModal isOpen={addModal.isOpen} onOpenChange={addModal.setOpen} />
    </section>
  );
}
