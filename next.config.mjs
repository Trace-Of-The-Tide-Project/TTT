import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // jsdom (isomorphic-dompurify's server path) can't be bundled — it fs.reads
  // non-JS assets via __dirname — and Next externalises it by default anyway.
  // So *Node*, not Turbopack, resolves jsdom's dep tree at runtime.
  //
  // That runtime resolution must stay CommonJS all the way down: Vercel's
  // function runtime does NOT have require(esm) enabled, so any ESM-only link
  // in the chain 500s every SSR route with ERR_REQUIRE_ESM. jsdom@27 pulls
  // parse5@8, which is ESM-only — hence the `jsdom: 26.1.0` override in
  // package.json (jsdom@26 -> parse5@7, which ships a CJS build). That override
  // is LOAD-BEARING; check the chain is still CJS before bumping jsdom:
  //   node --no-experimental-require-module -e "require('isomorphic-dompurify')"
  // Local dev and the Fly image never catch this — Node >= 22.12 has require(esm)
  // on by default, which is why it only ever broke on Vercel.
  //
  // If jsdom@26 ever has to go, the fix is to drop jsdom entirely (replace the
  // sanitizer with a DOM-free one), not to re-chase runtime flags.
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
