import type { Metadata } from "next";
import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "방법론",
  description:
    "이 사이트의 통계 점수와 백테스트가 무엇을 의미하고 무엇을 의미하지 않는지 한 곳에 정리했습니다.",
  path: "/methodology/",
  keywords: ["로또 통계 방법론", "로또 백테스트 방법론", "로또 당첨 확률"],
});

const TERMS: { term: string; meaning: string }[] = [
  {
    term: "Statistical Score / Model Score",
    meaning:
      "번호 조합의 통계적 특성(빈도·최근 트렌드·갭·균형·패턴·시뮬레이션 순위)을 종합한 0-100점 상대 순위입니다. 당첨 확률이 아닙니다.",
  },
  {
    term: "Historical Frequency",
    meaning: "역대 회차에서 해당 번호가 실제로 몇 번 나왔는지의 과거 기록입니다. 미래 출현을 보장하지 않습니다.",
  },
  {
    term: "Historical Pattern",
    meaning: "역대 회차에서 특정 번호 쌍/조합이 함께 나온 빈도입니다. 다음 회차에 다시 나올 근거가 아닙니다.",
  },
  {
    term: "Model Preference",
    meaning: "여러 통계 모델(핫넘버/콜드넘버/밸런스형 등) 중 어떤 모델이 이 조합을 더 선호하는지를 뜻합니다.",
  },
  {
    term: "Backtest Result",
    meaning:
      "과거 회차를 대상으로, 그 회차 이전 데이터만 사용해 모델이 실제 결과와 얼마나 일치했는지를 역사적으로 검증한 기록입니다.",
  },
  {
    term: "Combination Character (Luck Profile)",
    meaning: "조합의 균형·패턴·트렌드·희귀도·다양성을 재미있게 표현한 캐릭터입니다. 운세나 예언이 아닙니다.",
  },
];

const BANNED_PHRASES = ["당첨확률 3배", "1등 가능성이 높은 번호", "AI가 당첨번호를 예측", "이 번호가 가장 잘 맞는다", "당첨 보장"];
const APPROVED_PHRASES = ["Statistical Score", "Historical Pattern", "Model Preference", "Historical Frequency", "Backtest Result", "Combination Character"];

export default function MethodologyPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <div className="mb-8">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-400">방법론</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-50 sm:text-3xl">
          이 사이트가 하는 것과 하지 않는 것
        </h1>
      </div>

      <section className="rounded-lg border border-amber-900/40 bg-amber-950/20 p-5">
        <p className="text-base font-semibold leading-relaxed text-amber-200">
          공정한 6/45 추첨에서 모든 번호 조합의 이론적 당첨 확률은 동일합니다. 이
          사이트가 보여주는 모든 점수(Statistical Score, Model Score, Combination
          Character 등)는 <span className="underline decoration-amber-500">당첨 확률이 아니라</span>{" "}
          과거 데이터를 바탕으로 한 <span className="underline decoration-amber-500">통계적 순위 점수</span>
          입니다.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          이 사이트가 쓰는 용어
        </h2>
        <dl className="mt-3 space-y-3">
          {TERMS.map((t) => (
            <div key={t.term} className="rounded-lg border border-neutral-800 bg-neutral-900 p-4">
              <dt className="text-sm font-semibold text-neutral-100">{t.term}</dt>
              <dd className="mt-1 text-sm text-neutral-400">{t.meaning}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            쓰지 않는 표현
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-neutral-400">
            {BANNED_PHRASES.map((p) => (
              <li key={p} className="flex items-start gap-2">
                <span className="text-red-400">✕</span>
                {p}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            대신 쓰는 표현
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-neutral-400">
            {APPROVED_PHRASES.map((p) => (
              <li key={p} className="flex items-start gap-2">
                <span className="text-emerald-400">✓</span>
                {p}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          페이지별 고지 요약
        </h2>
        <ul className="mt-3 space-y-3 text-sm text-neutral-400">
          <li>
            <Link href="/generator/" className="text-neutral-200 hover:text-emerald-300">
              번호 생성기
            </Link>{" "}
            — 통계적 순위 참고용이며 당첨번호를 예측하지 않습니다.
          </li>
          <li>
            <Link href="/analyze/" className="text-neutral-200 hover:text-emerald-300">
              번호 분석기
            </Link>{" "}
            — 과거 데이터 기반 통계 정보이며 미래 당첨을 예측하지 않습니다.
          </li>
          <li>
            <Link href="/statistics/" className="text-neutral-200 hover:text-emerald-300">
              통계
            </Link>{" "}
            — 과거 출현 빈도와 다음 회차 당첨 확률은 무관합니다. 로또는 매회 독립
            추첨됩니다.
          </li>
          <li>
            <Link href="/backtest/" className="text-neutral-200 hover:text-emerald-300">
              백테스트
            </Link>{" "}
            — Historical Backtest Result이며 실제 당첨 확률을 예측하거나 높이지
            않습니다. 표본 크기가 통계적으로 크지 않고, z-score는 정식 유의성 검정을
            대신하지 않습니다.
          </li>
        </ul>
      </section>
    </main>
  );
}
