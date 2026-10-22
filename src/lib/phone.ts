import { toEnglishDigits } from "@/lib/digits";

const IRAN_MOBILE_REGEX = /^09\d{9}$/;

export function sanitizePhoneInput(value: string) {
  return toEnglishDigits(value).replace(/\D/g, "");
}

export function normalizePhone(value: string) {
  const digits = sanitizePhoneInput(value);
  if (digits.startsWith("98")) return `0${digits.slice(2)}`;
  if (digits.startsWith("9")) return `0${digits}`;
  return digits;
}

export function isValidPhone(value: string) {
  return IRAN_MOBILE_REGEX.test(normalizePhone(value));
}
