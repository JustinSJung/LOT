"use client";

import { useEffect, useMemo, useState } from "react";
import {
  computeFrequency,
  recentFrequency,
  hotNumbers,
  coldNumbers,
  computeGaps,
  oddEvenDistribution,
  lowHighDistribution,
  sumDistribution,
  sumHistogram,
  consecutivePatternSummary,
  pairFrequency,
  tripleFrequency,
  topEntries,
  type Draw,
  type LottoNumber,
} from "@/lib/lottery";
import { incrementCounter } from "@/lib/achievements";
import { publicAsset } from "@/lib/basePath";
import { NumberBall } from "@/components/number-ball";
import { NumberFrequencyChart } from "./number-frequency-chart";
import { SimpleBarChart } from "./simple-bar-chart";
import { NumberGapGrid } from "./number-gap-grid";
import { PairTripleList } from "./pair-triple-list";

const RECENT_WINDOWS = [10, 30, 50, 100];
const ODD_EVEN_ORDER = ["0:6", "1:5", "2:4", "3:3", "4:2", "5:1", "6:0"];
const LOW_HIGH_ORDER = ["0:6", "1:5", "2:4", "3:3", "4:2", "5:1", "6:0"];

function orderedDistribution(dist: Record<string, number>, order: string[]) {
  return order.map((key) => ({ label: key, value: dist[key] ?? 0 }));
}

export function StatisticsView() {
  const [draws, setDraws] = useState<Draw[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [recentWindow, setRecentWindow] = useState(30);

  useEffect(() => {
    fetch(publicAsset("data/draws.json"))
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: Draw[]) => setDraws(data))
      .catch((err) => setLoadError(String(err.message || err)));
  }, []);

  const frequency = useMemo(() => (draws ? computeFrequency(draws) : {}), [draws]);
  const recentFreq = useMemo(
    () => (draws ? recentFrequency(draws, recentWindow) : {}),
    [draws, recentWindow],
  );
  const gaps = useMemo(() => (draws ? computeGaps(draws) : {}), [draws]);

  const hot = useMemo(() => (draws ? hotNumbers(recentFreq, 6) : []), [draws, recentFreq]);
  const cold = useMemo(() => (draws ? coldNumbers(recentFreq, 6) : []), [draws, recentFreq]);
  const hotSet = useMemo(() => new Set<LottoNumber>(hot), [hot]);
  const coldSet = useMemo(() => new Set<LottoNumber>(cold), [cold]);

  const oddEven = useMemo(
    () => orderedDistribution(draws ? oddEvenDistribution(draws) : {}, ODD_EVEN_ORDER),
    [draws],
  );
  const lowHigh = useMemo(
    () => orderedDistribution(draws ? lowHighDistribution(draws) : {}, LOW_HIGH_ORDER),
    [draws],
  );

  const sumBuckets = useMemo(() => {
    if (!draws) return [];
    return sumHistogram(sumDistribution(draws), 20);
  }, [draws]);

  const consecutiveSummary = useMemo(
    () => (draws ? consecutivePatternSummary(draws) : { withConsecutive: 0, withoutConsecutive: 0 }),
    [draws],
  );

  const topPairs = useMemo(() => (draws ? topEntries(pairFrequency(draws), 12) : []), [draws]);
  const topTriples = useMemo(() => (draws ? topEntries(tripleFrequency(draws), 12) : []), [draws]);

  function handleWindowChange(next: number) {
    setRecentWindow(next);
    incrementCounter("statisticsFilterUses");
  }

  function handlePatternClick() {
    incrementCounter("patternExplorations");
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-12">
      <div className="mb-8">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-400">통계</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-50 sm:text-3xl">
          역대 회차 통계
        </h1>
        <p className="mt-2 text-sm text-neutral-400">
          역대 로또 6/45 전체 회차를 기준으로 계산한 통계입니다.
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

      {draws && (
        <div className="space-y-10">
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              번호별 전체 출현 빈도 (역대 {draws.length}개 회차)
            </h2>
            <div className="mt-3 rounded-lg border border-neutral-800 bg-neutral-900 p-4">
              <NumberFrequencyChart
                frequency={frequency}
                hotSet={new Set()}
                coldSet={new Set()}
              />
            </div>
          </section>

          <section>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                최근 출현 빈도
              </h2>
              <div className="flex gap-1">
                {RECENT_WINDOWS.map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => handleWindowChange(w)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      recentWindow === w
                        ? "bg-emerald-500 text-neutral-950"
                        : "border border-neutral-700 text-neutral-400 hover:border-neutral-500"
                    }`}
                  >
                    최근 {w}회
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-3 rounded-lg border border-neutral-800 bg-neutral-900 p-4">
              <NumberFrequencyChart frequency={recentFreq} hotSet={hotSet} coldSet={coldSet} />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-neutral-500">
                  🔥 핫넘버 (최근 {recentWindow}회 기준 출현 상위 6개)
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {hot.map((n) => (
                    <NumberBall key={n} number={n} size="sm" />
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-neutral-500">
                  🧊 콜드넘버 (최근 {recentWindow}회 기준 출현 하위 6개)
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {cold.map((n) => (
                    <NumberBall key={n} number={n} size="sm" />
                  ))}
                </div>
              </div>
            </div>
            <p className="mt-4 rounded-lg border border-amber-900/40 bg-amber-950/20 p-3 text-xs text-amber-300">
              과거 출현 빈도(Historical Frequency)와 다음 회차 당첨 확률은 무관합니다. 로또는
              매회 독립적으로 추첨되며, 특정 번호가 최근 자주 나왔다고 해서 다음 회차에 더 잘
              나오거나 덜 나오지 않습니다.
            </p>
          </section>

          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              번호별 갭 (마지막 출현 이후 경과 회차)
            </h2>
            <div className="mt-3">
              <NumberGapGrid gaps={gaps} />
            </div>
          </section>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                홀/짝 분포
              </h2>
              <div className="mt-3 rounded-lg border border-neutral-800 bg-neutral-900 p-4">
                <SimpleBarChart data={oddEven} />
              </div>
            </section>
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                저/고 분포 (1~22 / 23~45)
              </h2>
              <div className="mt-3 rounded-lg border border-neutral-800 bg-neutral-900 p-4">
                <SimpleBarChart data={lowHigh} />
              </div>
            </section>
          </div>

          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              번호 합계 분포
            </h2>
            <div className="mt-3 overflow-x-auto rounded-lg border border-neutral-800 bg-neutral-900 p-4">
              <SimpleBarChart
                data={sumBuckets.map((b) => ({ label: `${b.bucketStart}`, value: b.count }))}
              />
            </div>
          </section>

          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              연속 번호 패턴
            </h2>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-3">
                <p className="text-xs text-neutral-500">연속 번호 있음</p>
                <p className="mt-1 text-xl font-semibold text-neutral-50">
                  {consecutiveSummary.withConsecutive}회
                </p>
              </div>
              <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-3">
                <p className="text-xs text-neutral-500">연속 번호 없음</p>
                <p className="mt-1 text-xl font-semibold text-neutral-50">
                  {consecutiveSummary.withoutConsecutive}회
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              번호 쌍(Pair) 빈도 TOP 12
            </h2>
            <div className="mt-3">
              <PairTripleList entries={topPairs} onEntryClick={handlePatternClick} />
            </div>
          </section>

          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              번호 조합(Triple) 빈도 TOP 12
            </h2>
            <div className="mt-3">
              <PairTripleList entries={topTriples} onEntryClick={handlePatternClick} />
            </div>
            <p className="mt-4 rounded-lg border border-amber-900/40 bg-amber-950/20 p-3 text-xs text-amber-300">
              과거 출현 빈도와 다음 회차 당첨 확률은 무관합니다 — 로또는 매회 독립적으로
              추첨됩니다.
            </p>
          </section>
        </div>
      )}
    </main>
  );
}
