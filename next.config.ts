import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // next/image throws at request time without this entry. The allowlist used to
        // live in a second file, next.config.js, which Next 15 ignores when the .ts
        // exists, so it was silently inactive and recipe images did not load.
        protocol: "https",
        hostname: "oaidalleapiprodscus.blob.core.windows.net",
      },
    ],
  },
};

export default nextConfig;
