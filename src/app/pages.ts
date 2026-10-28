/**
 * Single place that knows how to load every page chunk.
 * The router uses it for lazy routes and preload-pages.ts uses it to warm the chunks up at login.
 */
export const pages = {
  LoginPage: () => import("@/features/auth/pages/LoginPage"),
  ProfilePage: () => import("@/features/profile/pages/ProfilePage"),
  HrPage: () => import("@/features/hr/pages/HrPage"),
  MembersPage: () => import("@/features/members/pages/MembersPage"),
  AssociationInfoPage: () => import("@/features/members/pages/AssociationInfoPage"),
  AssociationSecretariesPage: () => import("@/features/association-secretaries/pages/AssociationSecretariesPage"),
  UnionMembersPage: () => import("@/features/card-issuance/pages/UnionMembersPage"),
  AssociationsPage: () => import("@/features/associations/pages/AssociationsPage"),
  ChamberAssembliesPage: () => import("@/features/assemblies/pages/ChamberAssembliesPage"),
  ChamberAssemblyDetailPage: () => import("@/features/assemblies/pages/ChamberAssemblyDetailPage"),
  OrganizationsAssembliesPage: () => import("@/features/assemblies/pages/OrganizationsAssembliesPage"),
  OrganizationsAssemblyDetailPage: () => import("@/features/assemblies/pages/OrganizationsAssemblyDetailPage"),
  AssociationAssembliesPage: () => import("@/features/assemblies/pages/AssociationAssembliesPage"),
  AssociationAssemblyDetailPage: () => import("@/features/assemblies/pages/AssociationAssemblyDetailPage"),
  UserAssembliesPage: () => import("@/features/assemblies/pages/UserAssembliesPage"),
  UserAssemblyDetailPage: () => import("@/features/assemblies/pages/UserAssemblyDetailPage"),
} as const;
