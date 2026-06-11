/** One normalized item the detail page renders. */
export type CollectionRowItem = {
  id: string;
  title: string;
  excerpt: string;
  coverImage: string | null;
  date: string;
  contentType: string;
  publishedAt: string | null;
  scheduledAt: string | null;
  href: string;
};

export type BucketKey = "past" | "current" | "future";

export type CollectionBucket = {
  key: BucketKey;
  items: CollectionRowItem[];
  /** Min/max publish year of items in the bucket, or null when empty. */
  fromYear: number | null;
  toYear: number | null;
};

function yearOf(iso: string | null): number | null {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d.getFullYear();
}

/** Buckets items by publish year relative to `currentYear`.
 *  - future:  scheduledAt set AND (no publishedAt OR published year > currentYear)
 *  - current: published this year
 *  - past:    published in an earlier year
 *  Items with no usable date fall into `past` (oldest-known bucket). */
export function bucketByYear(
  items: CollectionRowItem[],
  currentYear: number,
): CollectionBucket[] {
  const groups: Record<BucketKey, CollectionRowItem[]> = {
    past: [],
    current: [],
    future: [],
  };

  for (const item of items) {
    const py = yearOf(item.publishedAt);
    const sy = yearOf(item.scheduledAt);
    if (item.scheduledAt && (py == null || (py != null && py > currentYear))) {
      groups.future.push(item);
    } else if (py === currentYear) {
      groups.current.push(item);
    } else if (py != null && py < currentYear) {
      groups.past.push(item);
    } else if (py != null && py > currentYear) {
      groups.future.push(item);
    } else {
      groups.past.push(item);
    }
    void sy;
  }

  return (["past", "current", "future"] as BucketKey[]).map((key) => {
    const bucketItems = groups[key];
    const years = bucketItems
      .map((i) => yearOf(i.publishedAt) ?? yearOf(i.scheduledAt))
      .filter((y): y is number => y != null);
    return {
      key,
      items: bucketItems,
      fromYear: years.length ? Math.min(...years) : null,
      toYear: years.length ? Math.max(...years) : null,
    };
  });
}
