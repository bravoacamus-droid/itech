/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@itech/ui", "@itech/db", "@itech/ai"],
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
