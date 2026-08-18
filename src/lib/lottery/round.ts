// Round 1 draw: 2002-12-07 21:00 KST. Encoded directly as UTC fields so that
// "now" (also shifted to KST wall-clock) can be compared on the same axis
// without a real timezone conversion.
const ANCHOR_ROUND1_KST_MS = Date.UTC(2002, 11, 7, 21, 0, 0);
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

/**
 * Computes the round number that should exist as of the given time (default: now).
 * A new round becomes available every Saturday at 21:00 KST.
 */
export function computeLatestRound(referenceDate: Date = new Date()): number {
  const kstNowMs = referenceDate.getTime() + KST_OFFSET_MS;
  const diff = kstNowMs - ANCHOR_ROUND1_KST_MS;
  if (diff < 0) return 0;
  return Math.floor(diff / WEEK_MS) + 1;
}
