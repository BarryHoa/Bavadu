const withNextIntl = require("next-intl/plugin")("./i18n.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
  // Module system configuration
  webpack: (config, { isServer }) => {
    // Add module resolution for modules directory
    config.resolve.alias = {
      ...config.resolve.alias,
      "@modules": require("path").resolve(__dirname, "modules"),
    };

    return config;
  },
  // Enable experimental features for module system
  experimental: {
    // Allow importing from modules directory
    externalDir: true,
  },
};

module.exports = withNextIntl(nextConfig);
