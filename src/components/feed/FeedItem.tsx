import type { FeedItem as FeedItemType } from "@/services/feed.service";
import { ArticleFeedItem } from "./items/ArticleFeedItem";
import { MagazineIssueFeedItem } from "./items/MagazineIssueFeedItem";
import { BookFeedItem } from "./items/BookFeedItem";

/**
 * Discriminated-union renderer registry. Adding a future content type is one
 * new file under items/ plus one case here — the rest of the feed (stream,
 * pagination, social layer) never needs to change.
 */
export function FeedItem({ item }: { item: FeedItemType }) {
  switch (item.type) {
    case "article":
      return <ArticleFeedItem item={item} />;
    case "magazine_issue":
      return <MagazineIssueFeedItem item={item} />;
    case "book":
      return <BookFeedItem item={item} />;
    default:
      return null;
  }
}
