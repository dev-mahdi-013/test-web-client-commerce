import assembliesIconUrl from "@/assets/images/icons/navigation/assemblies.svg";
import associationsIconUrl from "@/assets/images/icons/navigation/associations.svg";
import chamberMembersIconUrl from "@/assets/images/icons/navigation/chamber-members.svg";
import chamberMembersListIconUrl from "@/assets/images/icons/navigation/chamber-members-list.svg";
import electionsIconUrl from "@/assets/images/icons/navigation/elections.svg";
import humanResourcesIconUrl from "@/assets/images/icons/navigation/human-resources.svg";
import type { AppRole } from "@/features/profile/roles";

export type NavItem = {
  to: string;
  label: string;
  icon: string;
};

const hr: NavItem = { to: "/hr", label: "منابع انسانی", icon: humanResourcesIconUrl };
const hrAssociation: NavItem = { to: "/hr-association", label: "منابع انسانی", icon: humanResourcesIconUrl };
const chamberMembers: NavItem = { to: "/members", label: "لیست اعضای اتاق", icon: chamberMembersListIconUrl };
const organizationMembers: NavItem = { to: "/members", label: "اعضای اتاق", icon: chamberMembersIconUrl };
const associationInfo: NavItem = { to: "/association-information", label: "اطلاعات", icon: chamberMembersIconUrl };
const cardIssuance: NavItem = { to: "/union-members", label: "اعضای اتاق", icon: chamberMembersIconUrl };
const associations: NavItem = { to: "/associations", label: "انجمن ها", icon: associationsIconUrl };
const chamberAssemblies: NavItem = { to: "/assemblies", label: "مجامع", icon: assembliesIconUrl };
const organizationAssemblies: NavItem = { to: "/organizations/assemblies", label: "مجامع", icon: assembliesIconUrl };
const associationAssemblies: NavItem = { to: "/association/assemblies", label: "مجامع", icon: assembliesIconUrl };
const userElections: NavItem = { to: "/user/assemblies", label: "انتخابات", icon: electionsIconUrl };

const menus: Record<AppRole, NavItem[]> = {
  "chamber-president": [hr, chamberMembers, associations, chamberAssemblies],
  "card-issuance": [cardIssuance],
  organizations: [organizationMembers, associations, organizationAssemblies],
  "association-head": [hrAssociation, associationInfo, associationAssemblies],
  "association-info": [hrAssociation, associationInfo, associationAssemblies],
  "association-secretary": [associationInfo, associationAssemblies],
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
