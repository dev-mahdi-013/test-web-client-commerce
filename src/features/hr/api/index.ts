import type { OfficerUnit } from "../types";

export { hrApi } from "./hr.api";

export const hrKeys = {
  all: ["hr"] as const,
  officers: (unit: OfficerUnit) => [...hrKeys.all, "officers", unit] as const,
};
