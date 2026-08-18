import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import { AnalyzeView } from "./analyze-view";

export const metadata: Metadata = buildPageMetadata({
  title: "번호 분석기",
  description:
    "내 번호 6개가 역대 회차 대비 몇 번 일치했는지, 번호별 출현 빈도와 갭은 어떤지 통계로 확인해보세요.",
  path: "/analyze/",
  keywords: ["로또 번호 분석", "로또 번호 확인", "로또 당첨 이력 검색", "로또 번호 조회"],
});

export default function AnalyzePage() {
  return <AnalyzeView />;
}
