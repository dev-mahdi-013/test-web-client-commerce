import { DevicesIcon } from "@solar-icons/react/linear/devices";
import { Modal, Skeleton } from "@heroui/react";
import { relativeTimeFromNow } from "@/lib/relative-time";
import { useUserSessions } from "../hooks/useUserSessions";

type ActiveSessionsDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

/** Lists every active login and lets the user end the ones they do not recognise. */
export function ActiveSessionsDialog({ isOpen, onOpenChange }: ActiveSessionsDialogProps) {
  const { sessions, isLoading, isError, endingSessionId, endSession } = useUserSessions();

  return (
    <Modal.Backdrop isOpen={isOpen} variant="blur" onOpenChange={onOpenChange}>
      <Modal.Container placement="center">
        <Modal.Dialog
          aria-label="نشست های فعال"
          className="relative max-h-[30rem] w-[400px] max-w-[calc(100vw-2rem)] rounded-[24px] p-5 shadow-(--box-shadow)"
        >
          <Modal.CloseTrigger className="start-auto end-auto right-4 top-4" />
          <Modal.Body className="flex min-h-0 flex-col gap-4 p-0">
            <div className="flex flex-col items-center gap-2 px-2 pt-2 text-center">
              <DevicesIcon className="size-10 text-foreground" strokeWidth={1.6} />
              <h2 className="text-body font-bold text-foreground">نشست های فعال</h2>
              <p className="text-xs leading-6 text-muted">
                لیست تمام ورود های شما به سامانه
                <br />
                اگر ورود مشکوکی مشاهده میکنید آن را پایان دهید
              </p>
            </div>

            {isLoading ? (
              <div className="flex flex-col gap-2">
                <Skeleton className="h-[72px] rounded-2xl" />
                <Skeleton className="h-[72px] rounded-2xl" />
              </div>
            ) : isError ? (
              <p className="rounded-2xl bg-(--panel) px-4 py-6 text-center text-xs text-muted">
                دریافت لیست نشست ها ممکن نشد.
              </p>
            ) : sessions.length === 0 ? (
              <p className="rounded-2xl bg-(--panel) px-4 py-6 text-center text-xs text-muted">نشست فعالی یافت نشد.</p>
            ) : (
              <ul dir="ltr" className="flex min-h-0 flex-col gap-2 overflow-y-auto pr-1">
                {sessions.map((session) => (
                  <li key={session.id} className="flex shrink-0 flex-col overflow-hidden rounded-2xl bg-(--panel)">
                    <div className="flex items-center justify-between gap-3 px-4 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-foreground">{session.deviceName}</p>
                        <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 whitespace-nowrap text-xs text-muted">
                          {session.ip ? <span dir="ltr">{session.ip}</span> : null}
                          {session.ip && session.lastActiveAt ? (
                            <span aria-hidden className="size-1 shrink-0 rounded-full bg-current" />
                          ) : null}
                          {session.lastActiveAt ? <span dir="rtl">{relativeTimeFromNow(session.lastActiveAt)}</span> : null}
                          {session.panel && (session.ip || session.lastActiveAt) ? (
                            <span aria-hidden className="size-1 shrink-0 rounded-full bg-current" />
                          ) : null}
                          {session.panel ? (
                            <span
                              dir="rtl"
                              className="rounded-full bg-(--heading-bullet) px-2.5 py-0.5 text-xs leading-5 text-foreground"
                            >
                              {session.panel}
                            </span>
                          ) : null}
                        </p>
                      </div>
                      {session.isCurrent ? (
                        <span className="flex h-6 shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-(--status-finished-bg) px-2.5 text-xs text-(--status-finished)">
                          دستگاه فعلی
                        </span>
                      ) : null}
                    </div>

                    {session.isCurrent ? null : (
                      <button
                        className="w-full cursor-pointer bg-(--status-canceled-bg) px-4 py-1.5 text-right text-xs leading-5 text-(--status-canceled) transition-opacity hover:opacity-80 disabled:cursor-default disabled:opacity-50"
                        disabled={endingSessionId === session.id}
                        type="button"
                        onClick={() => endSession(session.id)}
                      >
                        پایان دادن به نشست
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Modal.Body>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
