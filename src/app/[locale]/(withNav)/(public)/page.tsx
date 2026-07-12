/**
 * Root `/` renders the "Hex grid" homepage.
 *
 * Host-based routing splits the two public faces of the site:
 *   - Apex (traceofthetide.org)      → `/`         → this homepage
 *   - Subdomain (magazine.…)         → `/magazine` → the editorial magazine
 *
 * The subdomain rewrite lives in `src/middleware.ts`, which maps the
 * subdomain's `/[locale]` to `/[locale]/magazine`. The magazine page
 * itself still lives at `./magazine/page` and is reachable at
 * `/magazine` on the apex too.
 *
 * We re-export the default but redeclare `dynamic` literally —
 * Next.js's compile-time static analysis won't follow re-exported
 * route segment config, and the homepage fetches articles at request
 * time so it must not be statically prerendered.
 */
export const dynamic = "force-dynamic";
// Named exports don't flow through `export { default }` — re-export
// generateMetadata explicitly so `/` gets the homepage title/OG/hreflang.
export { default, generateMetadata } from "./home/page";
