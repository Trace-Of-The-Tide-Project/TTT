// PRESERVED ORIGINAL — not a route (underscore-prefixed files are ignored
// by the Next.js App Router). This is the redirect that `fields/page.tsx`
// used before the "Coming Soon" override. To restore /fields, replace the
// body of `page.tsx` with the implementation below.
import { redirect } from "@/i18n/navigation";

// "Fields" is the content-browsing surface. Until a dedicated index
// exists, route it to the magazine landing (latest publications,
// issues, editorial board) so the navbar + hero CTAs all resolve.
export async function fieldsRedirectOriginal(
  params: Promise<{ locale: string }>,
) {
  const { locale } = await params;
  redirect({ href: "/magazine", locale });
}
