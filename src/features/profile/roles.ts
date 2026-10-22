import type { Profile, UserRole } from "./types";

/** Title of the card-issuance role, as shown in the role switcher. */
export const CARD_ISSUANCE_ROLE_TITLE = "واحد صدور کارت";

const BackendRoleType = {
  ProvincialChamberPresident: 0x10,
  ProvincialAssociationOfficer: 0x11,
  CardIssuanceOfficer: 0x12,
  AssociationPresident: 0x13,
  AssociationSecretary: 0x14,
  ChamberMember: 0x15,
} as const;

const backendRoleDefinitions: Partial<Record<number, { appRole: AppRole; title: string }>> = {
  [BackendRoleType.ProvincialChamberPresident]: { appRole: "chamber-president", title: "رئیس اتاق استان" },
  [BackendRoleType.ProvincialAssociationOfficer]: {
    appRole: "organizations",
    title: "مسئول امور تشکل های استان",
  },
  [BackendRoleType.CardIssuanceOfficer]: { appRole: "card-issuance", title: CARD_ISSUANCE_ROLE_TITLE },
  [BackendRoleType.AssociationPresident]: { appRole: "association-head", title: "رئیس تشکل استانی" },
  [BackendRoleType.AssociationSecretary]: {
    appRole: "association-secretary",
    title: "دبیر تشکل استانی",
  },
  [BackendRoleType.ChamberMember]: { appRole: "user", title: "عضو اتاق بازرگانی" },
};

const ROLE_TYPE_BY_BACKEND_ID: Record<string, number> = {
  "084c454fbf894278aea52686453dcf74": BackendRoleType.ProvincialChamberPresident,
  c02a6966aa3a45faa593bff8cfccf16d: BackendRoleType.ProvincialAssociationOfficer,
  "58266c9e69ed41fda78338b574cdd389": BackendRoleType.CardIssuanceOfficer,
};

/**
 * Instance role ids that must win over `roleTypeId`.
 * «رئیس انجمن» is association-info only — not shared with تشکل استانی or دبیر.
 */
const ROLE_OVERRIDE_BY_ID: Record<string, { appRole: AppRole; title: string }> = {
  "71764a3514144b5bb55101f165b4245e": { appRole: "association-info", title: "رئیس انجمن" },
};

function roleTitleKey(title: string) {
  return title.trim().replace(/\u200c/g, "").replace(/ي/g, "ی").replace(/ك/g, "ک").replace(/\s+/g, "");
}

/** Which design a role follows. Anything else keeps the general menu. */
export type AppRole =
  | "chamber-president"
  | "card-issuance"
  | "organizations"
  | "association-head"
  | "association-info"
  | "association-secretary"
  | "user"
  | "other";

const CHAMBER_PRESIDENT = roleTitleKey("رئیس اتاق استان");
const CARD_ISSUANCE = roleTitleKey(CARD_ISSUANCE_ROLE_TITLE);
const ORGANIZATIONS = roleTitleKey("امور تشکلها");
const ORGANIZATIONS_OFFICER = roleTitleKey("مأمور امور تشکل ها");
const ASSOCIATION_HEAD = roleTitleKey("رئیس انجمن مجامع");
/** Display title for the dedicated «رئیس انجمن» app role (override id / title match). */
const ASSOCIATION_INFO = roleTitleKey("رئیس انجمن");
const ASSOCIATION_SECRETARY = roleTitleKey("دبیر تشکل استانی");
const ASSOCIATION_SECRETARY_SHORT = roleTitleKey("دبیر انجمن");
const USER = roleTitleKey("کاربر");

function backendRoleDefinition(id: string | undefined) {
  const normalizedId = id?.trim().toLowerCase();
  if (!normalizedId) return undefined;
  const knownRoleType = ROLE_TYPE_BY_BACKEND_ID[normalizedId];
  if (knownRoleType !== undefined) return backendRoleDefinitions[knownRoleType];
  const numericId = normalizedId?.startsWith("0x")
    ? Number.parseInt(normalizedId.slice(2), 16)
    : Number(normalizedId);
  if (!Number.isInteger(numericId)) return undefined;
  return backendRoleDefinitions[numericId];
}

function backendRoleFor(role: Pick<UserRole, "id" | "roleTypeId"> | undefined) {
  const roleId = role?.id?.trim().toLowerCase();
  if (roleId && ROLE_OVERRIDE_BY_ID[roleId]) return ROLE_OVERRIDE_BY_ID[roleId];
  return backendRoleDefinition(role?.roleTypeId) ?? backendRoleDefinition(role?.id);
}

export function roleTitleOf(role: Pick<UserRole, "id" | "roleTypeId" | "title">): string {
  return backendRoleFor(role)?.title ?? role.title;
}

export function appRoleOf(role: Pick<UserRole, "id" | "roleTypeId" | "title"> | undefined): AppRole {
  const backendRole = backendRoleFor(role);
  if (backendRole) return backendRole.appRole;

  const title = roleTitleKey(role?.title ?? "");
  if (title === CHAMBER_PRESIDENT) return "chamber-president";
  if (title === CARD_ISSUANCE) return "card-issuance";
  if (title === ORGANIZATIONS || title === ORGANIZATIONS_OFFICER) return "organizations";
  if (title === ASSOCIATION_HEAD) return "association-head";
  if (title === ASSOCIATION_INFO) return "association-info";
  if (title === ASSOCIATION_SECRETARY || title === ASSOCIATION_SECRETARY_SHORT) {
    return "association-secretary";
  }
  if (title === USER) return "user";
  return "other";
}

/** First page of that role's menu. */
export function homePathFor(role: AppRole) {
  switch (role) {
    case "chamber-president":
      return "/assemblies";
    case "card-issuance":
      return "/union-members";
    case "organizations":
      return "/organizations/assemblies";
    case "association-head":
      return "/association/assemblies";
    case "association-info":
      return "/hr-association";
    case "association-secretary":
      return "/association-information";
    case "user":
      return "/user/assemblies";
    default:
      return "/hr";
  }
}

export function activeRoleOf(profile: Profile | undefined): UserRole | undefined {
  if (!profile) return undefined;
  return profile.roles.find((role) => role.id === profile.activeRoleId) ?? profile.roles[0];
}
