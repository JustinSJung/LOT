import { describe, it, expect } from "vitest";
import {
  buildScoringContext,
  scoreFrequency,
  scoreBalance,
  scoreCombination,
  computeEnsembleScore,
} from "./scoring";
import { ENSEMBLE_WEIGHTS } from "./config";
import { createRng } from "./rng";
import { makeFixtureDraws } from "./testFixtures";

describe("scoreBalance", () => {
  it("홀짝 3:3, 저고 3:3이면 만점(100)에 가깝다", () => {
    // 1,3,5 (odd, low) / 24,26,28 (even, high) -> odd 3, even 3, low 3(<=22 only 1,3,5), high 3
    expect(scoreBalance([1, 3, 5, 24, 26, 28])).toBe(100);
  });

  it("한쪽으로 완전히 치우치면 점수가 낮다", () => {
    const balanced = scoreBalance([1, 3, 5, 24, 26, 28]);
    const skewed = scoreBalance([1, 3, 5, 7, 9, 11]); // 홀 6, 짝 0 / 저 6, 고 0
    expect(skewed).toBeLessThan(balanced);
  });
});

describe("scoreFrequency", () => {
  it("역대 빈도가 높은 번호일수록 점수가 높다", () => {
    const draws = makeFixtureDraws(200, 7);
    const ctx = buildScoringContext(draws);
    const freqEntries = Object.entries(ctx.frequency).sort((a, b) => b[1] - a[1]);
    const hottest = Number(freqEntries[0][0]);
    const coldest = Number(freqEntries[freqEntries.length - 1][0]);

    // 6개를 채우기 위해 나머지는 중간값 번호로 채운다 (핫/콜드 자체와 겹치지 않게)
    const filler = [11, 12, 13, 14, 15].filter((n) => n !== hottest && n !== coldest);
    const hotCombo = [hottest, ...filler].slice(0, 6);
    const coldCombo = [coldest, ...filler].slice(0, 6);

    expect(scoreFrequency(hotCombo, ctx)).toBeGreaterThanOrEqual(scoreFrequency(coldCombo, ctx));
  });

  it("draws가 비어 있으면 0을 반환한다 (0으로 나누기 방지)", () => {
    const ctx = buildScoringContext([]);
    expect(scoreFrequency([1, 2, 3, 4, 5, 6], ctx)).toBe(0);
  });
});

describe("computeEnsembleScore", () => {
  it("가중 평균 공식대로 계산한다", () => {
    const breakdown = {
      frequency: 100,
      recentTrend: 50,
      gap: 0,
      balance: 100,
      pattern: 20,
      simulation: 80,
    };
    const expected =
      breakdown.frequency * ENSEMBLE_WEIGHTS.frequency +
      breakdown.recentTrend * ENSEMBLE_WEIGHTS.recentTrend +
      breakdown.gap * ENSEMBLE_WEIGHTS.gap +
      breakdown.balance * ENSEMBLE_WEIGHTS.balance +
      breakdown.pattern * ENSEMBLE_WEIGHTS.pattern +
      breakdown.simulation * ENSEMBLE_WEIGHTS.simulation;

    expect(computeEnsembleScore(breakdown)).toBeCloseTo(expected, 4);
  });

  it("모든 항목이 100이면 100에 가깝다", () => {
    const breakdown = {
      frequency: 100,
      recentTrend: 100,
      gap: 100,
      balance: 100,
      pattern: 100,
      simulation: 100,
    };
    expect(computeEnsembleScore(breakdown)).toBeCloseTo(100, 1);
  });
});

describe("scoreCombination", () => {
  it("6개 항목 모두 0-100 범위 안에 있다", () => {
    const draws = makeFixtureDraws(150, 3);
    const ctx = buildScoringContext(draws);
    const breakdown = scoreCombination([1, 2, 3, 4, 5, 6], ctx, {
      sampleSize: 100,
      rng: createRng(1),
    });
    for (const value of Object.values(breakdown)) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(100);
    }
  });
});
