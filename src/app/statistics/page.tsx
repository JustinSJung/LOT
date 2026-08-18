import type { Metadata } from "next";
import { StatisticsView } from "./statistics-view";

export const metadata: Metadata = {
  title: "통계 — LOTTO AI LAB",
  description:
    "역대 로또 6/45 전체 회차 기준 번호별 출현 빈도, 홀짝/저고 분포, 합계 분포, 번호 쌍/조합 빈도를 확인해보세요.",
};

export default function StatisticsPage() {
  return <StatisticsView />;
}
