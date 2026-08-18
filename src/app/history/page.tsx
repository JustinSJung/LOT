import type { Metadata } from "next";
import { HistoryView } from "./history-view";

export const metadata: Metadata = {
  title: "회차 이력 — LOTTO AI LAB",
  description: "역대 로또 6/45 전체 회차의 당첨번호를 검색하고 필터링해서 확인해보세요.",
};

export default function HistoryPage() {
  return <HistoryView />;
}
