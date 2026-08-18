interface ExpectedValueChartProps {
  aiAverage: number;
  randomAverage: number;
  theoretical: number;
}

/** Two bars (AI / random) against a dashed baseline at the theoretical expected value. */
export function ExpectedValueChart({ aiAverage, randomAverage, theoretical }: ExpectedValueChartProps) {
  const max = Math.max(aiAverage, randomAverage, theoretical) * 1.35;
  const baselinePct = (theoretical / max) * 100;
  const bars = [
    { label: "AI", value: aiAverage, color: "bg-emerald-500" },
    { label: "랜덤", value: randomAverage, color: "bg-neutral-500" },
  ];

  return (
    <div className="relative h-44 pt-6">
      <div
        className="absolute left-0 right-0 border-t border-dashed border-amber-400/70"
        style={{ bottom: `${baselinePct}%` }}
      >
        <span className="absolute -top-4 right-0 whitespace-nowrap text-[10px] text-amber-300">
          이론적 기댓값 {theoretical.toFixed(2)} (= 6 × 6/45)
        </span>
      </div>
      <div className="flex h-full items-end gap-10 px-8">
        {bars.map((b) => {
          const heightPct = (b.value / max) * 100;
          return (
            <div key={b.label} className="flex h-full flex-1 flex-col items-center justify-end">
              <span className="mb-1 text-xs text-neutral-300">{b.value.toFixed(3)}</span>
              <div className={`w-full max-w-[72px] rounded-t ${b.color}`} style={{ height: `${heightPct}%` }} />
              <span className="mt-1 text-xs text-neutral-500">{b.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
