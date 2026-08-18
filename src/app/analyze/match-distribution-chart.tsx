interface MatchDistributionChartProps {
  matchCounts: Record<number, number>;
  drawsSearched: number;
}

const BUCKETS = [0, 1, 2, 3, 4, 5, 6];

export function MatchDistributionChart({ matchCounts, drawsSearched }: MatchDistributionChartProps) {
  const max = Math.max(1, ...BUCKETS.map((n) => matchCounts[n] ?? 0));

  return (
    <div>
      <div className="flex h-32 items-end gap-2">
        {BUCKETS.map((n) => {
          const count = matchCounts[n] ?? 0;
          const heightPct = count > 0 ? Math.max((count / max) * 100, 4) : 0;
          return (
            <div key={n} className="flex h-full flex-1 flex-col items-center justify-end">
              <span className="mb-1 text-[10px] text-neutral-500">{count}</span>
              <div
                className="w-full rounded-t bg-emerald-500"
                style={{ height: `${heightPct}%` }}
              />
              <span className="mt-1 text-[10px] text-neutral-500">{n}개</span>
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-[11px] text-neutral-600">
        역대 {drawsSearched}개 회차 기준 일치 개수 분포입니다.
      </p>
    </div>
  );
}
