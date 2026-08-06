/** @type {import('next').NextConfig} */

const nextConfig = {
  output: "standalone",

  typescript: {
    ignoreBuildErrors: true,
  },

  experimental: {
    proxyClientMaxBodySize: "100mb",
  },
};

export default nextConfig;