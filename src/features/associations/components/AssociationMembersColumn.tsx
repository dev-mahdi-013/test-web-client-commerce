import { CalendarIcon } from "@solar-icons/react/linear/calendar";
import { PhoneIcon } from "@solar-icons/react/linear/phone";
import { UserIcon } from "@solar-icons/react/linear/user";
import { UserIdIcon } from "@solar-icons/react/linear/user-id";
import { Spinner } from "@heroui/react";
import { formatJalali } from "@/lib/date";
import { CardCarousel } from "@/shared/components/CardCarousel";
import { CardValidityPill } from "@/shared/components/CardValidityPill";
import { MemberMetaField } from "@/shared/components/MemberMetaField";
import { MembershipCard, WithAccentStrip } from "@/shared/components/MembershipCard";
import type { AssociationMember } from "../types";
import { RemoveAssociationMemberButton } from "./RemoveAssociationMemberButton";

type AssociationMembersColumnProps = {
  associationId: string | null;
  members: AssociationMember[];
  isLoading: boolean;
  /** Lets the viewer remove a member from the association. */
  canManageCards?: boolean;
};

function AssociationMemberCard({
  associationId,
  member,
  canManageCards,
}: {
  associationId: string;
  member: AssociationMember;
  canManageCards: boolean;
}) {
  const [memberId = "", memberRoleId = ""] = member.id.split(".");

  return (
    <article className="overflow-hidden rounded-[20px] bg-white">
      <div className="grid grid-cols-2 gap-x-3 gap-y-3 px-4 pt-4 pb-4">
        <MemberMetaField
          icon={UserIcon}
          iconClassName="bg-(--field-muted)"
          label="نام و نام خانوادگی"
          value={member.fullName}
        />
        <MemberMetaField
          icon={CalendarIcon}
          iconClassName="bg-(--field-muted)"
          label="تاریخ عضویت"
          value={<span dir="ltr">{formatJalali(member.joinedAt)}</span>}
        />
        <MemberMetaField
          icon={PhoneIcon}
          iconClassName="bg-(--field-muted)"
          label="شماره تماس"
          value={<span dir="ltr">{member.phone}</span>}
        />
        <MemberMetaField
          icon={UserIdIcon}
          iconClassName="bg-(--field-muted)"
          label="کد ملی"
          value={<span dir="ltr">{member.card.managerNationalId ?? "------"}</span>}
        />
      </div>
      <WithAccentStrip>
        <MembershipCard
          card={member.card}
          className="shadow-none"
          dimWhenExpired={false}
          footer={
            canManageCards ? (
              <>
                <RemoveAssociationMemberButton
                  associationId={associationId}
                  cardNo={member.card.cardNo}
                  memberId={memberId}
                  memberRoleId={memberRoleId}
                />
                <CardValidityPill withIcon card={member.card} />
              </>
            ) : (
              <CardValidityPill card={member.card} />
            )
          }
        />
      </WithAccentStrip>
    </article>
  );
}

export function AssociationMembersColumn({
  associationId,
  members,
  isLoading,
  canManageCards = false,
}: AssociationMembersColumnProps) {
  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Spinner size="sm" />
      </div>
    );
  }

  if (members.length === 0 || !associationId) {
    return <p className="flex h-40 items-center justify-center text-sm text-muted">عضوی برای این انجمن ثبت نشده است</p>;
  }

  return (
    <CardCarousel peek>
      {members.map((member) => (
        <AssociationMemberCard
          key={member.id}
          associationId={associationId}
          canManageCards={canManageCards}
          member={member}
        />
      ))}
    </CardCarousel>
  );
}
