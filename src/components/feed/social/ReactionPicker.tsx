"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { REACTION_TYPES, type ReactionType } from "@/services/reactions.service";

const REACTION_LABEL_KEY: Record<ReactionType, string> = {
  like: "like",
  love: "love",
  wow: "wow",
  sad: "sad",
  angry: "angry",
};

export function ReactionPicker({
  current,
  onSelect,
  onClose,
  anchorRef,
}: {
  current: ReactionType | null;
  onSelect: (type: ReactionType) => void;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement | null>;
}) {
  const t = useTranslations("Social.reactions");
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const [flipUp, setFlipUp] = useState(true);

  useEffect(() => {
    const anchor = anchorRef.current;
    if (anchor) {
      const rect = anchor.getBoundingClientRect();
      setFlipUp(rect.top > 120);
    }
  }, [anchorRef]);

  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  function onKeyDownRoving(e: React.KeyboardEvent, idx: number) {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      const dir = e.key === "ArrowRight" ? 1 : -1;
      const next = (idx + dir + REACTION_TYPES.length) % REACTION_TYPES.length;
      const btn = rootRef.current?.querySelectorAll<HTMLButtonElement>("button[data-reaction]")[
        next
      ];
      btn?.focus();
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        ref={rootRef}
        role="menu"
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: flipUp ? 6 : -6, scale: 0.97 }}
        animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: flipUp ? 6 : -6, scale: 0.97 }}
        transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="absolute z-20 flex items-center gap-1 rounded-full p-1.5 shadow-lg"
        style={{
          [flipUp ? "bottom" : "top"]: "calc(100% + 8px)",
          insetInlineStart: 0,
          backgroundColor: "var(--tott-dash-surface, #1c1c1c)",
          border: "1px solid var(--tott-card-border)",
        }}
      >
        {REACTION_TYPES.map((type, idx) => (
          <button
            key={type}
            type="button"
            data-reaction={type}
            role="menuitemradio"
            aria-checked={current === type}
            aria-label={t(REACTION_LABEL_KEY[type])}
            tabIndex={0}
            onKeyDown={(e) => onKeyDownRoving(e, idx)}
            onClick={() => onSelect(type)}
            className="flex h-9 min-w-9 items-center justify-center rounded-full px-2.5 text-xs font-medium transition-transform duration-150 hover:scale-110 focus-visible:outline focus-visible:outline-2"
            style={{
              backgroundColor:
                current === type ? "var(--tott-gold-chip-bg)" : "transparent",
              color:
                current === type ? "var(--tott-gold-chip-ink)" : "var(--tott-home-text-strong)",
              outlineColor: "var(--tott-accent-gold)",
            }}
          >
            {t(REACTION_LABEL_KEY[type])}
          </button>
        ))}
      </motion.div>
    </AnimatePresence>
  );
}
