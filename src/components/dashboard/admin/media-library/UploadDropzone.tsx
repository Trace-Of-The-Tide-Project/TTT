"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { CloudUploadIcon } from "@/components/ui/icons";
import { useUploadToMediaLibrary } from "@/hooks/mutations/media-library";

interface UploadDropzoneProps {
  folderId: string | null; // upload target; null = no folder assigned
}

interface UploadItem {
  file: File;
  percent: number;
  status: "uploading" | "done" | "error";
}

export function UploadDropzone(props: UploadDropzoneProps) {
  const t = useTranslations("Dashboard.mediaLibrary");
  const [items, setItems] = useState<UploadItem[]>([]);
  const [dragging, setDragging] = useState(false);
  const uploadMutation = useUploadToMediaLibrary();

  async function handleFiles(fileList: FileList | File[]) {
    const files = Array.from(fileList);
    if (!files.length) return;
    setItems(files.map((file) => ({ file, percent: 0, status: "uploading" as const })));
    let anyFailed = false;
    for (const file of files) {
      try {
        await uploadMutation.mutateAsync({
          file,
          folderId: props.folderId ?? undefined,
          onProgress: (percent) =>
            setItems((prev) => prev.map((it) => (it.file === file ? { ...it, percent } : it))),
        });
        setItems((prev) => prev.map((it) => (it.file === file ? { ...it, status: "done" } : it)));
      } catch {
        anyFailed = true;
        setItems((prev) => prev.map((it) => (it.file === file ? { ...it, status: "error" } : it)));
      }
    }
    if (anyFailed) toast.error(t("upload.failed"));
    else toast.success(t("upload.uploaded"));
    setItems([]);
  }

  return (
    <div>
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
        }}
        className={[
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition-colors",
          dragging
            ? "border-[var(--tott-accent-gold)] bg-[var(--tott-accent-gold)]/5"
            : "border-[var(--tott-card-border)]",
        ].join(" ")}
      >
        <input
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <CloudUploadIcon />
        <span className="text-sm text-[var(--tott-muted)]">{t("upload.dropHint")}</span>
      </label>

      {items.length > 0 && (
        <div className="mt-3 flex flex-col gap-2">
          {items.map((item, i) => (
            <div key={`${item.file.name}-${i}`} className="flex items-center gap-2 text-sm">
              <span className="min-w-0 flex-1 truncate text-[var(--tott-muted)]">{item.file.name}</span>
              {item.status === "uploading" && (
                <div className="h-1 w-24 shrink-0 overflow-hidden rounded-full bg-[var(--tott-dash-surface-inset)]">
                  <div
                    className="h-1 rounded-full"
                    style={{ width: `${item.percent}%`, backgroundColor: "var(--tott-accent-gold)" }}
                  />
                </div>
              )}
              {item.status === "done" && (
                <span className="shrink-0 text-[var(--tott-status-emerald)]">&#10003;</span>
              )}
              {item.status === "error" && <span className="shrink-0 text-red-400">&times;</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
