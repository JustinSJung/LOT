import type { Draw, LottoNumber } from "./types";

export function oddEvenSplit(numbers: LottoNumber[]): { odd: number; even: number } {
  const odd = numbers.filter((n) => n % 2 === 1).length;
  return { odd, even: numbers.length - odd };
}

/** threshold: numbers <= threshold count as "low". Lotto 6/45 splits at 22/23. */
export function lowHighSplit(
  numbers: LottoNumber[],
  threshold = 22,
): { low: number; high: number } {
  const low = numbers.filter((n) => n <= threshold).length;
  return { low, high: numbers.length - low };
}

export function sum(numbers: LottoNumber[]): number {
  return numbers.reduce((a, b) => a + b, 0);
}

/** Returns each run of 2+ consecutive numbers found in the combination. */
export function consecutiveRuns(numbers: LottoNumber[]): LottoNumber[][] {
  const sorted = [...numbers].sort((a, b) => a - b);
  const runs: LottoNumber[][] = [];
  let current: LottoNumber[] = [];

  for (const n of sorted) {
    if (current.length === 0 || n === current[current.length - 1] + 1) {
      current.push(n);
    } else {
      if (current.length > 1) runs.push(current);
      current = [n];
    }
  }
  if (current.length > 1) runs.push(current);
  return runs;
}

export function sumDistribution(draws: Pick<Draw, "numbers">[]): number[] {
  return draws.map((d) => sum(d.numbers));
}

/** key format: "odd:even", e.g. "3:3" */
export function oddEvenDistribution(draws: Pick<Draw, "numbers">[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const draw of draws) {
    const { odd, even } = oddEvenSplit(draw.numbers);
    const key = `${odd}:${even}`;
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}

/** key format: "low:high", e.g. "3:3" */
export function lowHighDistribution(draws: Pick<Draw, "numbers">[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const draw of draws) {
    const { low, high } = lowHighSplit(draw.numbers);
    const key = `${low}:${high}`;
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}

export interface SumBucket {
  bucketStart: number;
  count: number;
}

/** Buckets a list of sums into fixed-width ranges, filling in empty buckets in between. */
export function sumHistogram(sums: number[], bucketSize = 20): SumBucket[] {
  if (sums.length === 0) return [];
  const bucketOf = (s: number) => Math.floor(s / bucketSize) * bucketSize;

  const counts = new Map<number, number>();
  for (const s of sums) {
    const b = bucketOf(s);
    counts.set(b, (counts.get(b) ?? 0) + 1);
  }

  const minBucket = bucketOf(Math.min(...sums));
  const maxBucket = bucketOf(Math.max(...sums));
  const result: SumBucket[] = [];
  for (let b = minBucket; b <= maxBucket; b += bucketSize) {
    result.push({ bucketStart: b, count: counts.get(b) ?? 0 });
  }
  return result;
}

/** Draws with 0 vs 1+ consecutive-number runs (e.g. 12,13). */
export function consecutivePatternSummary(
  draws: Pick<Draw, "numbers">[],
): { withConsecutive: number; withoutConsecutive: number } {
  let withConsecutive = 0;
  for (const draw of draws) {
    if (consecutiveRuns(draw.numbers).length > 0) withConsecutive++;
  }
  return { withConsecutive, withoutConsecutive: draws.length - withConsecutive };
}
