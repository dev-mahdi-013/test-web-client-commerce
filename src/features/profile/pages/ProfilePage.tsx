import { UserRoundedIcon } from "@solar-icons/react/bold/user-rounded";
import { DevicesIcon } from "@solar-icons/react/linear/devices";
import { Avatar, Button } from "@heroui/react";
import { useState } from "react";
import { ActiveSessionsDialog } from "@/features/auth/components/ActiveSessionsDialog";
import { toPersianDigits } from "@/lib/digits";
import { SectionHeading } from "@/shared/components/SectionHeading";
import { useProfile } from "../hooks/useProfile";
import { activeRoleOf, roleAssociationNameOf, roleTitleOf } from "../roles";

const cardClassName = "rounded-2xl bg-white px-4 py-3";

export function ProfilePage() {
  const profile = useProfile();
  const [isSessionsOpen, setSessionsOpen] = useState(false);
  const activeRole = activeRoleOf(profile.data);
  const roles = profile.data?.roles ?? [];

  return (
    <div className="grid max-w-full gap-6 2xl:grid-cols-2 2xl:gap-9">
      <section aria-label="اطلاعات حساب" className="rounded-[28px] bg-(--panel) p-3 sm:p-4">
        <SectionHeading className="px-1">اطلاعات حساب</SectionHeading>

        <div className="mt-4 flex items-center gap-4 rounded-[20px] bg-white p-4">
          <Avatar className="size-16 shrink-0 rounded-full">
            <Avatar.Fallback className="rounded-full bg-(--avatar-placeholder) text-white">
              <UserRoundedIcon className="size-11" />
            </Avatar.Fallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-base font-bold">{profile.data?.fullName ?? "—"}</p>
            <p className="truncate text-right text-sm text-muted">{profile.data?.phone ?? ""}</p>
          </div>
        </div>

        <dl className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className={cardClassName}>
            <dt className="text-caption text-muted">شماره موبایل</dt>
            <dd className="mt-1 truncate text-right text-sm font-bold">{profile.data?.phone ?? "—"}</dd>
          </div>
          <div className={cardClassName}>
            <dt className="text-caption text-muted">نام و نام خانوادگی</dt>
            <dd className="mt-1 truncate text-sm font-bold">{profile.data?.fullName ?? "—"}</dd>
          </div>
          <div className={cardClassName}>
            <dt className="text-caption text-muted">نقش فعال</dt>
            <dd className="mt-1 truncate text-sm font-bold">{activeRole ? roleTitleOf(activeRole) : "—"}</dd>
          </div>
          <div className={cardClassName}>
            <dt className="text-caption text-muted">تعداد نقش ها</dt>
            <dd className="mt-1 text-sm font-bold">{toPersianDigits(roles.length)}</dd>
          </div>
        </dl>
      </section>

      <section aria-label="نقش ها" className="rounded-[28px] bg-(--panel) p-3 sm:p-4">
        <SectionHeading className="px-1">نقش ها</SectionHeading>

        {roles.length === 0 ? (
          <p className="mt-4 rounded-2xl bg-white px-4 py-6 text-center text-xs text-muted">نقشی ثبت نشده است.</p>
        ) : (
          <ul className="mt-4 flex flex-col gap-2">
            {roles.map((role) => (
              <li key={role.id} className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{roleTitleOf(role)}</p>
                  {(roleAssociationNameOf(role) ?? role.chamberName) ? (
                    <p className="mt-1 truncate text-caption text-muted">{roleAssociationNameOf(role) ?? role.chamberName}</p>
                  ) : null}
                </div>
                {role.id === activeRole?.id ? (
                  <span className="shrink-0 rounded-full bg-(--status-finished-bg) px-2.5 py-1 text-micro text-(--status-finished)">
                    نقش فعال
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-label="امنیت حساب" className="rounded-[28px] bg-(--panel) p-3 sm:p-4 2xl:col-span-2">
        <SectionHeading className="px-1">امنیت حساب</SectionHeading>

        <div className="mt-4 flex flex-col gap-4 rounded-[20px] bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-(--field-muted)">
              <DevicesIcon className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold">نشست های فعال</p>
              <p className="mt-1 text-caption text-muted">ورود های اخیر حساب خود را ببینید و نشست های ناشناس را پایان دهید.</p>
            </div>
          </div>
          <Button
            className="h-9 shrink-0 rounded-full px-5 text-note"
            size="sm"
            variant="secondary"
            onPress={() => setSessionsOpen(true)}
          >
            مشاهده نشست ها
          </Button>
        </div>
      </section>

      <ActiveSessionsDialog isOpen={isSessionsOpen} onOpenChange={setSessionsOpen} />
    </div>
  );
}
