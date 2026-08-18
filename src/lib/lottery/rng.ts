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

let freshSeedCounter = 0;

/**
 * A seed that's unique per call even when several calls land in the same
 * millisecond (Date.now() alone collides there — e.g. generating 5 paths
 * back-to-back in one click handler would otherwise seed identically and
 * produce suspiciously-matching "random" picks).
 */
export function freshSeed(): number {
  freshSeedCounter = (freshSeedCounter + 1) >>> 0;
  return (Date.now() ^ Math.imul(freshSeedCounter, 0x9e3779b1)) >>> 0;
}
