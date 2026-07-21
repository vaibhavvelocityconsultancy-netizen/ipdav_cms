/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    proxyClientMaxBodySize: "100mb",
  },
  async rewrites() {
    return [
      {
        source: "/:slug.md",
        destination: "/api/public/llms/:slug",
      },
    ];
  },
  turbopack: {},
};

export default nextConfig;
