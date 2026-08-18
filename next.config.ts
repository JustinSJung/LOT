import type { NextConfig } from "next";

const repoBasePath = "/LOT";

const nextConfig: NextConfig = {
  output: "export",
  basePath: repoBasePath,
  assetPrefix: repoBasePath,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Next only auto-prefixes basePath for next/link, next/image, next/script —
  // not for plain fetch(). Client code fetching public/ JSON needs this to
  // build a correct absolute path (see src/lib/basePath.ts).
  env: {
    NEXT_PUBLIC_BASE_PATH: repoBasePath,
  },
};

export default nextConfig;
