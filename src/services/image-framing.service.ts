/**
 * Per-placement image framing for records whose image column is a bare string
 * (article/book/issue covers, avatars, portraits) and for settings-key image
 * slots like page heroes — everything that has nowhere to keep framing beside
 * the image itself.
 *
 * Surfaces whose image already lives in a JSON config (magazine and home CMS
 * sections) keep framing in that config instead; they need no request at all.
 */
import { api } from "./api";
import { serverGet } from "@/lib/api/isomorphic-fetch";
import { clampFraming, type ImageFraming } from "@/lib/image-framing";

/** entityId → field → framing, exactly as the API returns it. */
export type FramingMap = Record<string, Record<string, ImageFraming>>;

type RawFramingMap = Record<string, Record<string, unknown>>;

/** Run the API payload back through the same clamp the editor uses, so a bad
 * or hand-edited row degrades to default framing instead of broken CSS. */
function normalize(raw: RawFramingMap | null | undefined): FramingMap {
  const out: FramingMap = {};
  for (const [entityId, fields] of Object.entries(raw ?? {})) {
    for (const [field, value] of Object.entries(fields ?? {})) {
      const framing = clampFraming(value);
      if (framing) (out[entityId] ??= {})[field] = framing;
    }
  }
  return out;
}

function unwrap(payload: unknown): RawFramingMap | null {
  if (!payload || typeof payload !== "object") return null;
  const withData = payload as { data?: unknown };
  const body = withData.data ?? payload;
  return body && typeof body === "object" ? (body as RawFramingMap) : null;
}

/**
 * Framing for many rows in ONE request. Always batch: a grid of cards must not
 * issue a request per card.
 */
export async function getFramings(
  entityType: string,
  entityIds: string[],
  field?: string,
): Promise<FramingMap> {
  const ids = entityIds.filter(Boolean);
  if (ids.length === 0) return {};
  const res = await api.get("/image-framings", {
    params: { entity_type: entityType, entity_id: ids.join(","), ...(field ? { field } : {}) },
  });
  return normalize(unwrap(res.data));
}

/** Server-component variant — public endpoint, fails soft to no framing so a
 * framing outage can never blank out a page. */
export async function getFramingsServer(
  entityType: string,
  entityIds: string[],
  field?: string,
): Promise<FramingMap> {
  const ids = entityIds.filter(Boolean);
  if (ids.length === 0) return {};
  const raw = await serverGet<unknown>("/image-framings", {
    entity_type: entityType,
    entity_id: ids.join(","),
    ...(field ? { field } : {}),
  });
  return normalize(unwrap(raw));
}

export async function upsertFraming(
  entityType: string,
  entityId: string,
  field: string,
  framing: ImageFraming,
): Promise<void> {
  await api.put("/image-framings", {
    entity_type: entityType,
    entity_id: entityId,
    field,
    framing,
  });
}

/** Reset to default framing. Deleting the row keeps "no row" as the single
 * meaning of "renders as it always did". */
export async function deleteFraming(
  entityType: string,
  entityId: string,
  field: string,
): Promise<void> {
  await api.delete("/image-framings", {
    params: { entity_type: entityType, entity_id: entityId, field },
  });
}
