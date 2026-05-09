/**
 * Root home page is the magazine landing.
 *
 * The previous "Hex grid" home page (HomeHexGrid + ShareYourStory)
 * has been moved to `/home` so it's still reachable, but `/` now
 * renders the magazine page so visitors land on the editorial
 * experience first.
 *
 * We re-export rather than duplicate the page body so there's a
 * single source of truth for the magazine route.
 */
export { default, dynamic } from "./magazine/page";
