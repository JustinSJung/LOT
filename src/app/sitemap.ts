import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export const dynamic = "force-static";

const ROUTES: { path: string; priority: number; changeFrequency: "daily" | "weekly" }[] = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/generator/", priority: 0.9, changeFrequency: "weekly" },
  { path: "/analyze/", priority: 0.8, changeFrequency: "weekly" },
  { path: "/statistics/", priority: 0.8, changeFrequency: "weekly" },
  { path: "/history/", priority: 0.7, changeFrequency: "weekly" },
  { path: "/backtest/", priority: 0.7, changeFrequency: "weekly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
