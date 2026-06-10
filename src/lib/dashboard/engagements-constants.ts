// Types matching the backend API response shapes.
// Sample data arrays have been removed — the page now fetches real data.

export type CommentAuthor = {
  id: string;
  username: string;
  full_name: string;
  avatar: string | null;
};

export type Comment = {
  id: string;
  content: string;
  author: CommentAuthor | null;
  is_flagged: boolean;
  likes: number;
  replies: number;
  createdAt: string;
};

export type TrendingDiscussion = {
  id: string;
  title: string;
  status: string;
  is_locked: boolean;
  author: CommentAuthor | null;
  comment_count: number;
  participant_count: number;
  createdAt: string;
};

export type Badge = {
  id: string;
  name: string;
  description: string;
  icon: string;
  recipient_count: number;
  createdAt: string;
};