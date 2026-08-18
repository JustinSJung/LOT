import type { Metadata } from "next";
import { BacktestView } from "./backtest-view";

export const metadata: Metadata = {
  title: "백테스트 — LOTTO AI LAB",
  description:
    "역대 회차를 대상으로 AI 모델과 랜덤 추첨을 비교한 Historical Backtest Result를 통계적 유의성과 함께 확인해보세요.",
};

export default function BacktestPage() {
  return <BacktestView />;
}
