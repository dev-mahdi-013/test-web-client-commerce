import type { UserRole } from "@/features/profile/types";
import { backendSnapshots } from "@/lib/backend-storage";
import { commerceHttp, fromEpoch, toMembershipCard, type ApiCardDetails } from "@/lib/commerce-http";
import type { MembershipCardData } from "@/shared/types/membership";

export type UserCardAssociation = {
  id: string;
  name: string;
  joinedAt: string;
};

type ApiJoinedAssociation = {
  _id: string;
  associationName: string;
  joinedDate: number;
};

type RecordedCard = {
  _id?: string;
  roleId?: string;
  startDate?: number;
  endDate?: number;
  cardDetails?: ApiCardDetails;
  joinedAssociations?: ApiJoinedAssociation[];
};

type RecordedMember = {
  _id?: string;
  name?: string;
  phone?: string;
  cards?: RecordedCard[];
  cardDetails?: ApiCardDetails;
  joinedAssociations?: ApiJoinedAssociation[];
};

function collectMembers(value: unknown, found: RecordedMember[] = []): RecordedMember[] {
  if (Array.isArray(value)) {
    for (const item of value) collectMembers(item, found);
    return found;
  }
  if (!value || typeof value !== "object") return found;

  const record = value as Record<string, unknown>;
  if (typeof record.phone === "string" && (Array.isArray(record.cards) || record.cardDetails)) {
    found.push(record as RecordedMember);
    return found;
  }
  for (const nested of Object.values(record)) collectMembers(nested, found);
  return found;
}

function digitsOf(value: string | undefined) {
  return (value ?? "").replace(/\D/g, "");
}

function recordedMember(fullName: string, phone: string) {
  const members = Object.values(backendSnapshots()).flatMap((snapshot) => collectMembers(snapshot.data));
  const digits = digitsOf(phone);
  return (
    (digits ? members.find((member) => digitsOf(member.phone) === digits) : undefined) ??
    members.find((member) => member.name === fullName)
  );
}

function recordedCard(member: RecordedMember | undefined) {
  if (!member) return undefined;
  const cards = member.cards ?? [];
  const card = cards.find((item) => !item.endDate) ?? cards[0];
  const details = card?.cardDetails ?? member.cardDetails;
  if (!details) return undefined;
  return {
    card,
    data: toMembershipCard(card?._id ?? card?.roleId ?? member._id ?? "active-card", details),
  };
}

function isApiCardDetails(value: unknown): value is ApiCardDetails {
  if (!value || typeof value !== "object") return false;
  const card = value as Record<string, unknown>;
  return (
    typeof card.cardType === "number" &&
    typeof card.name === "string" &&
    typeof card.cardNum === "string" &&
    typeof card.exprDate === "number"
  );
}

function membershipCardFromRoles(roles: UserRole[], activeRoleId: string | null) {
  const activeRole = roles.find((role) => role.id === activeRoleId);
  const prioritizedRoles = activeRole ? [activeRole, ...roles.filter((role) => role !== activeRole)] : roles;

  for (const role of prioritizedRoles) {
    const details = role.cardDetails;
    if (isApiCardDetails(details)) return toMembershipCard(role.id, details);
  }
  return undefined;
}

function toCardAssociation(association: ApiJoinedAssociation): UserCardAssociation {
  return {
    id: association._id,
    name: association.associationName,
    joinedAt: fromEpoch(association.joinedDate) ?? "",
  };
}

export const userAssembliesApi = {
  listJoinedAssociations: async () =>
    (await commerceHttp<ApiJoinedAssociation[]>("/cm/joinedAssociations")).map(toCardAssociation),

  vote: (pollId: string, surveyId: string, voteOptions: string[]) =>
    commerceHttp(`/cm/polls/${pollId}/surveys/${surveyId}/vote`, {
      method: "POST",
      body: { voteOptions },
    }),
};

export function userMembershipCard(
  fullName: string,
  phone: string,
  roles: UserRole[] = [],
  activeRoleId: string | null = null,
): MembershipCardData {
  const sessionCard = membershipCardFromRoles(roles, activeRoleId);
  if (sessionCard) return sessionCard;

  const recorded = recordedCard(recordedMember(fullName, phone));
  if (recorded) return recorded.data;

  return {
    id: "active-card",
    kind: "natural",
    holderName: fullName,
    managerName: null,
    managerNationalId: null,
    nationalCode: null,
    cardNo: "—",
    expiresAt: "",
    expired: false,
    hasCommerceCard: false,
    commerceExpiresAt: null,
  };
}

export function userCardAssociations(fullName: string, phone: string): UserCardAssociation[] {
  const member = recordedMember(fullName, phone);
  const associations = recordedCard(member)?.card?.joinedAssociations ?? member?.joinedAssociations ?? [];
  return associations.map(toCardAssociation);
}
