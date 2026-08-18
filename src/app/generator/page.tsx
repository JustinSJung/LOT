import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import { GeneratorView } from "./generator-view";

export const metadata: Metadata = buildPageMetadata({
  title: "번호 생성기",
  description:
    "5가지 통계적 경로로 번호 조합을 뽑고, 과거 패턴 분석을 확인하고, 다음 회차 결과와 비교할 수 있도록 저장하세요.",
  path: "/generator/",
  keywords: ["로또 번호 생성기", "로또 번호 추첨", "로또 6/45 번호 뽑기", "AI 로또 번호"],
});

export default function GeneratorPage() {
  return <GeneratorView />;
}
