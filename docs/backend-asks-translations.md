# Backend Asks — Extend translation groups to writers, books & people

> **STATUS (2026-06-24): 🟡 proposed — frontend wired ahead, dark behind a flag.**
>
> The frontend for these types is built and merged, but gated off by
> `NEXT_PUBLIC_FEATURE_EXTENDED_TRANSLATIONS`. Flip it to `true` once the
> endpoints below ship and the UI lights up with no further frontend change.
>
> Backend reference: `https://ttt-api-619600614028.europe-west2.run.app/api/docs`.

---

## Why

Admins can already translate **articles, open-calls, collections and magazine
issues**: each language version is a separate record sharing a
`translation_group_id`, tagged with a `language` ISO code, and the group is read
at `GET /<type>/:id/translations`. The dashboard renders a language-chip switcher
(`TranslationsPanel`) from that endpoint and creates new-language versions via
`POST /<type>` with `language` + `translation_of`.

We want the **same model** for the content types that currently store only one
language: **writers, books and people** (e.g. a writer's bio in both Arabic and
English). The frontend already speaks this contract — it just needs the columns
and endpoints below.

This reuses the existing pattern exactly; it is **not** a new mechanism. See
`src/services/translations.service.ts` for the shared client.

---

## Shared contract (identical to the existing 4 types)

For each type below, with API prefix `P`:

### 1. Columns

Add to the table:

| Column | Type | Notes |
|---|---|---|
| `language` | text | ISO code: `en` \| `ar` \| `es` \| `fr` (writers/people). Books also allow `de`. Default `en`. |
| `translation_group_id` | uuid (or text) | Shared across all language versions of one item. On the first/original record, set it to the row's own id (or a fresh uuid). |

### 2. Create accepts translation linking

`POST /P` additionally accepts (both optional):

```jsonc
{
  // ...existing create fields...
  "language": "ar",            // version language; defaults to "en" if omitted
  "translation_of": "<id>"     // id of the source row this translates
}
```

Behaviour when `translation_of` is present:
- Look up the source row, copy its `translation_group_id` onto the new row.
- If the source has no group yet, assign one to **both** rows.
- Reject (409) if a version in that `language` already exists in the group.

When `translation_of` is absent, the row is an original: assign it a fresh
`translation_group_id` and use `language` (default `en`).

### 3. Read the group

```
GET /P/:id/translations            → 200 (or 404 if id unknown)
```

Response shape (must match `unwrapGroup` in `translations.service.ts` —
it also accepts the body wrapped in `data`):

```jsonc
{
  "group": "<translation_group_id>",
  "original": { "id": "...", "language": "en", "title": "...", "status": null } | null,
  "translations": [ { "id": "...", "language": "ar", "title": "...", "status": null } ],
  "versions":     [ /* original + translations, every version */ ]
}
```

Each version object: `{ id, language, slug?, status?, title? }`.
**`title` mapping per type** (the chip switcher shows it):

| Type | `title` comes from |
|---|---|
| writer | `pen_name` |
| book | `title` |
| person | `full_name` |

`PATCH /P/:id` should **not** move a row between languages — language is fixed at
create. (The frontend never sends `language` on update.)

---

## Ask #1 — Writer profiles  (`P = /writers`)

- Columns `language`, `translation_group_id` on `writer_profiles`.
- `POST /writers` accepts `language` + `translation_of`.
  - A translation reuses the **same `user_id`** as the source (the frontend
    sends the source's `user_id`); allow multiple `writer_profiles` per user as
    long as they differ in `language` within the group.
- `GET /writers/:id/translations` (title ← `pen_name`).

## Ask #2 — Books  (`P = /knowledge/books`)

- `books` already has `language` ✅ — only add `translation_group_id`.
- `POST /knowledge/books` accepts `translation_of` (it already takes `language`).
- `GET /knowledge/books/:id/translations` (title ← `title`).

## Ask #3 — People  (`P = /people`)

- Columns `language`, `translation_group_id` on `people`.
- `POST /people` accepts `language` + `translation_of`.
- `GET /people/:id/translations` (title ← `full_name`).

---

## Public-side resolution (needed for the feature to be visible to readers)

The admin side links the versions; the **public** pages must then serve the
reader's locale. Please add, for each type:

- A `language` filter on the list reads, e.g. `GET /writers?language=ar`,
  **or** have the public read return the version matching the request locale
  within each group (falling back to the original when the requested language
  is missing). Either is fine — tell us which and we'll point the public
  queries at it.
- Detail reads (`GET /writers/:id`, `/people/:id`, `/knowledge/books/:id`)
  should expose `language` + `translation_group_id` so the public page can offer
  a language switch to sibling versions.

Without this, admins can author translations but readers always see the original.

---

## Taxonomy (categories / tags / badges) — different model, design note

These were requested too, but the translation-group pattern is the **wrong fit**:
taxonomy rows are referenced by id from many content rows, so splitting one tag
into four language rows would fork every reference. The right model is a single
row with a **localized name/description**, e.g.:

```jsonc
// categories / tags / badges
{ "id": "...", "name_i18n": { "en": "Poetry", "ar": "شعر" }, "slug": "poetry" }
```

Proposal: add `name_i18n` (and `description_i18n` where relevant) JSON columns,
keep `slug` language-neutral, and have reads resolve `name_i18n[locale]` with an
`en` fallback. This is a separate, smaller change — flagged here so it isn't
accidentally built as translation groups. Frontend wiring for taxonomy is **not**
yet done pending agreement on this shape.

---

## Frontend status (what's already merged against this contract)

- `src/services/translations.service.ts` — `writer`, `book`, `person` added to
  the translatable map; `EXTENDED_TRANSLATIONS_ENABLED` flag + `isTranslatableNow()`.
- `TranslationsPanel` generalized to route per content type
  (`translation-routes.ts`) — no longer hardcoded to `/admin/articles`.
- Writer / book / person service types carry `language` + `translation_group_id`;
  payloads carry `language` + `translation_of`.
- `WriterFormContent`, `BookFormContent`, `PersonFormContent`:
  - read `?language=&translation_of=` on the create route,
  - clone the source row's fields so admins only translate the text,
  - render the language-chip panel in edit mode,
  - send `language`/`translation_of` **only when the flag is on** (so the
    current backend never receives unknown columns).

### Known follow-ups
- Open-call **edit-mode** language panel: the create-translation flow works, but
  the bespoke open-call editor doesn't yet render `TranslationsPanel`
  (`contentType="open-call"`). Small wiring task once verified the open-call
  translations endpoint is live.
