import { Popover } from "@heroui/react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { formatJalaliParts, isValidJalaliDate, toJalali, type JalaliParts } from "@/lib/date";
import { BlurBackdrop } from "@/shared/components/BlurBackdrop";
import { JalaliCalendar } from "@/shared/components/JalaliCalendar";
import { useAutoPopoverPlacement } from "@/shared/hooks/useAutoPopoverPlacement";

type InlineDatePickerProps = {
  /** Accessible name of the control. */
  label: string;
  /** A yyyy/mm/dd Jalali date, or an empty string while nothing is picked. */
  value: string;
  onChange: (value: string) => void;
  autoOpen?: boolean;
  onCancel?: () => void;
};

function partsOf(value: string): JalaliParts {
  if (isValidJalaliDate(value)) {
    const [jy = 0, jm = 0, jd = 0] = value.split("/").map(Number);
    return { jy, jm, jd };
  }
  return toJalali(new Date());
}

/** The compact date chip of the table's edit mode, opening the calendar popover on click. */
export function InlineDatePicker({ label, value, onChange, autoOpen = false, onCancel }: InlineDatePickerProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isOpen, setOpen] = useState(autoOpen);
  const [picked, setPicked] = useState<JalaliParts>(() => partsOf(value));
  const { maxHeight, placement } = useAutoPopoverPlacement(isOpen, triggerRef, contentRef);

  useEffect(() => {
    if (!autoOpen) return;
    setPicked(partsOf(value));
    setOpen(true);
  }, [autoOpen, value]);

  const handleOpenChange = (open: boolean) => {
    if (open) setPicked(partsOf(value));
    setOpen(open);
    if (!open) onCancel?.();
  };

  return (
    <>
      <BlurBackdrop isOpen={isOpen} />
      <Popover isOpen={isOpen} onOpenChange={handleOpenChange}>
        <button
          ref={triggerRef}
          aria-expanded={isOpen}
          aria-label={label}
          className="relative z-[var(--z-index-overlay)] flex h-9 w-[150px] cursor-pointer items-center rounded-xl bg-(--field-muted) px-3 text-sm"
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            handleOpenChange(!isOpen);
          }}
          onPointerDown={(event) => event.stopPropagation()}
        >
          <span className={cn("truncate", !value && "text-muted")} dir="ltr">
            {value || "----/--/--"}
          </span>
        </button>
        <Popover.Content
          ref={contentRef}
          className="w-[280px] max-w-[calc(100vw-2rem)] overflow-y-auto rounded-2xl! bg-white shadow-(--box-shadow)"
          offset={8}
          placement={placement}
          style={{ maxHeight }}
          triggerRef={triggerRef}
        >
          <JalaliCalendar
            className="p-4"
            value={picked}
            onCancel={() => handleOpenChange(false)}
            onConfirm={() => {
              onChange(formatJalaliParts(picked));
              setOpen(false);
            }}
            onSelect={setPicked}
          />
        </Popover.Content>
      </Popover>
    </>
  );
}
