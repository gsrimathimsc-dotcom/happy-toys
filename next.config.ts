import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // ESLint is not part of this beginner project, so skip it during `npm run build`.
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
