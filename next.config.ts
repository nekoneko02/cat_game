import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Production optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false,
  },
  // Output optimization for production
  output: 'standalone',
  // Image optimization
  images: {
    unoptimized: false,
  },
};

export default nextConfig;
