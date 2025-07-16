import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone', // Required for Render.com deployments
  images: {
    domains: [
      'intellica-g0ud.onrender.com',
      'choozplatform.com', // ✅ Added to fix 400 error for blog image
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "intellica-g0ud.onrender.com",
        pathname: "/image/**",
      },
      {
        protocol: "https",
        hostname: "choozplatform.com",
        pathname: "/ai-business/blog_images/**", // ✅ Adjusted path for your image URLs
      },
    ],
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
