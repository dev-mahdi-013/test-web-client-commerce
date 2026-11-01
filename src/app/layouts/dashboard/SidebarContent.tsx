import { useMemo } from "react";
import { NavLink } from "react-router";
import { userMembershipCard } from "@/features/assemblies/user/api/user.api";
import { UserCardItem } from "@/features/assemblies/user/components/UserCardItem";
import { useProfile } from "@/features/profile/hooks/useProfile";
import { activeRoleOf, appRoleOf } from "@/features/profile/roles";
import { cn } from "@/lib/cn";
import { BrandLogo } from "@/shared/components/BrandLogo";
import { navItemsFor } from "./nav-items";
import { UserMenu } from "./UserMenu";

type SidebarContentProps = {
  onNavigate?: () => void;
  onRequestLogout: () => void;
  onRequestSessions: () => void;
};

const itemClassName = "flex h-12 items-center gap-3 rounded-full px-5 text-base transition-colors";

export function SidebarContent({ onNavigate, onRequestLogout, onRequestSessions }: SidebarContentProps) {
  const profile = useProfile();
  const role = appRoleOf(activeRoleOf(profile.data));
  const visibleNavItems = navItemsFor(role);
  const showMembershipCard = role === "user";
  const userCard = useMemo(
    () =>
      showMembershipCard
        ? userMembershipCard(
            profile.data?.fullName ?? "—",
            profile.data?.phone ?? "",
            profile.data?.roles ?? [],
            profile.data?.activeRoleId ?? null,
          )
        : null,
    [profile.data?.activeRoleId, profile.data?.fullName, profile.data?.phone, profile.data?.roles, showMembershipCard],
  );

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <UserMenu
        onNavigate={onNavigate}
        onRequestLogout={onRequestLogout}
        onRequestSessions={onRequestSessions}
      />

      {userCard && (
        <div className="mt-6 ">
          <UserCardItem card={userCard} />
        </div>
      )}

      <nav
        aria-label="منوی اصلی"
        className={cn("flex flex-col gap-3.5", showMembershipCard ? "mt-6" : "mt-12")}
      >
        {visibleNavItems.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            className={({ isActive }) =>
              cn(
                itemClassName,
                isActive ? "bg-white font-bold text-foreground shadow-[0_2px_8px_rgb(0_0_0/0.06)]" : "text-muted hover:bg-white/60",
              )
            }
            to={to}
            onClick={onNavigate}
          >
            <span
              className="size-5 shrink-0 bg-current"
              style={{
                WebkitMaskImage: `url("${icon}")`,
                maskImage: `url("${icon}")`,
              }}
            />
            <span className="mt-[2px]">{label}</span>
          </NavLink>
        ))}
      </nav>

      <BrandLogo className="mt-auto self-start pt-10" />
    </div>
  );
}
