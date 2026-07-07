import type { TranslatableType } from "@/services/translations.service";

/**
 * Where each translatable content type is created and edited in the admin.
 * Paths are NOT locale-prefixed — the caller (which knows the active locale)
 * prepends `/${locale}` and appends any query string.
 *
 * Articles and open-calls share the same article editor, so both edit at
 * `/admin/articles/edit/:id`. Magazine-issues have no dedicated admin editor
 * route yet, so they are intentionally absent here — {@link TranslationsPanel}
 * renders nothing for a type with no route.
 */
export type TranslationRoute = {
  /** Editor path for an existing version. */
  edit: (id: string) => string;
  /** Base path for creating a new-language version. */
  create: string;
};

export const TRANSLATION_ROUTES: Partial<Record<TranslatableType, TranslationRoute>> = {
  article: {
    edit: (id) => `/admin/articles/edit/${id}`,
    create: "/admin/articles/create/article",
  },
  "open-call": {
    edit: (id) => `/admin/articles/edit/${id}`,
    create: "/admin/articles/create/open-call",
  },
  writer: {
    edit: (id) => `/admin/writers/${id}/edit`,
    create: "/admin/writers/create",
  },
  book: {
    edit: (id) => `/admin/books/${id}/edit`,
    create: "/admin/books/create",
  },
  person: {
    edit: (id) => `/admin/people/${id}/edit`,
    create: "/admin/people/create",
  },
  collection: {
    edit: (id) => `/admin/collections/${id}/edit`,
    create: "/admin/collections/create",
  },
};
