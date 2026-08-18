import type { Draw, LottoNumber } from "./types";
import { generateCombinations, type GeneratorModel } from "./generator";
import { randomCombination } from "./monteCarlo";
import { countMatches } from "./rank";
import { createRng } from "./rng";
import {
  DEFAULT_BACKTEST_SAMPLE_SIZE,
  BACKTEST_MIN_HISTORY,
  THEORETICAL_EXPECTED_MATCHES,
  BACKTEST_SEED,
} from "./config";

export interface BacktestRoundResult {
  drawNumber: number;
  aiNumbers: LottoNumber[];
  aiMatches: number;
  randomNumbers: LottoNumber[];
  randomMatches: number;
}

interface SampleStats {
  mean: number;
  /** Sample standard deviation (n-1 denominator). 0 when fewer than 2 observations. */
  stdDev: number;
  /** Standard error of the mean: stdDev / sqrt(n). */
  stdError: number;
}

export interface BacktestSummary {
  model: GeneratorModel;
  /** Draws actually evaluated (may be less than the requested sample size if history was thin). */
  sampleSize: number;
  /** Theoretical expected matches for a uniformly random 6-pick: 6 * (6/45) ≈ 0.8. */
  theoreticalExpectedMatches: number;

  aiAverageMatch: number;
  aiStdDev: number;
  aiStdError: number;

  randomAverageMatch: number;
  randomStdDev: number;
  randomStdError: number;

  /** aiAverageMatch - randomAverageMatch. */
  meanDifference: number;
  /** sqrt(aiStdError^2 + randomStdError^2) — treats the two samples as independent (approximation). */
  standardErrorOfDifference: number;
  /**
   * meanDifference / standardErrorOfDifference. Roughly: how many standard errors
   * apart the two averages are. |z| < ~2 is consistent with the difference being
   * noise, not a real effect — this is a rough diagnostic, not a formal significance test.
   */
  zScore: number;

  aiThreePlus: number;
  randomThreePlus: number;
  aiThreePlusRate: number;
  randomThreePlusRate: number;
  /** Two-proportion z-test standard error for the 3+ match rate gap. */
  threeMatchStandardError: number;
  /** Two-proportion z-test z-score for AI vs random 3+ match rate. |z| < ~2 ~ noise. */
  threeMatchZScore: number;

  aiFourPlus: number;
  randomFourPlus: number;
  rounds: BacktestRoundResult[];
}

function round(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

interface TwoProportionZTest {
  p1: number;
  p2: number;
  standardError: number;
  zScore: number;
}

/**
 * Two-proportion z-test (pooled), treating the two samples as independent.
 * x1/n1 and x2/n2 are event counts and trial counts for each group.
 * |z| < ~2 is consistent with the rate difference being noise.
 */
function twoProportionZTest(x1: number, n1: number, x2: number, n2: number): TwoProportionZTest {
  if (n1 === 0 || n2 === 0) return { p1: 0, p2: 0, standardError: 0, zScore: 0 };

  const p1 = x1 / n1;
  const p2 = x2 / n2;
  const pooledP = (x1 + x2) / (n1 + n2);
  const standardError = Math.sqrt(pooledP * (1 - pooledP) * (1 / n1 + 1 / n2));
  const zScore = standardError > 0 ? (p1 - p2) / standardError : 0;

  return {
    p1: round(p1, 4),
    p2: round(p2, 4),
    standardError: round(standardError, 4),
    zScore: round(zScore, 4),
  };
}

function computeSampleStats(values: number[]): SampleStats {
  const n = values.length;
  if (n === 0) return { mean: 0, stdDev: 0, stdError: 0 };

  const mean = values.reduce((s, v) => s + v, 0) / n;
  if (n < 2) return { mean: round(mean, 4), stdDev: 0, stdError: 0 };

  const variance =
    values.reduce((s, v) => s + (v - mean) ** 2, 0) / (n - 1);
  const stdDev = Math.sqrt(variance);
  const stdError = stdDev / Math.sqrt(n);

  return { mean: round(mean, 4), stdDev: round(stdDev, 4), stdError: round(stdError, 4) };
}

/**
 * For each of the most recent `sampleSize` draws, generates one AI combination
 * using ONLY draws strictly before that draw (no look-ahead), plus one random
 * baseline combination, and compares both against the actual result.
 *
 * This reports a historical backtest result only. It does not imply the model
 * improves real future odds — see /methodology. Standard errors and the z-score
 * are included as a minimal check on whether an observed AI-vs-random gap looks
 * like noise; they are not a substitute for a proper significance test, and a
 * "not noise" result here still would not imply improved real-world odds.
 *
 * Defaults to a fixed-seed PRNG (BACKTEST_SEED) so the same inputs always
 * produce byte-identical output — see scripts/verify-backtest-reproducibility.ts.
 * Pass a different `rng` explicitly to sample a different run.
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
    rng = createRng(BACKTEST_SEED),
  } = options;

  const sorted = [...draws].sort((a, b) => a.drawNumber - b.drawNumber);
  const testDraws = sorted.slice(-sampleSize);
  const rounds: BacktestRoundResult[] = [];

  for (const actual of testDraws) {
    const priorDraws = sorted.filter((d) => d.drawNumber < actual.drawNumber);
    if (priorDraws.length < BACKTEST_MIN_HISTORY) continue;

    const [aiPick] = generateCombinations(priorDraws, { model, count: 1, poolSize, rng });
    const randomPick = randomCombination(rng);

    rounds.push({
      drawNumber: actual.drawNumber,
      aiNumbers: aiPick.numbers,
      aiMatches: countMatches(aiPick.numbers, actual),
      randomNumbers: randomPick,
      randomMatches: countMatches(randomPick, actual),
    });
  }

  const n = rounds.length;
  const aiStats = computeSampleStats(rounds.map((r) => r.aiMatches));
  const randomStats = computeSampleStats(rounds.map((r) => r.randomMatches));

  const meanDifference = round(aiStats.mean - randomStats.mean, 4);
  const standardErrorOfDifference = round(
    Math.sqrt(aiStats.stdError ** 2 + randomStats.stdError ** 2),
    4,
  );
  const zScore =
    standardErrorOfDifference > 0
      ? round(meanDifference / standardErrorOfDifference, 4)
      : 0;

  const aiThreePlus = rounds.filter((r) => r.aiMatches >= 3).length;
  const randomThreePlus = rounds.filter((r) => r.randomMatches >= 3).length;
  const threeMatchTest = twoProportionZTest(aiThreePlus, n, randomThreePlus, n);

  return {
    model,
    sampleSize: n,
    theoreticalExpectedMatches: round(THEORETICAL_EXPECTED_MATCHES, 4),

    aiAverageMatch: aiStats.mean,
    aiStdDev: aiStats.stdDev,
    aiStdError: aiStats.stdError,

    randomAverageMatch: randomStats.mean,
    randomStdDev: randomStats.stdDev,
    randomStdError: randomStats.stdError,

    meanDifference,
    standardErrorOfDifference,
    zScore,

    aiThreePlus,
    randomThreePlus,
    aiThreePlusRate: threeMatchTest.p1,
    randomThreePlusRate: threeMatchTest.p2,
    threeMatchStandardError: threeMatchTest.standardError,
    threeMatchZScore: threeMatchTest.zScore,

    aiFourPlus: rounds.filter((r) => r.aiMatches >= 4).length,
    randomFourPlus: rounds.filter((r) => r.randomMatches >= 4).length,
    rounds,
  };
}
