#!/usr/bin/env -S npx tsx
/**
 * Smoke tests for the Phase 6 additions: the 5-path generator, Luck Profile,
 * saved-set result matching, and the achievement tracker. Not a full test
 * suite (that's Phase 13) — just enough to catch regressions in this batch
 * of work before it ships.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { generateCombinations, type GeneratorModel } from "../src/lib/lottery/generator";
import { computeLuckProfile, type LuckCharacter } from "../src/lib/lottery/luckProfile";
import { buildScoringContext } from "../src/lib/lottery/scoring";
import { computeReadyResults, getPendingSets } from "../src/lib/savedSets/results";
import type { SavedSet } from "../src/lib/savedSets/types";
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

// 1. The 5 paths must not collide when generated back-to-back with the
//    default (unseeded) rng — this was a real bug: Date.now()-only seeding
//    let multiple same-millisecond calls produce identical picks.
const models: GeneratorModel[] = ["ensemble", "hotNumbers", "coldNumbers", "balanced", "monteCarlo"];
const picks = models.map((model) => generateCombinations(draws, { model, count: 1 })[0].numbers);
const uniquePicks = new Set(picks.map((p) => p.join(",")));
check(
  `5경로 back-to-back 호출이 서로 다른 조합을 반환 (실제로 ${uniquePicks.size}/5 종류)`,
  uniquePicks.size === 5,
);

// 2. Luck Profile axes stay within [0, 100] and resolve to a valid character.
const VALID_CHARACTERS: LuckCharacter[] = [
  "The Balanced Explorer",
  "The Hot Chaser",
  "The Contrarian",
  "The Pattern Hunter",
  "The Wild Card",
  "The Quiet Player",
  "The High Roller",
  "The Number Architect",
];
const ctx = buildScoringContext(draws);
let luckProfilesValid = true;
for (const numbers of picks) {
  const profile = computeLuckProfile(numbers, ctx);
  const axesInRange = [profile.balance, profile.pattern, profile.trend, profile.rarity, profile.diversity].every(
    (v) => v >= 0 && v <= 100,
  );
  const characterValid = VALID_CHARACTERS.includes(profile.character);
  if (!axesInRange || !characterValid) luckProfilesValid = false;
}
check("Luck Profile 5축 점수가 0-100 범위, character가 유효한 8종 중 하나", luckProfilesValid);

// 3. Saved-set result matching: a set saved for a draw that exists should be
//    "ready", one saved for a draw that doesn't exist yet should be "pending".
const knownDraw = draws[Math.floor(draws.length / 2)];
const readySet: SavedSet = {
  id: "test-ready",
  numbers: knownDraw.numbers,
  drawNumber: knownDraw.drawNumber,
  pathLabel: "테스트",
  model: "ensemble",
  name: null,
  savedAt: new Date().toISOString(),
};
const pendingSet: SavedSet = {
  id: "test-pending",
  numbers: [1, 2, 3, 4, 5, 6],
  drawNumber: Math.max(...draws.map((d) => d.drawNumber)) + 1,
  pathLabel: "테스트",
  model: "ensemble",
  name: null,
  savedAt: new Date().toISOString(),
};

const ready = computeReadyResults([readySet, pendingSet], draws);
const pending = getPendingSets([readySet, pendingSet], draws);

check(
  "이미 추첨된 회차로 저장한 세트는 ready 목록에, 6개 번호 모두 일치로 계산됨",
  ready.length === 1 && ready[0].savedSet.id === "test-ready" && ready[0].matches === 6 && ready[0].prizeTier === 1,
);
check(
  "아직 추첨 전 회차로 저장한 세트는 pending 목록에 남음",
  pending.length === 1 && pending[0].id === "test-pending",
);

console.log();
if (failures > 0) {
  console.error(`${failures}건 실패`);
  process.exit(1);
} else {
  console.log("전체 통과");
}
