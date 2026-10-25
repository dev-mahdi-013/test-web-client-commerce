import { Drawer } from "@heroui/react";
import { useEffect, useState } from "react";
import { Outlet } from "react-router";
import { ActiveSessionsDialog } from "@/features/auth/components/ActiveSessionsDialog";
import { useSession } from "@/features/auth/hooks/useSession";
import { useUiStore } from "@/shared/stores/ui.store";
import { AppHeader } from "./AppHeader";
import { LogoutDialog } from "./LogoutDialog";
import { SidebarContent } from "./SidebarContent";

export function DashboardLayout() {
  const { logout } = useSession();
  const isMobileNavOpen = useUiStore((state) => state.isMobileNavOpen);
  const setMobileNavOpen = useUiStore((state) => state.setMobileNavOpen);
  const [isLogoutOpen, setLogoutOpen] = useState(false);
  const [isSessionsOpen, setSessionsOpen] = useState(false);

  const requestLogout = () => {
    setMobileNavOpen(false);
    setLogoutOpen(true);
  };

  const requestSessions = () => {
    setMobileNavOpen(false);
    setSessionsOpen(true);
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
    // On desktop the shell is exactly one viewport tall: the sidebar stays put and only the content scrolls.
    <div className="flex min-h-full lg:h-dvh lg:overflow-hidden">
      <aside className="hidden h-full w-[312px] shrink-0 overflow-hidden border-e border-(--panel-border) bg-(--panel) px-[15px] py-10 lg:block">
        <SidebarContent onRequestLogout={requestLogout} onRequestSessions={requestSessions} />
      </aside>

      <Drawer.Backdrop isOpen={isMobileNavOpen} onOpenChange={setMobileNavOpen}>
        {/* HeroUI mirrors left/right under RTL, so "left" opens from the right edge. */}
        <Drawer.Content className="lg:hidden" placement="left">
          <Drawer.Dialog aria-label="منوی اصلی" className="w-[290px] max-w-[85vw] bg-(--panel) px-5 py-8">
            <SidebarContent
              onNavigate={() => setMobileNavOpen(false)}
              onRequestLogout={requestLogout}
              onRequestSessions={requestSessions}
            />
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>

      <div className="flex min-w-0 flex-1 flex-col bg-(--background) px-6 pb-5 lg:h-full lg:overflow-y-auto lg:px-10 lg:pb-0 2xl:px-24">
        <AppHeader />
        <main className="mt-1  lg:mt-6">
          <Outlet />
        </main>
      </div>

      <LogoutDialog
        isOpen={isLogoutOpen}
        onConfirm={() => {
          setLogoutOpen(false);
          logout();
        }}
        onOpenChange={setLogoutOpen}
      />
      <ActiveSessionsDialog isOpen={isSessionsOpen} onOpenChange={setSessionsOpen} />
    </div>
  );
}
