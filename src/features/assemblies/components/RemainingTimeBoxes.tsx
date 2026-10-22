type RemainingTimeBoxesProps = {
  days: number;
  hours: number;
};

function TimeBox({ value, unit }: { value: number; unit: string }) {
  return (
    <div className="flex items-end gap-1">
      <span
        className="mt-[-10px] inline-flex min-h-[24px] min-w-[24px] items-center justify-center rounded-sm bg-white text-lg font-bold shadow-[1px_5px_7px_rgba(0,0,0,0.1)] lg:text-[22px]"
        dir="ltr"
      >
        <span className="mt-1 leading-none"> {value}</span>
      </span>
      <span className="text-xs font-normal text-muted">{unit}</span>
    </div>
  );
}

/** Day / hour boxes for poll remaining time (organizations + association + user). */
export function RemainingTimeBoxes({ days, hours }: RemainingTimeBoxesProps) {
  return (
    <div className="mt-1 flex items-start gap-2 lg:gap-3">
      <TimeBox unit="روز" value={days} />
      <TimeBox unit="ساعت" value={hours} />
    </div>
  );
}
