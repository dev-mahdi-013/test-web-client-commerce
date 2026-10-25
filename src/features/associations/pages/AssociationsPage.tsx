import { AddCircleIcon } from "@solar-icons/react/linear/add-circle";
import { Button, toast } from "@heroui/react";
import { useState } from "react";
import { useProfile } from "@/features/profile/hooks/useProfile";
import { activeRoleOf, appRoleOf } from "@/features/profile/roles";
import { ListSectionHeader } from "@/shared/components/ListSectionHeader";
import { SectionHeading } from "@/shared/components/SectionHeading";
import { SimplePagination } from "@/shared/components/SimplePagination";
import { useRevealWhenReady } from "@/shared/hooks/useRevealWhenReady";
import { useSearchPagination } from "@/shared/hooks/useSearchPagination";
import { AddAssociationMemberModal } from "../components/AddAssociationMemberModal";
import { AddAssociationModal } from "../components/AddAssociationModal";
import { AssociationMembersColumn } from "../components/AssociationMembersColumn";
import { AssociationsTable } from "../components/AssociationsList";
import { useChangeAssociationBoss, useUpdateAssociation } from "../hooks/useAssociationMutations";
import { useAssociationMembers, useAssociations } from "../hooks/useAssociations";
import type { Association } from "../types";

const addButtonClassName = "h-9 gap-2 rounded-full ps-4 pe-2 text-note";

export function AssociationsPage() {
  const profile = useProfile();
  const isOrganizations = appRoleOf(activeRoleOf(profile.data)) === "organizations";
  const { query, setQuery, debouncedQuery, searchError, page, setPage } = useSearchPagination();
  const [chosen, setChosen] = useState<Association | null>(null);
  const [isAddOpen, setAddOpen] = useState(false);
  const [isAddMemberOpen, setAddMemberOpen] = useState(false);
  const associations = useAssociations({ page, query: debouncedQuery });
  const updateAssociation = useUpdateAssociation();
  const changeBoss = useChangeAssociationBoss();
  const items = associations.data?.items ?? [];
  // Until the user picks one, preview the first association of the current page.
  const selected = chosen ?? items[0] ?? null;
  const [membersPageState, setMembersPageState] = useState({ associationId: "", page: 1 });
  const membersPage = membersPageState.associationId === selected?.id ? membersPageState.page : 1;
  const members = useAssociationMembers(selected?.id ?? null, membersPage);
  const membersPanel = useRevealWhenReady<HTMLElement>(selected && members.isSuccess ? selected.id : null);
  const totalPages = associations.data?.totalPages ?? 1;
  const membersTotalPages = members.data?.totalPages ?? 1;

  const handleAddMember = () => {
    if (!selected) {
      toast.info("برای افزودن عضو ابتدا یک انجمن را انتخاب کنید");
      return;
    }
    setAddMemberOpen(true);
  };

  return (
    <div className="flex w-full flex-col gap-6 2xl:grid 2xl:grid-cols-[minmax(0,1fr)_382px] 2xl:items-start 2xl:gap-9">
      <section aria-label="انجمن ها" className="order-2 flex h-[551px] flex-col rounded-[28px] bg-(--panel) p-3 sm:p-4 lg:h-[520px] 2xl:order-none 2xl:h-[727px] max-lg:mb-4">
        <ListSectionHeader
          actionAtEnd
          action={
            isOrganizations && (
              <Button className={addButtonClassName} size="sm" onPress={() => setAddOpen(true)}>
                افزودن
                <AddCircleIcon className="size-5" />
              </Button>
            )
          }
          query={query}
          searchError={searchError}
          title="انجمن ها"
          onQueryChange={setQuery}
        />

        <AssociationsTable
          associations={items}
          canEdit={isOrganizations}
          isSaving={updateAssociation.isPending || changeBoss.isPending}
          isLoading={associations.isPending}
          selectedId={selected?.id ?? null}
          startIndex={(page - 1) * (associations.data?.pageSize ?? 0) + 1}
          onSave={(id, draft, onSuccess) => {
            if (!draft.foundedAt) {
              toast.danger("تاریخ تأسیس انجمن را مشخص کنید");
              return;
            }
            updateAssociation.mutate(
              { associationId: id, name: draft.name, foundedAt: draft.foundedAt },
              { onSuccess },
            );
          }}
          onChangeBoss={(associationId, member, onSuccess) => {
            const [memberId = "", memberRoleId = ""] = member.id.split(".");
            if (!memberId || !memberRoleId) {
              toast.danger("اطلاعات عضو برای تغییر رئیس معتبر نیست");
              return;
            }
            changeBoss.mutate({ associationId, memberId, memberRoleId }, { onSuccess });
          }}
          onSelect={(id) => {
            setChosen(items.find((association) => association.id === id) ?? null);
            membersPanel.requestReveal(id);
          }}
        />

        <div className="px-1 pt-4">
          <SimplePagination
            isDisabled={associations.isFetching}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      </section>

      <section
        aria-label="اعضای انجمن انتخابی"
        className="order-1 flex w-full max-w-full flex-col rounded-[28px] bg-(--panel) p-3 sm:p-4 2xl:order-none 2xl:h-[727px]"
      >
        <header
          ref={membersPanel.ref}
          className="mb-3 flex min-h-10 scroll-mt-20 items-center justify-between gap-3 px-1 lg:scroll-mt-28"
        >
          <SectionHeading>اعضای انجمن انتخابی</SectionHeading>
          {isOrganizations && (
            <Button className={addButtonClassName} size="sm" onPress={handleAddMember}>
              افزودن
              <AddCircleIcon className="size-5" />
            </Button>
          )}
        </header>
        <AssociationMembersColumn
          key={`${selected?.id}.${membersPage}`}
          associationId={selected?.id ?? null}
          canManageCards={isOrganizations}
          isLoading={associations.isPending || members.isLoading}
          members={members.data?.items ?? []}
        />
        {membersTotalPages > 1 && (
          <div className="px-1 pt-4">
            <SimplePagination
              isDisabled={members.isFetching}
              page={membersPage}
              totalPages={membersTotalPages}
              onPageChange={(nextPage) => setMembersPageState({ associationId: selected?.id ?? "", page: nextPage })}
            />
          </div>
        )}
      </section>

      {isOrganizations && (
        <>
          <AddAssociationModal isOpen={isAddOpen} onOpenChange={setAddOpen} />
          <AddAssociationMemberModal
            associationId={selected?.id ?? null}
            isOpen={isAddMemberOpen}
            onOpenChange={setAddMemberOpen}
          />
        </>
      )}
    </div>
  );
}
