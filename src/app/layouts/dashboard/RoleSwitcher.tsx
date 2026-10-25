import { AltArrowLeftIcon } from "@solar-icons/react/linear/alt-arrow-left";
import { WidgetIcon } from "@solar-icons/react/linear/widget";
import { Dropdown, Skeleton } from "@heroui/react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { useAssociations } from "@/features/associations/hooks/useAssociations";
import { useSessionStore } from "@/features/auth/stores/session.store";
import { useProfile } from "@/features/profile/hooks/useProfile";
import { appRoleOf, homePathFor, roleAssociationNameOf, roleTitleOf, type AppRole } from "@/features/profile/roles";
import type { UserRole } from "@/features/profile/types";
import { cn } from "@/lib/cn";
import { singleSelectedKeys } from "@/shared/components/tableSelection";
import { findProvince } from "@/shared/data/provinces";

function roleTitle(role: UserRole) {
  return roleTitleOf(role) || "نقش بدون عنوان";
}

const ASSOCIATION_APP_ROLES: ReadonlySet<AppRole> = new Set<AppRole>([
  "association-head",
  "association-info",
  "association-secretary",
]);

const NO_NAME_PLACEHOLDER = "—";

/** Titles of association-side roles (دبیر تشکل / رئیس انجمن / رئیس تشکل). */
const ASSOCIATION_TITLE_PATTERN = /(انجمن|دبیر\s*تشکل|رئیس\s*تشکل|رییس\s*تشکل)/u;

function isAssociationRole(role: UserRole) {
  const appRole = appRoleOf(role);
  if (ASSOCIATION_APP_ROLES.has(appRole)) return true;
  // Fall back to the title so these roles never show the province subtitle.
  return appRole !== "organizations" && ASSOCIATION_TITLE_PATTERN.test(roleTitleOf(role));
}

/** Name stored on the role in localStorage: association name first, then the chamber name as the backend sent it. */
function chamberLabelOf(role: UserRole) {
  return roleAssociationNameOf(role) ?? (role.chamberName?.trim() || findProvince(role.province)?.name);
}

type RoleCopyProps = {
  role: UserRole;
  subtitle?: string;
  large?: boolean;
  singleLine?: boolean;
};

function RoleCopy({ role, subtitle, large, singleLine }: RoleCopyProps) {
  const titleClass = cn("truncate font-bold", large ? "text-xs md:text-sm" : "text-xs");
  const cityClass = cn(
    "truncate font-normal text-muted",
    large ? "text-xs md:text-sm" : "text-xs",
    singleLine && "ms-4 shrink-0 md:ms-0 md:shrink",
  );

  return (
    <span
      className={cn(
        "flex flex-1 text-start leading-5",
        singleLine ? "items-center md:flex-col md:items-start md:gap-1" : "flex-col gap-1",
      )}
    >
      <span className={titleClass}>{roleTitle(role)}</span>
      {subtitle ? <span className={cityClass}>{subtitle}</span> : null}
    </span>
  );
}

export function RoleSwitcher() {
  const profile = useProfile();
  const queryClient = useQueryClient();
  const setActiveRole = useSessionStore((state) => state.setActiveRole);
  const navigate = useNavigate();

  const roles = profile.data?.roles ?? [];
  const activeRole = roles.find((role) => role.id === profile.data?.activeRoleId);

  const activeAssociationRole = activeRole !== undefined && isAssociationRole(activeRole);
  // The association endpoint is only valid for the real association app roles.
  const canFetchAssociation = activeRole !== undefined && ASSOCIATION_APP_ROLES.has(appRoleOf(activeRole));
  const associations = useAssociations({ page: 1 }, { enabled: canFetchAssociation });
  // The association name stored on the role in the persisted session (localStorage) always wins; the association
  // API response is only a fallback for the active role when the role carries no name.
  const associationNameOf = (role: UserRole) =>
    roleAssociationNameOf(role) ??
    (role.id === activeRole?.id && canFetchAssociation ? associations.data?.items[0]?.name || undefined : undefined);
  // Every role gets a subtitle: association roles show the association name (a dash keeps the line and the item
  // height while it is missing or loading), the others show their chamber name (association name first when present).
  const associationSubtitleOf = (role: UserRole) =>
    isAssociationRole(role) ? associationNameOf(role) ?? NO_NAME_PLACEHOLDER : chamberLabelOf(role);
  // Association roles show the association name; every other role shows its chamber name.
  const triggerSubtitle = activeRole
    ? activeAssociationRole
      ? associationNameOf(activeRole) ?? NO_NAME_PLACEHOLDER
      : chamberLabelOf(activeRole)
    : undefined;

  return (
    <Dropdown className="block w-full">
      <Dropdown.Trigger
        aria-label="تغییر نقش"
        className="flex h-[42px] w-full items-center gap-2 rounded-full bg-(--field-muted) ps-1 pe-2 md:h-12 md:w-[272px] lg:h-[60px] lg:gap-3 lg:ps-2 lg:pe-3"
        isDisabled={!roles.length}
      >
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white md:size-8 lg:size-11">
          <WidgetIcon className="size-[18px] md:size-5 lg:size-[22px]" />
        </span>
        {activeRole ? (
          <RoleCopy singleLine large role={activeRole} subtitle={triggerSubtitle} />
        ) : profile.data ? (
          <span className="truncate text-xs text-muted lg:text-sm">نقشی ثبت نشده</span>
        ) : (
          <Skeleton className="h-4 w-28 rounded-full" />
        )}
        <AltArrowLeftIcon className="ms-auto size-4 shrink-0" strokeWidth={2} />
      </Dropdown.Trigger>

      <Dropdown.Popover
        className="w-(--trigger-width) max-w-[calc(100svw-2rem)] rounded-[20px] shadow-(--box-shadow) md:min-w-60"
        offset={8}
        placement="bottom start"
      >
        <Dropdown.Menu
          aria-label="نقش‌ها"
          className="max-h-[min(24rem,70svh)] gap-1 overflow-y-auto p-3"
          disallowEmptySelection
          selectedKeys={singleSelectedKeys(activeRole?.id)}
          selectionMode="single"
          onSelectionChange={(keys) => {
            const [roleId] = keys === "all" ? [] : [...keys];
            if (typeof roleId !== "string" || roleId === activeRole?.id) return;
            setActiveRole(roleId);
            queryClient.resetQueries();
            const nextRole = roles.find((role) => role.id === roleId);
            if (nextRole) navigate(homePathFor(appRoleOf(nextRole)));
          }}
        >
          {roles.map((role) => (
            <Dropdown.Item
              key={role.id}
              id={role.id}
              className="items-center gap-3 rounded-xl px-3 py-3"
              textValue={[roleTitle(role), associationSubtitleOf(role)].filter(Boolean).join(" ")}
            >
              {({ isSelected }) => (
                <>
                  <RoleCopy role={role} subtitle={associationSubtitleOf(role)} />
                  <span
                    aria-hidden
                    className={
                      isSelected
                        ? "ms-auto size-4 shrink-0 rounded-full border-[5.5px] border-accent bg-white transition-[border-width] duration-150"
                        : "ms-auto size-4 shrink-0 rounded-full border-0 border-accent bg-(--panel-border) transition-[border-width] duration-150"
                    }
                  />
                </>
              )}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}
