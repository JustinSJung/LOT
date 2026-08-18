import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-400">
        통계 기반 로또 분석
      </p>
      <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">
        LOTTO AI LAB
      </h1>
      <p className="max-w-md text-neutral-400">
        당신의 행운의 번호는 무엇일까요? 번호를 뽑고, 그 안에 담긴 통계를
        확인하고, 추첨 후 다시 확인해보세요.
      </p>
      <Link
        href="/generator"
        className="rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-neutral-950 transition-colors hover:bg-emerald-400"
      >
        내 번호 뽑기
      </Link>
      <p className="max-w-md text-xs text-neutral-500">
        번호 분석기, 회차 이력, 통계, 백테스트 화면은 다음 단계에서
        추가됩니다.
      </p>
    </main>
  );
}
