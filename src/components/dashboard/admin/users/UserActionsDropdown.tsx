"use client";

import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { MoreDotsIcon } from "@/components/ui/icons";

type ActionItem = {
  id: string;
  labelKey: "viewProfile" | "editUser" | "changeRole" | "verifyUser" | "suspendUser";
  destructive?: boolean;
};

const ACTIONS: ActionItem[] = [
  { id: "view", labelKey: "viewProfile" },
  { id: "edit", labelKey: "editUser" },
  { id: "role", labelKey: "changeRole" },
  { id: "verify", labelKey: "verifyUser" },
  { id: "suspend", labelKey: "suspendUser", destructive: true },
];

const MENU_WIDTH = 176;
const MENU_GAP = 4;

type UserActionsDropdownProps = {
  userId: string;
  onAction?: (actionId: string, userId: string) => void;
};

export function UserActionsDropdown({ userId, onAction }: UserActionsDropdownProps) {
  const t = useTranslations("Dashboard.usersManagement.rowActions");
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!isOpen || !buttonRef.current) return;
    const r = buttonRef.current.getBoundingClientRect();
    const isRtl = document.documentElement.dir === "rtl";
    const left = isRtl ? r.left : r.right - MENU_WIDTH;
    const top = r.bottom + MENU_GAP;
    setCoords({
      top,
      left: Math.max(8, Math.min(left, window.innerWidth - MENU_WIDTH - 8)),
    });
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        buttonRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      setIsOpen(false);
    }
    function handleDismiss() {
      setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleDismiss, true);
    window.addEventListener("resize", handleDismiss);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleDismiss, true);
      window.removeEventListener("resize", handleDismiss);
    };
  }, [isOpen]);

  const menu =
    isOpen && coords && typeof document !== "undefined"
      ? createPortal(
          <div
            ref={menuRef}
            className="fixed z-50 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-inset)] py-1 shadow-lg"
            style={{ top: coords.top, left: coords.left, width: MENU_WIDTH }}
            role="menu"
          >
            {ACTIONS.map((action) => (
              <button
                key={action.id}
                type="button"
                role="menuitem"
                onClick={() => {
                  onAction?.(action.id, userId);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2 text-start text-sm transition-colors hover:bg-[var(--tott-dash-ghost-hover)] ${
                  action.destructive ? "text-red-400 hover:bg-red-500/10" : "text-foreground"
                }`}
              >
                {t(action.labelKey)}
              </button>
            ))}
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className="rounded p-1.5 transition-colors hover:bg-[var(--tott-dash-ghost-hover)]"
        style={{ color: "#A3A3A3" }}
        aria-label={t("menuAria")}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <MoreDotsIcon />
      </button>
      {menu}
    </>
  );
}
