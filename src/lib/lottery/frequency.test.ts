import { describe, it, expect } from "vitest";
import { computeFrequency, recentFrequency, hotNumbers, coldNumbers } from "./frequency";
import { ALL_NUMBERS } from "./types";
import type { Draw } from "./types";

function draw(drawNumber: number, numbers: Draw["numbers"]): Draw {
  return { drawNumber, date: "2020-01-01", numbers, bonusNumber: 45 };
}

describe("computeFrequency", () => {
  it("draws가 없으면 45개 번호 모두 0이다", () => {
    const freq = computeFrequency([]);
    expect(ALL_NUMBERS.every((n) => freq[n] === 0)).toBe(true);
    expect(Object.keys(freq)).toHaveLength(45);
  });

  it("등장 횟수를 정확히 센다", () => {
    const draws = [
      draw(1, [1, 2, 3, 4, 5, 6]),
      draw(2, [1, 2, 3, 4, 5, 7]),
      draw(3, [1, 8, 9, 10, 11, 12]),
    ];
    const freq = computeFrequency(draws);
    expect(freq[1]).toBe(3);
    expect(freq[2]).toBe(2);
    expect(freq[7]).toBe(1);
    expect(freq[20]).toBe(0);
  });

  it("각 draw당 6개 번호이므로 전체 합은 draws.length * 6이다", () => {
    const draws = [
      draw(1, [1, 2, 3, 4, 5, 6]),
      draw(2, [7, 8, 9, 10, 11, 12]),
    ];
    const freq = computeFrequency(draws);
    const total = Object.values(freq).reduce((a, b) => a + b, 0);
    expect(total).toBe(draws.length * 6);
  });
});

describe("recentFrequency", () => {
  it("windowSize만큼 최신 회차만 반영한다", () => {
    const draws = [
      draw(1, [1, 2, 3, 4, 5, 6]),
      draw(2, [7, 8, 9, 10, 11, 12]),
      draw(3, [1, 2, 3, 4, 5, 6]),
    ];
    const freq = recentFrequency(draws, 1); // 가장 최신 회차(3번)만
    expect(freq[1]).toBe(1);
    expect(freq[7]).toBe(0);
  });
});

describe("hotNumbers / coldNumbers", () => {
  it("hotNumbers는 빈도가 높은 순, coldNumbers는 낮은 순으로 반환한다", () => {
    const freq: Record<number, number> = {};
    for (const n of ALL_NUMBERS) freq[n] = 0;
    freq[1] = 10;
    freq[2] = 9;
    freq[45] = 0;
    freq[44] = 0;

    const hot = hotNumbers(freq, 2);
    const cold = coldNumbers(freq, 2);

    expect(hot).toEqual([1, 2]);
    expect(cold[0]).not.toBe(1);
    expect(cold[0]).not.toBe(2);
  });

  it("hot과 cold는 서로 겹치지 않는다 (충분히 차이나는 분포일 때)", () => {
    const freq: Record<number, number> = {};
    for (const n of ALL_NUMBERS) freq[n] = n; // 1..45, 완전히 다른 값
    const hot = hotNumbers(freq, 6);
    const cold = coldNumbers(freq, 6);
    expect(hot.some((n) => cold.includes(n))).toBe(false);
  });
});
