import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: 'standalone',

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
