#!/usr/bin/env -S npx tsx
/**
 * Smoke test for the Phase 9 Statistics aggregation helpers
 * (oddEvenDistribution, lowHighDistribution, sumHistogram, consecutivePatternSummary).
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  oddEvenDistribution,
  lowHighDistribution,
  sumDistribution,
  sumHistogram,
  consecutivePatternSummary,
} from "../src/lib/lottery/distribution";
import { hotNumbers, coldNumbers, recentFrequency } from "../src/lib/lottery/frequency";
import type { Draw } from "../src/lib/lottery/types";

const __dirname = dirname(fileURLToPath(import.meta.url));
const draws: Draw[] = JSON.parse(
  readFileSync(join(__dirname, "..", "data", "draws.json"), "utf-8"),
);

let failures = 0;
function check(label: string, condition: boolean) {
  console.log(`${condition ? "PASS" : "FAIL"} — ${label}`);
  if (!condition) failures++;
}

const oddEven = oddEvenDistribution(draws);
check(
  "홀짝 분포 합계가 전체 회차 수와 일치",
  Object.values(oddEven).reduce((a, b) => a + b, 0) === draws.length,
);

const lowHigh = lowHighDistribution(draws);
check(
  "저고 분포 합계가 전체 회차 수와 일치",
  Object.values(lowHigh).reduce((a, b) => a + b, 0) === draws.length,
);

const sums = sumDistribution(draws);
const buckets = sumHistogram(sums, 20);
check(
  "합계 히스토그램 버킷 합계가 전체 회차 수와 일치",
  buckets.reduce((a, b) => a + b.count, 0) === draws.length,
);
check("합계 히스토그램 버킷이 20 간격으로 연속됨", buckets.every((b) => b.bucketStart % 20 === 0));

const consecutive = consecutivePatternSummary(draws);
check(
  "연속번호 있음/없음 합계가 전체 회차 수와 일치",
  consecutive.withConsecutive + consecutive.withoutConsecutive === draws.length,
);

const recent30 = recentFrequency(draws, 30);
const hot = hotNumbers(recent30, 6);
const cold = coldNumbers(recent30, 6);
check("최근 30회 기준 핫넘버 6개 반환", hot.length === 6);
check("최근 30회 기준 콜드넘버 6개 반환", cold.length === 6);
check("핫넘버와 콜드넘버가 겹치지 않음", hot.every((n) => !cold.includes(n)));
check(
  "핫넘버 평균 최근빈도가 콜드넘버 평균보다 높거나 같음",
  hot.reduce((s, n) => s + recent30[n], 0) / 6 >= cold.reduce((s, n) => s + recent30[n], 0) / 6,
);

console.log();
if (failures > 0) {
  console.error(`${failures}건 실패`);
  process.exit(1);
} else {
  console.log("전체 통과");
}
