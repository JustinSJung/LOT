#!/usr/bin/env -S npx tsx
/**
 * Regenerates data/numbers.json, data/statistics.json and data/backtest.json
 * from data/draws.json using the statistical engine in src/lib/lottery.
 * Safe to run with zero draws — every output degrades to an honest empty/zero
 * shape rather than fabricating numbers (see /methodology "no fake data" rule).
 *
 * data/ is the canonical, version-controlled source. Everything written here
 * is mirrored into public/data/ too, because the site is a Next.js static
 * export (`output: 'export'`) with no server at runtime — client components
 * fetch JSON from public/, not from the repo-root data/ directory.
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ALL_NUMBERS, type Draw } from "../src/lib/lottery/types";
import { computeFrequency, recentFrequency, hotNumbers, coldNumbers } from "../src/lib/lottery/frequency";
import { computeGaps } from "../src/lib/lottery/gap";
import { oddEvenSplit, lowHighSplit, sumDistribution } from "../src/lib/lottery/distribution";
import { pairFrequency, tripleFrequency, topEntries } from "../src/lib/lottery/patterns";
import { runBacktest } from "../src/lib/lottery/backtest";
import { createRng } from "../src/lib/lottery/rng";
import { DEFAULT_BACKTEST_SAMPLE_SIZE, BACKTEST_SEED } from "../src/lib/lottery/config";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = join(__dirname, "..");
const DATA_DIR = join(ROOT_DIR, "data");
const PUBLIC_DATA_DIR = join(ROOT_DIR, "public", "data");

function readDraws(): Draw[] {
  const path = join(DATA_DIR, "draws.json");
  if (!existsSync(path)) return [];
  const raw = readFileSync(path, "utf-8").trim();
  return raw ? JSON.parse(raw) : [];
}

function writeJson(filename: string, data: unknown) {
  const content = JSON.stringify(data, null, 2) + "\n";
  writeFileSync(join(DATA_DIR, filename), content);
  mkdirSync(PUBLIC_DATA_DIR, { recursive: true });
  writeFileSync(join(PUBLIC_DATA_DIR, filename), content);
  console.log(`작성 완료: data/${filename} (+ public/data/${filename})`);
}

// Keep the client-fetchable copy of draws.json in sync too, even if this
// script runs without fetch-draws.ts having just run.
function mirrorDrawsToPublic() {
  const src = join(DATA_DIR, "draws.json");
  if (!existsSync(src)) return;
  mkdirSync(PUBLIC_DATA_DIR, { recursive: true });
  writeFileSync(join(PUBLIC_DATA_DIR, "draws.json"), readFileSync(src));
}

function main() {
  const draws = readDraws();
  mirrorDrawsToPublic();
  const generatedAt = new Date().toISOString();

  // --- numbers.json: per-number stats ---
  const frequency = computeFrequency(draws);
  const recentFreq = recentFrequency(draws, 30);
  const gaps = computeGaps(draws);

  const numbers = ALL_NUMBERS.map((n) => ({
    number: n,
    frequency: frequency[n],
    recentFrequency: recentFreq[n],
    lastSeenDrawNumber: gaps[n].lastSeenDrawNumber,
    gap: gaps[n].gap,
  }));

  writeJson("numbers.json", {
    generatedAt,
    drawCount: draws.length,
    recentWindow: 30,
    numbers,
  });

  // --- statistics.json: aggregate stats ---
  const sums = sumDistribution(draws);
  const oddEvenCounts: Record<string, number> = {};
  const lowHighCounts: Record<string, number> = {};
  for (const draw of draws) {
    const { odd, even } = oddEvenSplit(draw.numbers);
    const key1 = `${odd}:${even}`;
    oddEvenCounts[key1] = (oddEvenCounts[key1] ?? 0) + 1;

    const { low, high } = lowHighSplit(draw.numbers);
    const key2 = `${low}:${high}`;
    lowHighCounts[key2] = (lowHighCounts[key2] ?? 0) + 1;
  }

  const pairs = pairFrequency(draws);
  const triples = tripleFrequency(draws);

  writeJson("statistics.json", {
    generatedAt,
    drawCount: draws.length,
    hotNumbers: draws.length > 0 ? hotNumbers(frequency, 6) : [],
    coldNumbers: draws.length > 0 ? coldNumbers(frequency, 6) : [],
    oddEvenDistribution: oddEvenCounts,
    lowHighDistribution: lowHighCounts,
    sum: {
      min: sums.length ? Math.min(...sums) : null,
      max: sums.length ? Math.max(...sums) : null,
      average: sums.length ? Math.round((sums.reduce((a, b) => a + b, 0) / sums.length) * 10) / 10 : null,
      values: sums,
    },
    topPairs: topEntries(pairs, 10).map(([key, count]) => ({ key, count })),
    topTriples: topEntries(triples, 10).map(([key, count]) => ({ key, count })),
  });

  // --- backtest.json ---
  // Fixed seed -> reproducible: same draws.json always yields identical backtest.json
  // (see scripts/verify-backtest-reproducibility.ts).
  const backtest = runBacktest(draws, {
    sampleSize: DEFAULT_BACKTEST_SAMPLE_SIZE,
    model: "ensemble",
    rng: createRng(BACKTEST_SEED),
  });
  writeJson("backtest.json", {
    generatedAt,
    drawCount: draws.length,
    requestedSampleSize: DEFAULT_BACKTEST_SAMPLE_SIZE,
    seed: BACKTEST_SEED,
    ...backtest,
  });
}

main();
