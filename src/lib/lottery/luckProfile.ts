import type { LottoNumber } from "./types";
import { consecutiveRuns } from "./distribution";
import { scoreBalance, scoreFrequency, scorePattern, scoreRecentTrend, type ScoringContext } from "./scoring";

/**
 * Entertainment framing only — these are statistical characteristics of a
 * combination's numbers, not fortune-telling and not a win-probability
 * signal. Never surface this as "today's lucky number" or "higher chance to
 * win." Keep language to Statistical Score / Historical Pattern / Combination
 * Character.
 */
export type LuckCharacter =
  | "The Balanced Explorer"
  | "The Hot Chaser"
  | "The Contrarian"
  | "The Pattern Hunter"
  | "The Wild Card"
  | "The Quiet Player"
  | "The High Roller"
  | "The Number Architect";

export interface LuckProfile {
  balance: number;
  pattern: number;
  trend: number;
  rarity: number;
  diversity: number;
  character: LuckCharacter;
}

export const LUCK_CHARACTER_DESCRIPTIONS: Record<LuckCharacter, string> = {
  "The Balanced Explorer":
    "No single trait dominates — an evenly-spread statistical profile across the board.",
  "The Hot Chaser": "Leans on numbers with strong recent appearance trends.",
  "The Contrarian": "Leans on numbers that have historically appeared less often.",
  "The Pattern Hunter": "Leans on number pairs/triples that have co-occurred often historically.",
  "The Wild Card": "Two or more traits are tied for the lead — an unpredictable mix.",
  "The Quiet Player": "Modest scores across every trait — an understated combination.",
  "The High Roller": "Strong scores across every trait at once.",
  "The Number Architect": "Deliberately spread across number ranges, avoiding consecutive runs.",
};

function decadeOf(n: LottoNumber): number {
  if (n <= 10) return 0;
  if (n <= 20) return 1;
  if (n <= 30) return 2;
  if (n <= 40) return 3;
  return 4;
}

/** Structural spread of a combination across number ranges — independent of draw history. */
export function scoreDiversity(numbers: LottoNumber[]): number {
  const decadeCount = new Set(numbers.map(decadeOf)).size; // 1-5
  const decadeScore = (decadeCount / 5) * 100;
  const runs = consecutiveRuns(numbers);
  const consecutivePenalty = runs.reduce((sum, run) => sum + (run.length - 1) * 15, 0);
  return Math.max(0, Math.min(100, decadeScore - consecutivePenalty));
}

function determineCharacter(axes: {
  balance: number;
  pattern: number;
  trend: number;
  rarity: number;
  diversity: number;
}): LuckCharacter {
  const values = Object.values(axes);
  const avg = values.reduce((s, v) => s + v, 0) / values.length;
  const max = Math.max(...values);
  const min = Math.min(...values);

  if (avg >= 70) return "The High Roller";
  if (avg <= 30) return "The Quiet Player";
  if (max - min < 10) return "The Balanced Explorer";

  const topAxes = (Object.entries(axes) as [keyof typeof axes, number][]).filter(
    ([, v]) => max - v < 5,
  );

  if (topAxes.length >= 2) return "The Wild Card";

  const dominant = topAxes[0][0];
  const byDominantAxis: Record<keyof typeof axes, LuckCharacter> = {
    balance: "The Balanced Explorer",
    pattern: "The Pattern Hunter",
    trend: "The Hot Chaser",
    rarity: "The Contrarian",
    diversity: "The Number Architect",
  };
  return byDominantAxis[dominant];
}

export function computeLuckProfile(numbers: LottoNumber[], ctx: ScoringContext): LuckProfile {
  const balance = scoreBalance(numbers);
  const pattern = scorePattern(numbers, ctx);
  const trend = scoreRecentTrend(numbers, ctx);
  const rarity = 100 - scoreFrequency(numbers, ctx);
  const diversity = scoreDiversity(numbers);

  return {
    balance,
    pattern,
    trend,
    rarity,
    diversity,
    character: determineCharacter({ balance, pattern, trend, rarity, diversity }),
  };
}
