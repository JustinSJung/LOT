import type { Draw } from "./types";

/** key format: "a-b" with a < b */
export function pairFrequency(draws: Draw[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const draw of draws) {
    const nums = [...draw.numbers].sort((a, b) => a - b);
    for (let i = 0; i < nums.length; i++) {
      for (let j = i + 1; j < nums.length; j++) {
        const key = `${nums[i]}-${nums[j]}`;
        map.set(key, (map.get(key) ?? 0) + 1);
      }
    }
  }
  return map;
}

/** key format: "a-b-c" with a < b < c */
export function tripleFrequency(draws: Draw[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const draw of draws) {
    const nums = [...draw.numbers].sort((a, b) => a - b);
    for (let i = 0; i < nums.length; i++) {
      for (let j = i + 1; j < nums.length; j++) {
        for (let k = j + 1; k < nums.length; k++) {
          const key = `${nums[i]}-${nums[j]}-${nums[k]}`;
          map.set(key, (map.get(key) ?? 0) + 1);
        }
      }
    }
  }
  return map;
}

export function topEntries(map: Map<string, number>, count = 10): [string, number][] {
  return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, count);
}
