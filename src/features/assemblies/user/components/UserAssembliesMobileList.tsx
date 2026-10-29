import { useEffect, useRef } from "react";
import { Button, Spinner } from "@heroui/react";
import { useNavigate } from "react-router";
import { formatJalali } from "@/lib/date";
import { AssemblyStatusBadge } from "../../components/AssemblyStatusBadge";
import type { Assembly } from "../../types";

type UserAssembliesMobileListProps = {
  assemblies: Assembly[];
  isLoading: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
};

/** Mobile card: title + status, target and voting day, and a full-width entry button. */
function UserAssemblyMobileCard({ assembly }: { assembly: Assembly }) {
  const navigate = useNavigate();
  const isRunning = assembly.status === "running";

  return (
    <li className="flex flex-col gap-4 rounded-[20px] bg-white px-4 pt-[30px] pb-[32px] shadow-(--box-shadow)">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <span className="text-xs text-muted">عنوان</span>
          <p className="truncate text-[15px] font-bold leading-6">{assembly.title}</p>
        </div>
        <AssemblyStatusBadge
          className="h-[22px] px-2.5 text-[10px]"
          label={isRunning ? "در حال رأی گیری" : undefined}
          status={assembly.status}
        />
      </div>

      <div className="flex items-end justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1.5">
          <span className="text-xs text-muted">تارگت</span>
          <p className="truncate text-sm font-bold">{assembly.association}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span className="text-xs text-muted">روز رأی گیری</span>
          <p className="text-sm font-bold" dir="ltr">
            {formatJalali(assembly.newsDate)}
          </p>
        </div>
      </div>

      <Button
        className="mt-[14px] h-10 w-full rounded-full bg-accent text-sm font-bold text-white"
        onPress={() => navigate(`/user/assemblies/${assembly.id}`)}
      >
        ورود به انتخابات
      </Button>
    </li>
  );
}

/** Scrollable list that loads the next page when the sentinel at the bottom becomes visible. */
export function UserAssembliesMobileList({
  assemblies,
  isLoading,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: UserAssembliesMobileListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = scrollRef.current;
    const target = sentinelRef.current;
    if (!root || !target || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting && !isFetchingNextPage) onLoadMore();
      },
      { root, rootMargin: "120px" },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, onLoadMore]);

  return (
    <div ref={scrollRef} className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <Spinner size="sm" />
        </div>
      ) : assemblies.length === 0 ? (
        <p className="flex h-40 items-center justify-center text-sm text-muted">مجمعی پیدا نشد</p>
      ) : (
        <ul className="flex flex-col gap-[30px] pb-[60px]">
          {assemblies.map((assembly) => (
            <UserAssemblyMobileCard key={assembly.id} assembly={assembly} />
          ))}
        </ul>
      )}

      {isFetchingNextPage && (
        <div className="flex h-14 items-center justify-center">
          <Spinner size="sm" />
        </div>
      )}
      <div ref={sentinelRef} aria-hidden className="h-px shrink-0" />
    </div>
  );
}
