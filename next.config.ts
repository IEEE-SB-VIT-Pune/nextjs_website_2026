import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async redirects() {
    return [
      {
        source: "/fun-zone/:path*",
        destination: "/",
        permanent: false,
      },
      {
        source: "/fun-zone",
        destination: "/",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
