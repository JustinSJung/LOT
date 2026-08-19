import { describe, it, expect } from "vitest";
import { isValidLottoNumber, validateCombination } from "./validation";

describe("isValidLottoNumber", () => {
  it("1과 45는 유효하다 (경계값)", () => {
    expect(isValidLottoNumber(1)).toBe(true);
    expect(isValidLottoNumber(45)).toBe(true);
  });

  it("0과 46은 무효하다 (경계 밖)", () => {
    expect(isValidLottoNumber(0)).toBe(false);
    expect(isValidLottoNumber(46)).toBe(false);
  });

  it("정수가 아니면 무효하다", () => {
    expect(isValidLottoNumber(3.5)).toBe(false);
    expect(isValidLottoNumber(NaN)).toBe(false);
  });
});

describe("validateCombination", () => {
  it("정상적인 6개 조합은 유효하다", () => {
    expect(validateCombination([1, 2, 3, 4, 5, 6])).toEqual({ valid: true });
  });

  it("6개가 아니면 WRONG_COUNT", () => {
    expect(validateCombination([1, 2, 3, 4, 5])).toEqual({
      valid: false,
      error: "WRONG_COUNT",
    });
    expect(validateCombination([1, 2, 3, 4, 5, 6, 7])).toEqual({
      valid: false,
      error: "WRONG_COUNT",
    });
  });

  it("범위를 벗어난 숫자가 있으면 INVALID_RANGE", () => {
    expect(validateCombination([0, 2, 3, 4, 5, 6])).toEqual({
      valid: false,
      error: "INVALID_RANGE",
    });
    expect(validateCombination([1, 2, 3, 4, 5, 46])).toEqual({
      valid: false,
      error: "INVALID_RANGE",
    });
  });

  it("중복된 숫자가 있으면 DUPLICATE", () => {
    expect(validateCombination([1, 1, 3, 4, 5, 6])).toEqual({
      valid: false,
      error: "DUPLICATE",
    });
  });
});
