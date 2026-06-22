"use client";

import { HomePageEditorContent } from "@/components/dashboard/admin/home/HomePageEditorContent";

/**
 * Admin homepage editor tab. The homepage is now CMS-section-driven
 * (mirrors the magazine page), so this delegates to the section editor
 * which seeds/edits the `home_*` sections. Replaces the old single-hero
 * form.
 */
export function HomePageTab() {
  return <HomePageEditorContent />;
}
