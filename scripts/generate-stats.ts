#!/usr/bin/env -S npx tsx
/**
 * Regenerates data/numbers.json, data/statistics.json and data/backtest.json
 * from data/draws.json using the statistical engine in src/lib/lottery.
 * Safe to run with zero draws — every output degrades to an honest empty/zero
 * shape rather than fabricating numbers (see /methodology "no fake data" rule).
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
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
const DATA_DIR = join(__dirname, "..", "data");

function readDraws(): Draw[] {
  const path = join(DATA_DIR, "draws.json");
  if (!existsSync(path)) return [];
  const raw = readFileSync(path, "utf-8").trim();
  return raw ? JSON.parse(raw) : [];
}

function writeJson(filename: string, data: unknown) {
  writeFileSync(join(DATA_DIR, filename), JSON.stringify(data, null, 2) + "\n");
  console.log(`작성 완료: data/${filename}`);
}

function main() {
  const draws = readDraws();
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
