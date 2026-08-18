import type { Metadata } from "next";
import { GeneratorView } from "./generator-view";

export const metadata: Metadata = {
  title: "번호 생성기 — LOTTO AI LAB",
  description:
    "5가지 통계적 경로로 번호 조합을 뽑고, 과거 패턴 분석을 확인하고, 다음 회차 결과와 비교할 수 있도록 저장하세요.",
};

export default function GeneratorPage() {
  return <GeneratorView />;
}
