interface SimpleBarChartProps {
  data: { label: string; value: number }[];
  heightClass?: string;
}

export function SimpleBarChart({ data, heightClass = "h-32" }: SimpleBarChartProps) {
  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <div className={`flex ${heightClass} items-end gap-2`}>
      {data.map((d) => {
        const heightPct = d.value > 0 ? Math.max((d.value / max) * 100, 4) : 0;
        return (
          <div key={d.label} className="flex h-full flex-1 flex-col items-center justify-end">
            <span className="mb-1 whitespace-nowrap text-[10px] text-neutral-500">{d.value}</span>
            <div className="w-full rounded-t bg-emerald-500" style={{ height: `${heightPct}%` }} />
            <span className="mt-1 whitespace-nowrap text-[10px] text-neutral-500">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}
