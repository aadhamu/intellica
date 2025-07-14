import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone', // Required for Render.com deployments
  images: {
    domains: ['intellica-g0ud.onrender.com'], // Add your domain here
    remotePatterns: [
      {
        protocol: "https",
        hostname: "intellica-g0ud.onrender.com",
        pathname: "/image/**",
      },
    ],
    // For Render.com specifically:
    loader: 'default',
    path: '/_next/image',
    minimumCacheTTL: 60,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;