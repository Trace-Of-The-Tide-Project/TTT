"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { staggerParent, staggerChild, springs } from "@/lib/motion";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { ChamferedPanel } from "@/components/ui/ChamferedPanel";
import { Skeleton } from "@/components/ui/Skeleton";
import { HeartHandshakeIcon } from "@/components/ui/icons";
import { useWriterSupportSummary } from "@/hooks/queries/writers";
import { useSendSupport } from "@/hooks/mutations/writers";

const SANS = "var(--font-plex-sans), 'IBM Plex Sans', system-ui, sans-serif";
const SERIF = "var(--font-plex-serif), 'IBM Plex Serif', Georgia, serif";
const ACCENT = "var(--tott-accent-gold)";
const CARD_BORDER = "var(--tott-card-border)";
const MUTED = "var(--tott-home-text-muted)";
const SALT = "var(--tott-salt)";

function formatMoney(amount: number, currency: string): string {
  const formatter = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currency || "USD",
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  });
  try {
    return formatter.format(amount);
  } catch {
    return `$${amount}`;
  }
}

function relativeTime(iso: string, locale: string | undefined): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMin = Math.round(diffMs / 60000);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  if (diffMin < 60) return rtf.format(-diffMin, "minute");
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return rtf.format(-diffHr, "hour");
  return rtf.format(-Math.round(diffHr / 24), "day");
}

function PanelSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-4 w-full" />
      <div className="mt-2 grid grid-cols-2 gap-4">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-20" />
      </div>
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-full" />
    </div>
  );
}

export function WriterSupportPanel({
  writerId,
  userId,
}: {
  writerId: string;
  userId: string | null;
}) {
  const t = useTranslations("Writers.support");
  const summary = useWriterSupportSummary(userId);
  const sendSupport = useSendSupport(writerId);
  const [selected, setSelected] = useState<number | null>(null);
  const [customOpen, setCustomOpen] = useState(false);
  const [customValue, setCustomValue] = useState("");

  if (!userId) return null;

  const data = summary.data;
  const presets = data?.preset_amounts ?? [5, 10, 25, 50];
  const goalPct =
    data?.monthly_goal && data.monthly_goal > 0
      ? Math.min(100, Math.round((data.monthly_raised / data.monthly_goal) * 100))
      : null;

  function handlePreset(amount: number) {
    setSelected(amount);
    setCustomOpen(false);
    sendSupport.mutate({ amount, type: "one-time" });
  }

  function handleCustomSubmit() {
    const amount = Number(customValue);
    if (!Number.isFinite(amount) || amount <= 0) return;
    setSelected(amount);
    sendSupport.mutate({ amount, type: "one-time" });
    setCustomOpen(false);
    setCustomValue("");
  }

  return (
    <RevealOnScroll id="support-panel" className="lg:sticky lg:top-24">
      <ChamferedPanel size={16}>
        <div className="px-7 py-6">
          <div className="flex items-center gap-2">
            <span aria-hidden style={{ color: ACCENT }}>
              <HeartHandshakeIcon />
            </span>
          </div>
          <h3
            className="mt-2 text-lg font-medium"
            style={{ color: "var(--tott-home-text-strong)", fontFamily: SERIF }}
          >
            {t("heading")}
          </h3>
          <p className="mt-1 text-sm leading-relaxed" style={{ color: SALT }}>
            {t("subtitle")}
          </p>

          {summary.isPending ? (
            <div className="mt-6">
              <PanelSkeleton />
            </div>
          ) : (
            <>
              <div className="mt-6 flex items-center gap-6">
                <div className="flex flex-col gap-1">
                  <span
                    className="text-lg font-medium"
                    style={{ color: ACCENT, fontFamily: SANS }}
                  >
                    {formatMoney(data?.total_tips ?? 0, data?.currency ?? "USD")}
                  </span>
                  <span className="text-xs" style={{ color: MUTED }}>
                    {t("totalTips")}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span
                    className="text-lg font-medium"
                    style={{ color: ACCENT, fontFamily: SANS }}
                  >
                    {data?.supporter_count ?? 0}
                  </span>
                  <span className="text-xs" style={{ color: MUTED }}>
                    {t("supporters")}
                  </span>
                </div>
              </div>

              {goalPct !== null ? (
                <div className="mt-6">
                  <div className="flex items-center justify-between text-sm">
                    <span style={{ color: "var(--tott-home-text-strong)" }}>
                      {t("monthlyGoal")}
                    </span>
                    <span style={{ color: ACCENT }}>
                      {formatMoney(data?.monthly_raised ?? 0, data?.currency ?? "USD")}{" "}
                      /{" "}
                      {formatMoney(data?.monthly_goal ?? 0, data?.currency ?? "USD")}
                    </span>
                  </div>
                  <div
                    className="mt-2 h-2 w-full overflow-hidden rounded-full"
                    style={{ backgroundColor: "var(--tott-well-bg)" }}
                    role="progressbar"
                    aria-valuenow={goalPct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div
                      className="h-full rounded-full transition-[width]"
                      style={{ width: `${goalPct}%`, backgroundColor: ACCENT }}
                    />
                  </div>
                </div>
              ) : null}

              <div
                role="radiogroup"
                aria-label={t("heading")}
                className="mt-6 flex flex-wrap items-center gap-2"
              >
                {presets.map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    role="radio"
                    aria-checked={selected === amount}
                    disabled={sendSupport.isPending}
                    onClick={() => handlePreset(amount)}
                    className="flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-60"
                    style={{
                      backgroundColor:
                        selected === amount
                          ? ACCENT
                          : "var(--tott-elevated)",
                      color:
                        selected === amount
                          ? "var(--tott-on-accent, #1a1305)"
                          : "var(--tott-home-text-strong)",
                    }}
                  >
                    {formatMoney(amount, data?.currency ?? "USD")}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setCustomOpen((v) => !v)}
                  className="rounded-md px-3 py-1.5 text-sm font-medium transition-opacity hover:opacity-90"
                  style={{ backgroundColor: ACCENT, color: "var(--tott-on-accent, #1a1305)" }}
                >
                  {t("custom")}
                </button>
              </div>

              {customOpen ? (
                <div className="mt-3 flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    value={customValue}
                    onChange={(e) => setCustomValue(e.target.value)}
                    className="w-full rounded-md px-3 py-1.5 text-sm"
                    style={{
                      border: `1px solid ${CARD_BORDER}`,
                      backgroundColor: "var(--tott-well-bg)",
                      color: "var(--tott-home-text-strong)",
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleCustomSubmit}
                    disabled={sendSupport.isPending}
                    className="shrink-0 rounded-md px-3 py-1.5 text-sm font-medium disabled:opacity-60"
                    style={{ backgroundColor: ACCENT, color: "var(--tott-on-accent, #1a1305)" }}
                  >
                    {t("custom")}
                  </button>
                </div>
              ) : null}

              <div
                className="mt-6 border-t pt-4"
                style={{ borderColor: CARD_BORDER }}
              >
                <p
                  className="text-sm font-medium"
                  style={{ color: MUTED, fontFamily: SANS }}
                >
                  {t("recentSupporters")}
                </p>

                {(data?.recent_supporters?.length ?? 0) === 0 ? (
                  <p className="mt-3 text-sm" style={{ color: SALT }}>
                    {t("beFirst")}
                  </p>
                ) : (
                  <motion.ul
                    variants={staggerParent}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-40px" }}
                    className="mt-4 flex list-none flex-col gap-4"
                  >
                    {(data?.recent_supporters ?? []).slice(0, 5).map((s, i) => {
                      const name = s.anonymous ? t("anonymous") : s.name;
                      return (
                        <motion.li
                          key={`${s.created_at}-${i}`}
                          variants={staggerChild}
                          transition={springs.gentle}
                          className="flex items-center gap-3"
                        >
                          <span
                            aria-hidden
                            className="flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-medium"
                            style={{
                              backgroundColor:
                                "color-mix(in srgb, var(--tott-accent-gold) 16%, var(--tott-home-surface))",
                              color: ACCENT,
                            }}
                          >
                            {name.trim().charAt(0).toUpperCase()}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-4">
                              <span
                                className="truncate text-sm font-medium"
                                style={{ color: ACCENT }}
                              >
                                {name}
                              </span>
                              <span className="shrink-0 text-sm" style={{ color: MUTED }}>
                                {formatMoney(s.amount, data?.currency ?? "USD")}
                              </span>
                            </div>
                            <span className="text-xs" style={{ color: MUTED }}>
                              {relativeTime(s.created_at, undefined)}
                            </span>
                          </div>
                        </motion.li>
                      );
                    })}
                  </motion.ul>
                )}

                {(data?.supporter_count ?? 0) > 0 ? (
                  <div className="mt-4 flex items-center justify-between text-xs">
                    <span style={{ color: MUTED }}>
                      {t("supporterCount", {
                        shown: Math.min(5, data?.recent_supporters?.length ?? 0),
                        total: data?.supporter_count ?? 0,
                      })}
                    </span>
                  </div>
                ) : null}
              </div>
            </>
          )}
        </div>
      </ChamferedPanel>
    </RevealOnScroll>
  );
}
