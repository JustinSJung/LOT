import { NumberBall } from "@/components/number-ball";
import { PRIZE_LABELS } from "@/lib/lottery";
import type { SavedSet, SavedSetResult } from "@/lib/savedSets";

interface SavedSetsPanelProps {
  readyResults: SavedSetResult[];
  pendingSets: SavedSet[];
}

export function SavedSetsPanel({ readyResults, pendingSets }: SavedSetsPanelProps) {
  if (readyResults.length === 0 && pendingSets.length === 0) return null;

  return (
    <div className="mb-8 space-y-3">
      {readyResults.map((result) => (
        <div
          key={result.savedSet.id}
          className="rounded-xl border border-emerald-700/50 bg-emerald-950/30 p-5"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-400">
            결과가 도착했어요
          </p>
          <p className="mt-1 text-sm text-neutral-300">
            {result.savedSet.name ?? result.savedSet.pathLabel} — {result.savedSet.drawNumber}회차
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs text-neutral-500">내 번호</span>
            {result.savedSet.numbers.map((n) => (
              <NumberBall key={n} number={n} size="sm" />
            ))}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="text-xs text-neutral-500">실제 당첨번호</span>
            {result.actualNumbers.map((n) => (
              <NumberBall key={n} number={n} size="sm" />
            ))}
            <span className="text-xs text-neutral-500">+</span>
            <NumberBall number={result.actualBonus} size="sm" />
          </div>

          <p className="mt-3 text-sm font-medium text-neutral-100">
            {result.matches}개 번호 일치 — {PRIZE_LABELS[result.prizeTier]}
          </p>
        </div>
      ))}

      {pendingSets.map((set) => (
        <div key={set.id} className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
          <p className="text-xs text-neutral-400">
            {set.name ?? set.pathLabel} — {set.drawNumber}회차로 저장됨
          </p>
          <p className="mt-1 text-xs text-neutral-600">
            번호가 저장되었습니다. 추첨 후 다시 확인해보세요.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {set.numbers.map((n) => (
              <NumberBall key={n} number={n} size="sm" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
