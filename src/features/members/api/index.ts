import type { ListMembersParams } from "../types";

export { membersApi } from "./members.api";

export const memberKeys = {
  all: ["members"] as const,
  page: (params: ListMembersParams) => [...memberKeys.all, params] as const,
  cardAssociations: (memberId: string, cardId: string) =>
    [...memberKeys.all, memberId, "cards", cardId, "associations"] as const,
};
