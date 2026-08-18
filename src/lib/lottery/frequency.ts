import { ALL_NUMBERS, type Draw, type LottoNumber } from "./types";

export function computeFrequency(draws: Draw[]): Record<LottoNumber, number> {
  const counts: Record<number, number> = {};
  for (const n of ALL_NUMBERS) counts[n] = 0;
  for (const draw of draws) {
    for (const n of draw.numbers) counts[n]++;
  }
  return counts;
}

/** Frequency across only the most recent `windowSize` draws (by round). */
export function recentFrequency(
  draws: Draw[],
  windowSize: number,
): Record<LottoNumber, number> {
  const recent = [...draws].sort((a, b) => b.round - a.round).slice(0, windowSize);
  return computeFrequency(recent);
}

export function hotNumbers(
  freq: Record<LottoNumber, number>,
  count = 6,
): LottoNumber[] {
  return [...ALL_NUMBERS].sort((a, b) => freq[b] - freq[a] || a - b).slice(0, count);
}

export function coldNumbers(
  freq: Record<LottoNumber, number>,
  count = 6,
): LottoNumber[] {
  return [...ALL_NUMBERS].sort((a, b) => freq[a] - freq[b] || a - b).slice(0, count);
}
