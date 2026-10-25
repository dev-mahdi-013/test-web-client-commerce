import { AltArrowLeftIcon } from "@solar-icons/react/linear/alt-arrow-left";
import { AltArrowRightIcon } from "@solar-icons/react/linear/alt-arrow-right";
import { Button, Spinner } from "@heroui/react";
import { useState } from "react";
import { cn } from "@/lib/cn";
import {
  jalaliMonthGrid,
  persianMonthName,
  persianWeekdays,
  shiftJalaliMonth,
  type JalaliParts,
} from "@/lib/date";

type JalaliCalendarProps = {
  /** The day the calendar shows as picked. */
  value: JalaliParts;
  onSelect: (parts: JalaliParts) => void;
  onConfirm: () => void;
  onCancel: () => void;
  className?: string;
  isPending?: boolean;
};

function isSameDay(left: JalaliParts, right: JalaliParts) {
  return left.jy === right.jy && left.jm === right.jm && left.jd === right.jd;
}

/** The month grid of the design's date picker, with its confirm and cancel actions. */
export function JalaliCalendar({
  value,
  onSelect,
  onConfirm,
  onCancel,
  className,
  isPending = false,
}: JalaliCalendarProps) {
  const [view, setView] = useState({ jy: value.jy, jm: value.jm });
  const cells = jalaliMonthGrid(view.jy, view.jm);

  return (
    <div className={cn("outline-none", className)}>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-bold">
          {persianMonthName(view.jm)} <span dir="ltr">{view.jy}</span>
        </p>
        <div className="flex gap-1">
          <Button
            isIconOnly
            aria-label="ماه قبل"
            className="size-8 min-w-8"
            isDisabled={isPending}
            size="sm"
            variant="ghost"
            onPress={() => setView((current) => shiftJalaliMonth(current.jy, current.jm, -1))}
          >
            <AltArrowRightIcon className="size-4" />
          </Button>
          <Button
            isIconOnly
            aria-label="ماه بعد"
            className="size-8 min-w-8"
            isDisabled={isPending}
            size="sm"
            variant="ghost"
            onPress={() => setView((current) => shiftJalaliMonth(current.jy, current.jm, 1))}
          >
            <AltArrowLeftIcon className="size-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-y-1 text-center text-caption text-muted">
        {persianWeekdays.map((day) => (
          <span key={day} className="py-1">
            {day}
          </span>
        ))}
        {cells.map((cell, index) => {
          const date = { jy: view.jy, jm: view.jm, jd: cell.day };
          const isSelected = cell.inMonth && isSameDay(date, value);

          return (
            <button
              key={`${view.jy}-${view.jm}-${index}`}
              className={cn(
                "mx-auto flex size-8 items-center justify-center rounded-full text-xs",
                cell.inMonth ? "cursor-pointer text-foreground hover:bg-(--field-muted)" : "text-muted/40",
                isSelected && "bg-accent font-bold text-white hover:bg-accent",
              )}
              disabled={!cell.inMonth || isPending}
              type="button"
              onClick={() => onSelect(date)}
            >
              {cell.day}
            </button>
          );
        })}
      </div>

      <div className="flex justify-start gap-2 pt-4">
        <Button
          className="rounded-full px-4"
          isDisabled={isPending}
          isPending={isPending}
          size="sm"
          onPress={onConfirm}
        >
          {isPending && <Spinner color="current" size="sm" />}
          تأیید
        </Button>
        <Button className="rounded-full px-4" isDisabled={isPending} size="sm" variant="secondary" onPress={onCancel}>
          لغو
        </Button>
      </div>
    </div>
  );
}
