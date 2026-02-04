import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: '**', // Allow external images in production (e.g. AWS S3, Cloudinary, or Production Backend)
      }
    ],
  },
};

export default nextConfig;
