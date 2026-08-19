import type { LottoNumber } from "./types";

export function isValidLottoNumber(n: number): n is LottoNumber {
  return Number.isInteger(n) && n >= 1 && n <= 45;
}

export type CombinationValidationError = "WRONG_COUNT" | "INVALID_RANGE" | "DUPLICATE";

export interface CombinationValidationResult {
  valid: boolean;
  error?: CombinationValidationError;
}

/** A valid Lotto 6/45 pick: exactly 6 numbers, each 1-45, no duplicates. */
export function validateCombination(numbers: number[]): CombinationValidationResult {
  if (numbers.length !== 6) return { valid: false, error: "WRONG_COUNT" };
  if (!numbers.every(isValidLottoNumber)) return { valid: false, error: "INVALID_RANGE" };
  if (new Set(numbers).size !== 6) return { valid: false, error: "DUPLICATE" };
  return { valid: true };
}
