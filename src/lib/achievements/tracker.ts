import { ACHIEVEMENTS } from "./definitions";
import type { AchievementDefinition, AchievementProgress, CounterKey } from "./types";

/**
 * Client-side only (no login, no backend) — mirrors how saved number sets
 * already work. All reads/writes are guarded so this is safe to import from
 * code that also runs during static export / SSR.
 */
const COUNTERS_KEY = "lottoAiLab.achievementCounters.v1";
const UNLOCKED_AT_KEY = "lottoAiLab.achievementUnlockedAt.v1";

type Counters = Partial<Record<CounterKey, number>>;
type UnlockedAtMap = Record<string, string>;

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readJson<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Private browsing / quota / disabled storage — achievements are a
    // nice-to-have, so fail silently rather than break the page.
  }
}

export function getCounters(): Counters {
  return readJson<Counters>(COUNTERS_KEY, {});
}

/**
 * Increments a usage counter (e.g. after a Number Analyzer run) and returns
 * any achievements newly unlocked by this increment (empty array if none).
 */
export function incrementCounter(key: CounterKey, amount = 1): AchievementDefinition[] {
  const counters = getCounters();
  const before = counters[key] ?? 0;
  const after = before + amount;
  counters[key] = after;
  writeJson(COUNTERS_KEY, counters);

  const unlockedAt = readJson<UnlockedAtMap>(UNLOCKED_AT_KEY, {});
  const newlyUnlocked = ACHIEVEMENTS.filter(
    (a) =>
      a.counterKey === key &&
      before < a.threshold &&
      after >= a.threshold &&
      !unlockedAt[a.id],
  );

  if (newlyUnlocked.length > 0) {
    const now = new Date().toISOString();
    for (const a of newlyUnlocked) unlockedAt[a.id] = now;
    writeJson(UNLOCKED_AT_KEY, unlockedAt);
  }

  return newlyUnlocked;
}

export function getAchievementProgress(): AchievementProgress[] {
  const counters = getCounters();
  const unlockedAt = readJson<UnlockedAtMap>(UNLOCKED_AT_KEY, {});

  return ACHIEVEMENTS.map((definition) => {
    const count = counters[definition.counterKey] ?? 0;
    const unlocked = count >= definition.threshold;
    return {
      definition,
      count,
      unlocked,
      unlockedAt: unlocked ? (unlockedAt[definition.id] ?? null) : null,
    };
  });
}
