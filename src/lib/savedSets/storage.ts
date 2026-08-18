import type { SavedSet } from "./types";

/**
 * No login, no backend — same pattern as achievements. This is the core
 * revisit loop: a set is saved against a specific draw number, and the site
 * checks that draw's result on later visits. No "best score" or session
 * high-score tracking here by design (see Product Direction v2) — saved sets
 * are just what the user chose to keep, nothing more.
 */
const STORAGE_KEY = "lottoAiLab.savedSets.v1";

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readAll(): SavedSet[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SavedSet[]) : [];
  } catch {
    return [];
  }
}

function writeAll(sets: SavedSet[]): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sets));
  } catch {
    // Private browsing / quota / disabled storage — fail silently.
  }
}

function generateId(): string {
  if (isBrowser() && "randomUUID" in window.crypto) {
    return window.crypto.randomUUID();
  }
  return `set_${Date.now()}_${Math.floor(Math.random() * 1e9)}`;
}

export function getSavedSets(): SavedSet[] {
  return readAll().sort((a, b) => (a.savedAt < b.savedAt ? 1 : -1));
}

export function saveSet(input: Omit<SavedSet, "id" | "savedAt">): SavedSet {
  const set: SavedSet = {
    ...input,
    id: generateId(),
    savedAt: new Date().toISOString(),
  };
  writeAll([...readAll(), set]);
  return set;
}

export function renameSet(id: string, name: string | null): void {
  writeAll(readAll().map((s) => (s.id === id ? { ...s, name } : s)));
}

export function deleteSet(id: string): void {
  writeAll(readAll().filter((s) => s.id !== id));
}
