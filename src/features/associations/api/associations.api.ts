import { jalaliToDate } from "@/lib/date";
import { commerceHttp, commercePage, fromEpoch, toEpoch, toMembershipCard, type ApiCardDetails } from "@/lib/commerce-http";
import { currentCommerceScope } from "@/lib/commerce-scope";
import type {
  Association,
  AssociationMember,
  ListAssociationMembersParams,
  ListAssociationsParams,
} from "../types";

type ApiAssociation = {
  _id: string;
  name: string;
  establishmentDate: number;
  lastPollDate: number;
  presidentId?: string;
  presidentName?: string;
  secretaryId?: string;
  secretaryName?: string;
};

type ApiAssociationMember = {
  _id: string;
  roleId: string;
  name: string;
  phone: string;
  joinedDate: number;
  cardDetails: ApiCardDetails;
};

function associationsBase() {
  return currentCommerceScope() === "pao" ? "/pao/associations" : "/pcp/associations";
}

function toAssociation(association: ApiAssociation): Association {
  return {
    id: association._id,
    name: association.name,
    foundedAt: fromEpoch(association.establishmentDate),
    lastMeetingAt: fromEpoch(association.lastPollDate),
    presidentId: association.presidentId || null,
    presidentName: association.presidentName || null,
    secretaryName: association.secretaryName || null,
  };
}

function toMember(member: ApiAssociationMember): AssociationMember {
  return {
    // A member joins with one of their cards, and may join with several
    id: `${member._id}.${member.roleId}`,
    fullName: member.name,
    phone: member.phone,
    joinedAt: fromEpoch(member.joinedDate) ?? new Date(0).toISOString(),
    card: toMembershipCard(member.roleId, member.cardDetails),
  };
}

function jalaliToEpoch(value: string) {
  const [jy = 0, jm = 0, jd = 0] = value.split("/").map(Number);
  return toEpoch(jalaliToDate({ jy, jm, jd }));
}

export const associationsApi = {
  listAssociations: async ({ page, query }: ListAssociationsParams) => {
    // The association-president API exposes only the active association.
    if (currentCommerceScope() === "ap") {
      const info = await commerceHttp<ApiAssociation | ApiAssociation[]>("/ap/association/info");
      const association = Array.isArray(info) ? info[0] : info;
      return {
        items: association ? [toAssociation(association)] : [],
        page: 1,
        pageSize: 1,
        total: association ? 1 : 0,
        totalPages: 1,
      };
    }
    return commercePage(`${associationsBase()}/list`, { page, searchKeyword: query }, toAssociation);
  },

  listMembers: async ({ associationId, page }: ListAssociationMembersParams) => {
    if (currentCommerceScope() === "ap") {
      const members = await commerceHttp<ApiAssociationMember[]>("/ap/association/members/list");
      return {
        items: members.map(toMember),
        page: 1,
        pageSize: Math.max(1, members.length),
        total: members.length,
        totalPages: 1,
      };
    }
    return commercePage(`${associationsBase()}/${associationId}/members/list`, { page }, toMember);
  },

  listAllMembers: async (associationId: string) => {
    const path = `${associationsBase()}/${associationId}/members/list`;
    const firstPage = await commercePage<ApiAssociationMember, AssociationMember>(
      path,
      { page: 1 },
      toMember,
    );
    if (firstPage.totalPages <= 1) return firstPage.items;

    const remainingPages = await Promise.all(
      Array.from({ length: firstPage.totalPages - 1 }, (_, index) =>
        commercePage<ApiAssociationMember, AssociationMember>(
          path,
          { page: index + 2 },
          toMember,
        ),
      ),
    );
    return [firstPage, ...remainingPages].flatMap((page) => page.items);
  },

  createAssociation: async ({ name, foundedAt }: { name: string; foundedAt: string }) =>
    toAssociation(
      await commerceHttp<ApiAssociation>(`${associationsBase()}/new`, {
        method: "POST",
        body: { name: name.trim(), establishmentDate: jalaliToEpoch(foundedAt) },
      }),
    ),

  updateAssociation: async (
    associationId: string,
    { name, foundedAt }: { name: string; foundedAt: string },
  ) =>
    toAssociation(
      await commerceHttp<ApiAssociation>(`${associationsBase()}/${associationId}/edit`, {
        method: "POST",
        body: { name: name.trim(), establishmentDate: jalaliToEpoch(foundedAt) },
      }),
    ),

  addMember: ({
    associationId,
    memberId,
    memberRoleId,
  }: {
    associationId: string;
    memberId: string;
    memberRoleId: string;
  }) =>
    commerceHttp(`${associationsBase()}/${associationId}/members/add`, {
      method: "POST",
      body: { memberId, memberRoleId },
    }),

  removeMember: ({
    associationId,
    memberId,
    memberRoleId,
  }: {
    associationId: string;
    memberId: string;
    memberRoleId: string;
  }) =>
    commerceHttp(`${associationsBase()}/${associationId}/members/${memberId}/${memberRoleId}/remove`, {
      method: "DELETE",
    }),

  changeBoss: ({
    associationId,
    memberId,
    memberRoleId,
  }: {
    associationId: string;
    memberId: string;
    memberRoleId: string;
  }) =>
    commerceHttp(`${associationsBase()}/${associationId}/boss/change`, {
      method: "POST",
      body: { memberId, memberRoleId },
    }),
};
