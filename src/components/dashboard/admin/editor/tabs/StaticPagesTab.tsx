"use client";

import { useState, useEffect } from "react";
import { EyeIcon, FileTextIcon, PenLineIcon } from "@/components/ui/icons";
import { HexIconOutlined } from "@/components/dashboard/admin/articles/articles-create/HexIconOutlined";
import { getCmsPages, type CmsPage } from "@/services/cms.service";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function StaticPagesTab() {
  const [pages, setPages] = useState<CmsPage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCmsPages()
      .then((all) => setPages(all.filter((p) => p.page_type !== "homepage")))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="rounded-xl border border-[var(--tott-card-border)] p-6">
      {loading && pages.length === 0 ? (
        <p className="py-12 text-center text-sm text-gray-500">Loading pages…</p>
      ) : (
        <div className="space-y-4">
          {pages.map((page) => (
            <div
              key={page.id}
              className="flex w-full items-center justify-between gap-4 rounded-lg border border-[var(--tott-card-border)] px-4 py-4"
            >
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <HexIconOutlined size="sm">
                  <FileTextIcon />
                </HexIconOutlined>
                <div>
                  <p className="font-medium text-foreground">{page.title}</p>
                  <p className="text-xs text-gray-500">Last edited: {formatDate(page.updatedAt)}</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span
                  className={`text-sm font-medium ${
                    page.status === "published" ? "text-emerald-500" : "text-yellow-500"
                  }`}
                >
                  {page.status === "published" ? "Published" : "Draft"}
                </span>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--tott-dash-control-hover)]"
                >
                  <span className="[&_svg]:h-4 [&_svg]:w-4">
                    <PenLineIcon />
                  </span>
                  Edit
                </button>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--tott-dash-control-hover)]"
                >
                  <span className="[&_svg]:h-4 [&_svg]:w-4">
                    <EyeIcon />
                  </span>
                  Preview
                </button>
              </div>
            </div>
          ))}
          {!loading && pages.length === 0 && (
            <p className="py-12 text-center text-sm text-gray-500">No static pages found.</p>
          )}
        </div>
      )}
    </div>
  );
}
