"use client";

import { useState, useEffect } from "react";
import { LinkIcon, MoreDotsIcon } from "@/components/ui/icons";
import { checkIsFollowing, toggleFollow } from "@/services/follows.service";
import { getStoredToken } from "@/services/auth.service";

type ContentAuthorCardProps = {
  authorId?: string;
  name: string;
  initials: string;
  link?: string;
  color?: string;
};

export function ContentAuthorCard({
  authorId,
  name,
  initials,
  link,
  color = "black",
}: ContentAuthorCardProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    if (!authorId || !getStoredToken()) return;
    checkIsFollowing(authorId).then(setIsFollowing).catch(() => {});
  }, [authorId]);

  const handleFollow = async () => {
    if (!authorId || toggling) return;
    setToggling(true);
    setIsFollowing((prev) => !prev);
    try {
      const followed = await toggleFollow(authorId);
      setIsFollowing(followed);
    } catch {
      setIsFollowing((prev) => !prev);
    } finally {
      setToggling(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-base font-bold"
        style={{ backgroundColor: color, color: "#1a1a1a" }}
      >
        {initials}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <p className="min-w-0 flex-1 text-lg font-bold text-white wrap-break-word">{name}</p>
          <button
            type="button"
            className="shrink-0 rounded-lg border border-gray-600 p-1.5 text-white hover:text-white/80"
          >
            <MoreDotsIcon />
          </button>
          <button
            type="button"
            onClick={handleFollow}
            disabled={toggling || !authorId}
            className="shrink-0 rounded-lg px-4 py-1.5 text-xs font-semibold transition-colors hover:opacity-90 disabled:opacity-50"
            style={{
              backgroundColor: isFollowing ? "transparent" : "#C9A96E",
              color: isFollowing ? "#C9A96E" : "#1a1a1a",
              border: isFollowing ? "1px solid #C9A96E" : "none",
            }}
          >
            {isFollowing ? "Following" : "Follow"}
          </button>
        </div>
        {link && (
          <p className="mt-1 flex items-center gap-1.5 text-sm break-all" style={{ color: "#C9A96E" }}>
            <LinkIcon />
            <span>{link}</span>
          </p>
        )}
      </div>
    </div>
  );
}
