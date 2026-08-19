import { describe, it, expect } from "vitest";
import { computeGaps } from "./gap";
import { ALL_NUMBERS } from "./types";
import type { Draw } from "./types";

function draw(drawNumber: number, numbers: Draw["numbers"]): Draw {
  return { drawNumber, date: "2020-01-01", numbers, bonusNumber: 45 };
}

describe("computeGaps", () => {
  it("draws가 없으면 모든 번호의 gap은 0, lastSeenDrawNumber는 null이다", () => {
    const gaps = computeGaps([]);
    expect(ALL_NUMBERS.every((n) => gaps[n].gap === 0 && gaps[n].lastSeenDrawNumber === null)).toBe(
      true,
    );
  });

  it("마지막으로 등장한 회차 기준으로 gap을 계산한다", () => {
    const draws = [
      draw(1, [1, 2, 3, 4, 5, 6]),
      draw(2, [7, 8, 9, 10, 11, 12]),
      draw(3, [13, 14, 15, 16, 17, 18]),
    ];
    const gaps = computeGaps(draws);

    // 최신 회차(3)에 등장한 번호는 gap 0
    expect(gaps[13].gap).toBe(0);
    expect(gaps[13].lastSeenDrawNumber).toBe(3);

    // 회차 1에만 등장한 번호는 최신 회차(3) - 1 = 2
    expect(gaps[1].gap).toBe(2);
    expect(gaps[1].lastSeenDrawNumber).toBe(1);

    // 한 번도 등장하지 않은 번호는 gap이 최신 회차 번호와 같다
    expect(gaps[45].lastSeenDrawNumber).toBeNull();
    expect(gaps[45].gap).toBe(3);
  });

  it("같은 번호가 여러 번 나오면 가장 최근 회차를 기준으로 삼는다", () => {
    const draws = [
      draw(1, [1, 2, 3, 4, 5, 6]),
      draw(5, [1, 8, 9, 10, 11, 12]),
      draw(3, [1, 13, 14, 15, 16, 17]),
    ];
    const gaps = computeGaps(draws);
    expect(gaps[1].lastSeenDrawNumber).toBe(5);
    expect(gaps[1].gap).toBe(0);
  });
});
