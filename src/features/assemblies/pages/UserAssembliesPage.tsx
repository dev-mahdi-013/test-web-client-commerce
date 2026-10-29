import { useCallback, useMemo, useState } from "react";
import { useMediaQuery } from "@/shared/hooks/useMediaQuery";
import { SectionHeading } from "@/shared/components/SectionHeading";
import { SimplePagination } from "@/shared/components/SimplePagination";
import { AssembliesToolbar } from "../components/AssembliesToolbar";
import { ASSEMBLIES_PAGE_SIZE } from "../config";
import { useAssemblies } from "../hooks/useAssemblies";
import { UserAssembliesMobileList } from "../user/components/UserAssembliesMobileList";
import { UserAssembliesTable } from "../user/components/UserAssembliesTable";
import { useInfiniteUserAssemblies } from "../user/hooks/useInfiniteUserAssemblies";

const DESKTOP_QUERY = "(min-width: 64rem)";

/** Assemblies list for the user (کاربر) role. Desktop: table with pagination. Mobile: infinite-scroll cards. */
export function UserAssembliesPage() {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  return isDesktop ? <UserAssembliesDesktop /> : <UserAssembliesMobile />;
}

function UserAssembliesMobile() {
  const infinite = useInfiniteUserAssemblies({ enabled: true });
  const items = useMemo(() => infinite.data?.pages.flatMap((page) => page.items) ?? [], [infinite.data]);
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = infinite;
  const onLoadMore = useCallback(() => {
    void fetchNextPage();
  }, [fetchNextPage]);

  return (
    <section
      aria-label="لیست مجامع"
      className="relative flex h-[calc(100dvh-11rem)] min-h-[420px] w-full max-w-full flex-col rounded-[28px] bg-(--panel) p-4"
    >
      <header className="mb-4 px-1">
        <SectionHeading>لیست مجامع</SectionHeading>
      </header>
      <UserAssembliesMobileList
        assemblies={items}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        isLoading={infinite.isPending}
        onLoadMore={onLoadMore}
      />
      {/* Fade over the bottom of the panel so cards scroll out softly. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[97px] rounded-b-[20px] bg-[linear-gradient(0deg,#EFEFF0_38.66%,rgba(239,239,240,0)_100%)]"
      />
    </section>
  );
}

function UserAssembliesDesktop() {
  const [page, setPage] = useState(1);

  const assemblies = useAssemblies({ page });

  const items = assemblies.data?.items ?? [];
  const currentPage = assemblies.data?.page ?? page;
  const totalPages = assemblies.data?.totalPages ?? 1;
  const startIndex = (currentPage - 1) * (assemblies.data?.pageSize ?? ASSEMBLIES_PAGE_SIZE) + 1;

  return (
    <div className="flex w-full  max-w-full flex-col gap-6 overflow-x-hidden">
      <section
        aria-label="لیست مجامع"
        className="flex h-[551px]  max-w-full flex-col overflow-hidden rounded-[28px] bg-(--panel) p-3 sm:p-4 lg:h-[640px] 2xl:h-[552px]"
      >
        <AssembliesToolbar showSearch={false} />

        <UserAssembliesTable assemblies={items} isLoading={assemblies.isPending} startIndex={startIndex} />

        <div className="shrink-0 px-1 pt-4">
          <SimplePagination
            isDisabled={assemblies.isFetching}
            page={currentPage}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      </section>
    </div>
  );
}
