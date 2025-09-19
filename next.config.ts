import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  eslint: {
    // WARNING: Esto deshabilita ESLint durante builds
    // Solo usar temporalmente
    ignoreDuringBuilds: true,
  },
  typescript: {
    // WARNING: Esto permite errores de TypeScript en build
    // Solo usar temporalmente
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
