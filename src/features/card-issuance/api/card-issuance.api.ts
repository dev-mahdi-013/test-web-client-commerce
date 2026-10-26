import { jalaliToDate } from "@/lib/date";
import { commerceHttp, toEpoch, toMembershipCard, type ApiCardDetails } from "@/lib/commerce-http";
import type { MemberKind } from "@/shared/types/membership";
import type { ChamberMember } from "@/features/members/types";

type ApiMember = {
  _id: string;
  name: string;
  phone: string;
  cards: Array<{
    _id: string;
    cardDetails: ApiCardDetails;
  }>;
};

export type CardPayload = {
  kind: MemberKind;
  name: string;
  cardNo: string;
  expiresAt: string;
  managerName?: string;
  managerNationalId?: string;
  nationalCode?: string;
  commerceExpiresAt?: string;
};

export type CreateMemberPayload = {
  fullName: string;
  nationalCode: string;
  phone: string;
  card: CardPayload;
};

function jalaliToEpoch(value: string) {
  const [jy = 0, jm = 0, jd = 0] = value.split("/").map(Number);
  return toEpoch(jalaliToDate({ jy, jm, jd }));
}

function toCardBody(card: CardPayload) {
  if (card.kind === "legal") {
    return {
      type: "Legal" as const,
      data: {
        companyName: card.name.trim(),
        ceoName: card.managerName?.trim() ?? "",
        // The request body names the CEO's national code `nationalCode`; only responses use `ceoNationalCode`.
        nationalCode: card.managerNationalId ?? "",
        cardNum: card.cardNo,
        exprDate: jalaliToEpoch(card.expiresAt),
      },
    };
  }
  return {
    type: "Real" as const,
    data: {
      name: card.name.trim(),
      nationalCode: card.nationalCode ?? "",
      cardNum: card.cardNo,
      exprDate: jalaliToEpoch(card.expiresAt),
      commerceExprDate: card.commerceExpiresAt ? jalaliToEpoch(card.commerceExpiresAt) : 0,
    },
  };
}

function toMember(member: ApiMember): ChamberMember {
  return {
    id: member._id,
    fullName: member.name,
    phone: member.phone,
    associationCount: 0,
    cards: member.cards.map((card) => toMembershipCard(card._id, card.cardDetails)),
  };
}

export const cardIssuanceApi = {
  createMember: async (input: CreateMemberPayload) =>
    toMember(
      await commerceHttp<ApiMember>("/cio/members/new", {
        method: "POST",
        body: {
          name: input.fullName.trim(),
          phone: input.phone,
          cards: [toCardBody(input.card)],
        },
      }),
    ),

  addCard: async (memberId: string, card: CardPayload) =>
    toMember(
      await commerceHttp<ApiMember>(`/cio/members/${memberId}/addCard`, {
        method: "POST",
        body: toCardBody(card),
      }),
    ),

  extendExpiry: async (memberId: string, cardRoleId: string, expiresAt: string) => {
    await commerceHttp(`/cio/members/${memberId}/${cardRoleId}/expireExtension`, {
      method: "POST",
      body: { exprDate: jalaliToEpoch(expiresAt) },
    });
  },

  removeCard: (memberId: string, cardRoleId: string) =>
    commerceHttp(`/cio/members/${memberId}/${cardRoleId}/remove`, { method: "DELETE" }),

  extendCommerceExpiry: async (memberId: string, cardRoleId: string, expiresAt: string) => {
    await commerceHttp(`/cio/members/${memberId}/${cardRoleId}/commerceCard/expireExtension`, {
      method: "POST",
      body: { exprDate: jalaliToEpoch(expiresAt) },
    });
  },

  disableCommerceCard: async (memberId: string, cardRoleId: string) => {
    await commerceHttp(`/cio/members/${memberId}/${cardRoleId}/commerceCard/disable`, { method: "POST" });
  },
};
