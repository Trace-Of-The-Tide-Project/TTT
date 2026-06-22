"use client";

import { useEffect, useCallback, useState } from "react";
import { XIcon } from "@/components/ui/icons";

type MaintenanceModalProps = {
  open: boolean;
  onClose: () => void;
};

export function MaintenanceModal({ open, onClose }: MaintenanceModalProps) {
  const [enabled, setEnabled] = useState(false);
  const [message, setMessage] = useState("");
  const [duration, setDuration] = useState("1 hour");

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, handleKeyDown]);

  const handleEnable = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: wire to API
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label="Close modal"
      />

      <div className="relative mx-4 w-full max-w-lg rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] p-6">
        <div className="mb-5 flex items-start justify-between border-b border-[var(--tott-card-border)] pb-5">
          <div>
            <h2 className="text-lg font-bold text-foreground">Maintenance Mode</h2>
            <p className="mt-1 text-sm text-gray-500">
              Enable maintenance mode to temporarily disable user access to the platform.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-1 text-gray-400 transition-colors hover:bg-[var(--tott-dash-ghost-hover)] hover:text-foreground"
            aria-label="Close"
          >
            <XIcon />
          </button>
        </div>

        <form onSubmit={handleEnable} className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Enable Maintenance Mode</p>
              <p className="mt-0.5 text-xs text-gray-500">Users will see a maintenance page.</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={enabled}
              onClick={() => setEnabled(!enabled)}
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                enabled ? "bg-[#CBA158]" : "bg-[var(--tott-dash-control-bg)]"
              }`}
            >
              <span
                className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${
                  enabled ? "left-6 translate-x-0" : "left-1"
                }`}
              />
            </button>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Maintenance Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="We're currently performing scheduled maintenance ..."
              rows={4}
              className="w-full resize-y rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-4 py-2.5 text-sm placeholder:text-gray-500 outline-none transition-colors focus:border-gray-500"
              style={{ color: "#6b7280" }}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Estimated Duration
            </label>
            <div className="relative">
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full appearance-none rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] py-2.5 pl-5 pr-10 text-sm outline-none transition-colors focus:border-gray-500"
                style={{ color: "#6b7280" }}
              >
                <option value="30 minutes">30 minutes</option>
                <option value="1 hour">1 hour</option>
                <option value="2 hours">2 hours</option>
                <option value="3 hours">3 hours</option>
              </select>
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)] px-6 py-2 text-sm font-medium text-[var(--tott-dash-control-fg)] transition-colors hover:border-gray-500 hover:text-foreground"
            >
              Close
            </button>
            <button
              type="submit"
              className="rounded-lg px-6 py-2 text-sm font-medium text-black transition-colors hover:opacity-90"
              style={{ backgroundColor: "#CBA158" }}
            >
              Enable Maintenance
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
