import { useState } from "react";
import { useProfile } from "@/features/profile/hooks/useProfile";
import { activeRoleOf, appRoleOf } from "@/features/profile/roles";
import { CardCarousel } from "@/shared/components/CardCarousel";
import { ListSectionHeader } from "@/shared/components/ListSectionHeader";
import { MembershipCardPlaceholder } from "@/shared/components/MembershipCard";
import { SectionHeading } from "@/shared/components/SectionHeading";
import { SimplePagination } from "@/shared/components/SimplePagination";
import { useRevealWhenReady } from "@/shared/hooks/useRevealWhenReady";
import { useSearchPagination } from "@/shared/hooks/useSearchPagination";
import { AssociationInfoCard } from "../components/AssociationInfoCard";
import { MemberCardItem } from "../components/MemberCardItem";
import { MembersTable } from "../components/MembersList";
import { useMembers } from "../hooks/useMembers";
import type { ChamberMember } from "../types";

type MembersPageProps = {
  showAssociationInfo?: boolean;
};

export function MembersPage({ showAssociationInfo = false }: MembersPageProps) {
  const profile = useProfile();
  const isOrganizations = appRoleOf(activeRoleOf(profile.data)) === "organizations";
  const { query, setQuery, debouncedQuery, searchError, page, setPage } = useSearchPagination();
  const [selected, setSelected] = useState<ChamberMember | null>(null);
  const cards = useRevealWhenReady<HTMLElement>(selected?.id ?? null);
  const members = useMembers({ page, query: debouncedQuery });
  const items = members.data?.items ?? [];
  const totalPages = members.data?.totalPages ?? 1;
  const startIndex = (page - 1) * (members.data?.pageSize ?? 0) + 1;

  const handleSelect = (id: string) => {
    setSelected(items.find((member) => member.id === id) ?? null);
    cards.requestReveal(id);
  };

  return (
    <div className="flex w-full flex-col gap-6 2xl:grid 2xl:grid-cols-[minmax(0,1fr)_382px] 2xl:items-start 2xl:gap-9">
      <section
        aria-label={isOrganizations ? "اعضای اتاق" : "لیست اعضا"}
        className="order-2 flex min-h-[551px] flex-col overflow-hidden rounded-[28px] lg:min-h-[640px] 2xl:order-none 2xl:min-h-[727px] max-lg:mb-4"
      >
        {showAssociationInfo && <AssociationInfoCard className="lg:flex hidden mb-4 shrink-0" />}

        <div className="flex  flex-1 flex-col overflow-hidden bg-(--panel) p-3 sm:p-4">
          <ListSectionHeader
            query={query}
            searchError={searchError}
            title={isOrganizations ? "اعضای اتاق" : "لیست اعضا"}
            onQueryChange={setQuery}
          />

          <div className="flex  flex-col overflow-hidden rounded-[20px] bg-white">
            <MembersTable
              isLoading={members.isPending}
              members={items}
              selectedId={selected?.id ?? null}
              startIndex={startIndex}
              onSelect={handleSelect}
            />
          </div>

          <div className="mt-auto shrink-0 px-1 pt-4">
            <SimplePagination
              isDisabled={members.isFetching}
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        </div>
      </section>

       {showAssociationInfo && <AssociationInfoCard className="mb-0 flex shrink-0 lg:hidden" />}

      <section
        aria-label="مشاهده کارت ها"
        className="order-1 flex w-full max-w-full flex-col rounded-[28px] bg-(--panel) p-3 sm:p-4 2xl:order-none"
      >
        <header ref={cards.ref} className="mb-3 scroll-mt-20 px-1 lg:scroll-mt-28">
          <SectionHeading>مشاهده کارت ها</SectionHeading>
        </header>

        {selected && selected.cards.length > 0 ? (
          <CardCarousel key={selected.id} peek>
            {selected.cards.map((card) => (
              <MemberCardItem key={card.id} card={card} memberId={selected.id} />
            ))}
          </CardCarousel>
        ) : (
          <MembershipCardPlaceholder />
        )}
      </section>
    </div>
  );
}
