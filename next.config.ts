import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  output: 'export',
  basePath: '/hpma',
  assetPrefix: '/hpma/',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
