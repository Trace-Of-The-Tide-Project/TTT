"use client";

import { useState, type FormEvent } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Link, useRouter } from "@/i18n/navigation";
import { staggerParent, staggerChild, springs } from "@/lib/motion";
import { useSubmitBookReview } from "@/hooks/mutations/book-reviews";
import { formatApiError } from "@/lib/api/error-message";
import { ChamferedFrame } from "@/components/ui/ChamferedFrame";
import { MessageBubbleIcon } from "@/components/ui/icons";
import type { BookReviewItem } from "../BookDetailContent";

function SolidStar() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function OutlineStar() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round" aria-hidden>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

export function PartialStar({ fill, size = 16 }: { fill: number; size?: number }) {
  const clamped = Math.max(0, Math.min(1, fill));
  return (
    <span
      aria-hidden
      className="relative inline-block"
      style={{ width: `${size}px`, height: `${size}px`, color: "var(--tott-accent-gold)" }}
    >
      {clamped > 0 ? (
        <span className="absolute left-0 right-0 overflow-hidden" style={{ bottom: 0, height: `${clamped * 100}%` }}>
          <span className="absolute left-0" style={{ bottom: 0, width: `${size}px`, height: `${size}px` }}>
            <SolidStar />
          </span>
        </span>
      ) : null}
      <span className="absolute inset-0"><OutlineStar /></span>
    </span>
  );
}

function ReviewAvatar({ initial }: { initial: string }) {
  return (
    <span
      aria-hidden
      className="flex shrink-0 items-center justify-center rounded-full"
      style={{
        width: "40px",
        height: "40px",
        backgroundColor: "var(--tott-dash-gold-text)",
        color: "var(--tott-auth-btn-text)",
        fontFamily: "'Inter', var(--font-sans, sans-serif)",
        fontWeight: 400,
        fontSize: "16px",
        lineHeight: "20px",
      }}
    >
      {initial.charAt(0).toUpperCase() || "A"}
    </span>
  );
}

function InteractiveStars({ value, onChange, size = 16 }: { value: number; onChange: (v: number) => void; size?: number }) {
  return (
    <span className="inline-flex items-center" style={{ gap: "4px" }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          aria-label={`${i} stars`}
          aria-pressed={i === value}
          onClick={() => onChange(i)}
          className="relative inline-block transition-opacity hover:opacity-90"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            color: i <= value ? "var(--tott-accent-gold)" : "var(--tott-card-border)",
            background: "transparent",
            border: 0,
            padding: 0,
          }}
        >
          <SolidStar />
        </button>
      ))}
    </span>
  );
}

export function ReviewsSection({
  bookId,
  reviews,
  tHeading,
  tSeeAll,
  tPlaceholder,
  tAddQuote,
  tSubmit,
  tPage,
}: {
  bookId: string;
  reviews: BookReviewItem[];
  tHeading: string;
  tSeeAll: string;
  tPlaceholder: string;
  tAddQuote: string;
  tSubmit: string;
  tPage: (n: number) => string;
}) {
  const [draft, setDraft] = useState("");
  const [draftRating, setDraftRating] = useState(0);
  const [showQuote, setShowQuote] = useState(false);
  const [quote, setQuote] = useState("");
  const [guestName, setGuestName] = useState("");
  const submit = useSubmitBookReview(bookId);
  const router = useRouter();

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (draftRating < 1) { toast.error("Please pick a star rating before submitting."); return; }
    submit.mutate(
      {
        rating: draftRating,
        review_text: draft.trim() || null,
        quote: showQuote && quote.trim() ? quote.trim() : null,
        guest_name: guestName.trim() || null,
      },
      {
        onSuccess: () => {
          toast.success("Review submitted", { description: "Thanks for sharing your thoughts." });
          setDraft(""); setQuote(""); setShowQuote(false); setDraftRating(0); setGuestName("");
          router.refresh();
        },
        onError: (err) => {
          toast.error("Couldn't submit review", { description: formatApiError(err, "Please try again.") });
        },
      },
    );
  };

  const submitting = submit.isPending;

  return (
    <section aria-label={tHeading} className="relative mt-8 w-full" style={{ padding: "24px" }}>
      <ChamferedFrame size={24} borderColor="var(--tott-card-border)" />

      <div className="flex items-center justify-between" style={{ gap: "16px" }}>
        <h2
          className="min-[1600px]:text-[22px]!"
          style={{
            fontFamily: "'IBM Plex Sans', var(--font-sans, sans-serif)",
            fontWeight: 500,
            fontSize: "16px",
            lineHeight: "24px",
            color: "var(--tott-home-text-strong)",
            margin: 0,
          }}
        >
          {tHeading}
        </h2>
        <Link
          href={`/books/${bookId}/reviews`}
          className="inline-flex items-center transition-opacity hover:opacity-90"
          style={{ gap: "8px", color: "var(--tott-dash-gold-label)" }}
        >
          <span aria-hidden className="[&>svg]:h-4 [&>svg]:w-4"><MessageBubbleIcon /></span>
          <span style={{ fontFamily: "'IBM Plex Sans', var(--font-sans, sans-serif)", fontWeight: 400, fontSize: "14px", lineHeight: "20px", letterSpacing: "-0.006em" }}>
            {tSeeAll}
          </span>
        </Link>
      </div>

      <form onSubmit={onSubmit} className="mt-4">
        <label
          htmlFor="book-review-textarea"
          style={{
            display: "block",
            fontFamily: "'Inter', var(--font-sans, sans-serif)",
            fontWeight: 500,
            fontSize: "14px",
            lineHeight: "20px",
            letterSpacing: "-0.005em",
            color: "var(--tott-home-text-strong)",
            marginBottom: "8px",
          }}
        >
          {tPlaceholder}
        </label>
        <textarea
          id="book-review-textarea"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Share your thoughts about this book"
          rows={4}
          disabled={submitting}
          className="w-full focus:outline-none focus:ring-0 disabled:opacity-60"
          style={{
            backgroundColor: "var(--tott-panel-bg)",
            border: "1px solid var(--tott-card-border)",
            borderRadius: "8px",
            padding: "8px 12px",
            fontFamily: "'Inter', var(--font-sans, sans-serif)",
            fontWeight: 400,
            fontSize: "14px",
            lineHeight: "20px",
            letterSpacing: "0.005em",
            color: "var(--tott-home-text-strong)",
            boxShadow: "none",
            resize: "vertical",
            outline: "none",
            minHeight: "112px",
          }}
        />

        {showQuote ? (
          <input
            type="text"
            value={quote}
            onChange={(e) => setQuote(e.target.value)}
            placeholder="Favourite quote (optional)"
            disabled={submitting}
            className="mt-3 w-full focus:outline-none focus:ring-0 disabled:opacity-60"
            style={{
              backgroundColor: "var(--tott-panel-bg)",
              border: "1px solid var(--tott-card-border)",
              borderRadius: "8px",
              padding: "8px 12px",
              fontFamily: "'Inter', var(--font-sans, sans-serif)",
              fontStyle: "italic",
              fontSize: "14px",
              lineHeight: "20px",
              color: "var(--tott-home-text-strong)",
              boxShadow: "none",
              outline: "none",
              height: "40px",
            }}
          />
        ) : null}

        <input
          type="text"
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
          placeholder="Your name (optional)"
          disabled={submitting}
          className="mt-3 w-full focus:outline-none focus:ring-0 disabled:opacity-60"
          style={{
            backgroundColor: "var(--tott-panel-bg)",
            border: "1px solid var(--tott-card-border)",
            borderRadius: "8px",
            padding: "8px 12px",
            fontFamily: "'Inter', var(--font-sans, sans-serif)",
            fontWeight: 400,
            fontSize: "14px",
            lineHeight: "20px",
            color: "var(--tott-home-text-strong)",
            boxShadow: "none",
            outline: "none",
            height: "40px",
          }}
        />

        <div className="mt-4 flex flex-wrap items-center" style={{ gap: "16px" }}>
          <span className="flex flex-1 items-center" style={{ gap: "4px" }}>
            <InteractiveStars value={draftRating} onChange={setDraftRating} size={24} />
          </span>
          <button
            type="button"
            onClick={() => setShowQuote((v) => !v)}
            disabled={submitting}
            className="inline-flex items-center justify-center transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{
              height: "40px",
              padding: "8px 16px",
              borderRadius: "8px",
              backgroundColor: "var(--tott-card-border)",
              boxShadow: "inset 0px 1px 1px rgba(255, 255, 255, 0.08)",
              color: "var(--tott-home-text-strong)",
              fontFamily: "'Inter', var(--font-sans, sans-serif)",
              fontWeight: 400,
              fontSize: "14px",
              lineHeight: "20px",
              letterSpacing: "-0.005em",
              border: "none",
            }}
          >
            {tAddQuote}
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center transition-opacity hover:opacity-90 disabled:opacity-60"
            style={{
              height: "40px",
              padding: "8px 16px",
              borderRadius: "8px",
              backgroundColor: "var(--tott-magazine-btn-bg)",
              boxShadow: "inset 0px 1px 0px rgba(255, 255, 255, 0.4)",
              color: "var(--tott-auth-btn-text)",
              fontFamily: "'Inter', var(--font-sans, sans-serif)",
              fontWeight: 500,
              fontSize: "14px",
              lineHeight: "20px",
              letterSpacing: "-0.005em",
              border: "none",
            }}
          >
            {submitting ? "Submitting…" : tSubmit}
          </button>
        </div>
      </form>

      <span aria-hidden className="mt-4 block w-full" style={{ borderTop: "1.5px solid var(--tott-card-border)" }} />

      {reviews.length === 0 ? (
        <p
          className="mt-6 text-center"
          style={{
            fontFamily: "'Inter', var(--font-sans, sans-serif)",
            fontWeight: 400,
            fontSize: "14px",
            lineHeight: "20px",
            letterSpacing: "-0.005em",
            color: "var(--tott-home-text-muted)",
          }}
        >
          No reviews yet.
        </p>
      ) : null}

      <motion.ul
        className="mt-4 flex flex-col"
        style={{ gap: "16px" }}
        variants={staggerParent}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
      >
        {reviews.map((r) => (
          <motion.li key={r.id} variants={staggerChild} transition={springs.gentle} className="flex items-start" style={{ gap: "8px" }}>
            <ReviewAvatar initial={r.author} />
            <div className="flex min-w-0 flex-1 flex-col" style={{ gap: "8px" }}>
              <div className="flex items-start" style={{ gap: "8px" }}>
                <div className="flex flex-col" style={{ minWidth: "88px" }}>
                  <span style={{ fontFamily: "'Inter', var(--font-sans, sans-serif)", fontWeight: 500, fontSize: "14px", lineHeight: "20px", letterSpacing: "-0.005em", color: "var(--tott-home-text-strong)" }}>
                    {r.author}
                  </span>
                  <span aria-label={`${r.rating} out of 5 stars`} className="inline-flex items-center" style={{ padding: "4px 0", gap: "2px" }}>
                    {[0, 1, 2, 3, 4].map((i) => (
                      <span key={i} className="inline-block" style={{ width: "12px", height: "12px", color: i < Math.floor(r.rating) ? "var(--tott-accent-gold)" : "var(--tott-card-border)" }}>
                        <SolidStar />
                      </span>
                    ))}
                  </span>
                </div>
                <span
                  className="ml-auto"
                  style={{ fontFamily: "'Inter', var(--font-sans, sans-serif)", fontWeight: 400, fontSize: "12px", lineHeight: "16px", textAlign: "right", color: "var(--tott-home-text-muted)" }}
                >
                  {r.date}
                </span>
              </div>

              {r.quote ? (
                <blockquote style={{ borderLeft: "2px solid var(--tott-accent-gold)", padding: "6px 12px", gap: "4px", margin: 0, flexDirection: "column", alignItems: "flex-start" }} className="flex items-start">
                  <p style={{ fontFamily: "'Inter', var(--font-sans, sans-serif)", fontWeight: 400, fontStyle: "italic", fontSize: "16px", lineHeight: "24px", letterSpacing: "-0.01em", color: "var(--tott-home-text-strong)", textShadow: "var(--tott-home-text-shadow)", margin: 0 }}>
                    {r.quote}
                  </p>
                  {r.quotePage ? (
                    <span style={{ fontFamily: "'Inter', var(--font-sans, sans-serif)", fontWeight: 400, fontSize: "12px", lineHeight: "16px", color: "var(--tott-home-text-muted)" }}>
                      {tPage(r.quotePage)}
                    </span>
                  ) : null}
                </blockquote>
              ) : null}

              <p style={{ fontFamily: "'Inter', var(--font-sans, sans-serif)", fontWeight: 400, fontSize: "14px", lineHeight: "20px", letterSpacing: "-0.005em", color: "var(--tott-home-text-strong)", textShadow: "var(--tott-home-text-shadow)", margin: 0 }}>
                {r.body}
              </p>
            </div>
          </motion.li>
        ))}
      </motion.ul>
    </section>
  );
}
