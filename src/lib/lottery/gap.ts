import { ALL_NUMBERS, type Draw, type LottoNumber } from "./types";

export interface GapInfo {
  number: LottoNumber;
  lastSeenDrawNumber: number | null;
  /** Draws since this number last appeared, relative to the latest draw in the dataset. */
  gap: number;
}

export function computeGaps(draws: Draw[]): Record<LottoNumber, GapInfo> {
  if (draws.length === 0) {
    const empty: Record<number, GapInfo> = {};
    for (const n of ALL_NUMBERS) empty[n] = { number: n, lastSeenDrawNumber: null, gap: 0 };
    return empty;
  }

  const latestDrawNumber = Math.max(...draws.map((d) => d.drawNumber));
  const lastSeen: Record<number, number | null> = {};
  for (const n of ALL_NUMBERS) lastSeen[n] = null;

  for (const draw of draws) {
    for (const n of draw.numbers) {
      if (lastSeen[n] === null || draw.drawNumber > (lastSeen[n] as number)) {
        lastSeen[n] = draw.drawNumber;
      }
    }
  }

  const result: Record<number, GapInfo> = {};
  for (const n of ALL_NUMBERS) {
    const seen = lastSeen[n];
    result[n] = {
      number: n,
      lastSeenDrawNumber: seen,
      gap: seen === null ? latestDrawNumber : latestDrawNumber - seen,
    };
  }
  return result;
}
