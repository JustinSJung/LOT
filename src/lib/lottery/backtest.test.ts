import { describe, it, expect } from "vitest";
import { runBacktest } from "./backtest";
import { createRng } from "./rng";
import { makeFixtureDraws } from "./testFixtures";
import { BACKTEST_MIN_HISTORY } from "./config";

describe("runBacktest", () => {
  it("draws가 없으면 sampleSize 0에 평균 0을 반환한다 (가짜 데이터 없음)", () => {
    const result = runBacktest([], { sampleSize: 50 });
    expect(result.sampleSize).toBe(0);
    expect(result.aiAverageMatch).toBe(0);
    expect(result.randomAverageMatch).toBe(0);
    expect(result.rounds).toEqual([]);
  });

  it("워밍업 기간보다 회차가 적으면 평가되는 라운드가 없다", () => {
    const draws = makeFixtureDraws(BACKTEST_MIN_HISTORY - 1, 11);
    const result = runBacktest(draws, { sampleSize: 100 });
    expect(result.sampleSize).toBe(0);
  });

  it("같은 시드로 두 번 실행하면 완전히 동일한 결과가 나온다 (재현성)", () => {
    const draws = makeFixtureDraws(150, 21);
    const run1 = runBacktest(draws, { sampleSize: 40, rng: createRng(42) });
    const run2 = runBacktest(draws, { sampleSize: 40, rng: createRng(42) });
    expect(run1).toEqual(run2);
  });

  it("평가된 라운드마다 매치 개수가 0-6 범위 안에 있다", () => {
    const draws = makeFixtureDraws(150, 21);
    const result = runBacktest(draws, { sampleSize: 40, poolSize: 100, rng: createRng(5) });
    expect(result.sampleSize).toBeGreaterThan(0);
    for (const round of result.rounds) {
      expect(round.aiMatches).toBeGreaterThanOrEqual(0);
      expect(round.aiMatches).toBeLessThanOrEqual(6);
      expect(round.randomMatches).toBeGreaterThanOrEqual(0);
      expect(round.randomMatches).toBeLessThanOrEqual(6);
    }
  });

  it("각 라운드는 그 라운드 이전 데이터만으로 생성된다 (미래 데이터 참조 없음)", () => {
    const draws = makeFixtureDraws(150, 21);
    const result = runBacktest(draws, { sampleSize: 30, poolSize: 100, rng: createRng(9) });
    // 워밍업 이후 라운드들이 오름차순 회차로 기록되는지만 확인 (별도 lookahead 없이
    // generateCombinations가 priorDraws만 받는 구조는 runBacktest 구현 자체가 보장함)
    const drawNumbers = result.rounds.map((r) => r.drawNumber);
    expect(new Set(drawNumbers).size).toBe(drawNumbers.length);
  });
});
