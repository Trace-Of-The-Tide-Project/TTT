import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export const dynamic = "force-dynamic";

export default async function CheckoutCancelPage() {
  const t = await getTranslations("Home.Commerce");
  return (
    <main className="mx-auto flex w-full max-w-md flex-col items-center px-4 py-16 text-center">
      <h1 className="mb-3 text-2xl font-semibold text-[var(--tott-home-text-strong)]">
        {t("cancelTitle")}
      </h1>
      <p className="mb-8 text-[var(--tott-home-text-muted)]">{t("cancelBody")}</p>
      <Link
        href="/books/cart"
        className="w-full rounded-lg py-3 text-center font-medium transition-opacity hover:opacity-90"
        style={{
          backgroundColor: "var(--tott-magazine-btn-bg)",
          boxShadow: "inset 0px 1px 0px rgba(255, 255, 255, 0.4)",
          color: "var(--tott-auth-btn-text)",
        }}
      >
        {t("backToCart")}
      </Link>
    </main>
  );
}
