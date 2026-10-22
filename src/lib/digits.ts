const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

export function toEnglishDigits(value: string) {
  return value.replace(/[۰-۹٠-٩]/g, (char) => {
    const persianIndex = PERSIAN_DIGITS.indexOf(char);
    return String(persianIndex !== -1 ? persianIndex : ARABIC_DIGITS.indexOf(char));
  });
}

/** Drops everything but Latin digits, so typed Persian/Arabic digits survive numeric fields. */
export function sanitizeDigitsInput(value: string) {
  return toEnglishDigits(value).replace(/\D/g, "");
}

export function toPersianDigits(value: string | number) {
  return String(value).replace(/\d/g, (digit) => PERSIAN_DIGITS[Number(digit)] ?? digit);
}
