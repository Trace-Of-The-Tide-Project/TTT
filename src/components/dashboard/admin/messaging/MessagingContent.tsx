"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { theme } from "@/lib/theme";
import {
  ChevronDownIcon,
  ContributeIcon,
  MoreDotsIcon,
  SearchIcon,
  SendIcon,
} from "@/components/ui/icons";
import { sampleThreads, type Thread } from "@/lib/dashboard/messaging-constants";
import {
  CreateMessageTemplateModal,
  type MessageTemplate,
} from "@/components/dashboard/modals/CreateMessageTemplateModal";
import { EditMessageTemplateModal } from "@/components/dashboard/modals/EditMessageTemplateModal";

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

const KNOWN_TEMPLATE_IDS = new Set(["tpl1", "tpl2", "tpl3", "tpl4", "tpl5"]);

const THREAD_CATEGORY_TO_KEY: Record<Thread["category"], Exclude<CategoryKey, "all">> = {
  Support: "support",
  Payment: "payment",
  Moderation: "moderation",
  Feedback: "feedback",
};

const THREAD_PRIORITY_TO_KEY: Record<NonNullable<Thread["priority"]>, Exclude<PriorityKey, "all">> = {
  HIGH: "high",
  MED: "med",
  LOW: "low",
};

const DEFAULT_TEMPLATES: MessageTemplate[] = [
  {
    id: "tpl1",
    name: "Welcome Message",
    category: "onboarding",
    subject: "Welcome to the platform",
    body: "Hi {{name}}, welcome!",
  },
  {
    id: "tpl2",
    name: "Payment Confirmation",
    category: "payment",
    subject: "Payment confirmed",
    body: "Hi {{name}}, your payment was confirmed.",
  },
  {
    id: "tpl3",
    name: "Content Approved",
    category: "moderation",
    subject: "Your content was approved",
    body: "Hi {{name}}, great news — approved!",
  },
  {
    id: "tpl4",
    name: "Account Warning",
    category: "moderation",
    subject: "Account warning",
    body: "Hi {{name}}, please review this warning.",
  },
  {
    id: "tpl5",
    name: "Feature Announcement",
    category: "broadcast",
    subject: "New feature announcement",
    body: "Hi {{name}}, check out what's new!",
  },
];

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
        className={`inline-flex h-[42px] items-center justify-between gap-3 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] px-4 text-sm text-gray-200 outline-none transition-colors focus:border-[#555] ${
          fullWidth ? "w-full" : "min-w-[140px]"
        }`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="truncate">{selectedLabel}</span>
        <span className="text-gray-500">
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

function ThreadRow({
  thread,
  selected,
  onSelect,
}: {
  thread: Thread;
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
          ? "border-[#5a4a2a] bg-[#151515]"
          : "border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] hover:bg-[#151515]"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-[#111]"
          style={{ backgroundColor: theme.accentGoldFocus }}
        >
          {getInitials(thread.senderName)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <p className="truncate text-sm font-semibold text-foreground">{thread.senderName}</p>
            {priorityKey && (
              <span className="rounded-full border border-[#3a2f1a] bg-[var(--tott-dash-input-bg)] px-2 py-0.5 text-[10px] font-semibold text-[#CBA158]">
                {t(`prioritiesShort.${priorityKey}`)}
              </span>
            )}
          </div>
          <p className="mt-1 truncate text-xs text-gray-400">{thread.subject}</p>
          <p className="mt-1 truncate text-xs text-gray-500">{thread.preview}</p>
        </div>
      </div>
    </button>
  );
}

function threadMatchesCategory(thread: Thread, selected: CategoryKey) {
  if (selected === "all") return true;
  return THREAD_CATEGORY_TO_KEY[thread.category] === selected;
}

function threadMatchesPriority(thread: Thread, selected: PriorityKey) {
  if (selected === "all") return true;
  if (!thread.priority) return false;
  return THREAD_PRIORITY_TO_KEY[thread.priority] === selected;
}

export function MessagingContent() {
  const t = useTranslations("Dashboard.messagingPage");
  const tb = useTranslations("Dashboard.messagingPage.broadcast");
  const tt = useTranslations("Dashboard.messagingPage.templates");
  const ti = useTranslations("Dashboard.messagingPage.inbox");

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

  const inboxCount = useMemo(
    () => sampleThreads.filter((th) => th.status === "Inbox").length,
    [],
  );

  const threadsForTab = useMemo(() => {
    if (activeTab === "archived") return sampleThreads.filter((th) => th.status === "Archived");
    if (activeTab === "inbox") return sampleThreads.filter((th) => th.status === "Inbox");
    return [];
  }, [activeTab]);

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

  const [selectedThreadId, setSelectedThreadId] = useState<string>(() => sampleThreads[0]?.id ?? "");
  const selectedThread = useMemo(
    () => filteredThreads.find((th) => th.id === selectedThreadId) ?? filteredThreads[0] ?? null,
    [filteredThreads, selectedThreadId],
  );

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
  const [templates, setTemplates] = useState<MessageTemplate[]>(DEFAULT_TEMPLATES);
  const [editTemplateOpen, setEditTemplateOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);

  const categoryOptions = useMemo(
    () => CATEGORY_KEYS.map((k) => ({ value: k, label: t(`categories.${k}`) })),
    [t],
  );

  const priorityOptions = useMemo(
    () => PRIORITY_KEYS.map((k) => ({ value: k, label: t(`priorities.${k}`) })),
    [t],
  );

  const broadcastAudienceOptions = useMemo(
    () =>
      BROADCAST_AUDIENCE_KEYS.map((k) => ({
        value: k,
        label: tb(`audiences.${k}`),
      })),
    [tb],
  );

  const broadcastPriorityOptions = useMemo(
    () =>
      BROADCAST_PRIORITY_KEYS.map((k) => ({
        value: k,
        label: tb(`broadcastPriority.${k}`),
      })),
    [tb],
  );

  const templatePickerOptions = useMemo((): DropdownOption[] => {
    const tk = t as (key: string) => string;
    const fromTemplates = templates.map((tpl) => ({
      value: tpl.id,
      label: KNOWN_TEMPLATE_IDS.has(tpl.id) ? tk(`templateNames.${tpl.id}`) : tpl.name,
    }));
    return [{ value: "none", label: t("templatePicker.none") }, ...fromTemplates];
  }, [t, templates]);

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

  return (
    <div className="space-y-6 px-6 py-6 sm:px-8 sm:py-8">
      <CreateMessageTemplateModal
        open={createTemplateOpen}
        onClose={() => setCreateTemplateOpen(false)}
        onCreate={(tpl) => {
          setTemplates((prev) => [{ id: `tpl_${Date.now()}`, ...tpl }, ...prev]);
        }}
      />
      <EditMessageTemplateModal
        open={editTemplateOpen}
        template={selectedTemplate}
        onClose={() => setEditTemplateOpen(false)}
        onSave={(updated) => {
          setTemplates((prev) => prev.map((th) => (th.id === updated.id ? updated : th)));
        }}
      />
      <div className="flex w-fit gap-1 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-inset)] p-1">
        {MESSAGE_TAB_IDS.map((tabId) => (
          <button
            key={tabId}
            type="button"
            onClick={() => setActiveTab(tabId)}
            className={`rounded-md px-5 py-2.5 text-sm font-medium transition-all ${
              activeTab === tabId
                ? "border border-[#4A4A4A] bg-[var(--tott-dash-control-bg)] text-foreground shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]"
                : "border border-transparent bg-transparent text-[#AAAAAA] hover:text-[#E0E0E0]"
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
            <p className="mt-1 text-sm text-gray-500">{tb("subtitle")}</p>
          </div>

          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">{tb("targetAudience")}</label>
                <Dropdown
                  open={broadcastAudienceOpen}
                  onOpenChange={(v) => {
                    setBroadcastAudienceOpen(v);
                    if (v) {
                      setBroadcastPriorityOpen(false);
                      setBroadcastTemplateOpen(false);
                    }
                  }}
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
                  onOpenChange={(v) => {
                    setBroadcastPriorityOpen(v);
                    if (v) {
                      setBroadcastAudienceOpen(false);
                      setBroadcastTemplateOpen(false);
                    }
                  }}
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
                onOpenChange={(v) => {
                  setBroadcastTemplateOpen(v);
                  if (v) {
                    setBroadcastAudienceOpen(false);
                    setBroadcastPriorityOpen(false);
                  }
                }}
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
                className="h-[46px] w-full rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-4 text-sm text-foreground placeholder:text-gray-500 outline-none transition-colors focus:border-[#555]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">{tb("message")}</label>
              <textarea
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                placeholder={tb("messagePlaceholder")}
                rows={6}
                className="w-full resize-y rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-4 py-3 text-sm text-foreground placeholder:text-gray-500 outline-none transition-colors focus:border-[#555]"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-3">
              <button
                type="button"
                onClick={() => {
                  setBroadcastSubject("");
                  setBroadcastMessage("");
                }}
                className="h-[46px] rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-inset)] text-sm font-medium text-gray-200 transition-colors hover:bg-[var(--tott-dash-control-bg)]"
              >
                {tb("cancel")}
              </button>
              <button
                type="button"
                onClick={() => {
                  // Placeholder: wire to drafts API.
                }}
                className="inline-flex h-[46px] items-center justify-center gap-2 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-inset)] text-sm font-medium text-gray-200 transition-colors hover:bg-[var(--tott-dash-control-bg)]"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                {tb("saveDraft")}
              </button>
              <button
                type="button"
                onClick={() => {
                  // Placeholder: wire to send broadcast API.
                }}
                className="inline-flex h-[46px] items-center justify-center gap-2 rounded-lg text-sm font-semibold text-black transition-colors hover:opacity-90"
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
              <p className="mt-1 text-sm text-gray-500">{tt("subtitle")}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setCreateTemplateOpen(true);
              }}
              className="h-[40px] rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-inset)] px-4 text-sm font-medium text-gray-200 transition-colors hover:bg-[var(--tott-dash-control-bg)]"
            >
              {tt("createButton")}
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {templates.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => {
                  setSelectedTemplate(tpl);
                  setEditTemplateOpen(true);
                }}
                className="flex items-center justify-between gap-4 rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] px-6 py-5 text-start transition-colors hover:bg-[#151515]"
              >
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold text-foreground">{tpl.name}</p>
                  <p className="mt-1 truncate text-sm text-gray-500">
                    {(tt as (key: string) => string)(`categoryLabels.${tpl.category}`)}…
                  </p>
                </div>
                <span className="shrink-0 [&_svg]:h-4 [&_svg]:w-4" style={{ color: "#E8DDC0" }}>
                  <ContributeIcon />
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative flex-1">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                <SearchIcon />
              </span>
              <input
                type="text"
                placeholder={ti("searchPlaceholder")}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] py-2.5 pl-10 pr-4 text-sm text-foreground placeholder-gray-500 focus:border-[#555] focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Dropdown
                open={categoryOpen}
                onOpenChange={(v) => {
                  setCategoryOpen(v);
                  if (v) setPriorityOpen(false);
                }}
                items={categoryOptions}
                selected={category}
                onSelect={(v) => setCategory(v as CategoryKey)}
              />
              <Dropdown
                open={priorityOpen}
                onOpenChange={(v) => {
                  setPriorityOpen(v);
                  if (v) setCategoryOpen(false);
                }}
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
                  onSelect={() => setSelectedThreadId(th.id)}
                />
              ))}

              {filteredThreads.length === 0 && (
                <div className="rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] p-10 text-center text-gray-500">
                  {ti("emptyFiltered")}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)]">
              {selectedThread ? (
                <div className="flex h-[640px] flex-col">
                  <div className="flex items-start justify-between gap-4 border-b border-[var(--tott-card-border)] px-5 py-4">
                    <div className="flex items-start gap-3">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-[#111]"
                        style={{ backgroundColor: theme.accentGoldFocus }}
                      >
                        {getInitials(selectedThread.senderName)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {selectedThread.senderName}
                        </p>
                        <p className="truncate text-xs text-gray-500">{selectedThread.subject}</p>
                      </div>
                    </div>
                    <div className="relative">
                      <button
                        ref={threadMenuButtonRef}
                        type="button"
                        onClick={() => setThreadMenuOpen((v) => !v)}
                        className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-[var(--tott-dash-ghost-hover)] hover:text-foreground"
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
                            className="w-full rounded-md px-3 py-2 text-start text-sm text-[#CBA158] hover:bg-[var(--tott-dash-ghost-hover)]"
                            onClick={() => setThreadMenuOpen(false)}
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
                    {selectedThread.messages.map((m) => (
                      <div
                        key={m.id}
                        className={`flex items-end gap-3 ${m.align === "right" ? "justify-end" : ""}`}
                      >
                        {m.align === "left" && (
                          <div
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-[#111]"
                            style={{ backgroundColor: theme.accentGoldFocus }}
                          >
                            {m.senderInitials}
                          </div>
                        )}
                        <div
                          className={`max-w-[520px] rounded-xl border px-4 py-3 text-sm leading-relaxed ${
                            m.align === "right"
                              ? "border-[#3a2f1a] bg-[var(--tott-dash-input-bg)] text-gray-200"
                              : "border-[var(--tott-card-border)] bg-[#151515] text-gray-200"
                          }`}
                        >
                          <p className="whitespace-pre-line">{m.body}</p>
                          <p className="mt-2 text-[11px] text-gray-500">{m.timestamp}</p>
                        </div>
                        {m.align === "right" && (
                          <div
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-[#111]"
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
                      <label className="mb-1.5 block text-xs font-medium text-gray-500">{ti("useTemplate")}</label>
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
                        className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] text-gray-400 hover:text-foreground"
                        aria-label={ti("attachAria")}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M21.44 11.05 12.25 20.24a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                        </svg>
                      </button>
                      <input
                        value={composer}
                        onChange={(e) => setComposer(e.target.value)}
                        placeholder={ti("composerPlaceholder")}
                        className="h-10 flex-1 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] px-4 text-sm text-foreground placeholder-gray-500 outline-none transition-colors focus:border-[#555]"
                      />
                      <button
                        type="button"
                        onClick={() => setComposer("")}
                        className="flex h-10 w-10 items-center justify-center rounded-lg text-black transition-colors hover:opacity-90"
                        style={{ backgroundColor: theme.accentGoldFocus }}
                        aria-label={ti("sendAria")}
                      >
                        <SendIcon />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex h-[640px] items-center justify-center text-gray-500">
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
