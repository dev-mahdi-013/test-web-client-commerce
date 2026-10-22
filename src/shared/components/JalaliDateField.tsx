import { Popover } from "@heroui/react";
import { useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { formatJalaliParts, isValidJalaliDate, toJalali, type JalaliParts } from "@/lib/date";
import { useAutoPopoverPlacement } from "@/shared/hooks/useAutoPopoverPlacement";
import { BlurBackdrop } from "./BlurBackdrop";
import { JalaliCalendar } from "./JalaliCalendar";

type JalaliDateFieldProps = {
  /** Accessible name of the control. */
  label: string;
  /** A yyyy/mm/dd Jalali date, or an empty string while nothing is picked. */
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

function partsOf(value: string): JalaliParts {
  if (isValidJalaliDate(value)) {
    const [jy = 0, jm = 0, jd = 0] = value.split("/").map(Number);
    return { jy, jm, jd };
  }
  return toJalali(new Date());
}

/** A muted field that opens the Jalali calendar on click. */
export function JalaliDateField({ label, value, onChange, className }: JalaliDateFieldProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isOpen, setOpen] = useState(false);
  const [picked, setPicked] = useState<JalaliParts>(() => partsOf(value));
  const { maxHeight, placement } = useAutoPopoverPlacement(isOpen, triggerRef, contentRef);

  const handleOpenChange = (open: boolean) => {
    if (open) setPicked(partsOf(value));
    setOpen(open);
  };

  return (
    <>
      <BlurBackdrop isOpen={isOpen} />
      <Popover isOpen={isOpen} onOpenChange={handleOpenChange}>
        <button
          ref={triggerRef}
          aria-expanded={isOpen}
          aria-label={label}
          className={cn(
            "flex h-9 w-full cursor-pointer items-center rounded-xl bg-(--field-muted) px-3 text-sm shadow-none",
            className,
          )}
          type="button"
          onClick={() => handleOpenChange(!isOpen)}
        >
          <span className={cn("truncate", !value && "text-muted")} dir={value ? "ltr" : undefined}>
            {value || "انتخاب تاریخ"}
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
            onCancel={() => setOpen(false)}
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
