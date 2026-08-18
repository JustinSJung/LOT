import { ALL_NUMBERS, type LottoNumber } from "./types";
import { createRng, freshSeed } from "./rng";

/** Uniform-random 6-number combination (Fisher-Yates partial shuffle). */
export function randomCombination(rng: () => number = createRng(freshSeed())): LottoNumber[] {
  const pool = [...ALL_NUMBERS];
  const picked: LottoNumber[] = [];
  for (let i = 0; i < 6; i++) {
    const idx = Math.floor(rng() * pool.length);
    picked.push(pool[idx]);
    pool.splice(idx, 1);
  }
  return picked.sort((a, b) => a - b);
}

export function simulateCombinations(
  count: number,
  rng: () => number = createRng(freshSeed()),
): LottoNumber[][] {
  const results: LottoNumber[][] = [];
  for (let i = 0; i < count; i++) results.push(randomCombination(rng));
  return results;
}
