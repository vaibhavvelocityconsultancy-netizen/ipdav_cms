/** @type {import('next').NextConfig} */
const isProduction = process.env.NODE_ENV === "production";
const basePath =
  process.env.NEXT_PUBLIC_BASE_PATH || (isProduction ? "/newweb" : "");

const nextConfig = {
  output: "standalone",

  ...(basePath
    ? {
        basePath,
        assetPrefix: basePath,
      }
    : {}),

  typescript: {
    ignoreBuildErrors: true,
  },

  experimental: {
    proxyClientMaxBodySize: "100mb",
  },
};

export default nextConfig;
