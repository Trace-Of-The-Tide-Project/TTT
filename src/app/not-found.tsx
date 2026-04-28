/** Fallback when no `[locale]` segment matches (rare). Use plain anchor — no `next-intl` context here. */
export default function RootNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-8 text-center text-foreground">
      <p className="text-lg">Page not found</p>
      <a href="/en" className="text-[#C9A96E] underline">
        Go to English home
      </a>
    </div>
  );
}
