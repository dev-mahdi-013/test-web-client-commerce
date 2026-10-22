import type { ListAssociationsParams } from "../types";

export { associationsApi } from "./associations.api";

export const associationKeys = {
  all: ["associations"] as const,
  page: (params: ListAssociationsParams) => [...associationKeys.all, params] as const,
  members: (associationId: string, page: number) =>
    [...associationKeys.all, "members", associationId, page] as const,
  allMembers: (associationId: string) =>
    [...associationKeys.all, "members", associationId, "all"] as const,
};
