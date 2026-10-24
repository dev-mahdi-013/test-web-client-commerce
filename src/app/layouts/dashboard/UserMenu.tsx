import { AltArrowDownIcon } from "@solar-icons/react/linear/alt-arrow-down";
import { UserRoundedIcon } from "@solar-icons/react/bold/user-rounded";
import { Avatar, Popover, Skeleton } from "@heroui/react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { useProfile } from "@/features/profile/hooks/useProfile";

type UserMenuProps = {
  /** Called after a navigation or before a dialog opens, to close the mobile drawer. */
  onNavigate?: () => void;
  onRequestLogout: () => void;
  onRequestSessions: () => void;
};

const itemClassName = "w-full cursor-pointer rounded-xl px-3 py-3 text-start text-sm transition-colors hover:bg-(--field-muted)";

function UserAvatar() {
  return (
    <Avatar className="size-14 shrink-0 rounded-full">
      <Avatar.Fallback className="rounded-full bg-(--avatar-placeholder) text-white">
        <UserRoundedIcon className="size-10" />
      </Avatar.Fallback>
    </Avatar>
  );
}

/** The sidebar account row; pressing it opens the account popover. */
export function UserMenu({ onNavigate, onRequestLogout, onRequestSessions }: UserMenuProps) {
  const profile = useProfile();
  const navigate = useNavigate();
  const [isOpen, setOpen] = useState(false);

  const run = (action: () => void) => {
    setOpen(false);
    onNavigate?.();
    action();
  };

  return (
    <Popover isOpen={isOpen} onOpenChange={setOpen}>
      <Popover.Trigger
        aria-label="حساب کاربری"
        className="flex w-full cursor-pointer items-center gap-3 rounded-[24px] bg-(--field-muted) p-3.5 text-start transition-colors outline-none hover:bg-(--icon-button-hover) focus-visible:ring-2 focus-visible:ring-(--accent)"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key !== "Enter" && event.key !== " ") return;
          event.preventDefault();
          setOpen((open) => !open);
        }}
      >
        <UserAvatar />
        {profile.data ? (
          <div className="min-w-0">
            <p className="truncate text-base font-bold">{profile.data.fullName}</p>
            <p className="truncate text-sm text-muted">{profile.data.phone}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-32 rounded-full" />
            <Skeleton className="h-3 w-24 rounded-full" />
          </div>
        )}
        <AltArrowDownIcon className="ms-auto size-5 shrink-0 text-muted" strokeWidth={2} />
      </Popover.Trigger>

      <Popover.Content
        className="w-(--trigger-width) max-w-[calc(100svw-2rem)] rounded-[20px] p-0 shadow-(--box-shadow)"
        offset={8}
        placement="bottom"
      >
        <Popover.Dialog className="p-0 outline-none">
          <div className="flex items-center gap-3 p-4">
            <UserAvatar />
            {profile.data ? (
              <div className="min-w-0">
                <p className="truncate text-base font-bold">{profile.data.fullName}</p>
                <p className="truncate text-sm text-muted">{profile.data.phone}</p>
              </div>
            ) : (
              <Skeleton className="h-4 w-32 rounded-full" />
            )}
          </div>

          <div className="h-px bg-(--panel-border)" />

          <div className="flex flex-col p-2">
            <button className={itemClassName} type="button" onClick={() => run(() => navigate("/profile"))}>
              مشاهده پروفایل
            </button>
            <button className={itemClassName} type="button" onClick={() => run(onRequestSessions)}>
              نشست های فعال
            </button>
            <button
              className={`${itemClassName} text-(--status-canceled)`}
              type="button"
              onClick={() => run(onRequestLogout)}
            >
              خروج از حساب
            </button>
          </div>
        </Popover.Dialog>
      </Popover.Content>
    </Popover>
  );
}
