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
