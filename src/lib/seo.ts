import type { Metadata } from "next";

export const SITE_NAME = "LOTTO AI LAB";

/**
 * Best-effort GitHub Pages URL for this repo. Update if the repo is ever
 * renamed or moved to a custom domain — Next can't infer this at build time
 * for a static export, so it has to be hardcoded somewhere.
 */
export const SITE_URL = "https://justinsjung.github.io/LOT";

interface PageMetadataInput {
  /** Page-only title — the site name suffix comes from the root layout's title template. */
  title: string;
  description: string;
  /** Route path including trailing slash, e.g. "/generator/". */
  path: string;
  keywords: string[];
}

export function buildPageMetadata({ title, description, path, keywords }: PageMetadataInput): Metadata {
  return {
    title,
    description,
    keywords,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName: SITE_NAME,
      locale: "ko_KR",
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}
