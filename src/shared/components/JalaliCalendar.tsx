import { AltArrowLeftIcon } from "@solar-icons/react/linear/alt-arrow-left";
import { AltArrowRightIcon } from "@solar-icons/react/linear/alt-arrow-right";
import { Button, Spinner } from "@heroui/react";
import { useState } from "react";
import { cn } from "@/lib/cn";
import {
  jalaliMonthGrid,
  jalaliMonthLength,
  persianMonthName,
  persianMonths,
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

type CalendarPanel = "days" | "months" | "years";

const YEARS_PER_PAGE = 12;

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
  const [panel, setPanel] = useState<CalendarPanel>("days");
  const cells = jalaliMonthGrid(view.jy, view.jm);
  // A window of years around the viewed one, paged by whole windows.
  const yearPageStart = view.jy - YEARS_PER_PAGE / 2;
  const yearOptions = Array.from({ length: YEARS_PER_PAGE }, (_, index) => yearPageStart + index);

  // Picking a month or year also moves the selected day, so confirming sends the new date
  // instead of the one the calendar was opened with. The day is clamped to the month length.
  const selectMonth = (jy: number, jm: number) => {
    const jd = Math.min(value.jd, jalaliMonthLength(jy, jm));
    setView({ jy, jm });
    onSelect({ jy, jm, jd });
  };

  const headerClassName = "mb-3 flex items-center justify-between gap-2";
  const titleButtonClassName =
    "cursor-pointer rounded-md px-1 text-sm font-bold transition-colors hover:bg-(--field-muted)";

  return (
    <div className={cn("outline-none", className)}>
      {panel === "days" && (
        <>
          <div className={headerClassName}>
            <button
              aria-label="انتخاب ماه و سال"
              className={titleButtonClassName}
              type="button"
              onClick={() => setPanel("months")}
            >
              {persianMonthName(view.jm)} <span dir="ltr">{view.jy}</span>
            </button>
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
        </>
      )}

      {panel === "months" && (
        <>
          <div className={headerClassName}>
            <button
              aria-label="انتخاب سال"
              className={titleButtonClassName}
              type="button"
              onClick={() => setPanel("years")}
            >
              <span dir="ltr">{view.jy}</span>
            </button>
            <Button
              className="h-8 rounded-full px-3 text-xs"
              isDisabled={isPending}
              size="sm"
              variant="ghost"
              onPress={() => setPanel("days")}
            >
              بازگشت
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-1">
            {persianMonths.map((name, index) => {
              const jm = index + 1;
              const isCurrent = view.jm === jm;

              return (
                <button
                  key={name}
                  aria-label={name}
                  className={cn(
                    "h-8 cursor-pointer rounded-full text-xs transition-colors hover:bg-(--field-muted)",
                    isCurrent && "bg-accent font-bold text-white hover:bg-accent",
                  )}
                  type="button"
                  disabled={isPending}
                  onClick={() => {
                    selectMonth(view.jy, jm);
                    setPanel("days");
                  }}
                >
                  {name}
                </button>
              );
            })}
          </div>
        </>
      )}

      {panel === "years" && (
        <>
          <div className={headerClassName}>
            <div className="flex gap-1">
              <Button
                isIconOnly
                aria-label="سال‌های قبل"
                className="size-8 min-w-8"
                isDisabled={isPending}
                size="sm"
                variant="ghost"
                onPress={() => setView((current) => ({ ...current, jy: current.jy - YEARS_PER_PAGE }))}
              >
                <AltArrowRightIcon className="size-4" />
              </Button>
              <Button
                isIconOnly
                aria-label="سال‌های بعد"
                className="size-8 min-w-8"
                isDisabled={isPending}
                size="sm"
                variant="ghost"
                onPress={() => setView((current) => ({ ...current, jy: current.jy + YEARS_PER_PAGE }))}
              >
                <AltArrowLeftIcon className="size-4" />
              </Button>
            </div>
            <Button
              className="h-8 rounded-full px-3 text-xs"
              isDisabled={isPending}
              size="sm"
              variant="ghost"
              onPress={() => setPanel("months")}
            >
              بازگشت
            </Button>
          </div>

          <div className="grid grid-cols-4 gap-1">
            {yearOptions.map((year) => {
              const isCurrent = view.jy === year;

              return (
                <button
                  key={year}
                  aria-label={String(year)}
                  className={cn(
                    "h-8 cursor-pointer rounded-full text-xs transition-colors hover:bg-(--field-muted)",
                    isCurrent && "bg-accent font-bold text-white hover:bg-accent",
                  )}
                  dir="ltr"
                  type="button"
                  disabled={isPending}
                  onClick={() => {
                    selectMonth(year, view.jm);
                    setPanel("months");
                  }}
                >
                  {year}
                </button>
              );
            })}
          </div>
        </>
      )}

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
