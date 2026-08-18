"use client";

import { useEffect, useMemo, useState } from "react";
import { computeDrawDetails, drawYear, filterDraws, type Draw } from "@/lib/lottery";
import { publicAsset } from "@/lib/basePath";
import { DrawRow } from "./draw-row";

const PAGE_SIZE = 25;
const ODD_OPTIONS = [0, 1, 2, 3, 4, 5, 6];

export function HistoryView() {
  const [draws, setDraws] = useState<Draw[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [drawNumberInput, setDrawNumberInput] = useState("");
  const [year, setYear] = useState("");
  const [minDraw, setMinDraw] = useState("");
  const [maxDraw, setMaxDraw] = useState("");
  const [oddCount, setOddCount] = useState("");
  const [minSum, setMinSum] = useState("");
  const [maxSum, setMaxSum] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetch(publicAsset("data/draws.json"))
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: Draw[]) => setDraws(data))
      .catch((err) => setLoadError(String(err.message || err)));
  }, []);

  const years = useMemo(() => {
    if (!draws) return [];
    const unique = new Set(draws.map((d) => drawYear(d)));
    return [...unique].sort((a, b) => b - a);
  }, [draws]);

  const filtered = useMemo(() => {
    if (!draws) return [];
    const filters = {
      drawNumber: drawNumberInput ? parseInt(drawNumberInput, 10) : undefined,
      year: year ? parseInt(year, 10) : undefined,
      minDrawNumber: minDraw ? parseInt(minDraw, 10) : undefined,
      maxDrawNumber: maxDraw ? parseInt(maxDraw, 10) : undefined,
      oddCount: oddCount ? parseInt(oddCount, 10) : undefined,
      minSum: minSum ? parseInt(minSum, 10) : undefined,
      maxSum: maxSum ? parseInt(maxSum, 10) : undefined,
    };
    return filterDraws(draws, filters).sort((a, b) => b.drawNumber - a.drawNumber);
  }, [draws, drawNumberInput, year, minDraw, maxDraw, oddCount, minSum, maxSum]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function updateFilter(setter: (v: string) => void, value: string) {
    setter(value);
    setPage(1);
  }

  function resetFilters() {
    setDrawNumberInput("");
    setYear("");
    setMinDraw("");
    setMaxDraw("");
    setOddCount("");
    setMinSum("");
    setMaxSum("");
    setPage(1);
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <div className="mb-8">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-400">
          회차 이력
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-50 sm:text-3xl">
          전체 회차 검색
        </h1>
        <p className="mt-2 text-sm text-neutral-400">
          역대 로또 6/45 회차를 검색·필터링하고, 각 회차를 눌러 상세 정보를 확인해보세요.
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
        <>
          <div className="mb-6 grid grid-cols-2 gap-3 rounded-lg border border-neutral-800 bg-neutral-900 p-4 sm:grid-cols-3">
            <label className="text-xs text-neutral-500">
              회차 번호
              <input
                type="number"
                value={drawNumberInput}
                onChange={(e) => updateFilter(setDrawNumberInput, e.target.value)}
                placeholder="예: 1234"
                className="mt-1 w-full rounded border border-neutral-700 bg-neutral-950 px-2 py-1.5 text-sm text-neutral-50 focus:border-emerald-500 focus:outline-none"
              />
            </label>

            <label className="text-xs text-neutral-500">
              연도
              <select
                value={year}
                onChange={(e) => updateFilter(setYear, e.target.value)}
                className="mt-1 w-full rounded border border-neutral-700 bg-neutral-950 px-2 py-1.5 text-sm text-neutral-50 focus:border-emerald-500 focus:outline-none"
              >
                <option value="">전체</option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}년
                  </option>
                ))}
              </select>
            </label>

            <label className="text-xs text-neutral-500">
              홀수 개수
              <select
                value={oddCount}
                onChange={(e) => updateFilter(setOddCount, e.target.value)}
                className="mt-1 w-full rounded border border-neutral-700 bg-neutral-950 px-2 py-1.5 text-sm text-neutral-50 focus:border-emerald-500 focus:outline-none"
              >
                <option value="">전체</option>
                {ODD_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    홀 {n}개 : 짝 {6 - n}개
                  </option>
                ))}
              </select>
            </label>

            <label className="text-xs text-neutral-500">
              회차 범위 (최소)
              <input
                type="number"
                value={minDraw}
                onChange={(e) => updateFilter(setMinDraw, e.target.value)}
                className="mt-1 w-full rounded border border-neutral-700 bg-neutral-950 px-2 py-1.5 text-sm text-neutral-50 focus:border-emerald-500 focus:outline-none"
              />
            </label>
            <label className="text-xs text-neutral-500">
              회차 범위 (최대)
              <input
                type="number"
                value={maxDraw}
                onChange={(e) => updateFilter(setMaxDraw, e.target.value)}
                className="mt-1 w-full rounded border border-neutral-700 bg-neutral-950 px-2 py-1.5 text-sm text-neutral-50 focus:border-emerald-500 focus:outline-none"
              />
            </label>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-4 h-fit rounded border border-neutral-700 px-3 py-1.5 text-xs text-neutral-400 hover:border-neutral-500 hover:text-neutral-200"
            >
              필터 초기화
            </button>

            <label className="text-xs text-neutral-500">
              번호 합계 (최소)
              <input
                type="number"
                value={minSum}
                onChange={(e) => updateFilter(setMinSum, e.target.value)}
                className="mt-1 w-full rounded border border-neutral-700 bg-neutral-950 px-2 py-1.5 text-sm text-neutral-50 focus:border-emerald-500 focus:outline-none"
              />
            </label>
            <label className="text-xs text-neutral-500">
              번호 합계 (최대)
              <input
                type="number"
                value={maxSum}
                onChange={(e) => updateFilter(setMaxSum, e.target.value)}
                className="mt-1 w-full rounded border border-neutral-700 bg-neutral-950 px-2 py-1.5 text-sm text-neutral-50 focus:border-emerald-500 focus:outline-none"
              />
            </label>
          </div>

          <p className="mb-3 text-xs text-neutral-500">
            총 {filtered.length}개 회차 — {currentPage}/{totalPages} 페이지
          </p>

          <div className="space-y-2">
            {pageItems.map((draw) => (
              <DrawRow key={draw.drawNumber} details={computeDrawDetails(draw)} />
            ))}
            {pageItems.length === 0 && (
              <p className="text-sm text-neutral-500">조건에 맞는 회차가 없습니다.</p>
            )}
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="rounded border border-neutral-700 px-3 py-1.5 text-xs text-neutral-300 hover:border-neutral-500 disabled:cursor-default disabled:opacity-40"
              >
                이전
              </button>
              <span className="text-xs text-neutral-500">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="rounded border border-neutral-700 px-3 py-1.5 text-xs text-neutral-300 hover:border-neutral-500 disabled:cursor-default disabled:opacity-40"
              >
                다음
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}
