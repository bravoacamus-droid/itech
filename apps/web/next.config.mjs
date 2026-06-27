/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@itech/ui", "@itech/db", "@itech/ai"],
  eslint: {
    // El lint se corre aparte (turbo run lint); no bloquea el build.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
