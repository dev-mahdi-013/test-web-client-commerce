import type { MembershipCardData } from "@/shared/types/membership";

export type MemberAssociation = {
  id: string;
  name: string;
  joinedAt: string;
};

export type ChamberMember = {
  id: string;
  fullName: string;
  phone: string;
  associationCount: number;
  /** Card count reported by the service (`cardsCount` on the member row). */
  cardsCount: number;
  cards: MembershipCardData[];
};

export type ListMembersParams = {
  page: number;
  query?: string;
  associationId?: string | null;
};
