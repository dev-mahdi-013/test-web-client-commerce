import type { Icon } from "@solar-icons/react/lib/types";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { useLtrEllipsisWhenTruncated } from "@/shared/hooks/useLtrEllipsisWhenTruncated";

type MemberMetaFieldProps = {
  icon: Icon;
  label: string;
  value: ReactNode;
  className?: string;
  /** When true, forces LTR only while truncated so ellipsis sits on the right. */
  ltrEllipsisWhenTruncated?: boolean;
  /** Re-measure truncation when this identity changes. */
  contentKey?: string;
};

/** A small circular icon next to a muted label above its value, as the member cards show them. */
export function MemberMetaField({
  icon: FieldIcon,
  label,
  value,
  className,
  ltrEllipsisWhenTruncated = false,
  contentKey,
}: MemberMetaFieldProps) {
  const truncation = useLtrEllipsisWhenTruncated(ltrEllipsisWhenTruncated, contentKey);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-white text-muted">
        <FieldIcon className="size-3.5" />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] text-muted">{label}</p>
        <p ref={truncation.ref} className="truncate text-xs font-bold" dir={truncation.dir}>
          {value}
        </p>
      </div>
    </div>
  );
}
