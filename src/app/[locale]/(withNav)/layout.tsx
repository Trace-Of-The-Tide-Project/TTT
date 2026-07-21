import { NavbarDynamic } from "@/components/layout/NavbarDynamic";
import { ArticleReadingHeaderProvider } from "@/components/layout/ArticleReadingHeaderContext";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { SubscriptionProvider } from "@/context/SubscriptionContext";
import { getCmsNavLinks, getCmsBranding } from "@/lib/nav/cms-nav-links";

export default async function WithNavLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Admin-editable nav links (CMS Navigation tab). Falls back to the
  // hardcoded defaults inside Navbar when absent/malformed — see
  // getCmsNavLinks.
  const [cmsNavLinks, branding] = await Promise.all([getCmsNavLinks(), getCmsBranding()]);

  return (
    <MotionProvider>
      <ArticleReadingHeaderProvider>
        <SubscriptionProvider>
          <NavbarDynamic cmsNavLinks={cmsNavLinks} logoUrl={branding?.logo} />
          {children}
        </SubscriptionProvider>
      </ArticleReadingHeaderProvider>
    </MotionProvider>
  );
}
