import { ALL_NUMBERS, type LottoNumber } from "@/lib/lottery";

interface NumberFrequencyChartProps {
  frequency: Record<LottoNumber, number>;
  hotSet: Set<LottoNumber>;
  coldSet: Set<LottoNumber>;
}

export function NumberFrequencyChart({ frequency, hotSet, coldSet }: NumberFrequencyChartProps) {
  const max = Math.max(1, ...ALL_NUMBERS.map((n) => frequency[n] ?? 0));

  return (
    <div className="overflow-x-auto">
      <div className="flex h-40 min-w-[720px] items-end gap-1 border-b border-neutral-800 pt-4">
        {ALL_NUMBERS.map((n) => {
          const count = frequency[n] ?? 0;
          const heightPct = count > 0 ? Math.max((count / max) * 100, 2) : 0;
          const barClass = hotSet.has(n)
            ? "bg-orange-500"
            : coldSet.has(n)
              ? "bg-neutral-600"
              : "bg-emerald-500";
          return (
            <div key={n} className="group relative flex h-full flex-1 flex-col items-center justify-end">
              <span className="pointer-events-none absolute -top-4 whitespace-nowrap text-[10px] text-neutral-500 opacity-0 transition-opacity group-hover:opacity-100">
                {n}번 · {count}회
              </span>
              <div className={`w-full max-w-[10px] rounded-t ${barClass}`} style={{ height: `${heightPct}%` }} />
            </div>
          );
        })}
      </div>
      <div className="flex min-w-[720px] gap-1 pt-1">
        {ALL_NUMBERS.map((n) => (
          <span key={n} className="flex-1 text-center text-[9px] text-neutral-600">
            {n}
          </span>
        ))}
      </div>
    </div>
  );
}
