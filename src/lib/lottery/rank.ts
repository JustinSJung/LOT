import type { Draw, LottoNumber, PrizeTier } from "./types";

export function countMatches(picked: LottoNumber[], draw: Draw): number {
  const pickedSet = new Set(picked);
  return draw.numbers.filter((n) => pickedSet.has(n)).length;
}

export function prizeTier(picked: LottoNumber[], draw: Draw): PrizeTier {
  const pickedSet = new Set(picked);
  const matches = draw.numbers.filter((n) => pickedSet.has(n)).length;
  const bonusMatch = pickedSet.has(draw.bonusNumber);

  if (matches === 6) return 1;
  if (matches === 5 && bonusMatch) return 2;
  if (matches === 5) return 3;
  if (matches === 4) return 4;
  if (matches === 3) return 5;
  return 0;
}

export const PRIZE_LABELS: Record<PrizeTier, string> = {
  0: "낙첨",
  1: "1등",
  2: "2등",
  3: "3등",
  4: "4등",
  5: "5등",
};
