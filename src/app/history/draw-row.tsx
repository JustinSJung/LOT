"use client";

import { useState } from "react";
import { NumberBall } from "@/components/number-ball";
import type { DrawDetails } from "@/lib/lottery";

export function DrawRow({ details }: { details: DrawDetails }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-900">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full flex-wrap items-center gap-3 px-4 py-3 text-left"
      >
        <span className="w-16 shrink-0 text-sm font-semibold text-neutral-200">
          {details.drawNumber}회
        </span>
        <span className="w-24 shrink-0 text-xs text-neutral-500">{details.date}</span>
        <div className="flex flex-wrap items-center gap-1.5">
          {details.numbers.map((n) => (
            <NumberBall key={n} number={n} size="sm" />
          ))}
          <span className="text-xs text-neutral-500">+</span>
          <NumberBall number={details.bonusNumber} size="sm" />
        </div>
        <span className="ml-auto text-xs text-neutral-500">합계 {details.sum}</span>
      </button>

      {expanded && (
        <div className="border-t border-neutral-800 px-4 py-4">
          <dl className="grid grid-cols-2 gap-3 text-xs text-neutral-400 sm:grid-cols-4">
            <div>
              <dt className="text-neutral-500">홀/짝</dt>
              <dd className="mt-0.5 text-sm text-neutral-200">
                {details.oddCount}:{details.evenCount}
              </dd>
            </div>
            <div>
              <dt className="text-neutral-500">저/고</dt>
              <dd className="mt-0.5 text-sm text-neutral-200">
                {details.lowCount}:{details.highCount}
              </dd>
            </div>
            <div>
              <dt className="text-neutral-500">번호 합계</dt>
              <dd className="mt-0.5 text-sm text-neutral-200">{details.sum}</dd>
            </div>
            <div>
              <dt className="text-neutral-500">연속 번호</dt>
              <dd className="mt-0.5 text-sm text-neutral-200">
                {details.consecutiveRuns.length === 0
                  ? "없음"
                  : details.consecutiveRuns.map((run) => run.join("-")).join(", ")}
              </dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  );
}
