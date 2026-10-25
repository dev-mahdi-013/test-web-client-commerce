import { PenIcon } from "@solar-icons/react/linear/pen";
import type { MouseEvent, PointerEvent as ReactPointerEvent, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { InlineEditControl } from "./InlineEditControl";
import type { SelectFieldOption } from "./SelectField";

type InlineSelectEditProps = {
  /** Current selected option value while editing. */
  value: string;
  options: SelectFieldOption[];
  /** Shown next to the pencil when not editing. */
  displayValue: ReactNode;
  isEditing: boolean;
  canEdit?: boolean;
  isDisabled?: boolean;
  /** Keep the pencil's space but make it invisible and unclickable. */
  isHidden?: boolean;
  /** Aria / select label, e.g. ویرایش رئیس … */
  editLabel: string;
  accessibleName?: string;
  className?: string;
  selectPopoverClassName?: string;
  emptyDisplay?: ReactNode;
  onStartEdit: () => void;
  onChange: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
};

function stopRowPress(event: MouseEvent | ReactPointerEvent) {
  event.stopPropagation();
}

/** Pencil + value, or the select overlay editor used on assemblies / associations tables. */
export function InlineSelectEdit({
  value,
  options,
  displayValue,
  isEditing,
  canEdit = true,
  isDisabled = false,
  isHidden = false,
  editLabel,
  accessibleName,
  className = "w-[190px]",
  selectPopoverClassName,
  emptyDisplay,
  onStartEdit,
  onChange,
  onConfirm,
  onCancel,
}: InlineSelectEditProps) {
  if (isEditing) {
    return (
      <InlineEditControl
        accessibleName={accessibleName ?? editLabel}
        className={cn(className, isDisabled && "pointer-events-none opacity-60")}
        isOpen
        mode="select"
        options={options}
        selectPopoverClassName={selectPopoverClassName}
        stopPropagation
        value={value}
        onCancel={onCancel}
        onChange={onChange}
        onConfirm={onConfirm}
      />
    );
  }

  return (
    <span className="inline-flex items-center gap-2">
      {canEdit ? (
        <button
          type="button"
          aria-label={editLabel}
          className={cn(
            "inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-accent text-white",
            isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
            isHidden && "pointer-events-none opacity-0",
          )}
          aria-hidden={isHidden || undefined}
          disabled={isDisabled}
          tabIndex={isHidden ? -1 : undefined}
          onPointerDown={stopRowPress}
          onClick={(event) => {
            stopRowPress(event);
            onStartEdit();
          }}
        >
          <PenIcon className="size-3.5" />
        </button>
      ) : null}
      <span className={cn(!displayValue && "text-muted")}>{displayValue || emptyDisplay}</span>
    </span>
  );
}
