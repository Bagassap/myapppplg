import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['pg'],
  compress: true,
  poweredByHeader: false,

  outputFileTracingExcludes: {
    '/api/uploads/[...filename]': ['./public/uploads/**/*'],
  },

  async redirects() {
    return [
      {
        source: '/uploads/:path*',
        destination: '/api/uploads/:path*',
        permanent: false,
      },
    ];
  },

  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store' },
        ],
      },
      {
        source: '/api/uploads/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
};

export default nextConfig;
