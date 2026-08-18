import { NumberBall } from "@/components/number-ball";
import type { GapInfo, LottoNumber } from "@/lib/lottery";

export function NumberGapGrid({ gaps }: { gaps: Record<LottoNumber, GapInfo> }) {
  const sorted = Object.values(gaps).sort((a, b) => b.gap - a.gap);

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
      {sorted.map((g) => (
        <div
          key={g.number}
          className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 px-2 py-2"
        >
          <NumberBall number={g.number} size="sm" />
          <div className="text-xs">
            <p className="text-neutral-200">{g.gap}회차</p>
            <p className="text-neutral-600">미출현</p>
          </div>
        </div>
      ))}
    </div>
  );
}
