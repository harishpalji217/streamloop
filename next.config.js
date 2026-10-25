/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Increase body size limit for video uploads
  experimental: {
    serverActions: {
      bodySizeLimit: '200mb',
    },
  },
}

module.exports = nextConfig