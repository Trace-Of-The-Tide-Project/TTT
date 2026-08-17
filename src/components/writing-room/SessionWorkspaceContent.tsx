"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChamferedPanel } from "@/components/ui/ChamferedPanel";
import { Skeleton } from "@/components/ui/Skeleton";
import { uploadArticleAssetPath } from "@/services/uploads.service";
import { useSession, useSessionDrafts, useDraftComments, useMyCertificates } from "@/hooks/queries/sessions";
import { useCreateComment, useCreateDraft } from "@/hooks/mutations/sessions";
import type { SessionDetail, WorkshopDraft, DraftComment } from "@/services/sessions.service";

type CommentNode = DraftComment & { children: CommentNode[] };

function buildThread(comments: DraftComment[]): CommentNode[] {
  const nodes: CommentNode[] = comments.map((c) => ({ ...c, children: [] }));
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const roots: CommentNode[] = [];
  for (const n of nodes) {
    const parent = n.parent_comment_id ? byId.get(n.parent_comment_id) : undefined;
    if (parent) parent.children.push(n);
    else roots.push(n);
  }
  return roots;
}

function CommentNode({
  comment,
  depth,
  sessionId,
  draftId,
}: {
  comment: CommentNode;
  depth: number;
  sessionId: string;
  draftId: string;
}) {
  const t = useTranslations("WritingRoomSessions");
  const createComment = useCreateComment(sessionId, draftId);
  const [replying, setReplying] = useState(false);
  const [body, setBody] = useState("");
  const name = comment.author?.full_name || comment.author?.username || "—";

  const submit = () => {
    const trimmed = body.trim();
    if (!trimmed) return;
    createComment.mutate(
      { body: trimmed, parent_comment_id: comment.id },
      { onSuccess: () => setBody("") },
    );
  };

  return (
    <div className="space-y-3" style={{ marginInlineStart: depth * 16 }}>
      <div
        className={`rounded-md p-3 text-start text-sm ${
          comment.is_facilitator
            ? "border border-[var(--tott-accent-gold)] bg-[var(--tott-elevated)]"
            : "bg-[var(--tott-panel-bg)]"
        }`}
      >
        <div className="mb-1 flex items-center gap-2 text-xs">
          <span className="font-semibold text-[var(--tott-home-text-warm)]">{name}</span>
          {comment.is_facilitator && (
            <span className="uppercase tracking-wide text-[var(--tott-accent-gold)]">
              {t("facilitator")}
            </span>
          )}
        </div>
        <p className="text-[var(--tott-home-text-warm)]">{comment.body}</p>
        <button
          type="button"
          onClick={() => setReplying((v) => !v)}
          className="mt-1 text-xs text-[var(--tott-accent-gold)]"
        >
          {t("reply")}
        </button>
        {replying && (
          <div className="mt-2 flex gap-2">
            <input
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={t("commentPlaceholder")}
              className="flex-1 rounded-md border border-[var(--tott-card-border)] bg-transparent px-3 py-2 text-sm text-[var(--tott-home-text-warm)]"
            />
            <button
              type="button"
              disabled={createComment.isPending || !body.trim()}
              onClick={submit}
              className="rounded-md bg-[var(--tott-accent-gold)] px-3 py-2 text-sm font-medium text-black disabled:opacity-60"
            >
              {t("post")}
            </button>
          </div>
        )}
      </div>
      {comment.children.length > 0 && (
        <div className="space-y-3">
          {comment.children.map((c) => (
            <CommentNode
              key={c.id}
              comment={c}
              depth={depth + 1}
              sessionId={sessionId}
              draftId={draftId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function DraftThread({ sessionId, draft }: { sessionId: string; draft: WorkshopDraft }) {
  const t = useTranslations("WritingRoomSessions");
  const { data: commentsData, isLoading } = useDraftComments(
    sessionId,
    draft.id,
    { limit: 100 },
  );
  const comments = commentsData?.rows ?? [];
  const createComment = useCreateComment(sessionId, draft.id);
  const [body, setBody] = useState("");

  const thread = buildThread(comments);

  const submit = () => {
    const trimmed = body.trim();
    if (!trimmed) return;
    createComment.mutate({ body: trimmed }, { onSuccess: () => setBody("") });
  };

  return (
    <ChamferedPanel className="p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-start text-base font-semibold text-[var(--tott-home-text-warm)]">
          {draft.title}
        </h3>
        {draft.file_url && (
          <a
            href={draft.file_url}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-[var(--tott-accent-gold)]"
          >
            {t("viewFile")}
          </a>
        )}
      </div>

      <div className="mt-4 space-y-3">
        {isLoading ? (
          <Skeleton className="h-16 w-full" />
        ) : thread.length === 0 ? (
          <p className="text-start text-sm text-[var(--tott-salt)]">{t("noComments")}</p>
        ) : (
          thread.map((c) => (
            <CommentNode
              key={c.id}
              comment={c}
              depth={0}
              sessionId={sessionId}
              draftId={draft.id}
            />
          ))
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={t("commentPlaceholder")}
          className="flex-1 rounded-md border border-[var(--tott-card-border)] bg-transparent px-3 py-2 text-sm text-[var(--tott-home-text-warm)]"
        />
        <button
          type="button"
          disabled={createComment.isPending || !body.trim()}
          onClick={submit}
          className="rounded-md bg-[var(--tott-accent-gold)] px-4 py-2 text-sm font-medium text-black disabled:opacity-60"
        >
          {t("post")}
        </button>
      </div>
    </ChamferedPanel>
  );
}

function CertificatesSection() {
  const t = useTranslations("WritingRoomSessions");
  const { data = [], isLoading } = useMyCertificates();

  if (isLoading) return <Skeleton className="h-24 w-full" />;
  if (data.length === 0) return null;

  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  return (
    <ChamferedPanel className="mt-8 p-6">
      <h2 className="text-start text-sm font-semibold text-[var(--tott-home-text-warm)]">
        {t("myCertificates")}
      </h2>
      <ul className="mt-3 space-y-2">
        {data.map((c) => (
          <li
            key={c.id}
            className="flex items-center justify-between rounded-md bg-[var(--tott-panel-bg)] p-3 text-start text-sm"
          >
            <div>
              <p className="font-medium text-[var(--tott-home-text-warm)]">
                {c.program_title || c.program_id}
              </p>
              <p className="text-xs text-[var(--tott-salt)]">
                {t("certificateIssued", { date: fmt(c.issued_at) })}
              </p>
            </div>
            {c.file_url && (
              <a
                href={c.file_url}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-[var(--tott-accent-gold)]"
              >
                {t("certificateView")}
              </a>
            )}
          </li>
        ))}
      </ul>
    </ChamferedPanel>
  );
}

export function SessionWorkspaceContent({ session: initial }: { session: SessionDetail }) {
  const t = useTranslations("WritingRoomSessions");
  const { data } = useSession(initial.id);
  const session = data ?? initial;
  const { data: draftsData, isLoading } = useSessionDrafts(initial.id, {
    limit: 100,
  });
  const drafts = draftsData?.rows ?? [];
  const createDraft = useCreateDraft(initial.id);
  const [title, setTitle] = useState("");
  const [uploading, setUploading] = useState(false);

  const allowed = session.access?.allowed ?? false;

  const handleUpload = async (file: File) => {
    if (!title.trim()) return;
    setUploading(true);
    try {
      const filePath = await uploadArticleAssetPath(file);
      createDraft.mutate(
        { title: title.trim(), file_path: filePath },
        { onSuccess: () => setTitle("") },
      );
    } finally {
      setUploading(false);
    }
  };

  if (!allowed) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <ChamferedPanel className="p-6">
          <p className="text-start text-sm text-[var(--tott-salt)]">
            {t("workspaceRequiresTicket")}
          </p>
        </ChamferedPanel>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl text-[var(--tott-home-text-warm)] sm:text-4xl">
        {session.title}
      </h1>
      <p className="mt-2 text-start text-sm text-[var(--tott-salt)]">{t("workspaceSubtitle")}</p>

      <ChamferedPanel className="mt-8 p-6">
        <h2 className="text-start text-sm font-semibold text-[var(--tott-home-text-warm)]">
          {t("uploadDraft")}
        </h2>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("draftTitlePlaceholder")}
            className="flex-1 rounded-md border border-[var(--tott-card-border)] bg-transparent px-3 py-2 text-sm text-[var(--tott-home-text-warm)]"
          />
          <label className="cursor-pointer rounded-md bg-[var(--tott-accent-gold)] px-4 py-2 text-center text-sm font-medium text-black">
            {uploading ? t("uploading") : t("chooseFile")}
            <input
              type="file"
              className="hidden"
              disabled={uploading || !title.trim()}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleUpload(file);
                e.target.value = "";
              }}
            />
          </label>
        </div>
      </ChamferedPanel>

      <div className="mt-8 space-y-6">
        {isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : drafts.length === 0 ? (
          <p className="text-start text-sm text-[var(--tott-salt)]">{t("noDrafts")}</p>
        ) : (
          drafts.map((d) => <DraftThread key={d.id} sessionId={initial.id} draft={d} />)
        )}
      </div>

      <CertificatesSection />
    </section>
  );
}
