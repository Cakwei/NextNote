import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "localhost:3000, note.cakwei.com, *.cloudflareinsights.com", // Set your origin
          },
        ],
      },
    ];
  },
  experimental: {
    globalNotFound: true,
  },
};

export default nextConfig;
