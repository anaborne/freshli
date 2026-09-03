import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // next/image throws at request time without this entry. The allowlist used to
        // live here while a second file, next.config.js, also existed. Next 15 resolves
        // next.config.js before next.config.ts, so this file was the one being ignored
        // and recipe images did not load. The .js file is gone.
        protocol: "https",
        hostname: "oaidalleapiprodscus.blob.core.windows.net",
      },
    ],
  },
};

export default nextConfig;
