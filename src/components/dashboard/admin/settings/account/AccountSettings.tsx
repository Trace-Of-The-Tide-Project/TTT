"use client";

import { AccountOverview } from "./AccountOverview";
import { AccountSessions } from "./AccountSessions";
import { AccountDataExport } from "./AccountDataExport";
import { AccountDangerZone } from "./AccountDangerZone";

/**
 * The user-facing Account settings page. Composes the read-only overview,
 * active-session management, data export, and the destructive danger zone.
 */
export function AccountSettings() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <AccountOverview />
      <AccountSessions />
      <AccountDataExport />
      <AccountDangerZone />
    </div>
  );
}
