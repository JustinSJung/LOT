import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import { StatisticsView } from "./statistics-view";

export const metadata: Metadata = buildPageMetadata({
  title: "통계",
  description:
    "역대 로또 6/45 전체 회차 기준 번호별 출현 빈도, 홀짝/저고 분포, 합계 분포, 번호 쌍/조합 빈도를 확인해보세요.",
  path: "/statistics/",
  keywords: ["로또 통계", "로또 번호 출현 빈도", "로또 핫넘버 콜드넘버", "로또 번호 분석"],
});

export default function StatisticsPage() {
  return <StatisticsView />;
}
