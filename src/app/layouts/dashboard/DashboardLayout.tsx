import { Drawer } from "@heroui/react";
import { useEffect, useState } from "react";
import { Outlet } from "react-router";
import { useSession } from "@/features/auth/hooks/useSession";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { useUiStore } from "@/shared/stores/ui.store";
import { AppHeader } from "./AppHeader";
import { SidebarContent } from "./SidebarContent";

export function DashboardLayout() {
  const { logout } = useSession();
  const isMobileNavOpen = useUiStore((state) => state.isMobileNavOpen);
  const setMobileNavOpen = useUiStore((state) => state.setMobileNavOpen);
  const [isLogoutOpen, setLogoutOpen] = useState(false);

  const requestLogout = () => {
    setMobileNavOpen(false);
    setLogoutOpen(true);
  };

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 64rem)");
    const closeOnDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) setMobileNavOpen(false);
    };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, [setMobileNavOpen]);

  return (
    <div className="flex min-h-full">
      <aside className="sticky top-0 hidden h-dvh w-[312px] shrink-0 border-e border-(--panel-border) bg-(--panel) px-[15px] py-10 lg:block">
        <SidebarContent onRequestLogout={requestLogout} />
      </aside>

      <Drawer.Backdrop isOpen={isMobileNavOpen} onOpenChange={setMobileNavOpen}>
        {/* HeroUI mirrors left/right under RTL, so "left" opens from the right edge. */}
        <Drawer.Content className="lg:hidden" placement="left">
          <Drawer.Dialog aria-label="منوی اصلی" className="w-[290px] max-w-[85vw] bg-(--panel) px-5 py-8">
            <SidebarContent onNavigate={() => setMobileNavOpen(false)} onRequestLogout={requestLogout} />
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>

      <div className="flex w-full flex-1 flex-col bg-(--background) px-6 pb-5 lg:px-10 lg:pb-0 2xl:px-24">
        <AppHeader />
        <main className="mt-1  lg:mt-6">
          <Outlet />
        </main>
      </div>

      <ConfirmModal
        confirmLabel="خروج"
        confirmVariant="danger"
        isOpen={isLogoutOpen}
        message="آیا خروج را تأیید می‌کنید؟"
        onConfirm={() => {
          setLogoutOpen(false);
          logout();
        }}
        onOpenChange={setLogoutOpen}
      />
    </div>
  );
}
