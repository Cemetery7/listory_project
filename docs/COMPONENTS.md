---
title: COMPONENTS
project: Листория
version: 1.0.0
status: active
purpose: Описание UI-компонентов проекта
depends_on:
  - PROJECT.md
  - DESIGN_SYSTEM.md
---

# COMPONENTS.md

# Листория — Component Library

> Этот документ описывает основные UI-компоненты проекта, их назначение, структуру, состояния и правила использования.

Все компоненты должны соответствовать `DESIGN_SYSTEM.md`.

---

# 1. Общие правила компонентов

Каждый компонент обязан быть:

- переиспользуемым;
- типизированным;
- адаптивным;
- доступным с клавиатуры;
- совместимым с dark/light theme;
- построенным на дизайн-токенах;
- небольшим по размеру;
- понятным по назначению.

---

# 2. Запрещено

В компонентах запрещено:

- использовать случайные HEX-цвета;
- использовать inline styles;
- использовать `any` без причины;
- смешивать UI и бизнес-логику;
- делать компоненты больше 300 строк без веской причины;
- хранить mock data внутри компонентов;
- дублировать одинаковую верстку;
- создавать новый стиль, если уже есть подходящий компонент.

---

# 3. Структура компонентов

Рекомендуемая структура:

```text
frontend/

├── components/
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── badge.tsx
│   │   ├── avatar.tsx
│   │   └── skeleton.tsx
│   │
│   ├── layout/
│   │   ├── app-shell.tsx
│   │   ├── sidebar.tsx
│   │   ├── header.tsx
│   │   └── right-panel.tsx
│   │
│   ├── story/
│   │   ├── story-card.tsx
│   │   ├── story-compact-card.tsx
│   │   ├── story-grid.tsx
│   │   └── story-stats.tsx
│   │
│   └── shared/
│       ├── section-header.tsx
│       ├── search-bar.tsx
│       ├── tags-cloud.tsx
│       └── empty-state.tsx
```

---

# 4. Component Naming

Использовать PascalCase для компонентов.

Примеры:

```tsx
StoryCard
HeroBanner
ThemeToggle
SectionHeader
```

Файлы писать в kebab-case.

Примеры:

```text
story-card.tsx
hero-banner.tsx
theme-toggle.tsx
section-header.tsx
```

---

# 5. Props Rules

Все props должны быть явно типизированы.

Пример:

```tsx
type StoryCardProps = {
  title: string
  author: string
  description: string
  coverUrl: string
  tags: string[]
  likes: number
  views: number
  comments: number
}
```

Запрещено:

```tsx
function StoryCard(props: any) {}
```

---

# 6. AppShell

## Назначение

`AppShell` — главный layout приложения.

Он отвечает за:

- Sidebar;
- Header;
- Main Content;
- Right Panel;
- responsive-поведение.

---

## Структура

```text
AppShell

├── Sidebar
├── Header
├── Main
└── RightPanel
```

---

## Props

```tsx
type AppShellProps = {
  children: React.ReactNode
  rightPanel?: React.ReactNode
}
```

---

## Правила

- Не хранить бизнес-логику.
- Не хранить mock data.
- Не заниматься фильтрацией.
- Только layout.
- На мобильных устройствах Sidebar превращается в Drawer.
- RightPanel на мобильных устройствах переносится ниже основного контента.

---

# 7. Sidebar

## Назначение

Главная навигация проекта.

---

## Содержимое

- Logo
- Главная
- Каталог
- Подборки
- Авторы
- Фандомы
- Библиотека
- История
- Закладки
- Написать
- Настройки
- Профиль

---

## Состояния

Каждый пункт меню имеет состояния:

- default;
- hover;
- active;
- disabled.

---

## Props

```tsx
type SidebarProps = {
  activePath?: string
}
```

---

## Правила

- Использовать Lucide Icons.
- Не использовать emoji.
- Не использовать случайные цвета.
- Active item должен быть визуально заметен.
- На mobile скрывать в Drawer.

---

# 8. Header

## Назначение

Верхняя панель приложения.

---

## Содержимое

- Breadcrumbs;
- SearchBar;
- ThemeToggle;
- Notifications;
- ProfileMenu.

---

## Props

```tsx
type HeaderProps = {
  title?: string
  showSearch?: boolean
}
```

---

## Правила

- Header фиксирован сверху.
- При скролле появляется blur.
- SearchBar занимает центральное место.
- Не перегружать Header лишними кнопками.

---

# 9. SearchBar

## Назначение

Поиск по произведениям, авторам, тегам и категориям.

---

## Placeholder

```text
Поиск произведений, авторов, тегов...
```

---

## Props

```tsx
type SearchBarProps = {
  value?: string
  onChange?: (value: string) => void
  onSubmit?: (value: string) => void
  placeholder?: string
}
```

---

## Состояния

- default;
- focus;
- loading;
- results;
- empty;
- error.

---

## Правила

- Поддерживать `Ctrl + K`.
- На MVP может открывать mock command palette.
- Не делать реальный поиск до готовности данных.
- Использовать debounce при реальном поиске.

---

# 10. ThemeToggle

## Назначение

Переключение между dark/light theme.

---

## Props

```tsx
type ThemeToggleProps = {
  className?: string
}
```

---

## Правила

- Переключение без перезагрузки.
- Сохранять тему в localStorage.
- По умолчанию использовать системную тему или dark theme.
- Использовать CSS variables.

---

# 11. Button

## Назначение

Базовая кнопка для действий.

---

## Variants

```text
primary
secondary
ghost
outline
danger
```

---

## Sizes

```text
sm
md
lg
```

---

## Props

```tsx
type ButtonProps = {
  variant?: "primary" | "secondary" | "ghost" | "outline" | "danger"
  size?: "sm" | "md" | "lg"
  loading?: boolean
  disabled?: boolean
  children: React.ReactNode
}
```

---

## Правила

- Минимальная высота клика — 44px.
- Loading state обязателен.
- Disabled state обязателен.
- Focus visible обязателен.
- Не использовать кнопку как ссылку, если это навигация.

---

# 12. Card

## Назначение

Базовая карточка.

---

## Props

```tsx
type CardProps = {
  children: React.ReactNode
  interactive?: boolean
  className?: string
}
```

---

## Правила

- Использовать единый radius.
- Использовать border token.
- Interactive card должна иметь hover.
- Не вкладывать слишком много логики.

---

# 13. Badge

## Назначение

Маленькая метка статуса.

---

## Variants

```text
default
primary
success
warning
danger
muted
```

---

## Примеры

```text
Завершено
Новое
Популярное
AI
18+
```

---

# 14. Tag

## Назначение

Отображение жанров, тегов и характеристик.

---

## Props

```tsx
type TagProps = {
  label: string
  active?: boolean
  onClick?: () => void
}
```

---

## Правила

- Если tag кликабельный — использовать button.
- Если tag просто отображается — использовать span.
- Не использовать слишком яркие цвета.

---

# 15. Avatar

## Назначение

Отображение пользователя или автора.

---

## Sizes

```text
xs
sm
md
lg
xl
```

---

## Props

```tsx
type AvatarProps = {
  src?: string
  name: string
  size?: "xs" | "sm" | "md" | "lg" | "xl"
}
```

---

## Правила

- Если нет изображения — показывать initials.
- Всегда иметь alt.
- Не использовать случайные placeholder-изображения внутри компонента.

---

# 16. SectionHeader

## Назначение

Заголовок секции.

---

## Props

```tsx
type SectionHeaderProps = {
  title: string
  description?: string
  actionLabel?: string
  actionHref?: string
}
```

---

## Пример

```text
Популярное сегодня                    Смотреть все →
```

---

# 17. HeroBanner

## Назначение

Главный визуальный блок главной страницы.

---

## Содержимое

- заголовок;
- описание;
- CTA;
- иллюстрация;
- background gradient.

---

## Props

```tsx
type HeroBannerProps = {
  title: string
  description: string
  ctaLabel: string
  ctaHref: string
  imageUrl?: string
}
```

---

## Правила

- Не делать Hero слишком высоким на mobile.
- Использовать мягкий gradient.
- CTA должен быть один главный.
- Текст должен быть хорошо читаемым.

---

---

# 18. StoryCard

## Назначение

Основной компонент проекта.

Используется:

- Главная
- Каталог
- Подборки
- Похожие произведения
- AI рекомендации

---

## Структура

```text
StoryCard

├── Cover
├── Category
├── Title
├── Description
├── Tags
└── Stats
```

---

## Props

```tsx
type StoryCardProps = {
  id: string
  title: string
  description: string
  coverUrl: string
  author: string
  category: string
  tags: string[]
  likes: number
  views: number
  comments: number
  status?: string
}
```

---

## Поведение

При наведении:

- увеличивается на 2%;
- усиливается тень;
- немного увеличивается насыщенность изображения.

---

## Клик

Переходит

```text
/works/[id]
```

---

## Правила

- Заголовок максимум 2 строки.
- Описание максимум 3 строки.
- Использовать line-clamp.
- Cover всегда одинаковой пропорции.
- Не использовать фиксированную высоту текста.

---

# 19. StoryCompactCard

Используется:

- Последние обновления
- Правая колонка
- AI рекомендации

---

## Структура

```text
Cover

Title

Author

Updated At
```

---

## Props

```tsx
type StoryCompactCardProps = {
  id: string
  title: string
  author: string
  coverUrl: string
  updatedAt: string
}
```

---

# 20. StoryGrid

Контейнер карточек.

---

## Props

```tsx
type StoryGridProps = {
  stories: Story[]
}
```

---

## Поведение

Desktop

```text
4 колонки
```

Laptop

```text
3 колонки
```

Tablet

```text
2 колонки
```

Mobile

```text
1 колонка
```

Gap

```text
24px
```

---

# 21. StoryStats

Используется внутри StoryCard.

---

Показывает

- просмотры
- лайки
- комментарии
- главы

---

## Props

```tsx
type StoryStatsProps = {
  views: number
  likes: number
  comments: number
  chapters?: number
}
```

---

# 22. AuthorCard

Используется

- профиль
- рекомендации
- правая колонка

---

## Структура

```text
Avatar

Name

Bio

Followers

Stories
```

---

## Props

```tsx
type AuthorCardProps = {
  avatar: string
  name: string
  bio?: string
  followers: number
  stories: number
}
```

---

# 23. AuthorList

Контейнер списка авторов.

---

## Props

```tsx
type AuthorListProps = {
  authors: Author[]
}
```

---

# 24. CategoryCard

Используется на главной странице.

---

Содержимое

- Иконка
- Название
- Количество произведений

---

## Props

```tsx
type CategoryCardProps = {
  title: string
  icon: LucideIcon
  works: number
}
```

---

# 25. CollectionCard

Используется для подборок.

---

## Props

```tsx
type CollectionCardProps = {
  title: string
  cover: string
  works: number
}
```

---

# 26. UpdatesList

Показывает последние обновления.

---

## Элемент списка

```text
Cover

Title

Author

Updated At
```

---

## Props

```tsx
type UpdatesListProps = {
  updates: Story[]
}
```

---

# 27. TagsCloud

Набор тегов.

---

## Props

```tsx
type TagsCloudProps = {
  tags: string[]
}
```

---

Gap

```text
8px
```

---

# 28. CategoryList

Показывает категории.

---

Используется

- Главная
- Каталог

---

## Props

```tsx
type CategoryListProps = {
  categories: Category[]
}
```

---

# 29. Breadcrumbs

Используется начиная со второй страницы.

---

Пример

```text
Главная

/

Каталог

/

Фэнтези
```

---

# 30. EmptyState

Используется

- поиск
- каталог
- комментарии
- библиотека

---

## Структура

```text
Illustration

Title

Description

Action Button
```

---

## Props

```tsx
type EmptyStateProps = {
  title: string
  description: string
  buttonLabel?: string
}
```

---

# 31. LoadingSkeleton

Каждый крупный компонент должен иметь собственный Skeleton.

---

Использовать

- shimmer;
- radius соответствующий компоненту;
- одинаковую скорость анимации.

---

# 32. Pagination

Используется в каталоге.

---

## Props

```tsx
type PaginationProps = {
  page: number
  pages: number
  onChange: (page: number) => void
}
```

---

# 33. FilterSidebar

Используется только в каталоге.

---

Содержит

- категории;
- жанры;
- теги;
- статус;
- рейтинг;
- сортировку.

---

## Props

```tsx
type FilterSidebarProps = {
  filters: Filters
  onChange: (filters: Filters) => void
}
```

---

# 34. ThemeProvider

Отвечает только за тему.

---

Не хранит бизнес-логику.

---

Использует

```text
next-themes
```

---

# 35. Notification

Используется через Toast.

---

Типы

```text
success

warning

error

info
```

---

Позиция

```text
Top Right
```

---

# 36. Modal

Используется для

- входа;
- удаления;
- создания подборок;
- AI.

---

## Props

```tsx
type ModalProps = {
  open: boolean
  onClose: () => void
}
```

---

# 37. Drawer

Используется

- Mobile Sidebar
- Mobile Filters

---

Animation

```text
Slide
```

---

---

# 38. ProfileMenu

## Назначение

Выпадающее меню пользователя.

---

## Содержимое

- Профиль
- Моя библиотека
- Черновики
- Настройки
- Выйти

---

## Props

```tsx
type ProfileMenuProps = {
  user: User
}
```

---

## Правила

- Использовать Dropdown Menu.
- Показывать аватар.
- Отображать username и email.
- Не открывать на hover.
- Только по клику.

---

# 39. NotificationBell

## Назначение

Отображает уведомления пользователя.

---

## Props

```tsx
type NotificationBellProps = {
  unreadCount?: number
}
```

---

## Поведение

Если есть непрочитанные уведомления:

- отображать Badge;
- не использовать красные огромные кружки;
- максимум отображать "99+".

---

# 40. CommandPalette

## Назначение

Быстрый поиск по всему сайту.

Открывается:

```text
Ctrl + K
```

или

```text
⌘ + K
```

---

## MVP

Пока использовать mock data.

---

## Позже

Подключить:

- AI Search;
- поиск произведений;
- поиск авторов;
- поиск тегов.

---

# 41. ReaderToolbar

Используется только на странице чтения.

---

## Содержимое

- Размер текста
- Межстрочный интервал
- Ширина страницы
- Светлая тема
- Темная тема
- Автоскролл

---

## Props

```tsx
type ReaderToolbarProps = {
  fontSize: number
  lineHeight: number
  width: string
}
```

---

# 42. ChapterNavigation

Используется между главами.

---

Содержит

- Предыдущая глава
- Следующая глава

---

## Props

```tsx
type ChapterNavigationProps = {
  previous?: Chapter
  next?: Chapter
}
```

---

# 43. CommentCard

Используется в комментариях.

---

Структура

```text
Avatar

Name

Date

Comment

Actions
```

---

## Props

```tsx
type CommentCardProps = {
  comment: Comment
}
```

---

# 44. CommentList

Контейнер комментариев.

---

## Props

```tsx
type CommentListProps = {
  comments: Comment[]
}
```

---

# 45. CommentEditor

Редактор комментария.

---

Содержит

- Avatar
- Textarea
- Button

---

## Props

```tsx
type CommentEditorProps = {
  onSubmit: (text: string) => void
}
```

---

# 46. ChapterCard

Используется на странице произведения.

---

Показывает

- номер главы;
- название;
- дату публикации;
- примерное время чтения.

---

## Props

```tsx
type ChapterCardProps = {
  chapter: Chapter
}
```

---

# 47. AIBlock

Используется для AI-функций.

---

Варианты

- Summary
- Recommendations
- Tags
- Search

---

## Props

```tsx
type AIBlockProps = {
  title: string
  description: string
}
```

---

## MVP

Пока может отображать mock-ответы.

---

# 48. AIActionButton

Используется рядом с редактором.

---

Варианты

- Улучшить текст
- Предложить теги
- Создать описание
- Сгенерировать обложку

---

# 49. CoverUploader

Используется при создании произведения.

---

Состояния

- Empty
- Uploading
- Uploaded
- Error

---

## Props

```tsx
type CoverUploaderProps = {
  value?: string
  onUpload: (file: File) => void
}
```

---

# 50. RichTextEditor

Используется только для написания глав.

---

MVP

Можно использовать готовое решение.

Например

- TipTap

или

- Lexical

---

# 51. PageContainer

Используется всеми страницами.

---

Размер

```text
max-width: 1600px
```

---

Padding

```text
32px
```

---

# 52. MainContent

Контейнер основного контента.

---

Правила

- Не использовать фиксированную ширину.
- Контент должен занимать оставшееся пространство.

---

# 53. RightPanel

Используется только Desktop.

---

Содержит

- Популярные авторы
- Последние обновления
- Популярные теги
- AI рекомендует

---

На планшетах переносится вниз.

На мобильных скрывается.

---

# 54. MobileBottomSpacing

Используется только Mobile.

---

Добавляет безопасный нижний отступ.

---

# 55. Общие требования к компонентам

Каждый компонент обязан:

- использовать TypeScript;
- использовать Design Tokens;
- поддерживать обе темы;
- иметь hover;
- иметь focus;
- иметь loading state (если необходимо);
- иметь empty state (если необходимо);
- использовать Lucide Icons;
- использовать Framer Motion только там, где это улучшает UX.

---

# 56. Правила разработки компонентов

Перед созданием нового компонента Codex обязан проверить:

- существует ли аналог;
- можно ли расширить существующий;
- соответствует ли компонент Design System.

Если существует похожий компонент — использовать его.

---

# 57. Запрещено

Запрещается:

- создавать дублирующие компоненты;
- использовать разный radius;
- использовать разные тени;
- использовать разные анимации;
- использовать разные размеры кнопок;
- использовать разные размеры input;
- создавать локальные дизайн-токены.

---

# 58. Стандартная структура компонента

Каждый компонент должен состоять из:

```text
Component.tsx

types.ts

index.ts
```

При необходимости:

```text
hooks.ts

constants.ts

utils.ts
```

---

# 59. Barrel Exports

Использовать `index.ts`.

Пример:

```ts
export * from "./story-card";
```

---

# 60. Definition of Done

Компонент считается готовым только если:

- соответствует DESIGN_SYSTEM.md;
- соответствует PROJECT.md;
- имеет TypeScript-типы;
- поддерживает dark theme;
- поддерживает light theme;
- адаптивен;
- не содержит TODO;
- не содержит `any`;
- не использует inline styles;
- не содержит дублирования;
- имеет понятное API.

---

# 61. Инструкции для Codex

Перед созданием любого нового компонента:

1. Прочитать `PROJECT.md`.
2. Прочитать `DESIGN_SYSTEM.md`.
3. Прочитать `COMPONENTS.md`.
4. Проверить существующие компоненты.
5. Использовать только существующие Design Tokens.
6. Не создавать новый стиль без необходимости.
7. После реализации показать измененные файлы.
8. После завершения предложить следующий компонент.

---

# Конец файла COMPONENTS.md