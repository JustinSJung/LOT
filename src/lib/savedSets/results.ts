import type { Draw } from "../lottery/types";
import { countMatches, prizeTier } from "../lottery/rank";
import type { SavedSet, SavedSetResult } from "./types";

/** Saved sets whose target draw has already landed in draws.json — "YOUR RESULT IS READY". */
export function computeReadyResults(savedSets: SavedSet[], draws: Draw[]): SavedSetResult[] {
  const byDrawNumber = new Map(draws.map((d) => [d.drawNumber, d]));
  const results: SavedSetResult[] = [];

  for (const savedSet of savedSets) {
    const draw = byDrawNumber.get(savedSet.drawNumber);
    if (!draw) continue;
    results.push({
      savedSet,
      actualNumbers: draw.numbers,
      actualBonus: draw.bonusNumber,
      matches: countMatches(savedSet.numbers, draw),
      prizeTier: prizeTier(savedSet.numbers, draw),
    });
  }

  return results;
}

/** Saved sets still waiting on their draw. */
export function getPendingSets(savedSets: SavedSet[], draws: Draw[]): SavedSet[] {
  const readyDrawNumbers = new Set(draws.map((d) => d.drawNumber));
  return savedSets.filter((s) => !readyDrawNumbers.has(s.drawNumber));
}
