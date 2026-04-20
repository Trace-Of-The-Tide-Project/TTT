import { CONTRIBUTION_TYPE_ORDER } from "./contribution-type-icons";

/** Maps API contribution type `name` to `Contribute.types.*` message keys. */
export function contributionTypeSlug(apiName: string): string {
  return apiName.trim().toLowerCase().replace(/\s+/g, "_");
}

const KNOWN_TYPE_SLUGS = new Set(
  CONTRIBUTION_TYPE_ORDER.map((n) => contributionTypeSlug(n)),
);

export function isKnownContributionTypeSlug(slug: string): boolean {
  return KNOWN_TYPE_SLUGS.has(slug);
}
