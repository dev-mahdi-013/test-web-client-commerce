const NATIONAL_CODE_LENGTH = 10;

/** Checks an Iranian national code: 10 digits, not all the same, and the control digit matches. */
export function isValidNationalCode(value: string) {
  if (!/^\d{10}$/.test(value)) return false;
  if (/^(\d)\1{9}$/.test(value)) return false;

  const digits = value.split("").map(Number);
  const sum = digits.slice(0, NATIONAL_CODE_LENGTH - 1).reduce((total, digit, index) => total + digit * (10 - index), 0);
  const remainder = sum % 11;
  const control = digits[NATIONAL_CODE_LENGTH - 1] ?? -1;

  return remainder < 2 ? control === remainder : control === 11 - remainder;
}
