"use client";

import {
  ArticleGlyph,
  ArtworkGlyph,
  AudioGlyph,
  ThreadGlyph,
  TripGlyph,
  VideoGlyph,
} from "@/components/dashboard/admin/articles/articles-create/template-glyphs";
import type { ReactNode } from "react";

export type CreateTemplateKey =
  | "article"
  | "video"
  | "audio"
  | "thread"
  | "artwork"
  | "figma"
  | "trip"
  | "openCall"
  | "interview"
  | "comic"
  | "literary";

export type CreateTemplateFilterId =
  | "all"
  | "articles"
  | "films"
  | "audio"
  | "thread"
  | "artwork";

export const createTemplateFilterIds: CreateTemplateFilterId[] = [
  "all",
  "articles",
  "films",
  "audio",
  "thread",
  "artwork",
];

export type CreateTemplateDef = {
  number: string;
  templateKey: CreateTemplateKey;
  icon: ReactNode;
  href?: string;
  category: string;
};

export const createTemplates: CreateTemplateDef[] = [
  {
    number: "01",
    templateKey: "article",
    icon: <ArticleGlyph />,
    href: "/admin/articles/create/article",
    category: "articles",
  },
  {
    number: "02",
    templateKey: "video",
    icon: <VideoGlyph />,
    href: "/admin/articles/create/video",
    category: "films",
  },
  {
    number: "03",
    templateKey: "audio",
    icon: <AudioGlyph />,
    href: "/admin/articles/create/audio",
    category: "audio",
  },
  {
    number: "04",
    templateKey: "thread",
    icon: <ThreadGlyph />,
    href: "/admin/articles/create/thread",
    category: "thread",
  },
  {
    number: "05",
    templateKey: "artwork",
    icon: <ArtworkGlyph />,
    href: "/admin/articles/create/artwork",
    category: "artwork",
  },
  {
    number: "06",
    templateKey: "figma",
    icon: <ArtworkGlyph />,
    category: "artwork",
  },
  {
    number: "07",
    templateKey: "trip",
    icon: <TripGlyph />,
    href: "/admin/trips",
    category: "articles",
  },
  {
    number: "08",
    templateKey: "openCall",
    icon: <ArticleGlyph />,
    href: "/admin/articles/create/open-call",
    category: "articles",
  },
  {
    number: "09",
    templateKey: "interview",
    icon: <ArticleGlyph />,
    href: "/admin/articles/create/interview",
    category: "articles",
  },
  {
    number: "10",
    templateKey: "comic",
    icon: <ArtworkGlyph />,
    href: "/admin/articles/create/comic",
    category: "artwork",
  },
  {
    number: "11",
    templateKey: "literary",
    icon: <ArticleGlyph />,
    href: "/admin/articles/create/literary",
    category: "articles",
  },
];

/** Magazine create picker: same templates as the main flow, minus the three
 * that don't route through CreateContentEditor there either (trip has its
 * own admin section, open-call uses a dedicated layout, figma has no route
 * yet) — hrefs point at the magazine-scoped create routes instead. */
const MAGAZINE_TEMPLATE_KEYS: CreateTemplateKey[] = [
  "article",
  "video",
  "audio",
  "thread",
  "artwork",
  "interview",
  "comic",
  "literary",
];

export const magazineCreateTemplates: CreateTemplateDef[] = createTemplates
  .filter((template) => MAGAZINE_TEMPLATE_KEYS.includes(template.templateKey))
  .map((template) => ({
    ...template,
    href: `/admin/magazine/articles/create/${template.templateKey}`,
  }));
