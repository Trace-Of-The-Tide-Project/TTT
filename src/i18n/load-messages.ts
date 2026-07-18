import type { AppLocale } from "./routing";
import { deepMergeRecords } from "./merge-messages";

/** Dynamic imports per locale for dashboard feature slices. */
function dashboardImports(locale: AppLocale) {
  return [
    import(`../../messages/features/${locale}/dashboard/command-center.json`),
    import(`../../messages/features/${locale}/dashboard/articles.json`),
    import(`../../messages/features/${locale}/dashboard/articles-create.json`),
    import(`../../messages/features/${locale}/dashboard/articles-editor-workflow.json`),
    import(`../../messages/features/${locale}/dashboard/headers.json`),
    import(`../../messages/features/${locale}/dashboard/profile-home.json`),
    import(`../../messages/features/${locale}/dashboard/admin-home.json`),
    import(`../../messages/features/${locale}/dashboard/users-management.json`),
    import(`../../messages/features/${locale}/dashboard/people.json`),
    import(`../../messages/features/${locale}/dashboard/collections-admin.json`),
    import(`../../messages/features/${locale}/dashboard/subscriptions.json`),
    import(`../../messages/features/${locale}/dashboard/analytics.json`),
    import(`../../messages/features/${locale}/dashboard/trips.json`),
    import(`../../messages/features/${locale}/dashboard/magazine.json`),
    import(`../../messages/features/${locale}/dashboard/open-call-public.json`),
    import(`../../messages/features/${locale}/dashboard/application-form.json`),
    import(`../../messages/features/${locale}/dashboard/engagements.json`),
    import(`../../messages/features/${locale}/dashboard/reports.json`),
    import(`../../messages/features/${locale}/dashboard/finance.json`),
    import(`../../messages/features/${locale}/dashboard/messaging.json`),
    import(`../../messages/features/${locale}/dashboard/security.json`),
    import(`../../messages/features/${locale}/dashboard/notifications.json`),
    import(`../../messages/features/${locale}/dashboard/change-password.json`),
    import(`../../messages/features/${locale}/dashboard/account.json`),
    import(`../../messages/features/${locale}/dashboard/availability.json`),
    import(`../../messages/features/${locale}/dashboard/translations.json`),
    /** Large shared surfaces (content library, CMS editor, roles UI). */
    import(`../../messages/features/${locale}/dashboard/admin-surfaces.json`),
    import(`../../messages/features/${locale}/dashboard/cms-home.json`),
    import(`../../messages/features/${locale}/dashboard/cms-static.json`),
    import(`../../messages/features/${locale}/dashboard/cms-page-editor.json`),
    import(`../../messages/features/${locale}/dashboard/cms-branding.json`),
    import(`../../messages/features/${locale}/dashboard/cms-nav.json`),
    import(`../../messages/features/${locale}/dashboard/books.json`),
    import(`../../messages/features/${locale}/dashboard/writers.json`),
    import(`../../messages/features/${locale}/dashboard/media-library.json`),
    /**
     * Shell merged last so `Dashboard.sidebar` (system settings, profile, etc.),
     * layout, topbar, and shared placeholders are never overwritten by other slices.
     */
    import(`../../messages/features/${locale}/dashboard/shell.json`),
  ];
}

async function loadDashboardMessages(locale: AppLocale): Promise<Record<string, unknown>> {
  const modules = await Promise.all(dashboardImports(locale));
  let dashboard: Record<string, unknown> = {};
  for (const mod of modules) {
    const d = (mod.default as { Dashboard?: Record<string, unknown> }).Dashboard;
    if (d) dashboard = deepMergeRecords(dashboard, d);
  }
  return dashboard;
}

/**
 * Merges optional locale root (`messages/{locale}.json`, often `{}`) with
 * feature slices under `messages/features/{locale}/*.json`.
 * Dashboard strings are split under `messages/features/{locale}/dashboard/*.json` and deep-merged.
 */
export async function loadMessages(locale: AppLocale) {

  const [core, navbar, home, homeNext, magazineNext, auth, notFound, contribute, content, startAnIssue, openIssues, publicDetail, comingSoon, collections, subscribe, community, legal, dashboardMerged] = await Promise.all([
    import(`../../messages/${locale}.json`),
    import(`../../messages/features/${locale}/navbar.json`),
    import(`../../messages/features/${locale}/home.json`),
    import(`../../messages/features/${locale}/home-next.json`),
    import(`../../messages/features/${locale}/magazine-next.json`),
    import(`../../messages/features/${locale}/auth.json`),
    import(`../../messages/features/${locale}/notFound.json`),
    import(`../../messages/features/${locale}/contribute.json`),
    import(`../../messages/features/${locale}/content.json`),
    import(`../../messages/features/${locale}/start-an-issue.json`),
    import(`../../messages/features/${locale}/open-issues.json`),
    import(`../../messages/features/${locale}/public-detail.json`),
    import(`../../messages/features/${locale}/comingSoon.json`),
    import(`../../messages/features/${locale}/collections.json`),
    import(`../../messages/features/${locale}/subscribe.json`),
    import(`../../messages/features/${locale}/community.json`),
    import(`../../messages/features/${locale}/legal.json`),
    loadDashboardMessages(locale),
  ]);

  return {
    ...core.default,
    ...navbar.default,
    ...home.default,
    ...homeNext.default,
    ...magazineNext.default,
    ...auth.default,
    ...notFound.default,
    ...contribute.default,
    ...content.default,
    ...startAnIssue.default,
    ...openIssues.default,
    ...publicDetail.default,
    ...comingSoon.default,
    ...collections.default,
    ...subscribe.default,
    ...community.default,
    ...legal.default,
    Dashboard: dashboardMerged,
  } as Record<string, unknown>;
}
