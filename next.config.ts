import type { NextConfig } from "next";

const frontendUrl = process.env.NEXT_PUBLIC_URL;
const domain = frontendUrl ? new URL(frontendUrl).hostname : "localhost";

const nextConfig: NextConfig = {
  images: {
    domains: [domain], // Only needed if loading remote images
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
