import type { Key } from "@heroui/react";
import { Autocomplete, EmptyState, ListBox, SearchField, Spinner } from "@heroui/react";
import { useState } from "react";
import { useMembers } from "@/features/members/hooks/useMembers";
import { currentCommerceScope } from "@/lib/commerce-scope";
import { getErrorMessage } from "@/lib/http";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";

export type AgendaMemberCandidate = {
  id: string;
  name: string;
  cardNo: string;
  memberId: string;
  memberRoleId: string;
};

type AgendaMemberSearchFieldProps = {
  associationId?: string | null;
  existingIds: string[];
  existingMemberIds?: string[];
  isDisabled?: boolean;
  isPending?: boolean;
  onAdd: (candidate: AgendaMemberCandidate, onSuccess: () => void) => void;
};

/** Id of the placeholder row that shows loading / error / empty states inside the list. */
const STATUS_ITEM_ID = "__status__";

export function AgendaMemberSearchField({
  associationId,
  existingIds,
  existingMemberIds = [],
  isDisabled = false,
  isPending = false,
  onAdd,
}: AgendaMemberSearchFieldProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const debouncedQuery = useDebouncedValue(query.trim());
  const isSearchCurrent = debouncedQuery === query.trim();
  const canSearch = currentCommerceScope() !== "pao" || Boolean(associationId);
  const members = useMembers({ page: 1, query: debouncedQuery, associationId }, canSearch);

  // Association rows use a composite `memberId.roleId` id; the member id is only the part before the dot.
  const allCards = isSearchCurrent
    ? (members.data?.items ?? []).flatMap((member) =>
        member.cards.map((card) => ({ memberId: member.id.split(".")[0] ?? member.id, name: member.fullName, card })),
      )
    : [];
  const candidates: AgendaMemberCandidate[] = allCards
    .filter(({ memberId, card }) => {
      const candidateId = `${memberId}.${card.id}`;
      return !existingIds.includes(candidateId) && !existingMemberIds.includes(memberId);
    })
    .map(({ memberId, name, card }) => ({
      id: `${memberId}.${card.id}`,
      name,
      cardNo: card.cardNo,
      memberId,
      memberRoleId: card.id,
    }));

  const isLoading = canSearch && (!isSearchCurrent || members.isPending || members.isFetching);

  const handleSelectionChange = (value: Key | Key[] | null) => {
    const key = Array.isArray(value) ? value[0] : value;
    if (typeof key !== "string" || key === STATUS_ITEM_ID || isDisabled || isPending) return;
    const candidate = candidates.find((item) => item.id === key);
    if (!candidate || existingIds.includes(candidate.id) || existingMemberIds.includes(candidate.memberId))
      return;

    setSelectedId(key);
    onAdd(candidate, () => {
      setSelectedId(null);
      setQuery("");
      setIsOpen(false);
    });
  };

  /**
   * react-aria's Select refuses to open when its collection is empty, so the list must always
   * contain at least one item. While there are no real candidates we render a single disabled
   * "status" row (loading / error / no result) instead of swapping the ListBox out.
   */
  const statusContent = !canSearch ? (
    <EmptyState>شناسه انجمن برای این مجمع موجود نیست</EmptyState>
  ) : members.isError ? (
    <EmptyState>{getErrorMessage(members.error, "دریافت اعضای انجمن انجام نشد")}</EmptyState>
  ) : isLoading ? (
    <div className="flex h-10 items-center justify-center">
      <Spinner size="sm" />
    </div>
  ) : (
    <EmptyState>عضوی پیدا نشد</EmptyState>
  );

  return (
    <Autocomplete
      className="w-full"
      isDisabled={isDisabled || isPending}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      placeholder="جستجو و انتخاب اعضای انجمن"
      selectionMode="single"
      value={selectedId}
      variant="secondary"
      onChange={handleSelectionChange}
    >
      <Autocomplete.Trigger className="h-9 w-full rounded-[12px] bg-white text-sm shadow-(--box-shadow)">
        <Autocomplete.Value className="autocomplete__value text-sm" />
        <Autocomplete.Indicator />
      </Autocomplete.Trigger>
      <Autocomplete.Popover className="z-[var(--z-index-overlay)] w-(--trigger-width) rounded-xl bg-white p-2 shadow-(--box-shadow)">
        {/* Search is done by the server, so the local filter must not hide anything. */}
        <Autocomplete.Filter filter={() => true}>
          <SearchField
            aria-label="جستجوی عضو کاندیدا"
            autoFocus
            className="mb-2"
            isDisabled={isDisabled || isPending || !canSearch}
            value={query}
            variant="secondary"
            onChange={(value) => {
              setQuery(value);
              setSelectedId(null);
            }}
          >
            <SearchField.Group
              className="h-9 gap-0 rounded-xl border border-(--panel-border) bg-white px-0"
              dir="ltr"
            >
              <SearchField.SearchIcon className="!ms-1 size-4 shrink-0 text-muted" />
              <SearchField.Input
                className="!px-0 min-w-0 flex-1 bg-transparent text-start text-sm shadow-none"
                dir={query ? "auto" : "rtl"}
                placeholder="جستجوی نام یا شماره کارت"
              />
              <SearchField.ClearButton className="!me-0 size-4 cursor-pointer" />
            </SearchField.Group>
          </SearchField>

          <ListBox aria-label="اعضای قابل انتخاب" className="max-h-48 overflow-y-auto">
            {candidates.length === 0 ? (
              <ListBox.Item
                key={STATUS_ITEM_ID}
                id={STATUS_ITEM_ID}
                className="cursor-default justify-center opacity-100"
                isDisabled
                textValue="وضعیت"
              >
                {statusContent}
              </ListBox.Item>
            ) : (
              candidates.map((candidate) => (
                <ListBox.Item
                  key={candidate.id}
                  id={candidate.id}
                  textValue={`${candidate.name} ${candidate.cardNo}`}
                >
                  <span className="truncate font-bold">{candidate.name}</span>
                  <span className="ms-auto shrink-0 text-muted" dir="ltr">
                    {candidate.cardNo}
                  </span>
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              ))
            )}
          </ListBox>
        </Autocomplete.Filter>
      </Autocomplete.Popover>
    </Autocomplete>
  );
}
