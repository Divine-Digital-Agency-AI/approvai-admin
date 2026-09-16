import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: 'standalone',

  async redirects() {
    return [
      { source: "/phase-3/plan", destination: "/plan-approvals", permanent: true },
      { source: "/project-overview/plan", destination: "/plan-approvals", permanent: true },
      { source: "/phase-3", destination: "/project-overview", permanent: true },
      { source: "/phase-3/:path*", destination: "/project-overview/:path*", permanent: true },
    ];
  },

  turbopack: {
    root: path.resolve(__dirname, '..'),
  },

  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: /node_modules/,
      };
    }
    return config;
  },
};

export default nextConfig;
