import { commerceHttp, fromEpoch } from "@/lib/commerce-http";
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

export const userAssembliesApi = {
  listJoinedAssociations: async () =>
    (await commerceHttp<ApiJoinedAssociation[]>("/cm/joinedAssociations")).map(
      (association): UserCardAssociation => ({
        id: association._id,
        name: association.associationName,
        // `0` means unset — don't fall back to epoch (shows as 1348/10/11).
        joinedAt: fromEpoch(association.joinedDate) ?? "",
      }),
    ),

  vote: (pollId: string, surveyId: string, voteOptions: string[]) =>
    commerceHttp(`/cm/polls/${pollId}/surveys/${surveyId}/vote`, {
      method: "POST",
      body: { voteOptions },
    }),
};

/**
 * Card shell for the user role until Commerce exposes the active card details.
 * Do not use epoch `0` for expiry — it formats as Jalali 1348/10/11.
 */
export function userMembershipCard(holderName: string): MembershipCardData {
  return {
    id: "active-card",
    kind: "natural",
    holderName,
    managerName: null,
    managerNationalId: null,
    cardNo: "—",
    expiresAt: "",
    expired: false,
  };
}
