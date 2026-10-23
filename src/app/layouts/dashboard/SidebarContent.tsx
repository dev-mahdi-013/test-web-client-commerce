import { Logout2Icon } from "@solar-icons/react/linear/logout-2";
import { Avatar, Skeleton } from "@heroui/react";
import { useMemo } from "react";
import { NavLink } from "react-router";
import { userMembershipCard } from "@/features/assemblies/user/api/user.api";
import { UserCardItem } from "@/features/assemblies/user/components/UserCardItem";
import { useProfile } from "@/features/profile/hooks/useProfile";
import { activeRoleOf, appRoleOf } from "@/features/profile/roles";
import { cn } from "@/lib/cn";
import { BrandLogo } from "@/shared/components/BrandLogo";
import { navItemsFor } from "./nav-items";

type SidebarContentProps = {
  onNavigate?: () => void;
  onRequestLogout: () => void;
};

const itemClassName = "flex h-12 items-center gap-3 rounded-full px-5 text-[15px] transition-colors";

export function SidebarContent({ onNavigate, onRequestLogout }: SidebarContentProps) {
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
      <div className="flex items-center gap-3">
        <Avatar className="size-12 shrink-0 bg-[#e0e0e0]">
          <Avatar.Fallback className="bg-[#e0e0e0]" />
        </Avatar>
        {profile.data ? (
          <div className="">
            <p className="truncate text-[15px] font-bold">{profile.data.fullName}</p>
            <p className="text-sm text-muted" dir="ltr">
              {profile.data.phone}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-32 rounded-full" />
            <Skeleton className="h-3 w-24 rounded-full" />
          </div>
        )}
      </div>

      {userCard && (
        <div className="mt-6 ">
          <UserCardItem card={userCard} />
        </div>
      )}

      <nav
        aria-label="منوی اصلی"
        className={cn("flex flex-col gap-3.5", showMembershipCard ? "mt-6" : "mt-12")}
      >
        {visibleNavItems.map(({ to, label, icon: Icon }) => (
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
            <Icon className="size-[22px] shrink-0" />
            {label}
          </NavLink>
        ))}
        <button
          className={cn(itemClassName, "cursor-pointer text-muted hover:bg-white/60")}
          type="button"
          onClick={onRequestLogout}
        >
          <Logout2Icon className="size-[22px] shrink-0" />
          خروج
        </button>
      </nav>

      <BrandLogo className="mt-auto self-center pt-10" />
    </div>
  );
}
