import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [],
  },
  experimental: {
    globalNotFound: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? true : false,
  },
};

export default nextConfig;
