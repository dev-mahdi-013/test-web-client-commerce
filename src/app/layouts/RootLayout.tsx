import { RouterProvider } from "@heroui/react";
import { Outlet, useHref, useNavigate } from "react-router";

export function RootLayout() {
  const navigate = useNavigate();

  return (
    <RouterProvider navigate={navigate} useHref={useHref}>
      <Outlet />
    </RouterProvider>
  );
}
