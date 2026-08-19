import { createRng } from "./rng";
import { randomCombination } from "./monteCarlo";
import type { Draw } from "./types";

/** Deterministic synthetic draws for unit tests — not real lottery data. */
export function makeFixtureDraws(count: number, seed = 1): Draw[] {
  const rng = createRng(seed);
  const draws: Draw[] = [];

  for (let i = 1; i <= count; i++) {
    const numbers = randomCombination(rng) as Draw["numbers"];
    let bonus: number;
    do {
      bonus = 1 + Math.floor(rng() * 45);
    } while ((numbers as number[]).includes(bonus));

    draws.push({
      drawNumber: i,
      date: `2020-${String(1 + ((i - 1) % 12)).padStart(2, "0")}-${String(1 + ((i - 1) % 28)).padStart(2, "0")}`,
      numbers,
      bonusNumber: bonus,
    });
  }

  return draws;
}
