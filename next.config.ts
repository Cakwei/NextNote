import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [],
  },
  experimental: {
    globalNotFound: true,
  },
};

export default nextConfig;
