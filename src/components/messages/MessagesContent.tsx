"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import { DashboardHeader } from "@/components/dashboard/shared/DashboardHeader";
import { SearchIcon, SendIcon, XIcon } from "@/components/ui/icons";
import { useAuthUser } from "@/components/providers/AuthProvider";
import { useDmThreads, useDmMessages, useDmUserSearch, dmKeys } from "@/hooks/queries/dm";
import { useSendDmMessage, useStartDmThread, useMarkDmThreadRead } from "@/hooks/mutations/dm";
import { useDmSocket } from "@/hooks/useDmSocket";
import { dmUserDisplayName, type DmMessage, type DmUser } from "@/services/dm.service";

function initials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("") || "U";
}

function fmtTime(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

function NewDmSearch({ onStart }: { onStart: (user: DmUser) => void }) {
  const t = useTranslations("Dashboard.messages");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { data: results, isFetching } = useDmUserSearch(query);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-elevated)] px-3 py-2 text-start text-sm text-[var(--tott-muted)] transition-colors hover:border-[var(--tott-accent-gold)]/50"
      >
        {t("newMessage")}
      </button>
    );
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <span className="absolute start-3 top-1/2 -translate-y-1/2 text-[var(--tott-muted)]">
          <SearchIcon />
        </span>
        <input
          autoFocus
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("searchUsersPlaceholder")}
          className="w-full rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] py-2 ps-9 pe-8 text-sm text-foreground outline-none focus:border-[var(--tott-accent-gold)]/60"
        />
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setQuery("");
          }}
          className="absolute end-2 top-1/2 -translate-y-1/2 text-[var(--tott-muted)] hover:text-foreground"
          aria-label={t("cancel")}
        >
          <XIcon />
        </button>
      </div>
      {query.trim().length >= 2 ? (
        <div className="max-h-56 overflow-y-auto rounded-lg border border-[var(--tott-card-border)]">
          {isFetching ? (
            <p className="px-3 py-3 text-xs text-[var(--tott-muted)]">{t("searching")}</p>
          ) : results && results.length > 0 ? (
            results.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => {
                  onStart(u);
                  setOpen(false);
                  setQuery("");
                }}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-start text-sm transition-colors hover:bg-[var(--tott-dash-ghost-hover)]"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--tott-elevated)] text-[10px] font-semibold text-[var(--tott-gold)]">
                  {initials(dmUserDisplayName(u))}
                </span>
                <span className="truncate text-foreground">{dmUserDisplayName(u)}</span>
              </button>
            ))
          ) : (
            <p className="px-3 py-3 text-xs text-[var(--tott-muted)]">{t("noUsersFound")}</p>
          )}
        </div>
      ) : null}
    </div>
  );
}

export function MessagesContent() {
  const t = useTranslations("Dashboard.messages");
  const user = useAuthUser();
  const qc = useQueryClient();

  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  const { data: threadsPage, isLoading: threadsLoading } = useDmThreads();
  const threads = useMemo(() => threadsPage?.rows ?? [], [threadsPage]);

  const { data: messagesPage, isLoading: messagesLoading } = useDmMessages(activeThreadId);
  const messages = useMemo(() => messagesPage?.rows ?? [], [messagesPage]);

  const activeThread = threads.find((th) => th.id === activeThreadId) ?? null;

  const startThread = useStartDmThread();
  const sendMessage = useSendDmMessage();
  const markRead = useMarkDmThreadRead();

  const socket = useDmSocket(Boolean(user));

  useEffect(() => {
    if (!socket || !activeThreadId) return;
    socket.emit("join_thread", { thread_id: activeThreadId });
    return () => {
      socket.emit("leave_thread", { thread_id: activeThreadId });
    };
  }, [socket, activeThreadId]);

  useEffect(() => {
    if (!socket) return;
    function onNewMessage(payload: DmMessage & { thread_id: string }) {
      qc.invalidateQueries({ queryKey: dmKeys.messages(payload.thread_id) });
      qc.invalidateQueries({ queryKey: dmKeys.threads() });
      qc.invalidateQueries({ queryKey: dmKeys.unreadTotal() });
    }
    socket.on("new_message", onNewMessage);
    return () => {
      socket.off("new_message", onNewMessage);
    };
  }, [socket, qc]);

  useEffect(() => {
    if (activeThreadId) markRead.mutate(activeThreadId);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fire once per thread switch
  }, [activeThreadId]);

  const handleStartThread = useCallback(
    (recipient: DmUser) => {
      startThread.mutate(recipient.id, {
        onSuccess: (thread) => setActiveThreadId(thread.id),
      });
    },
    [startThread],
  );

  const handleSend = useCallback(() => {
    const content = draft.trim();
    if (!content || !activeThreadId) return;
    setDraft("");
    if (socket) {
      socket.emit("send_message", { thread_id: activeThreadId, content });
      qc.invalidateQueries({ queryKey: dmKeys.messages(activeThreadId) });
    } else {
      sendMessage.mutate({ threadId: activeThreadId, content });
    }
  }, [draft, activeThreadId, socket, sendMessage, qc]);

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <DashboardHeader title={t("title")} subtitle={t("subtitle")} compactPadding />

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 md:grid-cols-[280px_minmax(0,1fr)]">
        {/* Thread list */}
        <aside className="flex min-h-0 flex-col gap-3 overflow-hidden">
          <NewDmSearch onStart={handleStartThread} />
          <div className="min-h-0 flex-1 overflow-y-auto rounded-lg border border-[var(--tott-card-border)]">
            {threadsLoading ? (
              <p className="px-3 py-6 text-center text-xs text-[var(--tott-muted)]">{t("loading")}</p>
            ) : threads.length === 0 ? (
              <p className="px-3 py-6 text-center text-xs text-[var(--tott-muted)]">{t("noConversations")}</p>
            ) : (
              threads.map((th) => {
                const isActive = th.id === activeThreadId;
                const name = dmUserDisplayName(th.other_user);
                return (
                  <button
                    key={th.id}
                    type="button"
                    onClick={() => setActiveThreadId(th.id)}
                    className={`flex w-full items-center gap-2.5 border-b border-[var(--tott-card-border)] px-3 py-2.5 text-start transition-colors last:border-b-0 hover:bg-[var(--tott-dash-ghost-hover)] ${
                      isActive ? "bg-[var(--tott-accent-gold)]/8" : ""
                    }`}
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--tott-elevated)] text-xs font-semibold text-[var(--tott-gold)]">
                      {initials(name)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-medium text-foreground">{name}</span>
                        {th.unread_count > 0 ? (
                          <span className="flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full bg-[var(--tott-accent-gold)] px-1 text-[10px] font-semibold text-[var(--tott-on-accent)]">
                            {th.unread_count}
                          </span>
                        ) : null}
                      </span>
                      <span className="block truncate text-xs text-[var(--tott-muted)]">
                        {th.last_message_preview ?? t("noMessagesYet")}
                      </span>
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* Active thread */}
        <section className="flex min-h-0 flex-col rounded-lg border border-[var(--tott-card-border)]">
          {!activeThread ? (
            <div className="flex flex-1 items-center justify-center text-sm text-[var(--tott-muted)]">
              {t("selectConversation")}
            </div>
          ) : (
            <>
              <div className="flex shrink-0 items-center gap-2.5 border-b border-[var(--tott-card-border)] px-4 py-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--tott-elevated)] text-xs font-semibold text-[var(--tott-gold)]">
                  {initials(dmUserDisplayName(activeThread.other_user))}
                </span>
                <span className="truncate text-sm font-medium text-foreground">
                  {dmUserDisplayName(activeThread.other_user)}
                </span>
              </div>

              <div className="flex min-h-0 flex-1 flex-col-reverse overflow-y-auto px-4 py-3">
                <div className="space-y-2">
                  {messagesLoading ? (
                    <p className="text-center text-xs text-[var(--tott-muted)]">{t("loading")}</p>
                  ) : (
                    messages.map((m) => {
                      const mine = m.sender_id === user?.id;
                      return (
                        <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                          <div
                            className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${
                              mine
                                ? "bg-[var(--tott-accent-gold)] text-[var(--tott-on-accent)]"
                                : "bg-[var(--tott-elevated)] text-foreground"
                            }`}
                          >
                            <p className="whitespace-pre-wrap break-words">{m.content}</p>
                            <p
                              className={`mt-1 text-[10px] ${
                                mine ? "text-[var(--tott-on-accent)]/70" : "text-[var(--tott-muted)]"
                              }`}
                            >
                              {fmtTime(m.createdAt)}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2 border-t border-[var(--tott-card-border)] px-3 py-3">
                <input
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder={t("messagePlaceholder")}
                  className="min-w-0 flex-1 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--tott-accent-gold)]/60"
                />
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!draft.trim()}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--tott-accent-gold)] text-[var(--tott-on-accent)] transition-opacity hover:opacity-90 disabled:opacity-40"
                  aria-label={t("send")}
                >
                  <SendIcon />
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
