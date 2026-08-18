import type { Metadata } from "next";
import { AnalyzeView } from "./analyze-view";

export const metadata: Metadata = {
  title: "번호 분석기 — LOTTO AI LAB",
  description:
    "내 번호 6개가 역대 회차 대비 몇 번 일치했는지, 번호별 출현 빈도와 갭은 어떤지 통계로 확인해보세요.",
};

export default function AnalyzePage() {
  return <AnalyzeView />;
}
