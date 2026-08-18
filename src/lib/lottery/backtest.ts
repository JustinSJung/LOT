import type { Draw, LottoNumber } from "./types";
import { generateCombinations, type GeneratorModel } from "./generator";
import { randomCombination } from "./monteCarlo";
import { countMatches } from "./rank";
import { DEFAULT_BACKTEST_SAMPLE_SIZE, BACKTEST_MIN_HISTORY } from "./config";

export interface BacktestRoundResult {
  round: number;
  aiNumbers: LottoNumber[];
  aiMatches: number;
  randomNumbers: LottoNumber[];
  randomMatches: number;
}

export interface BacktestSummary {
  model: GeneratorModel;
  /** Rounds actually evaluated (may be less than the requested sample size if history was thin). */
  sampleSize: number;
  aiAverageMatch: number;
  randomAverageMatch: number;
  aiThreePlus: number;
  randomThreePlus: number;
  aiFourPlus: number;
  randomFourPlus: number;
  rounds: BacktestRoundResult[];
}

/**
 * For each of the most recent `sampleSize` draws, generates one AI combination
 * using ONLY draws strictly before that round (no look-ahead), plus one random
 * baseline combination, and compares both against the actual result.
 *
 * This reports a historical backtest result only. It does not imply the model
 * improves real future odds — see /methodology. Sample sizes here are small
 * relative to what's needed for statistical significance; treat results as
 * directional, not conclusive.
 */
export function runBacktest(
  draws: Draw[],
  options: {
    sampleSize?: number;
    model?: GeneratorModel;
    poolSize?: number;
    rng?: () => number;
  } = {},
): BacktestSummary {
  const {
    sampleSize = DEFAULT_BACKTEST_SAMPLE_SIZE,
    model = "ensemble",
    poolSize = 500,
    rng = Math.random,
  } = options;

  const sorted = [...draws].sort((a, b) => a.round - b.round);
  const testRounds = sorted.slice(-sampleSize);
  const rounds: BacktestRoundResult[] = [];

  for (const actual of testRounds) {
    const priorDraws = sorted.filter((d) => d.round < actual.round);
    if (priorDraws.length < BACKTEST_MIN_HISTORY) continue;

    const [aiPick] = generateCombinations(priorDraws, { model, count: 1, poolSize, rng });
    const randomPick = randomCombination(rng);

    rounds.push({
      round: actual.round,
      aiNumbers: aiPick.numbers,
      aiMatches: countMatches(aiPick.numbers, actual),
      randomNumbers: randomPick,
      randomMatches: countMatches(randomPick, actual),
    });
  }

  const n = rounds.length;
  const average = (values: number[]) =>
    n === 0 ? 0 : Math.round((values.reduce((s, v) => s + v, 0) / n) * 100) / 100;

  return {
    model,
    sampleSize: n,
    aiAverageMatch: average(rounds.map((r) => r.aiMatches)),
    randomAverageMatch: average(rounds.map((r) => r.randomMatches)),
    aiThreePlus: rounds.filter((r) => r.aiMatches >= 3).length,
    randomThreePlus: rounds.filter((r) => r.randomMatches >= 3).length,
    aiFourPlus: rounds.filter((r) => r.aiMatches >= 4).length,
    randomFourPlus: rounds.filter((r) => r.randomMatches >= 4).length,
    rounds,
  };
}
