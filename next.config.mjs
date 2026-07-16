import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // jsdom (via isomorphic-dompurify's server path) pulls in an ESM-only
  // transitive dep (@exodus/bytes, through html-encoding-sniffer) that
  // Turbopack's production server bundle fails to require() — "Failed to
  // load external module" at runtime. Excluding it from bundling lets Node
  // require() it natively instead, which is why this only broke Vercel
  // (Turbopack build) and not `next dev`.
  serverExternalPackages: ["jsdom", "isomorphic-dompurify"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
