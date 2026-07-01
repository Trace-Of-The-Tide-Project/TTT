import { api } from "./api";
import { routing } from "@/i18n/routing";

/** A single line in the user's cart, as returned by GET /commerce/cart. */
export type CartItem = {
  book_id: string;
  title: string;
  author?: string | null;
  cover_image?: string | null;
  price: number;
  currency: string;
};

export type CartResponse = {
  items: CartItem[];
  meta: { count: number; subtotal: number; currency: string };
};

/** A book the user owns, as returned by GET /me/library. */
export type LibraryBook = {
  id: string;
  title: string;
  author?: string | null;
  cover_image?: string | null;
  genre?: string | null;
  language?: string | null;
  price_paid?: number | string | null;
  currency?: string | null;
  purchased_at?: string;
};

const EMPTY_CART: CartResponse = {
  items: [],
  meta: { count: 0, subtotal: 0, currency: "USD" },
};

/** Unwrap the ResponseInterceptor envelope `{ status, results, data, meta }`. */
function unwrap<T>(raw: unknown): T | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  return (("data" in o ? o.data : o) as T) ?? null;
}

function asCart(raw: unknown): CartResponse {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  // Cart endpoints return { items, meta }; the interceptor wraps non-{rows,meta}
  // objects as { data: { items, meta } }.
  const inner = (("data" in o ? o.data : o) ?? {}) as Record<string, unknown>;
  const items = Array.isArray(inner.items) ? (inner.items as CartItem[]) : [];
  const meta =
    (inner.meta as CartResponse["meta"]) ?? EMPTY_CART.meta;
  return { items, meta };
}

/** GET /commerce/cart */
export async function getCart(): Promise<CartResponse> {
  try {
    const { data } = await api.get<unknown>("/commerce/cart");
    return asCart(data);
  } catch {
    return EMPTY_CART;
  }
}

/** POST /commerce/cart — add a book; returns the updated cart. */
export async function addToCart(bookId: string): Promise<CartResponse> {
  const { data } = await api.post<unknown>("/commerce/cart", {
    book_id: bookId,
  });
  return asCart(data);
}

/** DELETE /commerce/cart/:bookId */
export async function removeFromCart(bookId: string): Promise<CartResponse> {
  const { data } = await api.delete<unknown>(
    `/commerce/cart/${encodeURIComponent(bookId)}`,
  );
  return asCart(data);
}

/** DELETE /commerce/cart */
export async function clearCart(): Promise<CartResponse> {
  const { data } = await api.delete<unknown>("/commerce/cart");
  return asCart(data);
}

/**
 * POST /commerce/checkout — create a Stripe Checkout Session for the current
 * cart and return the hosted-page URL to redirect to.
 */
export async function createCheckout(locale?: string): Promise<string> {
  const safeLocale =
    locale && (routing.locales as readonly string[]).includes(locale)
      ? locale
      : routing.defaultLocale;
  const { data } = await api.post<unknown>("/commerce/checkout", {
    locale: safeLocale,
  });
  const inner = unwrap<{ url?: string }>(data);
  if (!inner?.url) throw new Error("Checkout did not return a URL");
  return inner.url;
}

/** GET /me/library — books the user owns. */
export async function getLibrary(): Promise<LibraryBook[]> {
  try {
    const { data } = await api.get<unknown>("/me/library");
    const o = (data ?? {}) as Record<string, unknown>;
    // Library uses the { rows, meta } shape → interceptor emits { data: rows }.
    const rows = "data" in o ? o.data : o;
    return Array.isArray(rows) ? (rows as LibraryBook[]) : [];
  } catch {
    return [];
  }
}

/** GET /commerce/entitlements/check?book_id= */
export async function checkOwnership(bookId: string): Promise<boolean> {
  try {
    const { data } = await api.get<unknown>(
      "/commerce/entitlements/check",
      { params: { book_id: bookId } },
    );
    const inner = unwrap<{ owned?: boolean }>(data);
    return Boolean(inner?.owned);
  } catch {
    return false;
  }
}

/** GET /commerce/entitlements/check-article?article_id= */
export async function checkArticleOwnership(articleId: string): Promise<boolean> {
  try {
    const { data } = await api.get<unknown>(
      "/commerce/entitlements/check-article",
      { params: { article_id: articleId } },
    );
    const inner = unwrap<{ owned?: boolean }>(data);
    return Boolean(inner?.owned);
  } catch {
    return false;
  }
}

/**
 * POST /commerce/checkout/article/:id — create a Stripe Checkout Session to
 * purchase a single paid article and return the hosted-page URL.
 */
export async function createArticleCheckout(
  articleId: string,
  locale?: string,
): Promise<string> {
  const safeLocale =
    locale && (routing.locales as readonly string[]).includes(locale)
      ? locale
      : routing.defaultLocale;
  const { data } = await api.post<unknown>(
    `/commerce/checkout/article/${encodeURIComponent(articleId)}`,
    { locale: safeLocale },
  );
  const inner = unwrap<{ url?: string }>(data);
  if (!inner?.url) throw new Error("Checkout did not return a URL");
  return inner.url;
}
