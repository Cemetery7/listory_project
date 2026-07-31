export type StoryComment = {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  author: {
    id: string;
    username: string;
    avatar: string | null;
  };
};
