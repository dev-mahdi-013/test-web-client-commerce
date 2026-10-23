import { useMemo, useState } from "react";
import { useProfile } from "@/features/profile/hooks/useProfile";
import { CardCarousel } from "@/shared/components/CardCarousel";
import { SectionHeading } from "@/shared/components/SectionHeading";
import { SimplePagination } from "@/shared/components/SimplePagination";
import { AssembliesToolbar } from "../components/AssembliesToolbar";
import { ASSEMBLIES_PAGE_SIZE } from "../config";
import { useAssemblies } from "../hooks/useAssemblies";
import { userMembershipCard } from "../user/api/user.api";
import { UserAssembliesTable } from "../user/components/UserAssembliesTable";
import { UserCardItem } from "../user/components/UserCardItem";

/** Assemblies list for the user (کاربر) role — table + green membership card sidebar. */
export function UserAssembliesPage() {
  const profile = useProfile();
  const [page, setPage] = useState(1);

  const assemblies = useAssemblies({ page });

  const items = assemblies.data?.items ?? [];
  const currentPage = assemblies.data?.page ?? page;
  const totalPages = assemblies.data?.totalPages ?? 1;
  const startIndex = (currentPage - 1) * (assemblies.data?.pageSize ?? ASSEMBLIES_PAGE_SIZE) + 1;

  const card = useMemo(
    () =>
      userMembershipCard(
        profile.data?.fullName ?? "—",
        profile.data?.phone ?? "",
        profile.data?.roles ?? [],
        profile.data?.activeRoleId ?? null,
      ),
    [profile.data?.activeRoleId, profile.data?.fullName, profile.data?.phone, profile.data?.roles],
  );

  return (
    <div className="flex w-full  max-w-full flex-col gap-6 overflow-x-hidden">
      <section
        aria-label="مشاهده کارت ها"
        className="flex  flex-col rounded-[28px] bg-(--panel) p-3 sm:p-4 lg:hidden"
      >
        <header className="mb-3 px-1">
          <SectionHeading>مشاهده کارت ها</SectionHeading>
        </header>
        <CardCarousel>
          <UserCardItem card={card} />
        </CardCarousel>
      </section>

      <section
        aria-label="لیست مجامع"
        className="flex h-[551px]  max-w-full flex-col overflow-hidden rounded-[28px] bg-(--panel) p-3 sm:p-4 lg:h-[640px] 2xl:h-[552px] max-lg:mb-4"
      >
        <AssembliesToolbar showSearch={false} />

        <UserAssembliesTable
          assemblies={items}
          isLoading={assemblies.isPending}
          startIndex={startIndex}
        />

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
