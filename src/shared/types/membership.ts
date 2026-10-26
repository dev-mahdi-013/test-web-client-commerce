export type MemberKind = "natural" | "legal";

export const memberKindLabel: Record<MemberKind, string> = {
  natural: "حقیقی",
  legal: "حقوقی",
};

export type MembershipCardData = {
  id: string;
  kind: MemberKind;
  /** Member name for natural cards, company name for legal cards */
  holderName: string;
  managerName: string | null;
  managerNationalId: string | null;
  /** Holder's national code from `cardDetails.nationalCode` */
  nationalCode: string | null;
  cardNo: string;
  expiresAt: string;
  expired: boolean;
  /** True only for natural cards that carry a commerce (بازرگانی) card */
  hasCommerceCard: boolean;
  /** Commerce card expiry as ISO string, null when the card has no commerce card */
  commerceExpiresAt: string | null;
};
