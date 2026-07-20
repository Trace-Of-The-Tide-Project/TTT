/**
 * Framing placement keys, shared by the admin surfaces that write framing and
 * the render surfaces that read it, so the two can never drift onto different
 * keys and silently stop seeing each other's data.
 *
 * `entity` is the table name and `field` the image column, matching the
 * addressing used by the framing API and by media usage tracking.
 *
 * Magazine issue covers keep their own constants in
 * components/home/magazine-next/issue-framing.ts (they predate this file).
 */
export const ARTICLE_COVER_FRAMING = {
  entity: "articles",
  field: "cover_image",
} as const;

export const WRITER_AVATAR_FRAMING = {
  entity: "writer_profiles",
  field: "avatar_url",
} as const;

export const PERSON_PORTRAIT_FRAMING = {
  entity: "person_profiles",
  field: "portrait",
} as const;
