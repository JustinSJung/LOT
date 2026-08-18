"use client";

import { useEffect, useState } from "react";
import {
  runBacktest,
  createRng,
  BACKTEST_SEED,
  BACKTEST_MIN_HISTORY,
  type BacktestSummary,
  type Draw,
  type GeneratorModel,
} from "@/lib/lottery";
import { GENERATOR_PATHS } from "@/lib/generatorPaths";
import { incrementCounter } from "@/lib/achievements";
import { publicAsset } from "@/lib/basePath";
import { SignificanceComparison } from "./significance-comparison";
import { ExpectedValueChart } from "./expected-value-chart";

interface OfficialBacktestData extends BacktestSummary {
  generatedAt: string;
  drawCount: number;
  requestedSampleSize: number;
  seed: number;
}

const CUSTOM_SAMPLE_SIZES = [100, 300, 500];

export function BacktestView() {
  const [official, setOfficial] = useState<OfficialBacktestData | null>(null);
  const [officialError, setOfficialError] = useState<string | null>(null);

  const [draws, setDraws] = useState<Draw[] | null>(null);
  const [drawsError, setDrawsError] = useState<string | null>(null);

  const [customModel, setCustomModel] = useState<GeneratorModel>("ensemble");
  const [customSampleSize, setCustomSampleSize] = useState(300);
  const [customResult, setCustomResult] = useState<BacktestSummary | null>(null);
  const [isRunningCustom, setIsRunningCustom] = useState(false);

  useEffect(() => {
    fetch(publicAsset("data/backtest.json"))
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: OfficialBacktestData) => setOfficial(data))
      .catch((err) => setOfficialError(String(err.message || err)));

    fetch(publicAsset("data/draws.json"))
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: Draw[]) => setDraws(data))
      .catch((err) => setDrawsError(String(err.message || err)));
  }, []);

  function handleRunCustom() {
    if (!draws) return;
    setIsRunningCustom(true);
    setTimeout(() => {
      const result = runBacktest(draws, {
        sampleSize: customSampleSize,
        model: customModel,
        poolSize: 500,
        rng: createRng(BACKTEST_SEED),
      });
      setCustomResult(result);
      setIsRunningCustom(false);
    }, 30);
  }

  function handleModelChange(model: GeneratorModel) {
    setCustomModel(model);
    incrementCounter("backtestConditionChanges");
  }

  function handleSampleSizeChange(size: number) {
    setCustomSampleSize(size);
    incrementCounter("backtestConditionChanges");
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <div className="mb-8">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-400">백테스트</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-50 sm:text-3xl">
          Historical Backtest Result
        </h1>
        <p className="mt-2 text-sm text-neutral-400">
          역대 회차를 대상으로, 그 회차 이전 데이터만 사용해 AI 모델과 랜덤 추첨을 비교합니다.
        </p>
      </div>

      {officialError && (
        <p className="mb-6 rounded-lg border border-red-900/50 bg-red-950/30 p-4 text-sm text-red-300">
          백테스트 데이터를 불러오지 못했습니다: {officialError}
        </p>
      )}
      {!official && !officialError && (
        <p className="mb-6 text-sm text-neutral-500">백테스트 데이터를 불러오는 중…</p>
      )}

      {official && (
        <div className="space-y-10">
          <section className="rounded-lg border border-neutral-800 bg-neutral-900/60 p-4">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-300">
              공식 결과
            </span>
            <p className="mt-2 text-xs text-neutral-400">
              표본: <span className="text-neutral-200">{official.sampleSize}회차</span> (워밍업{" "}
              {BACKTEST_MIN_HISTORY}회 제외) · 모델:{" "}
              <span className="text-neutral-200">
                {GENERATOR_PATHS.find((p) => p.model === official.model)?.label ?? official.model}
              </span>{" "}
              · 시드: <span className="text-neutral-200">{official.seed}</span> (재현 가능 — 같은
              데이터로 다시 실행해도 동일한 결과)
            </p>
          </section>

          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              이론적 기댓값 대비 평균 매치
            </h2>
            <div className="mt-3 rounded-lg border border-neutral-800 bg-neutral-900 p-4">
              <ExpectedValueChart
                aiAverage={official.aiAverageMatch}
                randomAverage={official.randomAverageMatch}
                theoretical={official.theoreticalExpectedMatches}
              />
            </div>
          </section>

          <section>
            <SignificanceComparison
              title="평균 매치 수 비교"
              aiLabel="AI 평균 매치"
              aiValue={official.aiAverageMatch.toFixed(3)}
              randomLabel="랜덤 평균 매치"
              randomValue={official.randomAverageMatch.toFixed(3)}
              zScore={official.zScore}
            />
          </section>

          <section>
            <SignificanceComparison
              title="3개 이상 매치 비율 비교"
              aiLabel="AI 3+매치 비율"
              aiValue={`${(official.aiThreePlusRate * 100).toFixed(2)}%`}
              randomLabel="랜덤 3+매치 비율"
              randomValue={`${(official.randomThreePlusRate * 100).toFixed(2)}%`}
              zScore={official.threeMatchZScore}
            />
          </section>

          <section className="rounded-lg border border-neutral-800 bg-neutral-900/60 p-4">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              참고 지표
            </h2>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div>
                <p className="text-xs text-neutral-500">AI 4+매치</p>
                <p className="mt-1 text-lg font-semibold text-neutral-50">{official.aiFourPlus}회</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500">랜덤 4+매치</p>
                <p className="mt-1 text-lg font-semibold text-neutral-50">
                  {official.randomFourPlus}회
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-500">AI 표준편차</p>
                <p className="mt-1 text-lg font-semibold text-neutral-50">{official.aiStdDev}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500">랜덤 표준편차</p>
                <p className="mt-1 text-lg font-semibold text-neutral-50">{official.randomStdDev}</p>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-dashed border-sky-800/60 bg-sky-950/10 p-5">
            <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-sky-300">
              Explore
            </span>
            <h2 className="mt-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
              직접 조건 바꿔보기
            </h2>
            <p className="mt-2 text-xs text-neutral-500">
              모델과 표본 회차 수를 바꿔서 다시 실행해볼 수 있습니다. 위 공식 결과와 같은 시드(
              {BACKTEST_SEED})를 사용해 조건만 다르게 비교할 수 있게 했습니다. 이 결과는 탐색용
              참고 자료이며, 공식 결과를 대체하지 않습니다.
            </p>

            {drawsError && (
              <p className="mt-3 rounded-lg border border-red-900/50 bg-red-950/30 p-3 text-xs text-red-300">
                회차 데이터를 불러오지 못했습니다: {drawsError}
              </p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <select
                value={customModel}
                onChange={(e) => handleModelChange(e.target.value as GeneratorModel)}
                className="rounded border border-neutral-700 bg-neutral-950 px-2 py-1.5 text-sm text-neutral-50 focus:border-emerald-500 focus:outline-none"
              >
                {GENERATOR_PATHS.map((p) => (
                  <option key={p.model} value={p.model}>
                    {p.label}
                  </option>
                ))}
              </select>

              <div className="flex gap-1">
                {CUSTOM_SAMPLE_SIZES.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => handleSampleSizeChange(size)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                      customSampleSize === size
                        ? "bg-sky-500 text-neutral-950"
                        : "border border-neutral-700 text-neutral-400 hover:border-neutral-500"
                    }`}
                  >
                    최근 {size}회
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleRunCustom}
                disabled={!draws || isRunningCustom}
                className="rounded-full bg-sky-500 px-4 py-1.5 text-xs font-semibold text-neutral-950 transition-colors hover:bg-sky-400 disabled:cursor-default disabled:bg-neutral-700 disabled:text-neutral-400"
              >
                {isRunningCustom ? "실행 중…" : "백테스트 실행"}
              </button>
            </div>

            <p className="mt-2 text-[11px] leading-relaxed text-neutral-500">
              표본이 작을수록 우연에 의한 변동 폭이 커집니다. 여러 조합을 둘러본 뒤 특정 결과
              하나만 떼어서 해석하지 마세요.
            </p>

            {customResult && (
              <div className="mt-4">
                <SignificanceComparison
                  title={`실행 결과 (탐색용) — ${
                    GENERATOR_PATHS.find((p) => p.model === customModel)?.label ?? customModel
                  } · 최근 ${customResult.sampleSize}회차`}
                  aiLabel="AI 평균 매치"
                  aiValue={customResult.aiAverageMatch.toFixed(3)}
                  randomLabel="랜덤 평균 매치"
                  randomValue={customResult.randomAverageMatch.toFixed(3)}
                  zScore={customResult.zScore}
                />
              </div>
            )}
          </section>

          <p className="rounded-lg border border-amber-900/40 bg-amber-950/20 p-4 text-xs leading-relaxed text-amber-300">
            <span className="font-semibold">Historical Backtest Result</span> — 실제 당첨 확률을
            예측하거나 높이지 않습니다. 표본 크기가 통계적으로 큰 편이 아니며, 여기 표시된
            z-score는 관측된 차이가 노이즈인지 가늠하는 최소한의 참고 지표일 뿐 정식 유의성
            검정을 대신하지 않습니다.
          </p>
        </div>
      )}
    </main>
  );
}
