/**
 * Root home page is the magazine landing.
 *
 * The previous "Hex grid" home page (HomeHexGrid + ShareYourStory)
 * has been moved to `/home` so it's still reachable, but `/` now
 * renders the magazine page so visitors land on the editorial
 * experience first.
 *
 * We re-export the default but redeclare `dynamic` literally —
 * Next.js's compile-time static analysis won't follow re-exported
 * route segment config.
 */
export const dynamic = "force-dynamic";
export { default } from "./magazine/page";
