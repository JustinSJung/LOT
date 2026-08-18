interface SignificanceComparisonProps {
  title: string;
  aiLabel: string;
  aiValue: string;
  randomLabel: string;
  randomValue: string;
  zScore: number;
}

/**
 * Renders AI value / Random value / z-score as three EQUALLY-weighted tiles
 * (same size, same font), then a verdict banner with the same visual weight
 * as the numbers themselves — so a reader can't come away thinking "AI wins"
 * from the numbers alone without also seeing the significance read.
 */
export function SignificanceComparison({
  title,
  aiLabel,
  aiValue,
  randomLabel,
  randomValue,
  zScore,
}: SignificanceComparisonProps) {
  const absZ = Math.abs(zScore);
  const borderline = absZ >= 2;

  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{title}</h3>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
          <p className="text-xs text-neutral-500">{aiLabel}</p>
          <p className="mt-1 text-2xl font-semibold text-neutral-50">{aiValue}</p>
        </div>
        <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
          <p className="text-xs text-neutral-500">{randomLabel}</p>
          <p className="mt-1 text-2xl font-semibold text-neutral-50">{randomValue}</p>
        </div>
        <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
          <p className="text-xs text-neutral-500">z-score</p>
          <p className="mt-1 text-2xl font-semibold text-neutral-50">{zScore.toFixed(3)}</p>
        </div>
      </div>
      <p
        className={`mt-3 rounded-lg border p-3 text-sm font-semibold ${
          borderline
            ? "border-amber-700 bg-amber-950/20 text-amber-300"
            : "border-emerald-800 bg-emerald-950/20 text-emerald-300"
        }`}
      >
        {borderline
          ? "⚠ |z| ≥ 2 — 경계선에 근접, 표본 확대 후 재검증이 필요합니다."
          : "✓ 통계적으로 유의한 차이 없음 (노이즈 수준, |z| < 2)."}
      </p>
    </div>
  );
}
