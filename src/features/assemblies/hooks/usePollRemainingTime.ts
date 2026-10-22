import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { useEffect, useState } from "react";

dayjs.extend(duration);

export type PollRemainingTime = {
  days: number;
  hours: number;
};

/**
 * Live countdown to the end of the voting local day (`pollDate` / `newsDate`).
 * Same dayjs duration used on organizations, association, and user assembly UIs.
 */
export function usePollRemainingTime(pollDate: string | null | undefined): PollRemainingTime {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let intervalId: number | undefined;
    const timeoutId = window.setTimeout(() => {
      setNow(Date.now());
      intervalId = window.setInterval(() => setNow(Date.now()), 60_000);
    }, 60_000 - (Date.now() % 60_000));

    return () => {
      window.clearTimeout(timeoutId);
      if (intervalId !== undefined) window.clearInterval(intervalId);
    };
  }, [pollDate]);

  if (!pollDate) return { days: 0, hours: 0 };

  const end = dayjs(pollDate).endOf("day");
  const current = dayjs(now);
  if (!end.isValid() || end.isBefore(current)) return { days: 0, hours: 0 };

  const remaining = dayjs.duration(end.diff(current));
  const days = Math.floor(remaining.asDays());
  let hours = remaining.hours();
  if (days === 0 && hours === 0 && remaining.asMinutes() > 0) hours = 1;

  return { days, hours };
}
