"use client";

import {
  PenLineIcon,
  FilmIcon,
  MusicIcon,
  ThreadIcon,
  PaletteIcon,
  MapPinIcon,
  MegaphoneIcon,
} from "@/components/ui/icons";
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
    icon: <PenLineIcon />,
    href: "/admin/articles/create/article",
    category: "articles",
  },
  {
    number: "02",
    templateKey: "video",
    icon: <FilmIcon />,
    href: "/admin/articles/create/video",
    category: "films",
  },
  {
    number: "03",
    templateKey: "audio",
    icon: <MusicIcon />,
    href: "/admin/articles/create/audio",
    category: "audio",
  },
  {
    number: "04",
    templateKey: "thread",
    icon: <ThreadIcon />,
    href: "/admin/articles/create/thread",
    category: "thread",
  },
  {
    number: "05",
    templateKey: "artwork",
    icon: <PaletteIcon />,
    category: "artwork",
  },
  {
    number: "06",
    templateKey: "figma",
    icon: <PaletteIcon />,
    category: "artwork",
  },
  {
    number: "07",
    templateKey: "trip",
    icon: <MapPinIcon />,
    href: "/admin/trips",
    category: "articles",
  },
  {
    number: "08",
    templateKey: "openCall",
    icon: <MegaphoneIcon />,
    href: "/admin/articles/create/open-call",
    category: "articles",
  },
];
