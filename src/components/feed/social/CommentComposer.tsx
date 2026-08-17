"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/AuthProvider";
import { usePathname } from "@/i18n/navigation";

export function CommentComposer({
  onSubmit,
  isPending,
  placeholder,
  autoFocus,
}: {
  onSubmit: (content: string) => void;
  isPending?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  const t = useTranslations("Social");
  const pathname = usePathname();
  const { user, status } = useAuth();
  const isAuthed = status === "authenticated" && Boolean(user);
  const [value, setValue] = useState("");

  function handleFocus() {
    if (isAuthed) return;
    toast(t("loginRequired"), {
      description: t("loginRequiredHint"),
      action: {
        label: t("logIn"),
        onClick: () => {
          window.location.href = "/auth/login?callbackUrl=" + encodeURIComponent(pathname);
        },
      },
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || !isAuthed || isPending) return;
    onSubmit(trimmed);
    setValue("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-start gap-2">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={handleFocus}
        autoFocus={autoFocus}
        rows={1}
        placeholder={placeholder ?? t("writeComment")}
        className="min-h-9 flex-1 resize-none rounded-lg px-3 py-2 text-sm outline-none"
        style={{
          backgroundColor: "var(--tott-panel-bg)",
          border: "1px solid var(--tott-card-border)",
          color: "var(--tott-home-text-strong)",
        }}
      />
      <button
        type="submit"
        disabled={!value.trim() || isPending}
        className="shrink-0 rounded-lg px-3 py-2 text-xs font-medium transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
        style={{
          backgroundColor: "var(--tott-accent-gold)",
          color: "var(--tott-auth-btn-text)",
        }}
      >
        {t("post")}
      </button>
    </form>
  );
}
