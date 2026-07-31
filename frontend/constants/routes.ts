export const ROUTES = {
  HOME: "/",
  CATALOG: "/catalog",
  CREATE: "/create",
  WRITE: "/create",
  LOGIN: "/login",
  REGISTER: "/register",
  PROFILE: "/profile",
  LIBRARY: "/library",
  HISTORY: "/history",
  MY_WORKS: "/my-works",
  SETTINGS: "/settings",
  ADMIN: "/admin",
  work: (id: string) => `/works/${id}`,
  readChapter: (id: string, chapterId: string) => `/works/${id}/read/${chapterId}`
} as const;
