import { currentCommerceScope } from "@/lib/commerce-scope";
import type { ListAssembliesParams } from "../types";

export { assembliesApi } from "./assemblies.api";

export const assemblyKeys = {
  all: ["assemblies"] as const,
  /** Scope (`ap` / `pao` / …) so role switches don't reuse the wrong cached poll payload. */
  page: (params: ListAssembliesParams) =>
    [...assemblyKeys.all, currentCommerceScope(), params] as const,
  detail: (assemblyId: string) =>
    [...assemblyKeys.all, currentCommerceScope(), "detail", assemblyId] as const,
};
