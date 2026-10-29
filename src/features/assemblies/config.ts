import type { AgendaKind, AssemblyCardType, AssemblyStatus, AssemblyUnit } from "./types";

export const ASSEMBLIES_PAGE_SIZE = 9;

/** Shared واجدین options for assembly/agenda unit selects. */
export const assemblyUnitOptions: Array<{ value: AssemblyUnit; label: string }> = [
  { value: "حقیقی", label: "حقیقی" },
  { value: "حقوقی", label: "حقوقی" },
];

export const assemblyCreationUnitOptions: Array<{ value: AssemblyUnit; label: string }> = [
  { value: "همه", label: "همه" },
  ...assemblyUnitOptions,
];

/** Card types an assembly can be limited to (نوع کارت). */
export const assemblyCardTypeOptions: Array<{ value: AssemblyCardType; label: string }> = [
  { value: "همه", label: "همه" },
  { value: "بازرگانی", label: "بازرگانی" },
];

/** Longest assembly title shown in the assemblies tables. */
export const ASSEMBLY_TITLE_MAX_CHARS = 40;

/** Longest creator name shown in the توسط column of the assemblies tables. */
export const ASSEMBLY_CREATED_BY_MAX_CHARS = 24;

type StatusMeta = {
  label: string;
  /** Background and foreground tokens for the status pill. */
  className: string;
};

export const statusMeta: Record<AssemblyStatus, StatusMeta> = {
  running: {
    label: "در حال برگزاری",
    className: "border border-(--status-running) bg-(--status-running-bg) text-(--status-running)",
  },
  published: {
    label: "در انتظار",
    className: "border border-(--status-published) bg-(--status-published-bg) text-(--status-published)",
  },
  pending: {
    label: "پیش‌نویس",
    className: "border border-(--status-pending) bg-(--status-pending-bg) text-(--status-pending)",
  },
  finished: {
    label: "پایان مجمع",
    className: "border border-(--status-finished) bg-(--status-finished-bg) text-(--status-finished)",
  },
  archived: {
    label: "بایگانی",
    className: "border border-(--status-archived) bg-(--status-archived-bg) text-(--status-archived)",
  },
  canceled: {
    label:"بازبینی",
    className: "border border-(--status-canceled) bg-(--status-canceled-bg) text-(--status-canceled)",
  },
};

// The API defines poll status codes 0x01..0x05 only; archived is not a valid filter there.
export const statusOptions = (Object.keys(statusMeta) as AssemblyStatus[])
  .filter((status) => status !== "archived")
  .map((value) => ({
    value,
    label: statusMeta[value].label,
  }));

export const agendaKindLabel: Record<AgendaKind, string> = {
  person: "شخص",
  text: "نوشته",
};

/** Status labels shown on the organizations (امور تشکل‌ها) assemblies screens. */
export const organizationsStatusMeta: Record<AssemblyStatus, StatusMeta> = {
  ...statusMeta,
  published: {
    label: "در انتظار",
    className: statusMeta.published.className,
  },
  canceled: {
    label: "در حال تایید",
    className: statusMeta.canceled.className,
  },
  running: {
    label: "در حال برگزاری",
    className: statusMeta.running.className,
  },
};

export const organizationsStatusOptions = (Object.keys(organizationsStatusMeta) as AssemblyStatus[])
  .filter((status) => status !== "archived")
  .map((value) => ({
    value,
    label: organizationsStatusMeta[value].label,
  }));

function normalizeCreatorText(value: string) {
  return value.replace(/\u200c/g, "").replace(/\s+/g, "").replace(/ي/g, "ی").replace(/ك/g, "ک");
}

/** True when the توسط text shows the chamber (e.g. "اتاق"). */
export function isChamberCreator(createdBy: string | null | undefined) {
  if (!createdBy) return false;
  return normalizeCreatorText(createdBy).includes(normalizeCreatorText("اتاق"));
}
