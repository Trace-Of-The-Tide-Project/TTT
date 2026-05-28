# Magazine (Homepage) → Admin Control: Current State & Backend Gaps

> Scope: the public **Magazine** page (`/magazine`, file `src/app/[locale]/(withNav)/(public)/magazine/page.tsx`) — the page the team refers to as the homepage. Goal: make its content editable from the admin dashboard. This doc maps every section to its data source, lists what admin control already exists, and isolates the asks for the backend developer.

> Backend reference: `https://ttt-api-619600614028.europe-west2.run.app/api/docs` (OpenAPI parsed directly, 337 paths).

---

## 1. What the Magazine page shows and where each part comes from

| Section (component) | Data source today | Backend endpoint exists? | Editable from admin today? |
|---|---|---|---|
| **Hero** title/subtitle/image (`MagazineHero`) | `GET /magazines` (first published) → `hero_title`, `hero_subtitle`, `cover_image` | ✅ `/magazines` exists | ❌ no admin UI |
| **Manifesto**: philosophy, vision, mission, editorial values, closing quote (`MagazineManifesto`) | **i18n JSON only** (`messages/features/*/home.json`, `useTranslations`) — fully hardcoded | ⚠️ entity *type* has `philosophy_quote`/`vision_body`/`mission_body` but the page ignores them | ❌ only by editing JSON + redeploy |
| **Explore Spaces** cards (Writing Room / Reading Salon) | i18n JSON, hardcoded links | n/a | ❌ |
| **Publications** (latest articles) | `GET /articles?status=published&sortBy=published_at` | ✅ | partially — articles are managed under `/admin/articles` |
| **Issues** (`MagazineIssues`) | `GET /magazine-issues?status=published` | ✅ `/magazine-issues` exists | ❌ no admin UI |
| **Editorial Board** — less-read articles | `GET /articles?sortBy=view_count&order=ASC` | ✅ | via articles |
| **Editorial Board** — featured writers | `GET /writers/featured` → fallback `GET /writers` | ✅ `/writers`, `/writers/featured` exist | ❌ no admin UI |
| **Editorial Board** — founder quote | `GET /magazines` → `founder_quote`, `founder_name` | ✅ | ❌ |
| **Support** (collaborations) | `GET /contributions` | ✅ | via `/admin/contributions-analytics` |
| **Newsletter** signup | `POST /newsletter-subscribers/subscribe` (requires `magazine_id`) | ✅ full lifecycle exists | subscribers list `GET /newsletter-subscribers` exists, no admin UI |
| Tab labels, newsletter copy, CTAs | i18n JSON, hardcoded | n/a | ❌ |

**Takeaway:** the data-driven sections (hero, issues, writers, articles, contributions, newsletter) all have backend endpoints. The *editorial copy* (manifesto, spaces, labels) is hardcoded in translation files and is not backed by any API.

---

## 2. Admin control that already exists

There is a **Visual Editor** at `/admin/editor` (`src/components/dashboard/admin/editor/`) wired to the backend **CMS module**:

- `GET /cms/pages/slug/homepage`, `PATCH /cms/pages/{id}/sections/{sectionId}` (edit), `.../toggle` (show/hide), `PATCH .../publish`, `GET/PATCH /cms/settings`.
- The `HomePageTab` lets an admin edit a generic **hero** section config (`headline`, `subheadline`, `primary_cta`, `secondary_cta`, background image) and toggle section visibility.

**Two problems with the existing editor (frontend):**

1. **Its edits render nowhere.** The editor reads/writes a CMS page with slug `homepage`. Neither public page consumes `/cms/*`:
   - `/magazine` (`MagazinePreviewPage`) reads `/magazines` + i18n.
   - `/home` (`Home`) reads `/articles` only.
   So edits made in the Visual Editor do **not** appear on either page. The CMS module is effectively orphaned from the live frontend.
2. **It is mostly a shell.** Only the `hero` section has a form. Other sections only support show/hide. "Add Section" and drag-to-reorder are not implemented.

---

## 3. Asks for the backend developer

The backend is more complete than expected — most endpoints exist. The genuine gaps:

1. **🔴 BLOCKING — Confirm/expose the Magazine entity's editorial fields + write DTO.**
   `POST /magazines` and `PATCH /magazines/{id}` have **no documented request schema** in the OpenAPI spec. The frontend already reads these fields off the entity, but we cannot confirm the columns even exist or are settable:
   `hero_title`, `hero_subtitle`, `cover_image`, `founder_quote`, `founder_name`, `philosophy_quote`, `vision_body`, `mission_body`, `description`, `meta`.
   → Please add/confirm these columns on the Magazine entity, expose them in the create/update DTO, and document them in Swagger (`@ApiProperty`).
   **Answer this first:** if `philosophy_quote`/`vision_body`/`mission_body` don't exist on the table, the manifesto cannot be moved off hardcoded i18n at all — that decision blocks gap #2 below.

2. **Decide where editable manifesto copy lives.** Today philosophy/vision/mission/editorial-values/closing-quote and the "Explore Spaces" cards are hardcoded i18n strings. To make them admin-editable, pick one:
   - put them on the Magazine entity (fields above + an array for `editorial_values` and the spaces cards), **or**
   - model them as `/cms` section `config` blocks.
   → Backend confirmation of the chosen shape is needed before frontend can wire it.

3. **Localization of admin-entered content.** The page is multilingual (ar/fr/es/en) but the Magazine entity fields look single-language. Articles already have `GET /articles/{id}/translations`. → Need an equivalent per-locale story for magazine/issue copy if admin text must be translatable.

4. **Confirm request DTOs / Swagger for `POST /magazine-issues` and `POST /newsletter-subscribers/subscribe`** (also undocumented). Frontend needs the field list for issues (`title`, `slug`, `kind`, `cover_image`, `excerpt`, `page_count`, `edition`, `category`, `magazine_id`, `published_at`) confirmed.

5. **Featured writers** — the writers DTO already has `featured: boolean` ✅. Confirm `PATCH /writers/{id}` accepts toggling it (no documented body). That's all that's needed to let admins curate the Editorial Board strip.

---

## 4. Frontend work that needs NO backend change

These admin endpoints already exist and just need dashboard UI built:

- **Magazines**: `GET/POST /magazines`, `PATCH/DELETE /magazines/{id}` — create/edit the masthead, hero, founder quote.
- **Magazine Issues**: `GET/POST /magazine-issues`, `PATCH/DELETE /magazine-issues/{id}` — CRUD the Issues pane.
- **Writers / Editorial Board**: `GET/POST /writers`, `PATCH /writers/{id}` (set `featured`).
- **Newsletter subscribers**: `GET /newsletter-subscribers`, confirm/unsubscribe/delete.
- (Optional) repoint the Visual Editor at the actual page the Magazine route consumes, or replace it with magazine-specific admin screens.

---

## Verified endpoint inventory (magazine-relevant)

```
/magazines                         GET, POST
/magazines/slug/{slug}             GET
/magazines/{id}                    GET, PATCH, DELETE
/magazine-issues                   GET, POST
/magazine-issues/slug/{slug}       GET
/magazine-issues/{id}              GET, PATCH, DELETE
/writers                           GET, POST
/writers/featured                  GET
/writers/{id}                      GET, PATCH, DELETE
/writers/{id}/collaborate          POST
/writers/{id}/support              POST
/newsletter-subscribers            GET
/newsletter-subscribers/subscribe  POST
/newsletter-subscribers/{id}                PATCH(confirm), PATCH(unsubscribe), DELETE
/cms/pages, /cms/pages/{id}/sections/...    GET/POST/PATCH/DELETE (+publish, +toggle, +reorder)
/cms/settings                      GET, PATCH
/articles, /contributions          full CRUD (already used)
```
