import { describe, it, expect } from "vitest";
import {
  oddEvenSplit,
  lowHighSplit,
  sum,
  consecutiveRuns,
  oddEvenDistribution,
  lowHighDistribution,
  sumHistogram,
  consecutivePatternSummary,
} from "./distribution";
import type { Draw } from "./types";

describe("oddEvenSplit", () => {
  it("홀/짝 개수를 정확히 센다", () => {
    expect(oddEvenSplit([1, 2, 3, 4, 5, 6])).toEqual({ odd: 3, even: 3 });
    expect(oddEvenSplit([1, 3, 5, 7, 9, 11])).toEqual({ odd: 6, even: 0 });
  });
});

describe("lowHighSplit", () => {
  it("기본 임계값(22) 기준으로 저/고를 나눈다", () => {
    expect(lowHighSplit([1, 2, 3, 22, 23, 45])).toEqual({ low: 4, high: 2 });
  });
});

describe("sum", () => {
  it("6개 번호의 합을 계산한다", () => {
    expect(sum([1, 2, 3, 4, 5, 6])).toBe(21);
  });
});

describe("consecutiveRuns", () => {
  it("연속된 번호가 없으면 빈 배열을 반환한다", () => {
    expect(consecutiveRuns([1, 5, 10, 20, 30, 40])).toEqual([]);
  });

  it("연속된 번호를 하나의 run으로 묶는다", () => {
    expect(consecutiveRuns([1, 2, 3, 10, 20, 30])).toEqual([[1, 2, 3]]);
  });

  it("서로 떨어진 여러 run을 모두 찾는다", () => {
    expect(consecutiveRuns([1, 2, 10, 11, 12, 30])).toEqual([
      [1, 2],
      [10, 11, 12],
    ]);
  });
});

function draw(numbers: Draw["numbers"]): Draw {
  return { drawNumber: 1, date: "2020-01-01", numbers, bonusNumber: 45 };
}

describe("oddEvenDistribution / lowHighDistribution", () => {
  it("각 draw를 정확히 하나의 버킷에 집계하고 합계가 draws.length와 같다", () => {
    const draws = [
      draw([1, 2, 3, 4, 5, 6]),
      draw([1, 3, 5, 7, 9, 11]),
      draw([2, 4, 6, 8, 10, 12]),
    ];
    const oddEven = oddEvenDistribution(draws);
    const lowHigh = lowHighDistribution(draws);
    expect(Object.values(oddEven).reduce((a, b) => a + b, 0)).toBe(draws.length);
    expect(Object.values(lowHigh).reduce((a, b) => a + b, 0)).toBe(draws.length);
    expect(oddEven["3:3"]).toBe(1);
    expect(oddEven["6:0"]).toBe(1);
    expect(oddEven["0:6"]).toBe(1);
  });
});

describe("sumHistogram", () => {
  it("빈 배열이면 빈 히스토그램을 반환한다", () => {
    expect(sumHistogram([])).toEqual([]);
  });

  it("버킷 합계가 입력 개수와 같고, 각 버킷 시작값이 버킷 크기의 배수다", () => {
    const sums = [45, 50, 55, 100, 105, 200];
    const buckets = sumHistogram(sums, 20);
    expect(buckets.reduce((a, b) => a + b.count, 0)).toBe(sums.length);
    expect(buckets.every((b) => b.bucketStart % 20 === 0)).toBe(true);
  });
});

describe("consecutivePatternSummary", () => {
  it("연속번호 있음/없음 합계가 draws.length와 같다", () => {
    const draws = [draw([1, 2, 10, 20, 30, 40]), draw([1, 5, 10, 20, 30, 40])];
    const summary = consecutivePatternSummary(draws);
    expect(summary.withConsecutive + summary.withoutConsecutive).toBe(draws.length);
    expect(summary.withConsecutive).toBe(1);
  });
});
