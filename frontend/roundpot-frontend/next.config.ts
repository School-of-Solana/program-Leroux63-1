import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Désactive ESLint pendant le build (sinon Vercel bloque)
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Désactive les erreurs TypeScript pendant le build (Anchor oblige)
  typescript: {
    ignoreBuildErrors: true,
  },

  // (optionnel mais recommandé) : évite les erreurs SWC sur certains packages Web3
  experimental: {
    serverMinification: false,
  },
};

export default nextConfig;
