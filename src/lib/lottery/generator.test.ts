import { describe, it, expect } from "vitest";
import { generateCombinations, type GeneratorModel } from "./generator";
import { createRng } from "./rng";
import { makeFixtureDraws } from "./testFixtures";

const MODELS: GeneratorModel[] = [
  "ensemble",
  "hotNumbers",
  "coldNumbers",
  "balanced",
  "monteCarlo",
  "recentTrend",
  "historicalPattern",
];

describe("generateCombinations", () => {
  const draws = makeFixtureDraws(150, 4);

  it.each(MODELS)("%s 모델: 요청한 개수만큼, 각각 6개의 유니크 번호를 반환한다", (model) => {
    const results = generateCombinations(draws, { model, count: 5, poolSize: 200, rng: createRng(1) });
    expect(results).toHaveLength(5);
    for (const r of results) {
      expect(r.numbers).toHaveLength(6);
      expect(new Set(r.numbers).size).toBe(6);
      expect(r.numbers.every((n) => n >= 1 && n <= 45)).toBe(true);
      expect(r.ensembleScore).toBeGreaterThanOrEqual(0);
      expect(r.ensembleScore).toBeLessThanOrEqual(100);
    }
  });

  it("draws가 비어 있어도 6개 유니크 번호를 반환한다 (0으로 나누기로 죽지 않음)", () => {
    const results = generateCombinations([], { model: "ensemble", count: 3, poolSize: 50 });
    expect(results).toHaveLength(3);
    for (const r of results) {
      expect(new Set(r.numbers).size).toBe(6);
    }
  });

  it("같은 시드로 실행하면 같은 결과를 반환한다 (재현성)", () => {
    const run1 = generateCombinations(draws, { model: "ensemble", count: 3, poolSize: 200, rng: createRng(99) });
    const run2 = generateCombinations(draws, { model: "ensemble", count: 3, poolSize: 200, rng: createRng(99) });
    expect(run1).toEqual(run2);
  });

  it("hotNumbers 모델은 coldNumbers 모델보다 평균 역대 빈도가 높은 조합을 낸다", () => {
    const hot = generateCombinations(draws, { model: "hotNumbers", count: 1, poolSize: 300, rng: createRng(1) })[0];
    const cold = generateCombinations(draws, { model: "coldNumbers", count: 1, poolSize: 300, rng: createRng(1) })[0];
    expect(hot.breakdown.frequency).toBeGreaterThanOrEqual(cold.breakdown.frequency);
  });
});
