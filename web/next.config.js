/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Experimental features
  },

  // Compiler options
  compiler: {
    emotion: true,
  },

  // Webpack configuration
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Hot reload optimization
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: ["node_modules/**", ".next/**"],
      };
    }

    // Handle SVG imports
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    return config;
  },

  // Image optimization
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  },

  // Webpack configuration
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Hot reload optimization
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: ["node_modules/**", ".next/**", "styled-system/**"],
      };
    }

    // Handle SVG imports
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    return config;
  },

  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false,
  },

  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: false,
  },
};

module.exports = nextConfig;
