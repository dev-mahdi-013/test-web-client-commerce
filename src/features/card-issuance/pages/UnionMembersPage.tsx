import { AddCircleIcon } from "@solar-icons/react/linear/add-circle";
import { Button, toast, useOverlayState } from "@heroui/react";
import { useEffect, useState } from "react";
import { MembersTable } from "@/features/members/components/MembersList";
import { MembersMobileList } from "@/features/members/components/MembersMobileList";
import { useMembers } from "@/features/members/hooks/useMembers";
import type { ChamberMember } from "@/features/members/types";
import { ListSectionHeader } from "@/shared/components/ListSectionHeader";
import { MembershipCardPlaceholder } from "@/shared/components/MembershipCard";
import { SectionHeading } from "@/shared/components/SectionHeading";
import { SimplePagination } from "@/shared/components/SimplePagination";
import { useRevealWhenReady } from "@/shared/hooks/useRevealWhenReady";
import { useSearchPagination } from "@/shared/hooks/useSearchPagination";
import { AddCardModal } from "../components/AddCardModal";
import { AddCardTile } from "../components/AddCardTile";
import { AddMemberModal } from "../components/AddMemberModal";
import { IssuanceCard } from "../components/IssuanceCard";

/** The workspace of the card-issuance unit: the members it issues cards for, and their cards. */
export function UnionMembersPage() {
  const { query, setQuery, debouncedQuery, searchError, page, setPage } = useSearchPagination();
  const [selected, setSelected] = useState<ChamberMember | null>(null);
  const addMember = useOverlayState();
  const addCard = useOverlayState();
  const cards = useRevealWhenReady<HTMLElement>(selected?.id ?? null);
  const members = useMembers({ page, query: debouncedQuery });
  const items = members.data?.items ?? [];
  const totalPages = members.data?.totalPages ?? 1;
  const startIndex = (page - 1) * (members.data?.pageSize ?? 0) + 1;
  const hasCards = !!selected && selected.cards.length > 0;

  useEffect(() => {
    if (!selected) return;
    const updatedMember = items.find((member) => member.id === selected.id);
    if (updatedMember) setSelected((current) => (current?.id === updatedMember.id ? updatedMember : current));
  }, [items, selected?.id]);

  const handleSelect = (id: string) => {
    setSelected(items.find((member) => member.id === id) ?? null);
    cards.requestReveal(id);
  };

  const handleAddCard = () => {
    if (!selected) {
      toast.info("برای افزودن کارت ابتدا یک عضو را انتخاب کنید");
      return;
    }
    addCard.open();
  };

  return (
    <div className="flex w-full flex-col gap-6 2xl:grid 2xl:grid-cols-[minmax(0,1fr)_692px] 2xl:items-start 2xl:gap-9">
      <section
        aria-label="اعضای اتاق"
        className="order-2 flex h-[551px] flex-col rounded-[28px] bg-(--panel) p-3 sm:p-4 lg:h-[520px] 2xl:order-none 2xl:h-[727px] max-lg:mb-4"
      >
        <ListSectionHeader
          action={
            <Button className="h-9 gap-2 rounded-full ps-4 pe-2 text-[13px]" size="sm" onPress={addMember.open}>
              افزودن
              <AddCircleIcon className="size-5" />
            </Button>
          }
          query={query}
          searchError={searchError}
          title="اعضای اتاق"
          onQueryChange={setQuery}
        />

        <div className="hidden  flex-1 flex-col lg:flex">
          <MembersTable
            isLoading={members.isPending}
            members={items}
            selectedId={selected?.id ?? null}
            showAssociationCount={false}
            startIndex={startIndex}
            onSelect={handleSelect}
          />
        </div>

        <MembersMobileList
          isLoading={members.isPending}
          members={items}
          selectedId={selected?.id ?? null}
          startIndex={startIndex}
          onSelect={handleSelect}
        />

        <div className="px-1 pt-4">
          <SimplePagination
            isDisabled={members.isFetching}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      </section>

      <section
        aria-label="مشاهده کارت ها"
        className="order-1 flex w-full max-w-full flex-col rounded-[20px] bg-(--panel-cards) p-4 sm:w-[350px] sm:p-5 2xl:order-none 2xl:w-auto"
      >
        <header ref={cards.ref} className="mb-4 scroll-mt-20 px-1 lg:scroll-mt-28">
          <SectionHeading>مشاهده کارت ها</SectionHeading>
        </header>

        {members.isPending && !hasCards ? (
          <MembershipCardPlaceholder />
        ) : (
          <div key={selected?.id} className="grid grid-cols-1 gap-4 2xl:grid-cols-2">
            <AddCardTile className={hasCards ? undefined : "2xl:col-span-2"} onPress={handleAddCard} />
            {selected?.cards.map((card) => (
              <IssuanceCard key={card.id} card={card} memberId={selected.id} />
            ))}
          </div>
        )}
      </section>

      <AddMemberModal isOpen={addMember.isOpen} pickExpiryDate onOpenChange={addMember.setOpen} />
      <AddCardModal
        isOpen={addCard.isOpen}
        memberId={selected?.id ?? null}
        memberName={selected?.fullName ?? ""}
        onOpenChange={addCard.setOpen}
      />
    </div>
  );
}
