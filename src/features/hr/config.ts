import type { OfficerUnit } from "./types";

export const OFFICERS_PAGE_SIZE = 10;

export const officerUnits: Array<{ unit: OfficerUnit; title: string }> = [
  { unit: "organizations", title: "مأمور امور تشکل ها" },
  { unit: "card-issuance", title: "واحد صدور کارت" },
];

/** Panel of «مسئول تشکل‌ها» (`/pao`): chamber poll agents only. */
export const organizationsOfficerUnits: Array<{ unit: OfficerUnit; title: string }> = [
  { unit: "chamber-poll-agent", title: "مامور اخذ رای اتاق استان" },
];

/** Panel of «رئیس تشکل» (`/ap`): association poll agents only. */
export const associationOfficerUnits: Array<{ unit: OfficerUnit; title: string }> = [
  { unit: "association-poll-agent", title: "مامور اخذ رای انجمن" },
];
