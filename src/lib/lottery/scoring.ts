import type { Draw, LottoNumber, ScoreBreakdown } from "./types";
import { computeFrequency, recentFrequency as computeRecentFrequency } from "./frequency";
import { computeGaps, type GapInfo } from "./gap";
import { oddEvenSplit, lowHighSplit } from "./distribution";
import { pairFrequency as computePairFrequency } from "./patterns";
import { randomCombination } from "./monteCarlo";
import { ENSEMBLE_WEIGHTS, RECENT_TREND_WINDOW, ANALYZER_SIMULATION_SAMPLE_SIZE } from "./config";

export interface ScoringContext {
  frequency: Record<LottoNumber, number>;
  recentFrequency: Record<LottoNumber, number>;
  gaps: Record<LottoNumber, GapInfo>;
  pairFrequency: Map<string, number>;
  maxFrequency: number;
  maxRecentFrequency: number;
  maxGap: number;
  maxPairFrequency: number;
}

export function buildScoringContext(
  draws: Draw[],
  recentWindow = RECENT_TREND_WINDOW,
): ScoringContext {
  const frequency = computeFrequency(draws);
  const recentFrequencyStat = computeRecentFrequency(draws, recentWindow);
  const gaps = computeGaps(draws);
  const pairs = computePairFrequency(draws);

  return {
    frequency,
    recentFrequency: recentFrequencyStat,
    gaps,
    pairFrequency: pairs,
    maxFrequency: Math.max(1, ...Object.values(frequency)),
    maxRecentFrequency: Math.max(1, ...Object.values(recentFrequencyStat)),
    maxGap: Math.max(1, ...Object.values(gaps).map((g) => g.gap)),
    maxPairFrequency: Math.max(1, ...pairs.values()),
  };
}

function normalize(value: number, max: number): number {
  if (max <= 0) return 0;
  return Math.max(0, Math.min(100, (value / max) * 100));
}

function average(numbers: LottoNumber[], lookup: (n: LottoNumber) => number): number {
  return numbers.reduce((sum, n) => sum + lookup(n), 0) / numbers.length;
}

export function scoreFrequency(numbers: LottoNumber[], ctx: ScoringContext): number {
  return normalize(average(numbers, (n) => ctx.frequency[n]), ctx.maxFrequency);
}

export function scoreRecentTrend(numbers: LottoNumber[], ctx: ScoringContext): number {
  return normalize(average(numbers, (n) => ctx.recentFrequency[n]), ctx.maxRecentFrequency);
}

export function scoreGap(numbers: LottoNumber[], ctx: ScoringContext): number {
  return normalize(average(numbers, (n) => ctx.gaps[n].gap), ctx.maxGap);
}

export function scoreBalance(numbers: LottoNumber[]): number {
  const { odd, even } = oddEvenSplit(numbers);
  const { low, high } = lowHighSplit(numbers);
  const oddEvenBalance = 100 - Math.abs(odd - even) * (100 / 6);
  const lowHighBalance = 100 - Math.abs(low - high) * (100 / 6);
  return Math.max(0, (oddEvenBalance + lowHighBalance) / 2);
}

export function scorePattern(numbers: LottoNumber[], ctx: ScoringContext): number {
  const sorted = [...numbers].sort((a, b) => a - b);
  let total = 0;
  let pairCount = 0;
  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      total += ctx.pairFrequency.get(`${sorted[i]}-${sorted[j]}`) ?? 0;
      pairCount++;
    }
  }
  return normalize(pairCount > 0 ? total / pairCount : 0, ctx.maxPairFrequency);
}

/** Combined frequency/recentTrend/gap/pattern affinity, unnormalized. Used to rank candidates. */
export function rawAffinity(numbers: LottoNumber[], ctx: ScoringContext): number {
  return (
    scoreFrequency(numbers, ctx) +
    scoreRecentTrend(numbers, ctx) +
    scoreGap(numbers, ctx) +
    scorePattern(numbers, ctx)
  );
}

/**
 * Percentile rank (0-100) of this combination's rawAffinity against a fresh batch
 * of randomly simulated combinations. A relative ranking device only — NOT an
 * estimate of win probability. Every 6/45 combination has identical odds.
 */
export function scoreSimulation(
  numbers: LottoNumber[],
  ctx: ScoringContext,
  sampleSize = ANALYZER_SIMULATION_SAMPLE_SIZE,
  rng: () => number = Math.random,
): number {
  const candidateRaw = rawAffinity(numbers, ctx);
  let atOrBelow = 0;
  for (let i = 0; i < sampleSize; i++) {
    if (rawAffinity(randomCombination(rng), ctx) <= candidateRaw) atOrBelow++;
  }
  return normalize(atOrBelow, sampleSize);
}

export function scoreCombination(
  numbers: LottoNumber[],
  ctx: ScoringContext,
  options: { sampleSize?: number; rng?: () => number } = {},
): ScoreBreakdown {
  return {
    frequency: scoreFrequency(numbers, ctx),
    recentTrend: scoreRecentTrend(numbers, ctx),
    gap: scoreGap(numbers, ctx),
    balance: scoreBalance(numbers),
    pattern: scorePattern(numbers, ctx),
    simulation: scoreSimulation(numbers, ctx, options.sampleSize, options.rng),
  };
}

export function computeEnsembleScore(breakdown: ScoreBreakdown): number {
  const weighted =
    breakdown.frequency * ENSEMBLE_WEIGHTS.frequency +
    breakdown.recentTrend * ENSEMBLE_WEIGHTS.recentTrend +
    breakdown.gap * ENSEMBLE_WEIGHTS.gap +
    breakdown.balance * ENSEMBLE_WEIGHTS.balance +
    breakdown.pattern * ENSEMBLE_WEIGHTS.pattern +
    breakdown.simulation * ENSEMBLE_WEIGHTS.simulation;
  return Math.round(weighted * 10) / 10;
}
