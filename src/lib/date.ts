import { jalaaliMonthLength, toGregorian, toJalaali, type JalaaliDate } from "jalaali-js";
import { toEnglishDigits } from "@/lib/digits";

const jalaliFormatter = new Intl.DateTimeFormat("fa-IR-u-ca-persian-nu-latn", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Formats an ISO date as a Jalali date with Latin digits, e.g. 1403/07/12; a missing date shows as a dash */
export function formatJalali(isoDate: string | null | undefined) {
  if (!isoDate) return "------";
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "------";
  return jalaliFormatter.format(date);
}

const JALALI_DATE_REGEX = /^1[3-4]\d{2}\/(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])$/;
const JALALI_DATE_LENGTH = 8;

/** Keeps digits only and inserts the separators of a Jalali date, e.g. 14040312 -> 1404/03/12 */
export function sanitizeJalaliInput(value: string) {
  const digits = toEnglishDigits(value).replace(/\D/g, "").slice(0, JALALI_DATE_LENGTH);
  const parts = [digits.slice(0, 4), digits.slice(4, 6), digits.slice(6, 8)].filter(Boolean);
  return parts.join("/");
}

/** Accepts a complete Jalali date as yyyy/mm/dd, e.g. 1410/03/12 */
export function isValidJalaliDate(value: string) {
  return JALALI_DATE_REGEX.test(value);
}

export const persianMonths = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
] as const;

/** Saturday through Friday, the Iranian week. */
export const persianWeekdays = ["ش", "ی", "د", "س", "چ", "پ", "ج"] as const;

export type JalaliParts = JalaaliDate;

export function toJalali(date: Date): JalaliParts {
  return toJalaali(date);
}

export function jalaliToDate({ jy, jm, jd }: JalaliParts) {
  const { gy, gm, gd } = toGregorian(jy, jm, jd);
  return new Date(gy, gm - 1, gd);
}

const pad2 = (value: number) => String(value).padStart(2, "0");

/** Writes Jalali parts in the yyyy/mm/dd shape the date fields accept. */
export function formatJalaliParts({ jy, jm, jd }: JalaliParts) {
  return `${jy}/${pad2(jm)}/${pad2(jd)}`;
}

export function persianMonthName(jm: number) {
  return persianMonths[jm - 1] ?? "";
}

export function jalaliMonthLength(jy: number, jm: number) {
  return jalaaliMonthLength(jy, jm);
}

export function shiftJalaliMonth(jy: number, jm: number, delta: number) {
  const index = jy * 12 + (jm - 1) + delta;
  const monthIndex = ((index % 12) + 12) % 12;
  return { jy: (index - monthIndex) / 12, jm: monthIndex + 1 };
}

/** 0 is Saturday, matching `persianWeekdays`. */
function jalaliWeekdayIndex(parts: JalaliParts) {
  return (jalaliToDate(parts).getDay() + 1) % 7;
}

export function jalaliMonthGrid(jy: number, jm: number) {
  const offset = jalaliWeekdayIndex({ jy, jm, jd: 1 });
  const length = jalaaliMonthLength(jy, jm);
  const previous = shiftJalaliMonth(jy, jm, -1);
  const previousLength = jalaaliMonthLength(previous.jy, previous.jm);

  return Array.from({ length: 42 }, (_, index) => {
    if (index < offset) return { day: previousLength - offset + index + 1, inMonth: false };
    const day = index - offset + 1;
    if (day > length) return { day: day - length, inMonth: false };
    return { day, inMonth: true };
  });
}
