import { PRIZE_LABELS, type DrawMatchResult } from "@/lib/lottery";

export function MatchHistoryTable({ matches }: { matches: DrawMatchResult[] }) {
  if (matches.length === 0) {
    return <p className="text-sm text-neutral-500">3개 이상 일치한 회차가 없습니다.</p>;
  }

  return (
    <div className="max-h-80 overflow-y-auto rounded-lg border border-neutral-800">
      <table className="w-full text-left text-sm">
        <thead className="sticky top-0 bg-neutral-900 text-xs text-neutral-500">
          <tr>
            <th className="px-3 py-2 font-medium">회차</th>
            <th className="px-3 py-2 font-medium">추첨일</th>
            <th className="px-3 py-2 font-medium">일치 개수</th>
            <th className="px-3 py-2 font-medium">등수</th>
          </tr>
        </thead>
        <tbody>
          {matches.map((m) => (
            <tr key={m.drawNumber} className="border-t border-neutral-800 text-neutral-300">
              <td className="px-3 py-2">{m.drawNumber}회</td>
              <td className="px-3 py-2 text-neutral-500">{m.date}</td>
              <td className="px-3 py-2">{m.matches}개</td>
              <td className="px-3 py-2">{PRIZE_LABELS[m.prizeTier]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
