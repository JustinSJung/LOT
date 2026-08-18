#!/usr/bin/env -S npx tsx
/**
 * Smoke test for the Phase 8 History engine (src/lib/lottery/history.ts).
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { computeDrawDetails, drawYear, filterDraws } from "../src/lib/lottery/history";
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

const round1 = draws.find((d) => d.drawNumber === 1)!;
const details = computeDrawDetails(round1);

check("1회차 연도가 2002로 파싱됨", drawYear(round1) === 2002);
check(
  "1회차 상세: 홀+짝 = 6",
  details.oddCount + details.evenCount === 6,
);
check(
  "1회차 상세: 저+고 = 6",
  details.lowCount + details.highCount === 6,
);
check(
  "1회차 상세: 합계가 실제 6개 번호의 합과 일치",
  details.sum === round1.numbers.reduce((a, b) => a + b, 0),
);

const drawNumberFiltered = filterDraws(draws, { drawNumber: 1 });
check("회차번호 필터: 정확히 1건, 1회차만 반환", drawNumberFiltered.length === 1 && drawNumberFiltered[0].drawNumber === 1);

const yearFiltered = filterDraws(draws, { year: 2002 });
check(
  "연도 필터: 결과가 전부 2002년 추첨",
  yearFiltered.length > 0 && yearFiltered.every((d) => drawYear(d) === 2002),
);

const rangeFiltered = filterDraws(draws, { minDrawNumber: 100, maxDrawNumber: 110 });
check(
  "회차 범위 필터: 100~110회만 반환 (11건)",
  rangeFiltered.length === 11 &&
    rangeFiltered.every((d) => d.drawNumber >= 100 && d.drawNumber <= 110),
);

const oddFiltered = filterDraws(draws, { oddCount: 3 });
check(
  "홀수 개수 필터: 결과 전부 홀수 3개",
  oddFiltered.length > 0 &&
    oddFiltered.every((d) => {
      const detail = computeDrawDetails(d);
      return detail.oddCount === 3;
    }),
);

const sumFiltered = filterDraws(draws, { minSum: 100, maxSum: 150 });
check(
  "합계 범위 필터: 결과 전부 100~150",
  sumFiltered.length > 0 &&
    sumFiltered.every((d) => {
      const detail = computeDrawDetails(d);
      return detail.sum >= 100 && detail.sum <= 150;
    }),
);

console.log();
if (failures > 0) {
  console.error(`${failures}건 실패`);
  process.exit(1);
} else {
  console.log("전체 통과");
}
