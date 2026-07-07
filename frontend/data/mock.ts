import type { Author, UpdateItem, Work } from "@/entities/work/types";

export const works: Work[] = [
  {
    id: "1",
    title: "Письма из северного архива",
    slug: "letters-from-north-archive",
    description: "Молодая архивистка находит дневник экспедиции и город, которого нет ни на одной карте.",
    coverClass: "cover-aurora",
    author: "Мира Вейс",
    category: "Оригинальное",
    fandom: "Северные земли",
    status: "ongoing",
    rating: 4.9,
    views: "128K",
    likes: "18K",
    commentsCount: 842,
    chaptersCount: 24,
    tags: ["фэнтези", "тайна", "приключения"],
    updatedAt: "сегодня"
  },
  {
    id: "2",
    title: "Город под стеклянным небом",
    slug: "glass-sky-city",
    description: "Неоновая драма о людях, которые продают воспоминания, чтобы купить себе будущее.",
    coverClass: "cover-neon",
    author: "Рен Солов",
    category: "Драма",
    fandom: "Новые миры",
    status: "completed",
    rating: 4.8,
    views: "94K",
    likes: "11K",
    commentsCount: 516,
    chaptersCount: 18,
    tags: ["киберпанк", "драма", "город"],
    updatedAt: "вчера"
  },
  {
    id: "3",
    title: "Когда маяк отвечает",
    slug: "when-lighthouse-answers",
    description: "Уютная история о письмах, море и голосе, который слышно только в тумане.",
    coverClass: "cover-coast",
    author: "Лея Туманова",
    category: "Романтика",
    fandom: "Береговые города",
    status: "ongoing",
    rating: 4.7,
    views: "67K",
    likes: "9K",
    commentsCount: 391,
    chaptersCount: 12,
    tags: ["романтика", "повседневность", "уют"],
    updatedAt: "2 часа назад"
  },
  {
    id: "4",
    title: "Карта последней весны",
    slug: "last-spring-map",
    description: "Путешествие через континент, где каждое место исчезает после последнего цветения.",
    coverClass: "cover-spring",
    author: "Эн Норд",
    category: "Макси",
    fandom: "Зеленый материк",
    status: "completed",
    rating: 4.9,
    views: "153K",
    likes: "22K",
    commentsCount: 1104,
    chaptersCount: 36,
    tags: ["приключения", "hurt/comfort", "магия"],
    updatedAt: "на неделе"
  }
];

export const authors: Author[] = [
  { id: "a1", name: "Мира Вейс", handle: "@mira", avatar: "МВ", worksCount: 8 },
  { id: "a2", name: "Рен Солов", handle: "@ren", avatar: "РС", worksCount: 5 },
  { id: "a3", name: "Лея Туманова", handle: "@leya", avatar: "ЛТ", worksCount: 11 }
];

export const updates: UpdateItem[] = [
  { id: "u1", title: "Письма из северного архива", chapter: "Глава 24", time: "12 мин" },
  { id: "u2", title: "Когда маяк отвечает", chapter: "Глава 12", time: "1 час" },
  { id: "u3", title: "Карта последней весны", chapter: "Эпилог", time: "3 часа" }
];

export const categories = ["Оригинальные", "Фанфики", "Поэзия", "Мини", "Макси", "Драма", "Романтика"];

export const tags = ["фэнтези", "романтика", "драма", "тайна", "приключения", "уют", "hurt/comfort", "магия"];
