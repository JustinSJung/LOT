/**
 * Mirrors next.config.ts's basePath. Needed because Next only auto-prefixes
 * next/link, next/image and next/script — a plain fetch() to a public/ asset
 * has to build the absolute path itself, or it resolves relative to the
 * current route instead of the site root (breaks under trailingSlash: true,
 * where every route looks like a directory).
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function publicAsset(path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${BASE_PATH}${cleanPath}`;
}
