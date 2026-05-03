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
  | "openCall";

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
];
