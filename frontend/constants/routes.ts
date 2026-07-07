export const ROUTES = {
  HOME: "/",
  CATALOG: "/catalog",
  WRITE: "/write",
  LOGIN: "/login",
  REGISTER: "/register",
  PROFILE: "/profile",
  work: (id: string) => `/works/${id}`,
  readChapter: (id: string, chapterId: string) => `/works/${id}/read/${chapterId}`
} as const;
