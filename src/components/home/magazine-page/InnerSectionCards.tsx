import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import { TOTT_AUTH_HEX_CLIP_PATH } from "@/components/auth/shared/authHexClipPath";
import { PersonPlusIcon, GiftIcon, PenLineIcon } from "@/components/ui/icons";

/**
 * Shared button for the gold CTA styling used here and in `ShareStory`
 * (Figma `Button`, type=Primary, size=Medium): flat gold fill, ink text,
 * subtle top inner-highlight. One definition, two call sites, rather than
 * a third inline copy.
 */
export function PageButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center rounded-lg px-6 py-2.5 text-sm font-medium text-[var(--tott-hero-cta-ink)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4)] transition-opacity hover:opacity-90"
      style={{ backgroundColor: "var(--tott-accent-gold-focus)" }}
    >
      {children}
    </Link>
  );
}

const CARDS = [
  { key: "1", icon: <PersonPlusIcon />, href: "/collectives" },
  { key: "2", icon: <GiftIcon />, href: "/subscribe" },
  { key: "3", icon: <PenLineIcon />, href: "/writing-room" },
] as const;

/**
 * 3 action cards below the hero (Figma `Inner Section Card` ×3, 360×212):
 * Join Collective / Send Gift / Share Story. Hex icon chip (56×64, reusing
 * the auth hex clip so it matches every other hex chip on the page),
 * title, body, gold CTA button.
 */
export async function InnerSectionCards({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "Magazine.innerCards" });

  return (
    <section className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 py-16 sm:px-10 md:grid-cols-3">
      {CARDS.map(({ key, icon, href }) => (
        <div key={key} className="flex flex-col items-center gap-6 px-8 text-center">
          <div
            className="flex h-16 w-14 items-center justify-center text-[var(--tott-accent-gold-focus)]"
            style={{
              clipPath: TOTT_AUTH_HEX_CLIP_PATH,
              background: "color-mix(in srgb, white 4%, transparent)",
            }}
          >
            {icon}
          </div>
          <div className="flex flex-col items-center gap-2">
            <h3 className="font-['IBM_Plex_Sans'] text-base font-medium leading-5 text-[var(--tott-accent-gold-focus)]">
              {t(`${key}.title`)}
            </h3>
            <p
              className="text-xs leading-4 text-[var(--tott-text-secondary-soft)]"
              style={{ textShadow: "0 1px 2px rgba(0,0,0,0.24)" }}
            >
              {t(`${key}.body`)}
            </p>
          </div>
          <PageButton href={href}>{t(`${key}.cta`)}</PageButton>
        </div>
      ))}
    </section>
  );
}
