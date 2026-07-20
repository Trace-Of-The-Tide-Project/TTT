/**
 * Whitelisted video-embed providers. Store only the source URL — never
 * accept or render provider markup/iframes authored by a user. The iframe
 * `src` is always constructed here from a charset-validated id, so it can
 * never carry attacker-controlled content.
 *
 * ponytail: table of 2 providers, not a plugin registry. Add a row for a 3rd
 * (e.g. Spotify/SoundCloud) when audio/social embeds are requested.
 */

export type EmbedProvider = "youtube" | "vimeo";

type ProviderDef = {
  id: EmbedProvider;
  /** Exact hostname match — never substring/endsWith (that admits `youtube.com.evil.tld`). */
  hosts: string[];
  extractId: (u: URL) => string | null;
  aspect: string;
};

const YOUTUBE_ID_RE = /^[A-Za-z0-9_-]{11}$/;
const VIMEO_ID_RE = /^\d+$/;

function firstMatch(re: RegExp, s: string): RegExpMatchArray | null {
  return re.test(s) ? s.match(re) : null;
}

const PROVIDERS: ProviderDef[] = [
  {
    id: "youtube",
    hosts: ["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be"],
    extractId: (u) => {
      if (u.hostname.toLowerCase() === "youtu.be") {
        return u.pathname.replace(/^\//, "").split("/")[0] || null;
      }
      const v = u.searchParams.get("v");
      if (v) return v;
      const m = firstMatch(/\/(?:embed|shorts)\/([^/?#]+)/, u.pathname);
      return m ? m[1] : null;
    },
    aspect: "16 / 9",
  },
  {
    id: "vimeo",
    hosts: ["vimeo.com", "player.vimeo.com"],
    extractId: (u) => {
      // A naive "first numeric segment" grabs the group/album/channel id from
      // URLs like /groups/98765/videos/123456789. Prefer the segment after
      // `video`/`videos`, else fall back to the last purely-numeric segment
      // (the clip id in /channels/staff/123456789, /123456789, etc.).
      const segs = u.pathname.split("/").filter(Boolean);
      const vi = segs.findIndex((s) => s === "video" || s === "videos");
      if (vi >= 0 && segs[vi + 1]) return segs[vi + 1];
      for (let i = segs.length - 1; i >= 0; i--) {
        if (/^\d+$/.test(segs[i])) return segs[i];
      }
      return null;
    },
    aspect: "16 / 9",
  },
];

export type ParsedEmbed = { provider: EmbedProvider; id: string };

/**
 * Validates an embed URL end to end: parseable → https-only → exact
 * allowlisted host → id matches the provider's charset. Returns null on any
 * failure. Used by both the editor (validation error) and the render path
 * (re-validation — the row may predate a provider-list change).
 */
export function parseEmbedUrl(input: string): ParsedEmbed | null {
  let u: URL;
  try {
    u = new URL(input.trim());
  } catch {
    return null;
  }
  if (u.protocol !== "https:") return null;
  const host = u.hostname.toLowerCase();
  const provider = PROVIDERS.find((p) => p.hosts.includes(host));
  if (!provider) return null;
  const id = provider.extractId(u);
  if (!id) return null;
  const idOk = provider.id === "youtube" ? YOUTUBE_ID_RE.test(id) : VIMEO_ID_RE.test(id);
  if (!idOk) return null;
  return { provider: provider.id, id };
}

/** Builds the iframe embed src from a validated {provider, id}. Never pass unvalidated input. */
export function embedSrc({ provider, id }: ParsedEmbed): string {
  if (provider === "youtube") return `https://www.youtube-nocookie.com/embed/${id}`;
  return `https://player.vimeo.com/video/${id}`;
}

export function embedAspect(provider: EmbedProvider): string {
  return PROVIDERS.find((p) => p.id === provider)?.aspect ?? "16 / 9";
}
