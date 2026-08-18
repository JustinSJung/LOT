#!/usr/bin/env -S npx tsx
/**
 * Smoke test for the Phase 7 Analyzer engine (src/lib/lottery/analyzer.ts).
 * Uses round 1's actual winning numbers as input — guarantees a known 6/6
 * match against round 1 itself, so the result is checkable against ground
 * truth rather than just "didn't throw."
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { analyzeNumberSet } from "../src/lib/lottery/analyzer";
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

const round1 = draws.find((d) => d.drawNumber === 1);
if (!round1) {
  console.error("data/draws.json에 1회차 데이터가 없습니다 — 테스트를 건너뜁니다.");
  process.exit(1);
}

const result = analyzeNumberSet(round1.numbers, draws);

check("검색한 회차 수가 draws.json 전체와 일치", result.drawsSearched === draws.length);
check("1회차 자기 자신과 비교하면 최고 일치 개수는 6", result.highestMatch === 6);
check("1회차 자기 자신과 비교하면 최고 등수는 1등", result.bestPrizeTier === 1);
check(
  "matchCounts(0~6개)의 합이 전체 회차 수와 일치",
  Object.values(result.matchCounts).reduce((a, b) => a + b, 0) === draws.length,
);
check(
  "3개 이상 일치 목록 길이가 matchCounts[3]+[4]+[5]+[6]과 일치",
  result.notableMatches.length ===
    (result.matchCounts[3] ?? 0) +
      (result.matchCounts[4] ?? 0) +
      (result.matchCounts[5] ?? 0) +
      (result.matchCounts[6] ?? 0),
);
check(
  "3개 이상 일치 목록이 회차 내림차순 정렬",
  result.notableMatches.every(
    (m, i) => i === 0 || result.notableMatches[i - 1].drawNumber > m.drawNumber,
  ),
);
check("번호별 분석 항목이 입력한 6개 번호와 정확히 일치", result.perNumber.length === 6);

console.log();
if (failures > 0) {
  console.error(`${failures}건 실패`);
  process.exit(1);
} else {
  console.log("전체 통과");
}
