import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import { BacktestView } from "./backtest-view";

export const metadata: Metadata = buildPageMetadata({
  title: "백테스트",
  description:
    "역대 회차를 대상으로 AI 모델과 랜덤 추첨을 비교한 Historical Backtest Result를 통계적 유의성과 함께 확인해보세요.",
  path: "/backtest/",
  keywords: ["로또 백테스트", "로또 통계 검증", "로또 시뮬레이션 결과"],
});

export default function BacktestPage() {
  return <BacktestView />;
}
