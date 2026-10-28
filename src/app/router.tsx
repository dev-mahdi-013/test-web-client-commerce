import { createBrowserRouter, Navigate } from "react-router";
import { GuestOnly, RequireAppRole, RequireAuth, RoleHome } from "./guards";
import { DashboardLayout } from "./layouts/dashboard/DashboardLayout";
import { RootLayout } from "./layouts/RootLayout";
import { FullScreenLoader } from "@/shared/components/FullScreenLoader";
import { pages } from "./pages";

export const router = createBrowserRouter([
  {
    Component: RootLayout,
    // Shown while the router loads the first (lazy) page, so the boot splash never drops to a blank screen.
    HydrateFallback: FullScreenLoader,
    children: [
      {
        Component: GuestOnly,
        children: [
          {
            path: "/login",
            lazy: async () => ({ Component: (await pages.LoginPage()).LoginPage }),
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
                lazy: async () => ({ Component: (await pages.ProfilePage()).ProfilePage }),
              },
              {
                element: <RequireAppRole roles={["chamber-president", "other"]} />,
                children: [
                  {
                    path: "/hr",
                    lazy: async () => ({ Component: (await pages.HrPage()).HrPage }),
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
                    lazy: async () => ({ Component: (await pages.MembersPage()).MembersPage }),
                  },
                ],
              },
              {
                element: <RequireAppRole roles={["association-head", "association-info", "association-secretary"]} />,
                children: [
                  {
                    path: "/association-information",
                    lazy: async () => ({
                      Component: (await pages.AssociationInfoPage()).AssociationInfoPage,
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
                      Component: (await pages.AssociationSecretariesPage())
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
                      Component: (await pages.UnionMembersPage()).UnionMembersPage,
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
                      Component: (await pages.AssociationsPage()).AssociationsPage,
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
                      Component: (await pages.ChamberAssembliesPage()).ChamberAssembliesPage,
                    }),
                  },
                  {
                    path: "/assemblies/:assemblyId",
                    lazy: async () => ({
                      Component: (await pages.ChamberAssemblyDetailPage()).ChamberAssemblyDetailPage,
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
                      Component: (await pages.OrganizationsAssembliesPage()).OrganizationsAssembliesPage,
                    }),
                  },
                  {
                    path: "/organizations/assemblies/:assemblyId",
                    lazy: async () => ({
                      Component: (await pages.OrganizationsAssemblyDetailPage()).OrganizationsAssemblyDetailPage,
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
                          Component: (await pages.AssociationAssembliesPage())
                            .AssociationAssembliesPage,
                        }),
                      },
                      {
                        path: ":assemblyId",
                        lazy: async () => ({
                          Component: (await pages.AssociationAssemblyDetailPage())
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
                      Component: (await pages.UserAssembliesPage()).UserAssembliesPage,
                    }),
                  },
                  {
                    path: "/user/assemblies/:assemblyId",
                    lazy: async () => ({
                      Component: (await pages.UserAssemblyDetailPage()).UserAssemblyDetailPage,
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
