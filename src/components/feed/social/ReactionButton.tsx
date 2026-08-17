"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/AuthProvider";
import { usePathname } from "@/i18n/navigation";
import type { ReactionType } from "@/services/reactions.service";
import { ReactionPicker } from "./ReactionPicker";

const REACTION_LABEL_KEY: Record<ReactionType, string> = {
  like: "like",
  love: "love",
  wow: "wow",
  sad: "sad",
  angry: "angry",
};

let hoverTimer: ReturnType<typeof setTimeout> | null = null;

export function ReactionButton({
  current,
  onToggle,
  disabled,
}: {
  current: ReactionType | null;
  onToggle: (type: ReactionType) => void;
  disabled?: boolean;
}) {
  const t = useTranslations("Social.reactions");
  const tPrompt = useTranslations("Social");
  const pathname = usePathname();
  const { user, status } = useAuth();
  const isAuthed = status === "authenticated" && Boolean(user);
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  function requireAuth(): boolean {
    if (isAuthed) return true;
    toast(tPrompt("loginRequired"), {
      description: tPrompt("loginRequiredHint"),
      action: {
        label: tPrompt("logIn"),
        onClick: () => {
          window.location.href = "/auth/login?callbackUrl=" + encodeURIComponent(pathname);
        },
      },
    });
    return false;
  }

  function handleClick() {
    if (!requireAuth()) return;
    if (current) {
      // Quick single click toggles the current reaction off (or re-affirms via picker).
      setOpen((v) => !v);
      return;
    }
    setOpen((v) => !v);
  }

  function handleSelect(type: ReactionType) {
    setOpen(false);
    onToggle(type);
  }

  function handleMouseEnter() {
    if (typeof window === "undefined" || window.matchMedia("(hover: none)").matches) return;
    hoverTimer = setTimeout(() => {
      if (isAuthed) setOpen(true);
    }, 350);
  }

  function handleMouseLeave() {
    if (hoverTimer) clearTimeout(hoverTimer);
  }

  const label = current ? t(REACTION_LABEL_KEY[current]) : t("react");

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        aria-pressed={Boolean(current)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50"
        style={{
          color: current ? "var(--tott-accent-gold)" : "var(--tott-home-text-muted)",
        }}
      >
        {label}
      </button>
      {open ? (
        <ReactionPicker
          current={current}
          onSelect={handleSelect}
          onClose={() => setOpen(false)}
          anchorRef={buttonRef}
        />
      ) : null}
    </div>
  );
}
