/**
 * Slugs served by a hardcoded route under `app/[locale]/(withNav)/(public)/`.
 * A CMS page saved under one of these slugs is shadowed by the static route
 * (Next.js gives static segments priority over the `[slug]` dynamic route), so
 * its `content` never surfaces on the public site — editing it silently loses
 * the author's work.
 *
 * The CMS admin uses this to hide such pages from the editable list. (The
 * `[slug]` route needs no check of its own — Next.js already resolves the
 * static segment ahead of the dynamic one.)
 *
 * Scope: `(public)` route group only — that's where public content pages live
 * and where slug collisions actually shadow CMS content. Routes elsewhere under
 * `[locale]` (e.g. `(dashboard)`) are intentionally out of scope.
 *
 * IMPORTANT: keep in sync with the directories in
 * `app/[locale]/(withNav)/(public)/`. Add a slug here whenever a bespoke
 * public route is added.
 */
export const RESERVED_PUBLIC_SLUGS: ReadonlySet<string> = new Set([
  "be-a-neighbor",
  "books",
  "collections",
  "community",
  "contact",
  "content",
  "contribute",
  "dictionary",
  "fields",
  "gdpr",
  "gift-a-trace",
  "home",
  "magazine",
  "magazine-issues",
  "magazine-next",
  "open-call",
  "open-calls",
  "open-issues",
  "privacy",
  "start-an-issue",
  "subscribe",
  "terms",
  "trip",
  "writers",
  "writing-room",
]);

/** True when `slug` is served by a hardcoded route and can't surface CMS content. */
export function isReservedPublicSlug(slug: string | null | undefined): boolean {
  return slug != null && RESERVED_PUBLIC_SLUGS.has(slug.trim().toLowerCase());
}
