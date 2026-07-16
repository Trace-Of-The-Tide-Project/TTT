import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // jsdom (isomorphic-dompurify's server path) can't be bundled — it fs.reads
  // non-JS assets via __dirname — and Next externalises it by default anyway.
  // So *Node*, not Turbopack, resolves jsdom's dep tree at runtime, and that
  // tree require()s ESM-only packages (jsdom -> parse5@8, which ships no CJS
  // build at all). That only works where require(esm) is enabled.
  //
  // Vercel's function runtime does NOT enable require(esm) by default, so
  // NODE_OPTIONS=--experimental-require-module is set on the Vercel project and
  // is LOAD-BEARING: without it every SSR route 500s with ERR_REQUIRE_ESM.
  // See https://vercel.com/docs/functions/runtimes/node-js/advanced-node-configuration
  // Local dev and the Fly image never hit this — Node >= 22.12 has require(esm)
  // on by default, which is why this only ever broke on Vercel.
  //
  // Pinning deps does NOT substitute for the flag: parse5 has no CJS build to
  // pin to. If the flag ever has to go, the fix is to drop jsdom (replace the
  // sanitizer with a DOM-free one), not to chase versions.
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
