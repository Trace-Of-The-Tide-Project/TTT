/**
 * Browser-side event emitted when the local session changes (login / logout /
 * a refresh the backend rejected). Lives here rather than in
 * `services/auth.service.ts` so `services/api.ts` can emit it without the two
 * modules importing each other.
 */
export const AUTH_STATE_CHANGED_EVENT = "tot:auth-state-changed";

export function emitAuthStateChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(AUTH_STATE_CHANGED_EVENT));
}
