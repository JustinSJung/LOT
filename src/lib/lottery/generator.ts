import type { Draw, LottoNumber, ScoredCombination } from "./types";
import { randomCombination } from "./monteCarlo";
import {
  buildScoringContext,
  scoreFrequency,
  scoreRecentTrend,
  scoreGap,
  scoreBalance,
  scorePattern,
  rawAffinity,
  computeEnsembleScore,
  type ScoringContext,
} from "./scoring";
import { GENERATOR_POOL_SIZE } from "./config";

export type GeneratorModel =
  | "balanced"
  | "hotNumbers"
  | "coldNumbers"
  | "recentTrend"
  | "historicalPattern"
  | "monteCarlo"
  | "ensemble";

export interface GenerateOptions {
  model?: GeneratorModel;
  /** How many games to return. */
  count?: number;
  /** How many candidates to simulate before ranking/picking from the pool. */
  poolSize?: number;
  rng?: () => number;
  /** Max times a single number may repeat across the returned set. */
  diversityLimit?: number;
}

interface Candidate {
  numbers: LottoNumber[];
  raw: number;
}

function combinationKey(numbers: LottoNumber[]): string {
  return [...numbers].sort((a, b) => a - b).join(",");
}

function average(numbers: LottoNumber[], lookup: Record<LottoNumber, number>): number {
  return numbers.reduce((sum, n) => sum + lookup[n], 0) / numbers.length;
}

function orderCandidates(
  candidates: Candidate[],
  model: GeneratorModel,
  ctx: ScoringContext,
): Candidate[] {
  switch (model) {
    case "hotNumbers":
      return [...candidates].sort(
        (a, b) => average(b.numbers, ctx.frequency) - average(a.numbers, ctx.frequency),
      );
    case "coldNumbers":
      return [...candidates].sort(
        (a, b) => average(a.numbers, ctx.frequency) - average(b.numbers, ctx.frequency),
      );
    case "recentTrend":
      return [...candidates].sort(
        (a, b) =>
          average(b.numbers, ctx.recentFrequency) - average(a.numbers, ctx.recentFrequency),
      );
    case "monteCarlo":
      return candidates; // pool is already uniformly random; no re-ranking
    case "historicalPattern":
    case "balanced":
    case "ensemble":
    default:
      return [...candidates].sort((a, b) => b.raw - a.raw);
  }
}

/**
 * Simulates a pool of random combinations, ranks them by the selected model,
 * and returns the top `count` with full score breakdowns. The "simulation"
 * dimension is this candidate's percentile rank within the same pool.
 *
 * This is a statistical ranking tool, not a probability predictor — every
 * 6/45 combination has identical odds of matching a future draw.
 */
export function generateCombinations(
  draws: Draw[],
  options: GenerateOptions = {},
): ScoredCombination[] {
  const {
    model = "ensemble",
    count = 5,
    poolSize = GENERATOR_POOL_SIZE,
    rng = Math.random,
    diversityLimit = Math.max(1, Math.round(count * 0.5)),
  } = options;

  const ctx = buildScoringContext(draws);

  const seen = new Set<string>();
  const candidates: Candidate[] = [];
  let attempts = 0;
  const maxAttempts = poolSize * 5;
  while (candidates.length < poolSize && attempts < maxAttempts) {
    attempts++;
    const numbers = randomCombination(rng);
    const key = combinationKey(numbers);
    if (seen.has(key)) continue;
    seen.add(key);
    candidates.push({ numbers, raw: rawAffinity(numbers, ctx) });
  }

  const ordered = orderCandidates(candidates, model, ctx);
  const total = ordered.length;

  const chosen: { candidate: Candidate; rank: number }[] = [];
  const numberUsage = new Map<LottoNumber, number>();

  for (let rank = 0; rank < ordered.length && chosen.length < count; rank++) {
    const candidate = ordered[rank];
    const overused = candidate.numbers.some(
      (n) => (numberUsage.get(n) ?? 0) >= diversityLimit,
    );
    if (overused) continue;
    chosen.push({ candidate, rank });
    for (const n of candidate.numbers) {
      numberUsage.set(n, (numberUsage.get(n) ?? 0) + 1);
    }
  }

  // Diversity constraint may leave slots unfilled on a small/skewed pool — top up ignoring it.
  for (let rank = 0; rank < ordered.length && chosen.length < count; rank++) {
    const candidate = ordered[rank];
    if (chosen.some((c) => c.candidate === candidate)) continue;
    chosen.push({ candidate, rank });
  }

  return chosen.map(({ candidate, rank }) => {
    const simulationScore =
      total > 0 ? Math.max(0, Math.min(100, ((total - rank) / total) * 100)) : 0;
    const breakdown = {
      frequency: scoreFrequency(candidate.numbers, ctx),
      recentTrend: scoreRecentTrend(candidate.numbers, ctx),
      gap: scoreGap(candidate.numbers, ctx),
      balance: scoreBalance(candidate.numbers),
      pattern: scorePattern(candidate.numbers, ctx),
      simulation: simulationScore,
    };
    return {
      numbers: [...candidate.numbers].sort((a, b) => a - b) as ScoredCombination["numbers"],
      breakdown,
      ensembleScore: computeEnsembleScore(breakdown),
    };
  });
}
