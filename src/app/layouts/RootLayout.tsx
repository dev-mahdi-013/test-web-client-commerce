import { RouterProvider } from "@heroui/react";
import { Outlet, useHref, useNavigate } from "react-router";
import { FullScreenLoader } from "@/shared/components/FullScreenLoader";
import { useAppBootReady } from "../preload-pages";

export function RootLayout() {
  const navigate = useNavigate();
  const isBootReady = useAppBootReady();

  return (
    <RouterProvider navigate={navigate} useHref={useHref}>
      {isBootReady ? <Outlet /> : <FullScreenLoader />}
    </RouterProvider>
  );
}
