"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/generator", label: "번호 생성" },
  { href: "/analyze", label: "번호 분석" },
  { href: "/history", label: "회차 이력" },
  { href: "/statistics", label: "통계" },
  { href: "/backtest", label: "백테스트" },
];

export function SiteHeader() {
  const rawPathname = usePathname();
  // trailingSlash: true means the real route is "/generator/", not "/generator" —
  // normalize before comparing against NAV_ITEMS' hrefs.
  const pathname = rawPathname && rawPathname !== "/" ? rawPathname.replace(/\/$/, "") : rawPathname;

  return (
    <header className="sticky top-0 z-10 border-b border-neutral-900 bg-neutral-950/85 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center gap-6 overflow-x-auto px-6 py-3">
        <Link
          href="/"
          className="shrink-0 text-sm font-semibold tracking-tight text-neutral-50 hover:text-neutral-200"
        >
          LOTTO AI LAB
        </Link>
        <nav className="flex shrink-0 gap-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  active
                    ? "bg-emerald-500/15 text-emerald-300"
                    : "text-neutral-400 hover:text-neutral-200"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
