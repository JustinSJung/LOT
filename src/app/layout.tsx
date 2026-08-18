import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SITE_NAME, SITE_URL } from "@/lib/seo";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_DESCRIPTION =
  "대한민국 로또 6/45의 과거 당첨 데이터를 분석하고, 통계 점수와 백테스트 결과를 제공하는 서비스입니다 — 연구·재미 목적으로만 이용해주세요.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — 통계 기반 로또 분석`,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "로또 번호 생성기",
    "로또 통계 분석",
    "로또 6/45",
    "로또 번호 확인",
    "로또 회차 이력",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    siteName: SITE_NAME,
    title: `${SITE_NAME} — 통계 기반 로또 분석`,
    description: SITE_DESCRIPTION,
    url: "/",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: `${SITE_NAME} — 통계 기반 로또 분석`,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-neutral-950 text-neutral-50">
        <SiteHeader />
        <div className="flex flex-1 flex-col">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
