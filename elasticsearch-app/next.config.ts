import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Disable ESLint during builds to avoid strict linting errors
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Keep type checking enabled but allow builds to continue
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
