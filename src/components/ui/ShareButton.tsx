"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import { EmailIcon, FacebookIcon, LinkIcon, TwitterXIcon } from "@/components/ui/icons";
import { renderStoryCard } from "@/lib/share/story-card";

type ShareButtonProps = {
  /** Title used by the native share sheet, share text and story card. */
  title: string;
  /** Author name, woven into the share sentence ("Read X by Y on ..."). */
  author?: string;
  /** Absolute URL to share. Defaults to the short link, then the current URL. */
  url?: string;
  /**
   * Article id — enables the short link `/a/<id>`, which avoids the
   * hundreds-of-characters percent-encoded Arabic slug.
   */
  shortLinkId?: string;
};

/**
 * Share control for public content (articles, issues, books...).
 * Uses the native share sheet when the browser exposes one (mobile), and
 * falls back to a themed modal with copy-link, social targets and a
 * downloadable Instagram-story card.
 */
export function ShareButton({ title, author, url, shortLinkId }: ShareButtonProps) {
  const t = useTranslations("Content.share");
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [storyBusy, setStoryBusy] = useState(false);

  function resolveUrl() {
    if (url) return url;
    if (typeof window === "undefined") return "";
    return shortLinkId ? `${window.location.origin}/a/${shortLinkId}` : window.location.href;
  }

  function shareText() {
    return author ? t("text", { title, author }) : t("textNoAuthor", { title });
  }

  async function onShareClick() {
    const shareUrl = resolveUrl();
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text: shareText(), url: shareUrl });
        return;
      } catch {
        // ponytail: user dismissed the sheet, or the browser refused it — fall through to the modal.
      }
    }
    setOpen(true);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(resolveUrl());
      toast.success(t("copied"));
      setOpen(false);
    } catch {
      toast.error(t("copyFailed"));
    }
  }

  async function shareStory() {
    if (storyBusy) return;
    setStoryBusy(true);
    try {
      const shareUrl = resolveUrl();
      const blob = await renderStoryCard({
        title,
        author,
        url: shareUrl,
        locale,
        brand: t("brand"),
        byLabel: t("by"),
      });
      const file = new File([blob], "trace-of-the-tide-story.png", { type: "image/png" });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title, text: shareText() });
        setOpen(false);
        return;
      }

      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = file.name;
      link.click();
      URL.revokeObjectURL(objectUrl);
      toast.success(t("storyDownloaded"));
      setOpen(false);
    } catch {
      toast.error(t("storyFailed"));
    } finally {
      setStoryBusy(false);
    }
  }

  const shareUrl = open ? resolveUrl() : "";
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(shareText());

  const targets = [
    {
      key: "x",
      label: "X",
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
      icon: <TwitterXIcon />,
    },
    {
      key: "facebook",
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      icon: <FacebookIcon />,
    },
    {
      key: "whatsapp",
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
      icon: <WhatsAppIcon />,
    },
    {
      key: "email",
      label: t("email"),
      href: `mailto:?subject=${encodeURIComponent(title)}&body=${encodedText}%20${encodedUrl}`,
      icon: <EmailIcon />,
    },
  ];

  const rowClassName =
    "flex items-center gap-3 rounded-lg border border-[var(--tott-card-border)] px-3 py-2.5 text-start text-sm text-foreground transition-colors hover:bg-[var(--tott-dash-ghost-hover)] disabled:opacity-50";

  return (
    <>
      <button
        type="button"
        onClick={onShareClick}
        aria-label={t("action")}
        className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-opacity hover:opacity-80"
        style={{
          backgroundColor: "transparent",
          color: "var(--tott-home-text-muted)",
          border: "1px solid var(--tott-card-border)",
        }}
      >
        <ShareIcon />
        {t("action")}
      </button>

      <Modal open={open} title={t("title")} onClose={() => setOpen(false)}>
        <div className="flex flex-col gap-2">
          <p className="mb-1 text-sm leading-relaxed text-[var(--tott-muted)]">{shareText()}</p>

          <button
            type="button"
            onClick={shareStory}
            disabled={storyBusy}
            className={`${rowClassName} border-[var(--tott-accent-gold)]`}
          >
            <InstagramStoryIcon />
            <span className="flex flex-col">
              <span>{storyBusy ? t("storyRendering") : t("story")}</span>
              <span className="text-xs text-[var(--tott-muted)]">{t("storyHint")}</span>
            </span>
          </button>

          <button type="button" onClick={copyLink} className={rowClassName}>
            <LinkIcon />
            {t("copyLink")}
          </button>

          {targets.map((target) => (
            <a
              key={target.key}
              href={target.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className={rowClassName}
            >
              {target.icon}
              {target.label}
            </a>
          ))}
        </div>
      </Modal>
    </>
  );
}

function ShareIcon() {
  return (
    <svg
      width={13}
      height={13}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
    </svg>
  );
}

function InstagramStoryIcon() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="2" width="18" height="20" rx="4" />
      <circle cx="12" cy="10" r="3.2" />
      <path d="M7.5 18.5h9" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.22 8.22 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24a8.2 8.2 0 0 1 8.24 8.25c0 4.54-3.7 8.23-8.24 8.23Zm4.52-6.16c-.25-.13-1.47-.72-1.69-.8-.23-.09-.39-.13-.56.12-.16.25-.64.8-.79.97-.14.16-.29.19-.54.06-.25-.12-1.05-.38-1.99-1.23-.74-.65-1.23-1.46-1.38-1.71-.14-.25-.01-.38.11-.51.11-.11.25-.29.37-.44.13-.15.17-.25.25-.41.08-.17.04-.31-.02-.44-.06-.12-.56-1.35-.77-1.84-.2-.49-.4-.42-.56-.43h-.47c-.16 0-.43.06-.65.31-.22.25-.85.83-.85 2.03s.87 2.35.99 2.51c.12.16 1.71 2.62 4.15 3.67.58.25 1.03.4 1.39.51.58.19 1.11.16 1.53.1.47-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.11-.22-.17-.47-.29Z" />
    </svg>
  );
}
