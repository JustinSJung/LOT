import { ALL_NUMBERS, type Draw, type LottoNumber } from "./types";

export interface GapInfo {
  number: LottoNumber;
  lastSeenRound: number | null;
  /** Rounds since this number last appeared, relative to the latest round in the dataset. */
  gap: number;
}

export function computeGaps(draws: Draw[]): Record<LottoNumber, GapInfo> {
  if (draws.length === 0) {
    const empty: Record<number, GapInfo> = {};
    for (const n of ALL_NUMBERS) empty[n] = { number: n, lastSeenRound: null, gap: 0 };
    return empty;
  }

  const latestRound = Math.max(...draws.map((d) => d.round));
  const lastSeen: Record<number, number | null> = {};
  for (const n of ALL_NUMBERS) lastSeen[n] = null;

  for (const draw of draws) {
    for (const n of draw.numbers) {
      if (lastSeen[n] === null || draw.round > (lastSeen[n] as number)) {
        lastSeen[n] = draw.round;
      }
    }
  }

  const result: Record<number, GapInfo> = {};
  for (const n of ALL_NUMBERS) {
    const seen = lastSeen[n];
    result[n] = {
      number: n,
      lastSeenRound: seen,
      gap: seen === null ? latestRound : latestRound - seen,
    };
  }
  return result;
}
