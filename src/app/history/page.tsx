import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import { HistoryView } from "./history-view";

export const metadata: Metadata = buildPageMetadata({
  title: "회차 이력",
  description: "역대 로또 6/45 전체 회차의 당첨번호를 검색하고 필터링해서 확인해보세요.",
  path: "/history/",
  keywords: ["로또 회차 이력", "로또 당첨번호 검색", "역대 로또 번호", "로또 6/45 회차"],
});

export default function HistoryPage() {
  return <HistoryView />;
}
