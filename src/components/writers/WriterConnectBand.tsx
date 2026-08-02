"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import HexBackground from "@/components/ui/HexBackground";
import { Modal } from "@/components/ui/Modal";
import { HeartHandshakeIcon } from "@/components/ui/icons";
import { FollowButton } from "@/components/writers/FollowButton";
import { useSendCollaboration } from "@/hooks/mutations/writers";

const SERIF = "var(--font-plex-serif), 'IBM Plex Serif', Georgia, serif";
const SANS = "var(--font-plex-sans), 'IBM Plex Sans', system-ui, sans-serif";
const ACCENT = "var(--tott-accent-gold)";
const CARD_BORDER = "var(--tott-card-border)";
const MUTED = "var(--tott-home-text-muted)";

function CollaborateForm({
  writerId,
  onDone,
}: {
  writerId: string;
  onDone: () => void;
}) {
  const t = useTranslations("Writers.connect");
  const send = useSendCollaboration(writerId);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    send.mutate(
      { name, email, message },
      { onSuccess: onDone },
    );
  }

  const inputStyle: React.CSSProperties = {
    border: `1px solid ${CARD_BORDER}`,
    backgroundColor: "var(--tott-well-bg)",
    color: "var(--tott-home-text-strong)",
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm" style={{ color: MUTED }}>
        {t("collaborateName")}
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-lg px-3 py-2 text-sm"
          style={inputStyle}
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm" style={{ color: MUTED }}>
        {t("collaborateEmail")}
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-lg px-3 py-2 text-sm"
          style={inputStyle}
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm" style={{ color: MUTED }}>
        {t("collaborateMessage")}
        <textarea
          required
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="resize-none rounded-lg px-3 py-2 text-sm"
          style={inputStyle}
        />
      </label>
      <button
        type="submit"
        disabled={send.isPending}
        className="mt-1 inline-flex h-10 items-center justify-center rounded-lg text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-60"
        style={{ backgroundColor: ACCENT, color: "var(--tott-on-accent, #1a1305)" }}
      >
        {t("collaborateSubmit")}
      </button>
    </form>
  );
}

export function WriterConnectBand({
  writerId,
  userId,
  name,
}: {
  writerId: string;
  userId: string | null;
  name: string;
}) {
  const t = useTranslations("Writers.connect");
  const [collabOpen, setCollabOpen] = useState(false);

  return (
    <section className="relative mx-auto mt-24 max-w-6xl overflow-hidden px-6 py-16 sm:px-10 sm:py-24">
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-40">
        <HexBackground />
      </div>

      <RevealOnScroll className="relative mx-auto flex max-w-xl flex-col items-center gap-4 text-center">
        <span
          className="flex size-16 items-center justify-center rounded-full"
          style={{
            backgroundColor:
              "color-mix(in srgb, var(--tott-accent-gold) 14%, var(--tott-home-surface))",
            color: ACCENT,
          }}
        >
          <HeartHandshakeIcon />
        </span>

        <span
          className="text-xs font-semibold uppercase tracking-[0.18em]"
          style={{ color: "var(--tott-gold-muted)", fontFamily: SANS }}
        >
          {t("eyebrow")}
        </span>

        <h2
          className="font-display text-3xl sm:text-4xl"
          style={{
            color: "var(--tott-home-text-warm)",
            fontFamily: SERIF,
            lineHeight: "var(--tott-display-leading)",
            letterSpacing: "var(--tott-display-tracking)",
          }}
        >
          {t("heading")}
        </h2>

        <p className="max-w-md text-sm leading-relaxed" style={{ color: MUTED }}>
          {t("subtitle", { name })}
        </p>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          {userId ? <FollowButton targetUserId={userId} /> : null}
          <button
            type="button"
            onClick={() => setCollabOpen(true)}
            disabled={!userId}
            className="inline-flex h-10 items-center justify-center rounded-lg px-5 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ border: `1px solid ${CARD_BORDER}`, color: "var(--tott-home-text-strong)" }}
          >
            {t("collaborate")}
          </button>
          <a
            href="#support-panel"
            className="inline-flex h-10 items-center justify-center rounded-lg px-5 text-sm font-medium transition-opacity hover:opacity-90"
            style={{ backgroundColor: ACCENT, color: "var(--tott-on-accent, #1a1305)" }}
          >
            {t("support")}
          </a>
        </div>
      </RevealOnScroll>

      {userId ? (
        <Modal
          open={collabOpen}
          title={t("collaborate")}
          onClose={() => setCollabOpen(false)}
        >
          <CollaborateForm writerId={writerId} onDone={() => setCollabOpen(false)} />
        </Modal>
      ) : null}
    </section>
  );
}
