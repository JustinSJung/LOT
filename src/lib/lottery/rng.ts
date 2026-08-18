/**
 * mulberry32 — a small, fast, seedable PRNG. Given the same seed it produces
 * the exact same sequence every time, which is what makes a backtest run
 * reproducible. Not cryptographically secure; fine for simulation use only.
 */
export function createRng(seed: number): () => number {
  let a = seed >>> 0;
  return function mulberry32() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
