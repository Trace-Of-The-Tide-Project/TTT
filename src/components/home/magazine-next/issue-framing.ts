/**
 * Framing placement for magazine issue covers. Shared by the admin editor that
 * writes it and the magazine surfaces that read it, so the two cannot drift
 * onto different keys and silently stop seeing each other's data.
 *
 * `entity_type` is the table name and `field` the column, matching the
 * addressing used by the framing API and media usage tracking.
 */
export const ISSUE_FRAMING_ENTITY = "magazine_issues";
export const ISSUE_FRAMING_FIELD = "cover_image";
