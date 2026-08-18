"use client";

import { useEffect, useMemo, useState } from "react";
import {
  buildScoringContext,
  computeEnsembleScore,
  computeLuckProfile,
  computeNextDrawDateTime,
  computeNextDrawNumber,
  generateCombinations,
  scoreCombination,
  type Draw,
  type GeneratorModel,
  type LottoNumber,
  type LuckProfile,
} from "@/lib/lottery";
import {
  getSavedSets,
  saveSet,
  computeReadyResults,
  getPendingSets,
  type SavedSet,
} from "@/lib/savedSets";
import { incrementCounter } from "@/lib/achievements";
import { publicAsset } from "@/lib/basePath";
import { PathCard, type GeneratorPath } from "./path-card";
import { SavedSetsPanel } from "./saved-sets-panel";

const PATHS: GeneratorPath[] = [
  {
    label: "통계학자",
    model: "ensemble",
    description: "모든 통계 지표를 종합해 하나의 순위로 계산합니다.",
  },
  {
    label: "핫넘버 추적자",
    model: "hotNumbers",
    description: "역대 출현 빈도가 높은 번호 위주로 구성합니다.",
  },
  {
    label: "콜드넘버 사냥꾼",
    model: "coldNumbers",
    description: "역대 출현 빈도가 낮은 번호 위주로 구성합니다.",
  },
  {
    label: "밸런스형",
    model: "balanced",
    description: "홀짝, 저고 비율이 고르게 맞춰지도록 구성합니다.",
  },
  {
    label: "와일드카드",
    model: "monteCarlo",
    description: "시뮬레이션 풀에서 순위 없이 그대로 뽑은 조합입니다.",
  },
];

interface GeneratedEntry {
  path: GeneratorPath;
  numbers: LottoNumber[];
  ensembleScore: number;
  luckProfile: LuckProfile;
}

function arraysEqual(a: LottoNumber[], b: LottoNumber[]): boolean {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort((x, y) => x - y);
  const sortedB = [...b].sort((x, y) => x - y);
  return sortedA.every((v, i) => v === sortedB[i]);
}

function formatCountdown(target: Date): string {
  const diffMs = target.getTime() - Date.now();
  if (diffMs <= 0) return "곧 결과가 반영됩니다 — 새로고침해서 확인해보세요";
  const totalMinutes = Math.floor(diffMs / 60_000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;
  return `${days}일 ${hours}시간 ${minutes}분`;
}

export function GeneratorView() {
  const [draws, setDraws] = useState<Draw[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [savedSets, setSavedSets] = useState<SavedSet[]>([]);
  const [entries, setEntries] = useState<GeneratedEntry[] | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    fetch(publicAsset("data/draws.json"))
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: Draw[]) => setDraws(data))
      .catch((err) => setLoadError(String(err.message || err)));

    // Deliberately read localStorage after mount, not from useState's
    // initializer: the static export has no per-user data at build time, so
    // an initializer would mismatch this browser's actual saved sets during
    // hydration. This is the standard "sync from an external store on mount"
    // effect the lint rule's own guidance describes as legitimate.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSavedSets(getSavedSets());
  }, []);

  useEffect(() => {
    function tick() {
      setCountdown(formatCountdown(computeNextDrawDateTime()));
    }
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  const scoringContext = useMemo(() => (draws ? buildScoringContext(draws) : null), [draws]);
  const nextDrawNumber = useMemo(() => computeNextDrawNumber(), []);

  const readyResults = useMemo(
    () => (draws ? computeReadyResults(savedSets, draws) : []),
    [draws, savedSets],
  );
  const pendingSets = useMemo(
    () => (draws ? getPendingSets(savedSets, draws) : savedSets),
    [draws, savedSets],
  );

  function handleGenerate() {
    if (!draws) return;
    setIsGenerating(true);
    setExpandedIndex(null);

    // Defer one tick so the "generating" state has a chance to paint before
    // the (synchronous) simulation work runs.
    setTimeout(() => {
      const next = PATHS.map<GeneratedEntry>((path) => {
        const [combo] = generateCombinations(draws, {
          model: path.model as GeneratorModel,
          count: 1,
        });
        return {
          path,
          numbers: combo.numbers,
          ensembleScore: combo.ensembleScore,
          luckProfile: computeLuckProfile(combo.numbers, buildScoringContext(draws)),
        };
      });
      setEntries(next);
      setIsGenerating(false);
    }, 30);
  }

  function handleSwap(index: number, slotIndex: number, newNumber: LottoNumber) {
    if (!entries || !scoringContext) return;
    setEntries((prev) => {
      if (!prev) return prev;
      const target = prev[index];
      const updatedNumbers = [...target.numbers];
      updatedNumbers[slotIndex] = newNumber;
      updatedNumbers.sort((a, b) => a - b);

      const breakdown = scoreCombination(updatedNumbers, scoringContext);
      const next = [...prev];
      next[index] = {
        ...target,
        numbers: updatedNumbers,
        ensembleScore: computeEnsembleScore(breakdown),
        luckProfile: computeLuckProfile(updatedNumbers, scoringContext),
      };
      return next;
    });
    incrementCounter("whatIfEdits");
  }

  function handleToggleExpand(index: number) {
    setExpandedIndex((current) => {
      const next = current === index ? null : index;
      if (next !== null) incrementCounter("luckProfilesViewed");
      return next;
    });
  }

  function handleSave(index: number) {
    if (!entries) return;
    const entry = entries[index];
    saveSet({
      numbers: entry.numbers,
      drawNumber: nextDrawNumber,
      pathLabel: entry.path.label,
      model: entry.path.model as GeneratorModel,
      name: null,
    });
    setSavedSets(getSavedSets());
    incrementCounter("setsSaved");
  }

  function isEntrySaved(entry: GeneratedEntry): boolean {
    return savedSets.some(
      (s) => s.drawNumber === nextDrawNumber && arraysEqual(s.numbers, entry.numbers),
    );
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <div className="mb-8">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-400">
          번호 생성기
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-50 sm:text-3xl">
          내 번호 뽑기
        </h1>
        <p className="mt-2 text-sm text-neutral-400">
          {nextDrawNumber}회차 — {countdown || "…"} 후 추첨
        </p>
        <p className="mt-3 text-xs text-neutral-500">
          통계적 순위 참고용입니다 — 모든 6/45 조합은 당첨 확률이 동일합니다. 이 도구는
          당첨번호를 예측하지 않습니다.
        </p>
      </div>

      <SavedSetsPanel readyResults={readyResults} pendingSets={pendingSets} />

      {loadError && (
        <p className="mb-6 rounded-lg border border-red-900/50 bg-red-950/30 p-4 text-sm text-red-300">
          회차 데이터를 불러오지 못했습니다: {loadError}
        </p>
      )}

      {!draws && !loadError && (
        <p className="mb-6 text-sm text-neutral-500">회차 데이터를 불러오는 중…</p>
      )}

      <button
        type="button"
        onClick={handleGenerate}
        disabled={!draws || isGenerating}
        className="w-full rounded-full bg-emerald-500 py-3 text-sm font-semibold text-neutral-950 transition-colors hover:bg-emerald-400 disabled:cursor-default disabled:bg-neutral-700 disabled:text-neutral-400"
      >
        {isGenerating ? "생성 중…" : entries ? "다시 뽑기" : "내 번호 뽑기"}
      </button>

      {entries && (
        <div className="mt-8 space-y-4">
          {entries.map((entry, index) => (
            <PathCard
              key={entry.path.label}
              path={entry.path}
              numbers={entry.numbers}
              ensembleScore={entry.ensembleScore}
              luckProfile={entry.luckProfile}
              isSaved={isEntrySaved(entry)}
              isExpanded={expandedIndex === index}
              onToggleExpand={() => handleToggleExpand(index)}
              onSave={() => handleSave(index)}
              onSwap={(slotIndex, newNumber) => handleSwap(index, slotIndex, newNumber)}
            />
          ))}
        </div>
      )}
    </main>
  );
}
