export type WorkStatus = "ongoing" | "completed" | "draft";

export type Work = {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverUrl: string | null;
  coverClass: string;
  authorId: string;
  author: string;
  authorAvatar: string | null;
  category: string;
  fandom: string;
  status: WorkStatus;
  rating: number;
  views: string;
  likes: string;
  commentsCount: number;
  chaptersCount: number;
  tags: string[];
  updatedAt: string;
};

export type Author = {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  worksCount: number;
};

export type UpdateItem = {
  id: string;
  title: string;
  chapter: string;
  time: string;
};
