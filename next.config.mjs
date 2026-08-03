/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",

  basePath: "/newweb",
  assetPrefix: "/newweb",

  typescript: {
    ignoreBuildErrors: true,
  },

  experimental: {
    proxyClientMaxBodySize: "100mb",
  },
};

export default nextConfig;