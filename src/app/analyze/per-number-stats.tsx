import { NumberBall } from "@/components/number-ball";
import type { NumberAnalysisEntry } from "@/lib/lottery";

export function PerNumberStats({ entries }: { entries: NumberAnalysisEntry[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {entries.map((entry) => (
        <div key={entry.number} className="rounded-lg border border-neutral-800 bg-neutral-900 p-3">
          <NumberBall number={entry.number} size="sm" />
          <dl className="mt-3 space-y-1 text-xs text-neutral-400">
            <div className="flex items-center justify-between">
              <dt>역대 출현 빈도</dt>
              <dd className="text-neutral-200">{entry.frequency}회</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt>최근 출현 빈도</dt>
              <dd className="text-neutral-200">{entry.recentFrequency}회</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt>현재 갭</dt>
              <dd className="text-neutral-200">{entry.gap}회차</dd>
            </div>
          </dl>
        </div>
      ))}
    </div>
  );
}
