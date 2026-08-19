import { describe, it, expect } from "vitest";
import { countMatches, prizeTier, PRIZE_LABELS } from "./rank";
import type { Draw } from "./types";

const draw: Draw = {
  drawNumber: 1,
  date: "2020-01-01",
  numbers: [1, 2, 3, 4, 5, 6],
  bonusNumber: 7,
};

describe("countMatches", () => {
  it("6개 모두 일치하면 6을 반환한다", () => {
    expect(countMatches([1, 2, 3, 4, 5, 6], draw)).toBe(6);
  });

  it("일부만 일치하면 일치 개수만 센다", () => {
    expect(countMatches([1, 2, 3, 40, 41, 42], draw)).toBe(3);
  });

  it("하나도 일치하지 않으면 0을 반환한다", () => {
    expect(countMatches([10, 11, 12, 13, 14, 15], draw)).toBe(0);
  });

  it("보너스 번호는 매치 개수에 포함하지 않는다", () => {
    expect(countMatches([7, 2, 3, 4, 5, 6], draw)).toBe(5);
  });
});

describe("prizeTier", () => {
  it("6개 일치 = 1등", () => {
    expect(prizeTier([1, 2, 3, 4, 5, 6], draw)).toBe(1);
  });

  it("5개 일치 + 보너스 일치 = 2등", () => {
    expect(prizeTier([1, 2, 3, 4, 5, 7], draw)).toBe(2);
  });

  it("5개 일치 + 보너스 불일치 = 3등", () => {
    expect(prizeTier([1, 2, 3, 4, 5, 40], draw)).toBe(3);
  });

  it("4개 일치 = 4등", () => {
    expect(prizeTier([1, 2, 3, 4, 40, 41], draw)).toBe(4);
  });

  it("3개 일치 = 5등", () => {
    expect(prizeTier([1, 2, 3, 40, 41, 42], draw)).toBe(5);
  });

  it("2개 이하 일치 = 낙첨(0)", () => {
    expect(prizeTier([1, 2, 40, 41, 42, 43], draw)).toBe(0);
  });

  it("PRIZE_LABELS가 0~5 전부 정의되어 있다", () => {
    expect(Object.keys(PRIZE_LABELS)).toHaveLength(6);
  });
});
