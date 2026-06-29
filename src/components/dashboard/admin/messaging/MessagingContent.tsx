"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { theme } from "@/lib/theme";
import {
  ChevronDownIcon,
  ContributeIcon,
  MoreDotsIcon,
  SearchIcon,
  SendIcon,
} from "@/components/ui/icons";
import {
  CreateMessageTemplateModal,
  type MessageTemplate,
} from "@/components/dashboard/modals/CreateMessageTemplateModal";
import type { MessageTemplateCategory } from "@/components/dashboard/modals/CreateMessageTemplateModal";
import { EditMessageTemplateModal } from "@/components/dashboard/modals/EditMessageTemplateModal";
import { useAuthUser } from "@/components/providers/AuthProvider";
import { ChamferedFrame } from "@/components/ui/ChamferedFrame";
import type {
  FrontendThread,
  FrontendMessage,
  ApiTemplate,
} from "@/services/messaging.service";
import { useConversations, useMessageTemplates, useConversationMessages } from "@/hooks/queries/messaging";
import {
  useArchiveConversation,
  useCreateMessageTemplate,
  useSendBroadcast,
  useSendReply,
  useUpdateMessageTemplate,
} from "@/hooks/mutations/messaging";

const MESSAGE_TAB_IDS = ["inbox", "broadcast", "templates", "archived"] as const;
type MessageTabId = (typeof MESSAGE_TAB_IDS)[number];

const CATEGORY_KEYS = ["all", "support", "payment", "moderation", "feedback"] as const;
type CategoryKey = (typeof CATEGORY_KEYS)[number];

const PRIORITY_KEYS = ["all", "high", "med", "low"] as const;
type PriorityKey = (typeof PRIORITY_KEYS)[number];

const BROADCAST_AUDIENCE_KEYS = ["allUsers", "authors", "editors", "contributors"] as const;
type BroadcastAudienceKey = (typeof BROADCAST_AUDIENCE_KEYS)[number];

const BROADCAST_PRIORITY_KEYS = ["low", "normal", "high"] as const;
type BroadcastPriorityKey = (typeof BROADCAST_PRIORITY_KEYS)[number];

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).join("") || "U";
}

type DropdownOption = { value: string; label: string };

function Dropdown({
  open,
  onOpenChange,
  items,
  selected,
  onSelect,
  menuWidthClassName,
  fullWidth,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  items: readonly DropdownOption[];
  selected: string;
  onSelect: (v: string) => void;
  menuWidthClassName?: string;
  fullWidth?: boolean;
}) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const selectedLabel = items.find((i) => i.value === selected)?.label ?? selected;

  useEffect(() => {
    if (!open) return;
    function onDocMouseDown(e: MouseEvent) {
      const target = e.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        onOpenChange(false);
      }
    }
    function onDocKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onOpenChange(false);
    }
    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onDocKeyDown);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onDocKeyDown);
    };
  }, [open, onOpenChange]);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => onOpenChange(!open)}
        className={`inline-flex h-[42px] items-center justify-between gap-3 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] px-4 text-sm text-foreground outline-none transition-colors focus:border-[var(--tott-card-border)] ${
          fullWidth ? "w-full" : "min-w-[140px]"
        }`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="truncate">{selectedLabel}</span>
        <span className="text-[var(--tott-muted)]">
          <ChevronDownIcon />
        </span>
      </button>

      {open && (
        <div
          ref={menuRef}
          role="listbox"
          className={`absolute start-0 top-full z-20 mt-2 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-inset)] p-2 shadow-xl ${
            menuWidthClassName ?? "w-[200px]"
          }`}
        >
          {items.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onSelect(opt.value);
                onOpenChange(false);
              }}
              className="w-full rounded-md px-3 py-2 text-start text-sm text-foreground hover:bg-[var(--tott-dash-ghost-hover)]"
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const THREAD_CATEGORY_TO_KEY: Record<FrontendThread["category"], Exclude<CategoryKey, "all">> = {
  Support: "support",
  Payment: "payment",
  Moderation: "moderation",
  Feedback: "feedback",
};

const THREAD_PRIORITY_TO_KEY: Record<"HIGH" | "MED" | "LOW", Exclude<PriorityKey, "all">> = {
  HIGH: "high",
  MED: "med",
  LOW: "low",
};

function threadMatchesCategory(thread: FrontendThread, selected: CategoryKey) {
  if (selected === "all") return true;
  return THREAD_CATEGORY_TO_KEY[thread.category] === selected;
}

function threadMatchesPriority(thread: FrontendThread, selected: PriorityKey) {
  if (selected === "all") return true;
  if (!thread.priority) return false;
  return THREAD_PRIORITY_TO_KEY[thread.priority] === selected;
}

function ThreadRow({
  thread,
  selected,
  onSelect,
}: {
  thread: FrontendThread;
  selected: boolean;
  onSelect: () => void;
}) {
  const t = useTranslations("Dashboard.messagingPage");
  const priorityKey = thread.priority ? THREAD_PRIORITY_TO_KEY[thread.priority] : null;
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-xl border px-4 py-4 text-start transition-colors ${
        selected
          ? "border-[var(--tott-accent-gold)] bg-[var(--tott-elevated)]"
          : "border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] hover:bg-[var(--tott-elevated-hover)]"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-[var(--tott-on-accent)]"
          style={{ backgroundColor: theme.accentGoldFocus }}
        >
          {getInitials(thread.senderName)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <p className="truncate text-sm font-semibold text-foreground">{thread.senderName}</p>
            {priorityKey && (
              <span className="rounded-full border border-[var(--tott-accent-gold)] bg-[var(--tott-dash-input-bg)] px-2 py-0.5 text-[10px] font-semibold text-[var(--tott-dash-gold-text)]">
                {t(`prioritiesShort.${priorityKey}`)}
              </span>
            )}
          </div>
          <p className="mt-1 truncate text-xs text-[var(--tott-muted)]">{thread.subject}</p>
          <p className="mt-1 truncate text-xs text-[var(--tott-muted)]">{thread.preview}</p>
        </div>
      </div>
    </button>
  );
}

// ── Main component ─────────────────────────────────────────────

export function MessagingContent() {
  const t = useTranslations("Dashboard.messagingPage");
  const tb = useTranslations("Dashboard.messagingPage.broadcast");
  const tt = useTranslations("Dashboard.messagingPage.templates");
  const ti = useTranslations("Dashboard.messagingPage.inbox");
  const currentUser = useAuthUser();

  const [activeTab, setActiveTab] = useState<MessageTabId>("inbox");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryKey>("all");
  const [priority, setPriority] = useState<PriorityKey>("all");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [priorityOpen, setPriorityOpen] = useState(false);
  const [templateOpen, setTemplateOpen] = useState(false);
  const [composerTemplateId, setComposerTemplateId] = useState("none");
  const [threadMenuOpen, setThreadMenuOpen] = useState(false);
  const threadMenuButtonRef = useRef<HTMLButtonElement>(null);
  const threadMenuRef = useRef<HTMLDivElement>(null);

  // Real data state
  const [selectedThreadId, setSelectedThreadId] = useState<string>("");
  const [composer, setComposer] = useState("");

  const [broadcastAudience, setBroadcastAudience] = useState<BroadcastAudienceKey>("allUsers");
  const [broadcastPriority, setBroadcastPriority] = useState<BroadcastPriorityKey>("normal");
  const [broadcastTemplateId, setBroadcastTemplateId] = useState("none");
  const [broadcastSubject, setBroadcastSubject] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcastAudienceOpen, setBroadcastAudienceOpen] = useState(false);
  const [broadcastPriorityOpen, setBroadcastPriorityOpen] = useState(false);
  const [broadcastTemplateOpen, setBroadcastTemplateOpen] = useState(false);

  const [createTemplateOpen, setCreateTemplateOpen] = useState(false);
  const [editTemplateOpen, setEditTemplateOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);

  // ── Data fetching via React Query ──────────────────────────────
  const { data: inboxThreads = [] } = useConversations("inbox");
  const { data: archivedThreads = [] } = useConversations("archived");
  const allThreads: FrontendThread[] = useMemo(
    () => [...inboxThreads, ...archivedThreads],
    [inboxThreads, archivedThreads],
  );

  // Auto-select the first thread when the inbox/archived list loads.
  // Render-phase pattern instead of an effect.
  if (
    (activeTab === "inbox" || activeTab === "archived") &&
    !selectedThreadId
  ) {
    const list = activeTab === "inbox" ? inboxThreads : archivedThreads;
    if (list.length > 0) setSelectedThreadId(list[0].id);
  }

  const { data: rawTemplates = [] } = useMessageTemplates();
  const templates: MessageTemplate[] = useMemo(
    () =>
      rawTemplates.map((t) => ({
        id: t.id,
        name: t.name,
        category: (t.category as MessageTemplateCategory) || "support",
        subject: t.subject || "",
        body: t.body,
      })),
    [rawTemplates],
  );

  const { data: messages = [], isFetching: loadingMessages } = useConversationMessages(
    selectedThreadId || null,
    currentUser?.id ?? null,
  );
  const messagesCache = useMemo<Record<string, FrontendMessage[]>>(
    () => (selectedThreadId ? { [selectedThreadId]: messages } : {}),
    [messages, selectedThreadId],
  );

  const handleSelectThread = useCallback((id: string) => {
    setSelectedThreadId(id);
  }, []);

  // ── Mutations ──────────────────────────────────────────────────
  const sendReplyMutation = useSendReply();
  const archiveMutation = useArchiveConversation();
  const createTemplateMutation = useCreateMessageTemplate();
  const updateTemplateMutation = useUpdateMessageTemplate();
  const sendBroadcastMutation = useSendBroadcast();
  const sendingReply = sendReplyMutation.isPending;

  // ── Thread menu dismiss ────────────────────────────────────────
  useEffect(() => {
    if (!threadMenuOpen) return;
    function onDocMouseDown(e: MouseEvent) {
      const target = e.target as Node;
      if (
        threadMenuRef.current &&
        !threadMenuRef.current.contains(target) &&
        threadMenuButtonRef.current &&
        !threadMenuButtonRef.current.contains(target)
      ) {
        setThreadMenuOpen(false);
      }
    }
    function onDocKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setThreadMenuOpen(false);
    }
    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onDocKeyDown);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onDocKeyDown);
    };
  }, [threadMenuOpen]);

  // ── Computed ───────────────────────────────────────────────────
  const inboxCount = allThreads.filter((t) => t.status === "Inbox").length;

  const threadsForTab = useMemo(() => {
    if (activeTab === "archived") return allThreads.filter((t) => t.status === "Archived");
    if (activeTab === "inbox") return allThreads.filter((t) => t.status === "Inbox");
    return [];
  }, [activeTab, allThreads]);

  const filteredThreads = useMemo(() => {
    const q = query.trim().toLowerCase();
    return threadsForTab.filter((th) => {
      const categoryOk = threadMatchesCategory(th, category);
      const priorityOk = threadMatchesPriority(th, priority);
      const queryOk =
        !q ||
        th.senderName.toLowerCase().includes(q) ||
        th.subject.toLowerCase().includes(q) ||
        th.preview.toLowerCase().includes(q);
      return categoryOk && priorityOk && queryOk;
    });
  }, [threadsForTab, query, category, priority]);

  const selectedThread = useMemo(
    () => filteredThreads.find((th) => th.id === selectedThreadId) ?? filteredThreads[0] ?? null,
    [filteredThreads, selectedThreadId],
  );

  const activeMessages = selectedThread ? (messagesCache[selectedThread.id] ?? []) : [];

  const categoryOptions = useMemo(
    () => CATEGORY_KEYS.map((k) => ({ value: k, label: t(`categories.${k}`) })),
    [t],
  );

  const priorityOptions = useMemo(
    () => PRIORITY_KEYS.map((k) => ({ value: k, label: t(`priorities.${k}`) })),
    [t],
  );

  const broadcastAudienceOptions = useMemo(
    () => BROADCAST_AUDIENCE_KEYS.map((k) => ({ value: k, label: tb(`audiences.${k}`) })),
    [tb],
  );

  const broadcastPriorityOptions = useMemo(
    () => BROADCAST_PRIORITY_KEYS.map((k) => ({ value: k, label: tb(`broadcastPriority.${k}`) })),
    [tb],
  );

  const templatePickerOptions = useMemo((): DropdownOption[] => {
    const fromTemplates = templates.map((tpl) => ({ value: tpl.id, label: tpl.name }));
    return [{ value: "none", label: t("templatePicker.none") }, ...fromTemplates];
  }, [t, templates]);

  // ── Handlers ───────────────────────────────────────────────────
  const sendingBroadcast = sendBroadcastMutation.isPending;

  const handleSendReply = () => {
    if (!selectedThread || !composer.trim()) return;
    const threadId = selectedThread.id;
    const content = composer.trim();
    const templateId = composerTemplateId !== "none" ? composerTemplateId : undefined;
    sendReplyMutation.mutate(
      { conversationId: threadId, content, templateId },
      {
        onSuccess: () => {
          setComposer("");
          setComposerTemplateId("none");
        },
      },
    );
  };

  const handleArchiveThread = () => {
    if (!selectedThread) return;
    setThreadMenuOpen(false);
    archiveMutation.mutate(selectedThread.id, {
      onSuccess: () => setSelectedThreadId(""),
    });
  };

  const handleCreateTemplate = (tpl: Omit<MessageTemplate, "id">) => {
    createTemplateMutation.mutate(tpl as Omit<ApiTemplate, "id">);
  };

  const handleSaveTemplate = (updated: MessageTemplate) => {
    updateTemplateMutation.mutate({
      id: updated.id,
      data: {
        name: updated.name,
        category: updated.category,
        subject: updated.subject,
        body: updated.body,
      },
    });
  };

  const handleSendBroadcast = (sendNow: boolean) => {
    if (!broadcastSubject.trim() || !broadcastMessage.trim()) return;
    sendBroadcastMutation.mutate(
      {
        subject: broadcastSubject.trim(),
        message: broadcastMessage.trim(),
        target_audience: broadcastAudience,
        priority: broadcastPriority,
        template_id: broadcastTemplateId !== "none" ? broadcastTemplateId : undefined,
        send: sendNow,
      },
      {
        onSuccess: () => {
          setBroadcastSubject("");
          setBroadcastMessage("");
        },
      },
    );
  };

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div className="space-y-6 px-6 py-6 sm:px-8 sm:py-8">
      <CreateMessageTemplateModal
        open={createTemplateOpen}
        onClose={() => setCreateTemplateOpen(false)}
        onCreate={handleCreateTemplate}
      />
      <EditMessageTemplateModal
        open={editTemplateOpen}
        template={selectedTemplate}
        onClose={() => setEditTemplateOpen(false)}
        onSave={handleSaveTemplate}
      />
      <div className="flex w-fit gap-1 rounded-xl bg-[var(--tott-elevated)] p-1">
        {MESSAGE_TAB_IDS.map((tabId) => (
          <button
            key={tabId}
            type="button"
            onClick={() => setActiveTab(tabId)}
            className={`rounded-md px-5 py-2.5 text-sm font-medium transition-all ${
              activeTab === tabId
                ? "bg-[var(--tott-dash-control-bg)] text-foreground"
                : "bg-transparent text-[var(--tott-tab-inactive)] hover:text-[var(--tott-tab-inactive-hover)]"
            }`}
          >
            {tabId === "inbox" ? t("tabs.inbox", { count: inboxCount }) : t(`tabs.${tabId}`)}
          </button>
        ))}
      </div>

      {activeTab === "broadcast" ? (
        <div className="rounded-2xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] p-6 lg:p-8">
          <div className="mb-6 border-b border-[var(--tott-card-border)] pb-6">
            <h2 className="text-xl font-semibold text-foreground">{tb("title")}</h2>
            <p className="mt-1 text-sm text-[var(--tott-muted)]">{tb("subtitle")}</p>
          </div>

          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">{tb("targetAudience")}</label>
                <Dropdown
                  open={broadcastAudienceOpen}
                  onOpenChange={(v) => { setBroadcastAudienceOpen(v); if (v) { setBroadcastPriorityOpen(false); setBroadcastTemplateOpen(false); } }}
                  items={broadcastAudienceOptions}
                  selected={broadcastAudience}
                  onSelect={(v) => setBroadcastAudience(v as BroadcastAudienceKey)}
                  fullWidth
                  menuWidthClassName="w-full"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">{tb("priority")}</label>
                <Dropdown
                  open={broadcastPriorityOpen}
                  onOpenChange={(v) => { setBroadcastPriorityOpen(v); if (v) { setBroadcastAudienceOpen(false); setBroadcastTemplateOpen(false); } }}
                  items={broadcastPriorityOptions}
                  selected={broadcastPriority}
                  onSelect={(v) => setBroadcastPriority(v as BroadcastPriorityKey)}
                  fullWidth
                  menuWidthClassName="w-full"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">{tb("useTemplate")}</label>
              <Dropdown
                open={broadcastTemplateOpen}
                onOpenChange={(v) => { setBroadcastTemplateOpen(v); if (v) { setBroadcastAudienceOpen(false); setBroadcastPriorityOpen(false); } }}
                items={templatePickerOptions}
                selected={broadcastTemplateId}
                onSelect={setBroadcastTemplateId}
                fullWidth
                menuWidthClassName="w-full"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">{tb("subject")}</label>
              <input
                value={broadcastSubject}
                onChange={(e) => setBroadcastSubject(e.target.value)}
                placeholder={tb("subjectPlaceholder")}
                className="h-[46px] w-full rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-4 text-sm text-foreground placeholder:text-[var(--tott-muted)] outline-none transition-colors focus:border-[var(--tott-card-border)]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">{tb("message")}</label>
              <textarea
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                placeholder={tb("messagePlaceholder")}
                rows={6}
                className="w-full resize-y rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-4 py-3 text-sm text-foreground placeholder:text-[var(--tott-muted)] outline-none transition-colors focus:border-[var(--tott-card-border)]"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-3">
              <button
                type="button"
                onClick={() => { setBroadcastSubject(""); setBroadcastMessage(""); }}
                className="h-[46px] rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-inset)] text-sm font-medium text-foreground transition-colors hover:bg-[var(--tott-dash-control-bg)]"
              >
                {tb("cancel")}
              </button>
              <button
                type="button"
                disabled={sendingBroadcast}
                onClick={() => handleSendBroadcast(false)}
                className="inline-flex h-[46px] items-center justify-center gap-2 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-inset)] text-sm font-medium text-foreground transition-colors hover:bg-[var(--tott-dash-control-bg)] disabled:opacity-50"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                {tb("saveDraft")}
              </button>
              <button
                type="button"
                disabled={sendingBroadcast}
                onClick={() => handleSendBroadcast(true)}
                className="inline-flex h-[46px] items-center justify-center gap-2 rounded-lg text-sm font-semibold text-[var(--tott-on-accent)] transition-colors hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: theme.accentGoldFocus }}
              >
                <SendIcon />
                {tb("send")}
              </button>
            </div>
          </div>
        </div>
      ) : activeTab === "templates" ? (
        <div className="rounded-2xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] p-6 lg:p-8">
          <div className="mb-6 flex flex-col gap-4 border-b border-[var(--tott-card-border)] pb-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground">{tt("title")}</h2>
              <p className="mt-1 text-sm text-[var(--tott-muted)]">{tt("subtitle")}</p>
            </div>
            <button
              type="button"
              onClick={() => setCreateTemplateOpen(true)}
              className="h-[40px] rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-inset)] px-4 text-sm font-medium text-foreground transition-colors hover:bg-[var(--tott-dash-control-bg)]"
            >
              {tt("createButton")}
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {templates.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => { setSelectedTemplate(tpl); setEditTemplateOpen(true); }}
                className="relative flex items-center justify-between gap-4 px-6 py-5 text-start transition-colors hover:bg-[var(--tott-elevated)]"
              >
                <ChamferedFrame />
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold text-foreground">{tpl.name}</p>
                  <p className="mt-1 truncate text-sm text-[var(--tott-muted)] capitalize">
                    {tpl.category}
                  </p>
                </div>
                <span className="shrink-0 [&_svg]:h-4 [&_svg]:w-4" style={{ color: "var(--tott-dash-gold-text)" }}>
                  <ContributeIcon />
                </span>
              </button>
            ))}
            {templates.length === 0 && (
              <p className="col-span-2 py-10 text-center text-sm text-[var(--tott-muted)]">{tt("emptyState")}</p>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative flex-1">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--tott-muted)]">
                <SearchIcon />
              </span>
              <input
                type="text"
                placeholder={ti("searchPlaceholder")}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-[var(--tott-muted)] focus:border-[var(--tott-card-border)] focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Dropdown
                open={categoryOpen}
                onOpenChange={(v) => { setCategoryOpen(v); if (v) setPriorityOpen(false); }}
                items={categoryOptions}
                selected={category}
                onSelect={(v) => setCategory(v as CategoryKey)}
              />
              <Dropdown
                open={priorityOpen}
                onOpenChange={(v) => { setPriorityOpen(v); if (v) setCategoryOpen(false); }}
                items={priorityOptions}
                selected={priority}
                onSelect={(v) => setPriority(v as PriorityKey)}
                menuWidthClassName="w-[160px]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[360px_1fr]">
            <div className="space-y-3">
              {filteredThreads.map((th) => (
                <ThreadRow
                  key={th.id}
                  thread={th}
                  selected={selectedThread?.id === th.id}
                  onSelect={() => handleSelectThread(th.id)}
                />
              ))}

              {filteredThreads.length === 0 && (
                <div className="relative p-10 text-center text-[var(--tott-muted)]">
                  <ChamferedFrame />
                  {ti("emptyFiltered")}
                </div>
              )}
            </div>

            <div className="relative">
              <ChamferedFrame />
              {selectedThread ? (
                <div className="flex h-[640px] flex-col">
                  <div className="flex items-start justify-between gap-4 border-b border-[var(--tott-card-border)] px-5 py-4">
                    <div className="flex items-start gap-3">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-[var(--tott-on-accent)]"
                        style={{ backgroundColor: theme.accentGoldFocus }}
                      >
                        {getInitials(selectedThread.senderName)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {selectedThread.senderName}
                        </p>
                        <p className="truncate text-xs text-[var(--tott-muted)]">{selectedThread.subject}</p>
                      </div>
                    </div>
                    <div className="relative">
                      <button
                        ref={threadMenuButtonRef}
                        type="button"
                        onClick={() => setThreadMenuOpen((v) => !v)}
                        className="rounded-lg p-2 text-[var(--tott-muted)] transition-colors hover:bg-[var(--tott-dash-ghost-hover)] hover:text-foreground"
                        aria-label={ti("threadMenuAria")}
                        aria-haspopup="menu"
                        aria-expanded={threadMenuOpen}
                      >
                        <MoreDotsIcon />
                      </button>
                      {threadMenuOpen && (
                        <div
                          ref={threadMenuRef}
                          role="menu"
                          className="absolute end-0 top-full z-20 mt-2 w-[180px] rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-inset)] p-2 shadow-xl"
                        >
                          <button
                            type="button"
                            className="w-full rounded-md px-3 py-2 text-start text-sm text-foreground hover:bg-[var(--tott-dash-ghost-hover)]"
                            onClick={() => setThreadMenuOpen(false)}
                          >
                            {ti("viewProfile")}
                          </button>
                          <button
                            type="button"
                            className="w-full rounded-md px-3 py-2 text-start text-sm text-[var(--tott-dash-gold-text)] hover:bg-[var(--tott-dash-ghost-hover)]"
                            onClick={handleArchiveThread}
                          >
                            {ti("archive")}
                          </button>
                          <button
                            type="button"
                            className="w-full rounded-md px-3 py-2 text-start text-sm text-red-400 hover:bg-[var(--tott-dash-ghost-hover)]"
                            onClick={() => setThreadMenuOpen(false)}
                          >
                            {ti("delete")}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
                    {loadingMessages && activeMessages.length === 0 && (
                      <p className="text-center text-xs text-[var(--tott-muted)]">{ti("loading")}</p>
                    )}
                    {activeMessages.map((m) => (
                      <div
                        key={m.id}
                        className={`flex items-end gap-3 ${m.align === "right" ? "justify-end" : ""}`}
                      >
                        {m.align === "left" && (
                          <div
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-[var(--tott-on-accent)]"
                            style={{ backgroundColor: theme.accentGoldFocus }}
                          >
                            {m.senderInitials}
                          </div>
                        )}
                        <div
                          className={`max-w-[520px] rounded-xl border px-4 py-3 text-sm leading-relaxed ${
                            m.align === "right"
                              ? "border-[var(--tott-accent-gold)] bg-[var(--tott-dash-input-bg)] text-foreground"
                              : "border-[var(--tott-card-border)] bg-[var(--tott-elevated)] text-foreground"
                          }`}
                        >
                          <p className="whitespace-pre-line">{m.body}</p>
                          <p className="mt-2 text-[11px] text-[var(--tott-muted)]">{m.timestamp}</p>
                        </div>
                        {m.align === "right" && (
                          <div
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-[var(--tott-on-accent)]"
                            style={{ backgroundColor: theme.accentGoldFocus }}
                          >
                            {m.senderInitials}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-[var(--tott-card-border)] p-4">
                    <div className="mb-3">
                      <label className="mb-1.5 block text-xs font-medium text-[var(--tott-muted)]">{ti("useTemplate")}</label>
                      <Dropdown
                        open={templateOpen}
                        onOpenChange={(v) => setTemplateOpen(v)}
                        items={templatePickerOptions}
                        selected={composerTemplateId}
                        onSelect={setComposerTemplateId}
                        menuWidthClassName="w-full"
                        fullWidth
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] text-[var(--tott-muted)] hover:text-foreground"
                        aria-label={ti("attachAria")}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21.44 11.05 12.25 20.24a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                        </svg>
                      </button>
                      <input
                        value={composer}
                        onChange={(e) => setComposer(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendReply(); } }}
                        placeholder={ti("composerPlaceholder")}
                        className="h-10 flex-1 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] px-4 text-sm text-foreground placeholder:text-[var(--tott-muted)] outline-none transition-colors focus:border-[var(--tott-card-border)]"
                      />
                      <button
                        type="button"
                        onClick={handleSendReply}
                        disabled={sendingReply || !composer.trim()}
                        className="flex h-10 w-10 items-center justify-center rounded-lg text-[var(--tott-on-accent)] transition-colors hover:opacity-90 disabled:opacity-50"
                        style={{ backgroundColor: theme.accentGoldFocus }}
                        aria-label={ti("sendAria")}
                      >
                        <SendIcon />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex h-[640px] items-center justify-center text-[var(--tott-muted)]">
                  {ti("selectConversation")}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
