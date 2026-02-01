import type { NextConfig } from "next";

process.env.TURBOPACK = '0';

const nextConfig: NextConfig = {
  transpilePackages: ['pg'],
};

export default nextConfig;
