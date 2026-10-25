import type { Icon } from "@solar-icons/react/lib/types";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { useTruncation } from "@/shared/hooks/useTruncation";
import { TruncationTooltip } from "./TruncationTooltip";

type MemberMetaFieldProps = {
  icon: Icon;
  label: string;
  value: ReactNode;
  className?: string;
  /** Overrides the icon circle styling (e.g. a muted circle on a white surface). */
  iconClassName?: string;
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
  iconClassName,
  ltrEllipsisWhenTruncated = false,
  contentKey,
}: MemberMetaFieldProps) {
  const truncation = useTruncation<HTMLSpanElement>(ltrEllipsisWhenTruncated, contentKey);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span
        className={cn(
          "flex size-6 shrink-0 items-center justify-center rounded-full bg-white text-muted",
          iconClassName,
        )}
      >
        <FieldIcon className="size-3.5" />
      </span>
      <div className="min-w-0">
        <TruncationTooltip content={label}>
          <span className="block text-micro text-muted">{label}</span>
        </TruncationTooltip>
        <TruncationTooltip content={value}>
          <span ref={truncation.ref} className="block truncate text-xs font-bold" dir={truncation.dir}>
            {value}
          </span>
        </TruncationTooltip>
      </div>
    </div>
  );
}
