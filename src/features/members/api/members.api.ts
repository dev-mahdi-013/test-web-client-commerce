import { commerceHttp, commercePage, fromEpoch, toMembershipCard, type ApiCardDetails } from "@/lib/commerce-http";
import { currentCommerceScope } from "@/lib/commerce-scope";
import type { ChamberMember, ListMembersParams, MemberAssociation } from "../types";

type ApiJoinedAssociation = {
  _id: string;
  associationName: string;
  joinedDate: number;
};

type ApiMember = {
  _id: string;
  name: string;
  phone: string;
  /** Number of cards the member holds, counted by the service. */
  cardsCount?: number;
  cards: Array<{
    _id: string;
    cardDetails: ApiCardDetails;
    joinedAssociations?: ApiJoinedAssociation[];
  }>;
};

/** Association-president active association summary. */
type ApiAssociationInfo = {
  _id: string;
  name: string;
};

/** Association-president member: one card, identified by its card role id. */
type ApiAssociationMember = {
  id?: string;
  _id?: string;
  roleId: string;
  name: string;
  phone: string;
  joinedDate?: number;
  cardDetails?: ApiCardDetails;
  cardsCount?: number;
};

const AP_MEMBERS_PAGE_SIZE = 30;

function membersBase() {
  const scope = currentCommerceScope();
  if (scope === "cio") return "/cio/members";
  if (scope === "pao") return "/pao/members";
  if (scope === "ap") return "/ap/association/members";
  return "/pcp/members";
}

function toMember(member: ApiMember): ChamberMember {
  const associationIds = new Set(member.cards.flatMap((card) => (card.joinedAssociations ?? []).map(({ _id }) => _id)));
  return {
    id: member._id,
    fullName: member.name,
    phone: member.phone,
    associationCount: associationIds.size,
    cardsCount: member.cardsCount ?? member.cards.length,
    cards: member.cards.map((card) => toMembershipCard(card._id, card.cardDetails)),
  };
}

function toAssociation(association: ApiJoinedAssociation): MemberAssociation {
  return {
    id: association._id,
    name: association.associationName,
    joinedAt: fromEpoch(association.joinedDate) ?? new Date(0).toISOString(),
  };
}

function toAssociationMember(member: ApiAssociationMember, id?: string): ChamberMember {
  // `id` must be a string: never let an `Array.map` index leak in here.
  const memberId = (typeof id === "string" ? id : undefined) ?? member.id ?? member._id;
  if (!memberId) {
    throw new Error("شناسه عضو انجمن در پاسخ سرویس موجود نیست");
  }

  return {
    id: memberId,
    fullName: member.name,
    phone: member.phone,
    associationCount: 1,
    cardsCount: member.cardsCount ?? (member.cardDetails ? 1 : 0),
    cards: member.cardDetails ? [toMembershipCard(member.roleId, member.cardDetails)] : [],
  };
}

/**
 * `/ap` answers with one row per membership, so a member with two cards comes back twice with the
 * same `_id`; the row id adds the card role id to stay unique in the table.
 */
function apMemberId(member: ApiAssociationMember) {
  const memberId = member.id ?? member._id;
  if (!memberId) {
    throw new Error("شناسه عضو انجمن در پاسخ سرویس موجود نیست");
  }
  return `${memberId}.${member.roleId}`;
}

export const membersApi = {
  listMembers: async ({ page, query, associationId }: ListMembersParams) => {
    const scope = currentCommerceScope();
    if (scope === "pao" && associationId) {
      return commercePage<ApiAssociationMember, ChamberMember>(
        `/pao/associations/${associationId}/members/list`,
        { page, searchKeyword: query },
        (member) => toAssociationMember(member),
      );
    }

    if (scope === "ap") {
      // The association endpoint returns all members; search and pages are cut here.
      const members = await commerceHttp<ApiAssociationMember[]>("/ap/association/members/list");
      const keyword = query?.trim();
      const matched = keyword
        ? members.filter(
            (member) =>
              member.name.includes(keyword) ||
              member.phone.includes(keyword) ||
              (member.cardDetails?.cardNum ?? "").includes(keyword),
          )
        : members;
      const totalPages = Math.max(1, Math.ceil(matched.length / AP_MEMBERS_PAGE_SIZE));
      const current = Math.min(page, totalPages);
      const start = (current - 1) * AP_MEMBERS_PAGE_SIZE;
      return {
        items: matched
          .slice(start, start + AP_MEMBERS_PAGE_SIZE)
          .map((member) => toAssociationMember(member, apMemberId(member))),
        page: current,
        pageSize: AP_MEMBERS_PAGE_SIZE,
        total: matched.length,
        totalPages,
      };
    }

    return commercePage(`${membersBase()}/list`, { page, searchKeyword: query }, toMember);
  },

  listCardAssociations: async (memberId: string, cardId: string) => {
    if (currentCommerceScope() === "ap") {
      // The association-president API has no per-card list; every member belongs to the
      // president's association, so its info plus the member's join date is the answer.
      const [info, members] = await Promise.all([
        commerceHttp<ApiAssociationInfo | ApiAssociationInfo[]>("/ap/association/info"),
        commerceHttp<ApiAssociationMember[]>("/ap/association/members/list"),
      ]);
      const association = Array.isArray(info) ? info[0] : info;
      if (!association) return [];
      const member = members.find((item) => apMemberId(item) === memberId);
      return [
        {
          id: association._id,
          name: association.name,
          joinedAt: fromEpoch(member?.joinedDate ?? 0) ?? new Date(0).toISOString(),
        },
      ];
    }
    return (
      await commerceHttp<ApiJoinedAssociation[]>(`${membersBase()}/${memberId}/${cardId}/joinedAssociations`)
    ).map(toAssociation);
  },
};
