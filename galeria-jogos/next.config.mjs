/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-495151c8fd334e6981386bd8a4e6f1c0.r2.dev',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
