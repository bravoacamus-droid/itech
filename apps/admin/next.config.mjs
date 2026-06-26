/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@itech/ui", "@itech/db"],
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
