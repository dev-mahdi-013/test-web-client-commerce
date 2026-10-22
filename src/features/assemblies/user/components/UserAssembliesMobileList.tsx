import { EyeIcon } from "@solar-icons/react/linear/eye";
import { Button, Spinner } from "@heroui/react";
import { useNavigate } from "react-router";
import { formatJalali } from "@/lib/date";
import { TruncatedText } from "@/shared/components/TruncatedText";
import { AssemblyStatusBadge } from "../../components/AssemblyStatusBadge";
import { ASSEMBLY_CREATED_BY_MAX_CHARS, ASSEMBLY_TITLE_MAX_CHARS } from "../../config";
import type { Assembly } from "../../types";

type UserAssembliesMobileListProps = {
  assemblies: Assembly[];
  startIndex: number;
  isLoading: boolean;
};

/** Mobile cards with the same fields as the desktop table. */
export function UserAssembliesMobileList({ assemblies, startIndex, isLoading }: UserAssembliesMobileListProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center lg:hidden">
        <Spinner size="sm" />
      </div>
    );
  }

  if (assemblies.length === 0) {
    return (
      <p className="flex h-40 items-center justify-center text-sm text-muted lg:hidden">مجمعی پیدا نشد</p>
    );
  }

  return (
    <ul className="flex  flex-1 flex-col gap-3 overflow-y-auto lg:hidden">
      {assemblies.map((assembly, index) => (
        <li key={assembly.id} className="rounded-[20px] bg-white px-4 py-4 shadow-(--box-shadow)">
          <div className="flex items-start justify-between gap-3">
            <div className=" flex-1">
              <p className="text-sm font-bold leading-6">
                {startIndex + index}.{" "}
                <TruncatedText maxChars={ASSEMBLY_TITLE_MAX_CHARS} value={assembly.title} />
              </p>
              <p className="mt-1 text-xs text-muted">{assembly.association}</p>
            </div>
            <AssemblyStatusBadge status={assembly.status} />
          </div>

          <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
            <div>
              <dt className="text-muted">توسط</dt>
              <dd className="mt-0.5 font-bold">
                <TruncatedText maxChars={ASSEMBLY_CREATED_BY_MAX_CHARS} value={assembly.createdBy} />
              </dd>
            </div>
            <div>
              <dt className="text-muted">تاریخ ساخت</dt>
              <dd className="mt-0.5 font-bold" dir="ltr">
                {formatJalali(assembly.createdAt)}
              </dd>
            </div>
            <div>
              <dt className="text-muted">روز برگزاری</dt>
              <dd className="mt-0.5 font-bold" dir="ltr">
                {formatJalali(assembly.newsDate)}
              </dd>
            </div>
            <div>
              <dt className="text-muted">زمان شروع</dt>
              <dd className="mt-0.5 font-bold" dir="ltr">
                {assembly.startsAt}
              </dd>
            </div>
            <div>
              <dt className="text-muted">زمان پایان</dt>
              <dd className="mt-0.5 font-bold" dir="ltr">
                {assembly.endsAt}
              </dd>
            </div>
          </dl>

          <div className="mt-3 flex items-center justify-end">
            <Button
              isIconOnly
              aria-label={`ورود به پنل کاربری ${assembly.title}`}
              className="size-8 min-w-8 rounded-full bg-accent text-white"
              size="sm"
              onPress={() => navigate(`/user/assemblies/${assembly.id}`)}
            >
              <EyeIcon className="size-4" />
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}
