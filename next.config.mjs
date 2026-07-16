import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // jsdom (isomorphic-dompurify's server path) must not be bundled — it does
  // dynamic requires and __dirname reads. Externalising means Node require()s
  // its dep tree, which contains CJS builds that require() ESM-only packages
  // (@asamuzakjp/css-color -> @csstools/css-calc). That needs require(esm),
  // i.e. Node >= 22.12 — see the `engines` floor in package.json. Dropping
  // below that floor resurrects ERR_REQUIRE_ESM at runtime.
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
