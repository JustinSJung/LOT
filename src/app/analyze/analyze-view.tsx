"use client";

import { useEffect, useState } from "react";
import { analyzeNumberSet, validateCombination, PRIZE_LABELS, type Draw, type NumberSetAnalysis } from "@/lib/lottery";
import { incrementCounter } from "@/lib/achievements";
import { publicAsset } from "@/lib/basePath";
import { PerNumberStats } from "./per-number-stats";
import { MatchDistributionChart } from "./match-distribution-chart";
import { MatchHistoryTable } from "./match-history-table";

const EMPTY_INPUTS = ["", "", "", "", "", ""];

export function AnalyzeView() {
  const [draws, setDraws] = useState<Draw[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [inputs, setInputs] = useState<string[]>(EMPTY_INPUTS);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<NumberSetAnalysis | null>(null);

  useEffect(() => {
    fetch(publicAsset("data/draws.json"))
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: Draw[]) => setDraws(data))
      .catch((err) => setLoadError(String(err.message || err)));
  }, []);

  function handleInputChange(index: number, value: string) {
    setInputs((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  function handleAnalyze() {
    setValidationError(null);
    if (!draws) return;

    const numbers = inputs.map((v) => parseInt(v, 10));
    const result = validateCombination(numbers);
    if (!result.valid) {
      setValidationError(
        result.error === "DUPLICATE"
          ? "중복되지 않는 숫자 6개를 입력해주세요."
          : "1부터 45 사이의 숫자를 모두 입력해주세요.",
      );
      return;
    }

    const sorted = [...numbers].sort((a, b) => a - b);
    setAnalysis(analyzeNumberSet(sorted, draws));
    incrementCounter("numberAnalyses");
  }

  const fourPlus =
    (analysis?.matchCounts[4] ?? 0) + (analysis?.matchCounts[5] ?? 0) + (analysis?.matchCounts[6] ?? 0);

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <div className="mb-8">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-400">번호 분석기</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-50 sm:text-3xl">
          내 번호 분석하기
        </h1>
        <p className="mt-2 text-sm text-neutral-400">
          숫자 6개를 입력하면 역대 전체 회차를 검색해 몇 번 일치했는지 통계로 보여드립니다.
        </p>
        <p className="mt-3 text-xs text-neutral-500">
          과거 데이터를 근거로 한 통계 정보입니다 — 미래 당첨을 예측하지 않습니다.
        </p>
      </div>

      {loadError && (
        <p className="mb-6 rounded-lg border border-red-900/50 bg-red-950/30 p-4 text-sm text-red-300">
          회차 데이터를 불러오지 못했습니다: {loadError}
        </p>
      )}
      {!draws && !loadError && (
        <p className="mb-6 text-sm text-neutral-500">회차 데이터를 불러오는 중…</p>
      )}

      <div className="flex flex-wrap gap-2">
        {inputs.map((value, i) => (
          <input
            key={i}
            type="number"
            min={1}
            max={45}
            value={value}
            onChange={(e) => handleInputChange(i, e.target.value)}
            className="h-12 w-14 rounded-lg border border-neutral-700 bg-neutral-900 text-center text-lg font-semibold text-neutral-50 focus:border-emerald-500 focus:outline-none"
            placeholder={`${i + 1}`}
          />
        ))}
      </div>

      {validationError && <p className="mt-3 text-sm text-red-300">{validationError}</p>}

      <button
        type="button"
        onClick={handleAnalyze}
        disabled={!draws}
        className="mt-4 w-full rounded-full bg-emerald-500 py-3 text-sm font-semibold text-neutral-950 transition-colors hover:bg-emerald-400 disabled:cursor-default disabled:bg-neutral-700 disabled:text-neutral-400"
      >
        내 번호 분석하기
      </button>

      {analysis && (
        <div className="mt-10 space-y-8">
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              역대 성적 요약
            </h2>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-3">
                <p className="text-xs text-neutral-500">최고 일치 개수</p>
                <p className="mt-1 text-xl font-semibold text-neutral-50">
                  {analysis.highestMatch}개
                </p>
              </div>
              <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-3">
                <p className="text-xs text-neutral-500">최고 등수</p>
                <p className="mt-1 text-xl font-semibold text-neutral-50">
                  {PRIZE_LABELS[analysis.bestPrizeTier]}
                </p>
              </div>
              <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-3">
                <p className="text-xs text-neutral-500">4개 이상 일치</p>
                <p className="mt-1 text-xl font-semibold text-neutral-50">{fourPlus}회</p>
              </div>
              <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-3">
                <p className="text-xs text-neutral-500">3개 일치</p>
                <p className="mt-1 text-xl font-semibold text-neutral-50">
                  {analysis.matchCounts[3] ?? 0}회
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              일치 개수 분포
            </h2>
            <div className="mt-3 rounded-lg border border-neutral-800 bg-neutral-900 p-4">
              <MatchDistributionChart
                matchCounts={analysis.matchCounts}
                drawsSearched={analysis.drawsSearched}
              />
            </div>
          </section>

          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              번호별 분석
            </h2>
            <div className="mt-3">
              <PerNumberStats entries={analysis.perNumber} />
            </div>
          </section>

          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              3개 이상 일치한 회차
            </h2>
            <div className="mt-3">
              <MatchHistoryTable matches={analysis.notableMatches} />
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
