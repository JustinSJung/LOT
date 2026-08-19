import { describe, it, expect } from "vitest";
import { randomCombination, simulateCombinations } from "./monteCarlo";
import { createRng } from "./rng";

describe("randomCombination", () => {
  it("항상 정확히 6개의 서로 다른 번호를 반환한다", () => {
    const rng = createRng(1);
    for (let i = 0; i < 200; i++) {
      const combo = randomCombination(rng);
      expect(combo).toHaveLength(6);
      expect(new Set(combo).size).toBe(6);
      expect(combo.every((n) => n >= 1 && n <= 45)).toBe(true);
    }
  });

  it("오름차순으로 정렬되어 있다", () => {
    const combo = randomCombination(createRng(2));
    const sorted = [...combo].sort((a, b) => a - b);
    expect(combo).toEqual(sorted);
  });

  it("같은 시드는 같은 조합을 만든다 (재현성)", () => {
    expect(randomCombination(createRng(123))).toEqual(randomCombination(createRng(123)));
  });
});

describe("simulateCombinations", () => {
  it("요청한 개수만큼 조합을 생성하고 각각 6개 유니크 번호다", () => {
    const combos = simulateCombinations(50, createRng(3));
    expect(combos).toHaveLength(50);
    for (const combo of combos) {
      expect(new Set(combo).size).toBe(6);
    }
  });
});
