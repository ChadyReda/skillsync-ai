import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove the X-Powered-By header for security
  poweredByHeader: false,

  // Enable gzip/brotli compression
  compress: true,

  images: {
    // Serve modern image formats when supported
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
      {
        protocol: "https",
        hostname: "images.clerk.dev",
      },
      // allow any ngrok tunnel for local dev
      {
        protocol: "https",
        hostname: "*.ngrok-free.app",
      },
      {
        protocol: "https",
        hostname: "*.ngrok.io",
      },
    ],
  },

  // allow ngrok to proxy to Next.js without host header rejection
  allowedDevOrigins: ["*.ngrok-free.app", "*.ngrok.io"],
};

export default nextConfig;
