import type { LottoNumber } from "./types";

// Matches the real Lotto 6/45 physical ball colors by range.
const BALL_COLOR_RANGES: { max: number; color: string }[] = [
  { max: 10, color: "#fbc400" },
  { max: 20, color: "#69c8f2" },
  { max: 30, color: "#ff7272" },
  { max: 40, color: "#aaaaaa" },
  { max: 45, color: "#b0d840" },
];

export function getBallColor(n: LottoNumber): string {
  for (const range of BALL_COLOR_RANGES) {
    if (n <= range.max) return range.color;
  }
  return "#aaaaaa";
}
