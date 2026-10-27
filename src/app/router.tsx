import { createBrowserRouter, Navigate } from "react-router";
import { GuestOnly, RequireAppRole, RequireAuth, RoleHome } from "./guards";
import { DashboardLayout } from "./layouts/dashboard/DashboardLayout";
import { RootLayout } from "./layouts/RootLayout";

export const router = createBrowserRouter([
  {
    Component: RootLayout,
    children: [
      {
        Component: GuestOnly,
        children: [
          {
            path: "/login",
            lazy: async () => ({ Component: (await import("@/features/auth/pages/LoginPage")).LoginPage }),
          },
        ],
      },
      {
        Component: RequireAuth,
        children: [
          {
            Component: DashboardLayout,
            children: [
              { index: true, Component: RoleHome },
              {
                path: "/profile",
                lazy: async () => ({ Component: (await import("@/features/profile/pages/ProfilePage")).ProfilePage }),
              },
              {
                element: <RequireAppRole roles={["chamber-president", "other"]} />,
                children: [
                  {
                    path: "/hr",
                    lazy: async () => ({ Component: (await import("@/features/hr/pages/HrPage")).HrPage }),
                  },
                ],
              },
              {
                element: (
                  <RequireAppRole roles={["chamber-president", "organizations", "association-head", "other"]} />
                ),
                children: [
                  {
                    path: "/members",
                    lazy: async () => ({ Component: (await import("@/features/members/pages/MembersPage")).MembersPage }),
                  },
                ],
              },
              {
                element: <RequireAppRole roles={["association-head", "association-info", "association-secretary"]} />,
                children: [
                  {
                    path: "/association-information",
                    lazy: async () => ({
                      Component: (await import("@/features/members/pages/AssociationInfoPage")).AssociationInfoPage,
                    }),
                  },
                ],
              },
              {
                element: <RequireAppRole roles={["association-head", "association-info"]} />,
                children: [
                  {
                    path: "/hr-association",
                    lazy: async () => ({
                      Component: (await import("@/features/association-secretaries/pages/AssociationSecretariesPage"))
                        .AssociationSecretariesPage,
                    }),
                  },
                ],
              },
              {
                element: <RequireAppRole roles={["card-issuance"]} />,
                children: [
                  {
                    path: "/union-members",
                    lazy: async () => ({
                      Component: (await import("@/features/card-issuance/pages/UnionMembersPage")).UnionMembersPage,
                    }),
                  },
                ],
              },
              {
                element: (
                  <RequireAppRole
                    roles={[
                      "chamber-president",
                      "organizations",
                      "association-head",
                      "other",
                    ]}
                  />
                ),
                children: [
                  {
                    path: "/associations",
                    lazy: async () => ({
                      Component: (await import("@/features/associations/pages/AssociationsPage")).AssociationsPage,
                    }),
                  },
                ],
              },
              {
                element: <RequireAppRole roles={["chamber-president", "other"]} />,
                children: [
                  {
                    path: "/assemblies",
                    lazy: async () => ({
                      Component: (await import("@/features/assemblies/pages/ChamberAssembliesPage")).ChamberAssembliesPage,
                    }),
                  },
                  {
                    path: "/assemblies/:assemblyId",
                    lazy: async () => ({
                      Component: (await import("@/features/assemblies/pages/ChamberAssemblyDetailPage")).ChamberAssemblyDetailPage,
                    }),
                  },
                ],
              },
              {
                element: <RequireAppRole roles={["organizations"]} />,
                children: [
                  {
                    path: "/organizations/assemblies",
                    lazy: async () => ({
                      Component: (await import("@/features/assemblies/pages/OrganizationsAssembliesPage")).OrganizationsAssembliesPage,
                    }),
                  },
                  {
                    path: "/organizations/assemblies/:assemblyId",
                    lazy: async () => ({
                      Component: (await import("@/features/assemblies/pages/OrganizationsAssemblyDetailPage")).OrganizationsAssemblyDetailPage,
                    }),
                  },
                ],
              },
              {
                element: (
                  <RequireAppRole
                    roles={["association-head", "association-info", "association-secretary"]}
                  />
                ),
                children: [
                  {
                    path: "/association/assemblies",
                    children: [
                      {
                        index: true,
                        lazy: async () => ({
                          Component: (await import("@/features/assemblies/pages/AssociationAssembliesPage"))
                            .AssociationAssembliesPage,
                        }),
                      },
                      {
                        path: ":assemblyId",
                        lazy: async () => ({
                          Component: (await import("@/features/assemblies/pages/AssociationAssemblyDetailPage"))
                            .AssociationAssemblyDetailPage,
                        }),
                      },
                    ],
                  },
                ],
              },
              {
                element: <RequireAppRole roles={["user"]} />,
                children: [
                  {
                    path: "/user/assemblies",
                    lazy: async () => ({
                      Component: (await import("@/features/assemblies/pages/UserAssembliesPage")).UserAssembliesPage,
                    }),
                  },
                  {
                    path: "/user/assemblies/:assemblyId",
                    lazy: async () => ({
                      Component: (await import("@/features/assemblies/pages/UserAssemblyDetailPage")).UserAssemblyDetailPage,
                    }),
                  },
                ],
              },
            ],
          },
        ],
      },
      { path: "*", element: <Navigate replace to="/" /> },
    ],
  },
]);
