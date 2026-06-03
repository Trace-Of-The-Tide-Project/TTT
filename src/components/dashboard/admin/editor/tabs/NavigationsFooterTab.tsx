"use client";

import { useState } from "react";
import { GripVerticalIcon, PlusIcon } from "@/components/ui/icons";
import { theme } from "@/lib/theme";
import { useCmsSettings } from "@/hooks/queries/cms";
import { useUpdateCmsSetting } from "@/hooks/mutations/cms";

type NavLink = { id: string; text: string; path: string; enabled: boolean };

type SaveState = "idle" | "saving" | "saved" | "error";

function NavFooterToggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? "" : "bg-[var(--tott-dash-control-bg)]"}`}
      style={checked ? { backgroundColor: theme.accentGoldFocus } : undefined}
    >
      <span
        className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${checked ? "left-6" : "left-1"}`}
      />
    </button>
  );
}

function SaveButton({ state, onSave }: { state: SaveState; onSave: () => void }) {
  return (
    <button
      type="button"
      onClick={onSave}
      disabled={state === "saving"}
      className={`mt-4 w-full rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 ${
        state === "saved"
          ? "border-emerald-600/50 bg-emerald-600/20 text-emerald-400"
          : state === "error"
            ? "border-red-600/50 bg-red-600/20 text-red-400"
            : "border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)] text-foreground hover:bg-[var(--tott-dash-control-hover)]"
      }`}
    >
      {state === "saving" ? "Saving…" : state === "saved" ? "Saved" : state === "error" ? "Error — retry" : "Save"}
    </button>
  );
}

export function NavigationsFooterTab() {
  const [navLinks, setNavLinks] = useState<NavLink[]>([]);
  const [footerText, setFooterText] = useState("");
  const [twitter, setTwitter] = useState("");
  const [instagram, setInstagram] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [navSave, setNavSave] = useState<SaveState>("idle");
  const [footerSave, setFooterSave] = useState<SaveState>("idle");

  const { data: settings } = useCmsSettings();
  const updateMutation = useUpdateCmsSetting();

  // Seed form fields from the loaded CMS settings. Render-phase
  // prev-value pattern instead of an effect.
  const [prevSettings, setPrevSettings] = useState(settings);
  if (settings && settings !== prevSettings) {
    setPrevSettings(settings);
    const nav = settings.navigation as { links?: Array<{ label?: string; url?: string; order?: number; is_visible?: boolean }> } | undefined;
    if (nav?.links && nav.links.length > 0) {
      setNavLinks(
        nav.links.map((l, i) => ({
          id: String(i),
          text: l.label ?? "",
          path: l.url ?? "",
          enabled: l.is_visible ?? true,
        }))
      );
    } else {
      setNavLinks(
        Array.from({ length: 6 }, (_, i) => ({ id: String(i), text: "", path: "", enabled: true }))
      );
    }

    const footer = settings.footer as { text?: string; social_links?: { twitter?: string; instagram?: string; linkedin?: string } } | undefined;
    if (footer) {
      setFooterText(footer.text ?? "");
      setTwitter(footer.social_links?.twitter ?? "");
      setInstagram(footer.social_links?.instagram ?? "");
      setLinkedin(footer.social_links?.linkedin ?? "");
    }
  }

  const updateNavLink = (id: string, field: keyof NavLink, value: string | boolean) => {
    setNavLinks((prev) => prev.map((l) => (l.id === id ? { ...l, [field]: value } : l)));
  };

  const addNavLink = () => {
    setNavLinks((prev) => [...prev, { id: String(Date.now()), text: "", path: "", enabled: true }]);
  };

  const handleSaveNav = () => {
    setNavSave("saving");
    updateMutation.mutate(
      {
        key: "navigation",
        value: {
          links: navLinks.map((l, i) => ({
            label: l.text,
            url: l.path,
            order: i + 1,
            is_visible: l.enabled,
          })),
        },
      },
      {
        onSuccess: () => {
          setNavSave("saved");
          setTimeout(() => setNavSave("idle"), 2500);
        },
        onError: () => {
          setNavSave("error");
          setTimeout(() => setNavSave("idle"), 3000);
        },
      },
    );
  };

  const handleSaveFooter = () => {
    setFooterSave("saving");
    updateMutation.mutate(
      {
        key: "footer",
        value: {
          text: footerText,
          social_links: { twitter, instagram, linkedin },
        },
      },
      {
        onSuccess: () => {
          setFooterSave("saved");
          setTimeout(() => setFooterSave("idle"), 2500);
        },
        onError: () => {
          setFooterSave("error");
          setTimeout(() => setFooterSave("idle"), 3000);
        },
      },
    );
  };

  return (
    <div className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-2" role="region" aria-label="Navigations and footer configuration">
      {/* Header Navigation */}
      <div
        className="isolate min-w-0 overflow-visible rounded-xl border border-[var(--tott-card-border)] p-6"
        role="group"
        aria-label="Header navigation configuration"
      >
        <h3 className="text-sm font-semibold text-foreground">Header Navigation</h3>
        <p className="mt-1 text-xs text-gray-500">Configure main navigation links</p>
        <div className="mt-4 space-y-4">
          {navLinks.map((link) => (
            <div key={link.id} className="flex min-w-0 items-center gap-3">
              <span className="cursor-grab text-gray-500" aria-label="Reorder">
                <GripVerticalIcon />
              </span>
              <input
                type="text"
                placeholder="Text"
                value={link.text}
                onChange={(e) => updateNavLink(link.id, "text", e.target.value)}
                className="min-w-0 flex-1 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-4 py-2.5 text-sm text-foreground placeholder-gray-500 focus:border-[#555] focus:outline-none"
              />
              <input
                type="text"
                placeholder="/path"
                value={link.path}
                onChange={(e) => updateNavLink(link.id, "path", e.target.value)}
                className="min-w-0 flex-1 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-4 py-2.5 text-sm text-foreground placeholder-gray-500 focus:border-[#555] focus:outline-none"
              />
              <NavFooterToggle
                checked={link.enabled}
                onChange={(v) => updateNavLink(link.id, "enabled", v)}
              />
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addNavLink}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)] py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--tott-dash-control-hover)]"
        >
          <span className="[&_svg]:h-4 [&_svg]:w-4">
            <PlusIcon />
          </span>
          Add Link
        </button>
        <SaveButton state={navSave} onSave={handleSaveNav} />
      </div>

      {/* Footer */}
      <div
        className="isolate overflow-hidden rounded-xl border border-[var(--tott-card-border)] p-6"
        role="group"
        aria-label="Footer configuration"
      >
        <h3 className="text-sm font-semibold text-foreground">Footer</h3>
        <p className="mt-1 text-xs text-gray-500">Configure footer content and links</p>
        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-foreground">Footer Text</label>
            <textarea
              placeholder="© 2024 TTT. All rights reserved."
              rows={3}
              value={footerText}
              onChange={(e) => setFooterText(e.target.value)}
              className="w-full resize-none rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-4 py-2.5 text-sm text-foreground placeholder-gray-500 focus:border-[#555] focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-foreground">Social Links</label>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Twitter URL"
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
                className="w-full rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-4 py-2.5 text-sm text-foreground placeholder-gray-500 focus:border-[#555] focus:outline-none"
              />
              <input
                type="text"
                placeholder="Instagram URL"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                className="w-full rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-4 py-2.5 text-sm text-foreground placeholder-gray-500 focus:border-[#555] focus:outline-none"
              />
              <input
                type="text"
                placeholder="LinkedIn URL"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                className="w-full rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-4 py-2.5 text-sm text-foreground placeholder-gray-500 focus:border-[#555] focus:outline-none"
              />
            </div>
          </div>
        </div>
        <SaveButton state={footerSave} onSave={handleSaveFooter} />
      </div>
    </div>
  );
}
