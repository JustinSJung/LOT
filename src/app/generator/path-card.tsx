"use client";

import { useState } from "react";
import { NumberBall } from "@/components/number-ball";
import { LuckProfilePanel } from "./luck-profile-panel";
import type { LottoNumber, LuckProfile } from "@/lib/lottery";
import type { GeneratorPathOption as GeneratorPath } from "@/lib/generatorPaths";

interface PathCardProps {
  path: GeneratorPath;
  numbers: LottoNumber[];
  ensembleScore: number;
  luckProfile: LuckProfile;
  isSaved: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onSave: () => void;
  onSwap: (slotIndex: number, newNumber: LottoNumber) => void;
}

export function PathCard({
  path,
  numbers,
  ensembleScore,
  luckProfile,
  isSaved,
  isExpanded,
  onToggleExpand,
  onSave,
  onSwap,
}: PathCardProps) {
  const [swapSlot, setSwapSlot] = useState<number | null>(null);
  const [swapValue, setSwapValue] = useState("");

  function submitSwap() {
    const n = parseInt(swapValue, 10);
    if (swapSlot === null || Number.isNaN(n) || n < 1 || n > 45 || numbers.includes(n)) return;
    onSwap(swapSlot, n);
    setSwapSlot(null);
    setSwapValue("");
  }

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-5">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-base font-semibold text-neutral-50">{path.label}</h3>
        <span className="text-xs text-neutral-500">
          통계 점수 {ensembleScore.toFixed(1)}/100
        </span>
      </div>
      <p className="mt-1 text-xs text-neutral-500">{path.description}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {numbers.map((n, i) => (
          <button
            key={i}
            type="button"
            onClick={() => {
              setSwapSlot(i);
              setSwapValue("");
            }}
            aria-label={`${n}번 교체해보기`}
          >
            <NumberBall number={n} revealDelayMs={i * 70} emphasized={swapSlot === i} />
          </button>
        ))}
      </div>

      {swapSlot !== null && (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-neutral-400">{swapSlot + 1}번째 자리를 이 숫자로 바꾸면?</span>
          <input
            type="number"
            min={1}
            max={45}
            value={swapValue}
            onChange={(e) => setSwapValue(e.target.value)}
            className="w-16 rounded border border-neutral-700 bg-neutral-950 px-2 py-1 text-neutral-50"
          />
          <button
            type="button"
            onClick={submitSwap}
            className="rounded bg-neutral-800 px-3 py-1 text-xs font-medium text-neutral-100 hover:bg-neutral-700"
          >
            적용
          </button>
          <button
            type="button"
            onClick={() => setSwapSlot(null)}
            className="text-xs text-neutral-500 hover:text-neutral-300"
          >
            취소
          </button>
        </div>
      )}

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleExpand}
          className="text-xs font-medium text-emerald-400 hover:text-emerald-300"
        >
          {isExpanded ? "조합 캐릭터 숨기기" : "조합 캐릭터 보기"}
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={isSaved}
          className="ml-auto rounded-full bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-neutral-950 transition-colors hover:bg-emerald-400 disabled:cursor-default disabled:bg-neutral-700 disabled:text-neutral-400"
        >
          {isSaved ? "저장됨" : "이 조합 저장"}
        </button>
      </div>

      {isExpanded && <LuckProfilePanel profile={luckProfile} />}
    </div>
  );
}
