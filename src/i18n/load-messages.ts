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
    import(`../../messages/features/${locale}/dashboard/trips.json`),
    import(`../../messages/features/${locale}/dashboard/open-call-public.json`),
    import(`../../messages/features/${locale}/dashboard/application-form.json`),
    import(`../../messages/features/${locale}/dashboard/engagements.json`),
    import(`../../messages/features/${locale}/dashboard/reports.json`),
    import(`../../messages/features/${locale}/dashboard/finance.json`),
    import(`../../messages/features/${locale}/dashboard/messaging.json`),
    import(`../../messages/features/${locale}/dashboard/security.json`),
    import(`../../messages/features/${locale}/dashboard/notifications.json`),
    import(`../../messages/features/${locale}/dashboard/change-password.json`),
    /** Large shared surfaces (content library, CMS editor, roles UI). */
    import(`../../messages/features/${locale}/dashboard/admin-surfaces.json`),
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
  const [core, navbar, home, auth, notFound, contribute, dashboardMerged] = await Promise.all([
    import(`../../messages/${locale}.json`),
    import(`../../messages/features/${locale}/navbar.json`),
    import(`../../messages/features/${locale}/home.json`),
    import(`../../messages/features/${locale}/auth.json`),
    import(`../../messages/features/${locale}/notFound.json`),
    import(`../../messages/features/${locale}/contribute.json`),
    loadDashboardMessages(locale),
  ]);

  return {
    ...core.default,
    ...navbar.default,
    ...home.default,
    ...auth.default,
    ...notFound.default,
    ...contribute.default,
    Dashboard: dashboardMerged,
  } as Record<string, unknown>;
}
