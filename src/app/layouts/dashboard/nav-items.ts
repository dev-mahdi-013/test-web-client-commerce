import type { Icon } from "@solar-icons/react/lib/types";
import { CardIcon } from "@solar-icons/react/linear/card";
import { HomeAngleIcon } from "@solar-icons/react/linear/home-angle";
import { SettingsIcon } from "@solar-icons/react/linear/settings";
import { UserPlusRoundedIcon } from "@solar-icons/react/linear/user-plus-rounded";
import { WalletIcon } from "@solar-icons/react/linear/wallet";
import { Widget2Icon } from "@solar-icons/react/linear/widget-2";
import type { AppRole } from "@/features/profile/roles";

export type NavItem = {
  to: string;
  label: string;
  icon: Icon;
};

const hr: NavItem = { to: "/hr", label: "منابع انسانی", icon: HomeAngleIcon };
const hrAssociation: NavItem = { to: "/hr-association", label: "منابع انسانی", icon: HomeAngleIcon };
const chamberMembers: NavItem = { to: "/members", label: "لیست اعضای اتاق", icon: UserPlusRoundedIcon };
const organizationMembers: NavItem = { to: "/members", label: "اعضای اتاق", icon: UserPlusRoundedIcon };
const associationInfo: NavItem = { to: "/association-information", label: "اطلاعات", icon: UserPlusRoundedIcon };
const cardIssuance: NavItem = { to: "/union-members", label: "اعضای اتاق", icon: CardIcon };
const associations: NavItem = { to: "/associations", label: "انجمن ها", icon: WalletIcon };
const chamberAssemblies: NavItem = { to: "/assemblies", label: "مجامع", icon: SettingsIcon };
const organizationAssemblies: NavItem = { to: "/organizations/assemblies", label: "مجامع", icon: SettingsIcon };
const associationAssemblies: NavItem = { to: "/association/assemblies", label: "مجامع", icon: SettingsIcon };
const userElections: NavItem = { to: "/user/assemblies", label: "انتخابات", icon: Widget2Icon };

const menus: Record<AppRole, NavItem[]> = {
  "chamber-president": [hr, chamberMembers, associations, chamberAssemblies],
  "card-issuance": [cardIssuance],
  organizations: [organizationMembers, associations, organizationAssemblies],
  "association-head": [organizationMembers, associations, associationAssemblies],
  /** Only «رئیس انجمن» — منابع انسانی / اطلاعات / مجامع */
  "association-info": [hrAssociation, associationInfo, associationAssemblies],
  /**
   * دبیر تشکل (docs): same `/ap` as president except agents.
   * → اطلاعات + انجمن‌ها + مجامع؛ بدون منابع انسانی (`/ap/agents` → 403).
   */
  "association-secretary": [associationInfo, associations, associationAssemblies],
  user: [userElections],
  other: [hr, chamberMembers, associations, chamberAssemblies],
};

export function navItemsFor(role: AppRole) {
  return menus[role];
}

/** Flat list for lookups that are not tied to the active role. */
export const navItems: NavItem[] = [
  hr,
  hrAssociation,
  chamberMembers,
  associationInfo,
  cardIssuance,
  associations,
  chamberAssemblies,
  organizationAssemblies,
  associationAssemblies,
  userElections,
];
