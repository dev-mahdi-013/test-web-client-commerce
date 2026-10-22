import { Spinner } from "@heroui/react";
import { cn } from "@/lib/cn";
import type { ChamberMember } from "../types";

type MembersMobileListProps = {
  members: ChamberMember[];
  selectedId: string | null;
  startIndex: number;
  isLoading: boolean;
  onSelect: (id: string) => void;
};

/** The single-column list the design uses for member tables below `lg`. */
export function MembersMobileList({
  members,
  selectedId,
  startIndex,
  isLoading,
  onSelect,
}: MembersMobileListProps) {
  return (
    <div className="flex  flex-1 flex-col lg:hidden">
      <div className="mb-1 rounded-full bg-(--field-muted) px-4 py-2 text-xs text-muted">نام و نام خانوادگی</div>

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <Spinner size="sm" />
        </div>
      ) : members.length === 0 ? (
        <p className="flex h-40 items-center justify-center text-sm text-muted">عضوی پیدا نشد</p>
      ) : (
        <ul className=" flex-1 overflow-y-auto">
          {members.map((member, index) => (
            <li key={member.id}>
              <button
                aria-pressed={member.id === selectedId}
                className={cn(
                  "w-full cursor-pointer truncate border-b border-(--panel-border) px-4 py-4 text-start text-sm transition-colors",
                  member.id === selectedId ? "bg-accent-soft" : "hover:bg-white/60",
                )}
                type="button"
                onClick={() => onSelect(member.id)}
              >
                {startIndex + index}. {member.fullName}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
