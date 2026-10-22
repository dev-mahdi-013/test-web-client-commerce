import { AddCircleIcon } from "@solar-icons/react/linear/add-circle";
import { CalendarIcon } from "@solar-icons/react/linear/calendar";
import { PhoneIcon } from "@solar-icons/react/linear/phone";
import { UserIcon } from "@solar-icons/react/linear/user";
import { UserIdIcon } from "@solar-icons/react/linear/user-id";
import { Button, Spinner } from "@heroui/react";
import { useEffect, useState } from "react";
import { useMembers } from "@/features/members/hooks/useMembers";
import { cn } from "@/lib/cn";
import { formatJalali } from "@/lib/date";
import { CardValidityPill } from "@/shared/components/CardValidityPill";
import { MemberMetaField } from "@/shared/components/MemberMetaField";
import { MembershipCard } from "@/shared/components/MembershipCard";
import { SearchField } from "@/shared/components/SearchField";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import type { MembershipCardData } from "@/shared/types/membership";

/** A member together with one of their cards; the association joins that card. */
export type PickerMember = {
  /** Unique per member-card pair, so a member with several cards lists once per card. */
  key: string;
  fullName: string;
  phone: string;
  card: MembershipCardData;
};

type AssociationMemberPickerProps = {
  /** Hands the picked member to the caller; the picker only searches and selects. */
  onAdd: (member: PickerMember, onSuccess: () => void) => void;
  isAdding?: boolean;
};

/**
 * Searches the members of the chamber by name, phone or card number and previews the card of
 * the member the operator picks, ready to be added to an association.
 */
export function AssociationMemberPicker({ onAdd, isAdding = false }: AssociationMemberPickerProps) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query.trim());
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const members = useMembers({ page: 1, query: debouncedQuery });
  const rows: PickerMember[] = (members.data?.items ?? []).flatMap((member) =>
    member.cards.map((card) => ({
      key: `${member.id}.${card.id}`,
      fullName: member.fullName,
      phone: member.phone,
      card,
    })),
  );
  const hasQuery = query.trim().length > 0;
  const selected = hasQuery ? (rows.find((row) => row.key === selectedKey) ?? null) : null;
  const resultKeys = rows.map((row) => row.key).join("|");

  // Keep the selection on a live row; prefer the first hit when the query changes.
  // Gate on the live query so clearing after add hides the card before debounce catches up.
  useEffect(() => {
    if (!hasQuery || !resultKeys) {
      setSelectedKey(null);
      return;
    }
    const keys = resultKeys.split("|");
    if (!selectedKey || !keys.includes(selectedKey)) {
      setSelectedKey(keys[0] ?? null);
    }
  }, [hasQuery, resultKeys, selectedKey]);

  const handleAdd = (member: PickerMember) => {
    onAdd(member, () => {
      setSelectedKey(null);
      setQuery("");
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <SearchField
        className="w-full"
        isMuted
        rounded="xl"
        placeholder="جست و جو در نام، تلفن یا شماره کارت"
        value={query}
        onChange={setQuery}
      />

      {hasQuery &&
        (members.isPending ? (
          <div className="flex h-16 items-center justify-center">
            <Spinner size="sm" />
          </div>
        ) : rows.length === 0 ? (
          <p className="flex h-16 items-center justify-center text-xs text-muted">عضوی پیدا نشد</p>
        ) : (
          <>
            {rows.length > 1 && (
              <ul className="flex max-h-[104px] flex-col gap-2 overflow-y-auto rounded-2xl bg-(--panel-cards) p-2">
                {rows.map((row) => (
                  <li key={row.key}>
                    <button
                      type="button"
                      aria-pressed={row.key === selectedKey}
                      className={cn(
                        "w-full cursor-pointer rounded-2xl px-3 py-2.5 text-start transition-colors",
                        row.key === selectedKey ? "bg-white" : "hover:bg-white/60",
                      )}
                      onClick={() => setSelectedKey(row.key)}
                    >
                      <span className="flex items-center justify-between gap-3 text-xs">
                        <span className="truncate font-bold">{row.fullName}</span>
                        <span className="shrink-0 text-muted" dir="ltr">
                          {row.card.cardNo}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {selected && (
              <article className="overflow-hidden rounded-[20px] bg-(--field-muted) p-2">
                <div className="grid grid-cols-2 gap-x-3 gap-y-3 rounded-2xl bg-white px-3 pt-3 pb-4">
                  <MemberMetaField icon={UserIcon} label="نام و نام خانوادگی" value={selected.fullName} />
                  <MemberMetaField
                    icon={PhoneIcon}
                    label="شماره تماس"
                    value={<span dir="ltr">{selected.phone}</span>}
                  />
                  <MemberMetaField
                    icon={CalendarIcon}
                    label="تاریخ انقضا"
                    value={<span dir="ltr">{formatJalali(selected.card.expiresAt)}</span>}
                  />
                  <MemberMetaField
                    contentKey={selected.card.cardNo}
                    icon={UserIdIcon}
                    label="شماره کارت"
                    ltrEllipsisWhenTruncated
                    value={<span dir="ltr">{selected.card.cardNo}</span>}
                  />
                </div>

                <MembershipCard
                  card={selected.card}
                  className="mt-2 shadow-none"
                  dimWhenExpired={false}
                  footer={
                    <>
                    <Button
                      className="h-9 gap-1.5 rounded-full ps-1.5 pe-4 text-xs font-bold text-white"
                      isDisabled={isAdding}
                      isPending={isAdding}
                      onPress={() => handleAdd(selected)}
                    >
                      <AddCircleIcon className="size-6" />
                      <span className="mt-1">افزودن</span>
                    </Button>
                    <CardValidityPill withIcon card={selected.card} />
                  </>
                }
                />
              </article>
            )}
          </>
        ))}
    </div>
  );
}
