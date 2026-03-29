import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/tycg-status',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
}

export default nextConfig
