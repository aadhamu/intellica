import type { NextConfig } from "next";

const frontendUrl = process.env.NEXT_PUBLIC_URL;
const domain = frontendUrl ? new URL(frontendUrl).hostname : 'localhost';

const nextConfig: NextConfig = {
  images: {
    domains: [domain],
  },
};

export default nextConfig;
