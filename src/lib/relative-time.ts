import { toPersianDigits } from "./digits";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const MONTH = 30 * DAY;
const YEAR = 12 * MONTH;

/** Persian "time ago" label for an ISO date, e.g. ۲۸ دقیقه پیش; empty for missing or invalid dates. */
export function relativeTimeFromNow(isoDate: string | null | undefined) {
  if (!isoDate) return "";
  const time = new Date(isoDate).getTime();
  if (Number.isNaN(time)) return "";

  const elapsed = Math.max(Date.now() - time, 0);

  if (elapsed < MINUTE) return "همین حالا";
  if (elapsed < HOUR) return `${toPersianDigits(Math.floor(elapsed / MINUTE))} دقیقه پیش`;
  if (elapsed < DAY) return `${toPersianDigits(Math.floor(elapsed / HOUR))} ساعت پیش`;
  if (elapsed < MONTH) return `${toPersianDigits(Math.floor(elapsed / DAY))} روز پیش`;
  if (elapsed < YEAR) return `${toPersianDigits(Math.floor(elapsed / MONTH))} ماه پیش`;
  return `${toPersianDigits(Math.floor(elapsed / YEAR))} سال پیش`;
}
