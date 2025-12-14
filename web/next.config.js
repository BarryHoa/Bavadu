const withNextIntl = require("next-intl/plugin")("./i18n/request.ts");

// Security headers configuration
const isProduction = process.env.NODE_ENV === "production";

const securityHeaders = {
  "Content-Security-Policy":
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self';",
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
  "X-XSS-Protection": "1; mode=block",
  ...(isProduction && {
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
  }),
};

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: "/:path*",
        headers: Object.entries(securityHeaders).map(([key, value]) => ({
          key,
          value,
        })),
      },
    ];
  },
  // Module system configuration
  webpack: (config, { isServer }) => {
    // Add module resolution for modules directory
    config.resolve.alias = {
      ...config.resolve.alias,
      "@mdl": require("path").resolve(__dirname, "modules"),
      "@base": require("path").resolve(__dirname, "module-base"),
    };

    // Allow dynamic imports for server-side code
    if (isServer) {
      config.externals = config.externals || [];
      // Don't externalize modules that need to be bundled
    }

    // Allow more flexible dynamic imports
    config.module = config.module || {};
    config.module.unknownContextCritical = false;
    config.module.exprContextCritical = false;

    return config;
  },
  // Enable experimental features for module system
  experimental: {
    // Allow importing from modules directory
    externalDir: true,
    // Enable instrumentation hook for server initialization
    instrumentationHook: true,
  },
};

module.exports = withNextIntl(nextConfig);
