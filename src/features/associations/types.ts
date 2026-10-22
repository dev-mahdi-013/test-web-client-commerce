import type { MembershipCardData } from "@/shared/types/membership";

export type Association = {
  id: string;
  name: string;
  foundedAt: string | null;
  lastMeetingAt: string | null;
  presidentId: string | null;
  presidentName: string | null;
  secretaryName: string | null;
};

export type AssociationDraft = {
  name: string;
  /** A yyyy/mm/dd Jalali date, or an empty string while nothing is picked. */
  foundedAt: string;
};

export type AssociationMember = {
  id: string;
  fullName: string;
  phone: string;
  joinedAt: string;
  card: MembershipCardData;
};

export type ListAssociationsParams = {
  page: number;
  query?: string;
};

export type ListAssociationMembersParams = {
  associationId: string;
  page: number;
};
