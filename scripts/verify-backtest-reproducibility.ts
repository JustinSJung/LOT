#!/usr/bin/env -S npx tsx
/**
 * Smoke test: runs the backtest twice with the same fixed seed and asserts
 * the outputs are byte-identical. This is what "reproducible" is supposed to
 * mean for data/backtest.json — if this ever fails, something in the engine
 * started depending on unseeded randomness (raw Math.random, Set/Map
 * iteration order assumptions, Date.now(), etc.) and needs to be fixed before
 * trusting backtest.json as the "official" numbers.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { runBacktest } from "../src/lib/lottery/backtest";
import { createRng } from "../src/lib/lottery/rng";
import { DEFAULT_BACKTEST_SAMPLE_SIZE, BACKTEST_SEED } from "../src/lib/lottery/config";
import type { Draw } from "../src/lib/lottery/types";

const __dirname = dirname(fileURLToPath(import.meta.url));
const draws: Draw[] = JSON.parse(
  readFileSync(join(__dirname, "..", "data", "draws.json"), "utf-8"),
);

function run() {
  return runBacktest(draws, {
    sampleSize: DEFAULT_BACKTEST_SAMPLE_SIZE,
    model: "ensemble",
    rng: createRng(BACKTEST_SEED),
  });
}

const run1 = run();
const run2 = run();

const json1 = JSON.stringify(run1);
const json2 = JSON.stringify(run2);

if (json1 === json2) {
  console.log(
    `재현성 확인 완료: 시드 ${BACKTEST_SEED}, ${run1.sampleSize}라운드 — 두 번의 실행 결과가 완전히 동일합니다.`,
  );
  process.exit(0);
} else {
  console.error(`재현성 실패: 시드 ${BACKTEST_SEED}인데 두 실행 결과가 다릅니다.`);
  console.error("run1:", json1.slice(0, 500));
  console.error("run2:", json2.slice(0, 500));
  process.exit(1);
}
