import type { Draw, LottoNumber, PrizeTier } from "./types";
import { computeFrequency, recentFrequency } from "./frequency";
import { computeGaps } from "./gap";
import { countMatches, prizeTier } from "./rank";
import { RECENT_TREND_WINDOW } from "./config";

export interface DrawMatchResult {
  drawNumber: number;
  date: string;
  matches: number;
  prizeTier: PrizeTier;
}

export interface NumberAnalysisEntry {
  number: LottoNumber;
  frequency: number;
  recentFrequency: number;
  gap: number;
}

export interface NumberSetAnalysis {
  drawsSearched: number;
  highestMatch: number;
  /** 0 if this set never matched enough for any prize across the searched draws. */
  bestPrizeTier: PrizeTier;
  /** matches (0-6) -> how many draws produced exactly that many matches. */
  matchCounts: Record<number, number>;
  /** Draws with 3+ matches, most recent first. */
  notableMatches: DrawMatchResult[];
  perNumber: NumberAnalysisEntry[];
}

/**
 * Searches every draw for how a user's 6-number pick would have performed.
 * Historical only — does not imply anything about a future draw.
 */
export function analyzeNumberSet(
  picked: LottoNumber[],
  draws: Draw[],
  recentWindow: number = RECENT_TREND_WINDOW,
): NumberSetAnalysis {
  const matchCounts: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  const notableMatches: DrawMatchResult[] = [];
  let highestMatch = 0;
  let bestPrizeTier: PrizeTier = 0;

  for (const draw of draws) {
    const matches = countMatches(picked, draw);
    matchCounts[matches] = (matchCounts[matches] ?? 0) + 1;
    if (matches > highestMatch) highestMatch = matches;

    const tier = prizeTier(picked, draw);
    if (tier > 0 && (bestPrizeTier === 0 || tier < bestPrizeTier)) bestPrizeTier = tier;

    if (matches >= 3) {
      notableMatches.push({ drawNumber: draw.drawNumber, date: draw.date, matches, prizeTier: tier });
    }
  }

  notableMatches.sort((a, b) => b.drawNumber - a.drawNumber);

  const freq = computeFrequency(draws);
  const recentFreq = recentFrequency(draws, recentWindow);
  const gaps = computeGaps(draws);

  const perNumber: NumberAnalysisEntry[] = picked.map((n) => ({
    number: n,
    frequency: freq[n],
    recentFrequency: recentFreq[n],
    gap: gaps[n].gap,
  }));

  return {
    drawsSearched: draws.length,
    highestMatch,
    bestPrizeTier,
    matchCounts,
    notableMatches,
    perNumber,
  };
}
