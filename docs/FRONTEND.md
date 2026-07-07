---
title: FRONTEND
project: Листория
version: 1.0.0
status: active
purpose: Архитектура Frontend части проекта
depends_on:
  - PROJECT.md
  - DESIGN_SYSTEM.md
  - COMPONENTS.md
  - PAGES.md
---

# FRONTEND.md

# Frontend Architecture

> Этот документ определяет архитектуру frontend-приложения, правила организации кода и взаимодействия между компонентами.

---

# 1. Frontend Philosophy

Frontend должен быть:

- масштабируемым;
- читаемым;
- модульным;
- предсказуемым;
- легко поддерживаемым.

Каждая новая функция должна добавляться без необходимости переписывать существующий код.

---

# 2. Основные принципы

Во всём проекте соблюдать:

- SOLID
- DRY
- KISS
- Composition over Inheritance
- Single Responsibility
- Reusable Components
- Feature-first подход

---

# 3. Используемый стек

## Framework

```text
Next.js 15+
```

---

## Language

```text
TypeScript
```

---

## Styling

```text
TailwindCSS
```

---

## UI

```text
shadcn/ui
```

---

## Animation

```text
Framer Motion
```

---

## Forms

```text
React Hook Form
```

---

## Validation

```text
Zod
```

---

## Theme

```text
next-themes
```

---

## Icons

```text
Lucide React
```

---

## Data Fetching

После подключения backend

```text
TanStack Query
```

---

# 4. Folder Structure

Frontend должен выглядеть следующим образом.

```text
frontend/

app/

components/

features/

widgets/

entities/

shared/

lib/

hooks/

services/

styles/

types/

constants/

data/

providers/
```

Запрещается создавать случайные папки.

---

# 5. Полная структура

```text
frontend/

app/
components/
widgets/
features/
entities/
shared/

lib/
hooks/
providers/
services/

styles/
types/
constants/
data/

public/
```

---

# 6. App Router

Использовать только App Router.

Структура

```text
app/

layout.tsx

page.tsx

catalog/

works/

profile/

settings/

login/

register/
```

Не использовать Pages Router.

---

# 7. App Layout

Главный Layout отвечает только за:

- ThemeProvider
- Fonts
- Providers
- Metadata

Никакой бизнес-логики.

---

# 8. Providers

Создать папку

```text
providers/
```

В ней размещаются:

```text
ThemeProvider

QueryProvider

TooltipProvider

ModalProvider
```

Каждый Provider отвечает только за одну задачу.

---

# 9. Shared

Папка

```text
shared/
```

Используется для всего общего.

Структура

```text
shared/

ui/

hooks/

utils/

config/

icons/

constants/

types/
```

---

# 10. UI Components

Все универсальные компоненты располагаются только здесь.

```text
shared/ui
```

Например

```text
Button

Card

Badge

Input

Avatar

Skeleton

Dialog

Drawer
```

---

# 11. Widgets

Widgets — крупные независимые блоки интерфейса.

Например

```text
Header

Sidebar

HeroBanner

StoryGrid

RightPanel

Footer
```

Widget может состоять из множества компонентов.

---

# 12. Features

Features содержат пользовательскую функциональность.

Например

```text
Auth

Search

Reading

Writing

Theme

Bookmarks

Notifications
```

Feature может использовать:

- widgets;
- shared;
- entities.

---

# 13. Entities

Entities описывают бизнес-сущности.

Например

```text
Story

User

Comment

Collection

Category

Tag
```

Каждая сущность должна иметь:

```text
components/

hooks/

types/

api/

model/
```

---

# 14. Components

Компоненты не должны хранить данные.

Они получают всё через Props.

Пример

```tsx
<StoryCard story={story} />
```

Нельзя

```tsx
fetch(...)
```

внутри компонента.

---

# 15. Hooks

Все пользовательские hooks размещаются в

```text
hooks/
```

или

```text
shared/hooks
```

Примеры

```text
useTheme

useDebounce

useLocalStorage

useMediaQuery
```

---

# 16. Utils

Все вспомогательные функции располагаются в

```text
shared/utils
```

Например

```text
formatDate

truncate

pluralize

slugify

readingTime
```

---

# 17. Constants

Использовать отдельную папку

```text
constants/
```

Например

```text
routes.ts

theme.ts

limits.ts

pagination.ts
```

Запрещено писать магические числа внутри компонентов.

---

# 18. Types

Все общие типы располагаются здесь.

```text
types/
```

Например

```text
Story.ts

User.ts

Comment.ts
```

Не дублировать одинаковые типы.

---

# 19. Mock Data

До подключения backend использовать

```text
data/
```

Структура

```text
stories.ts

authors.ts

collections.ts

comments.ts

categories.ts

tags.ts
```

Никогда не хранить mock внутри компонентов.

---

# 20. Naming Convention

Использовать:

Компоненты

```text
PascalCase
```

Файлы

```text
kebab-case
```

Hooks

```text
camelCase

useTheme

useSearch
```

Типы

```text
PascalCase
```

Константы

```text
UPPER_CASE
```

---

---

# 21. Services

Все взаимодействие с API должно происходить только через папку:

```text
services/
```

Структура

```text
services/

auth/

stories/

users/

comments/

collections/

search/
```

Каждый сервис отвечает только за одну область.

---

# 22. API Layer

До подключения backend использовать mock data.

После подключения backend:

```text
Component

↓

Feature

↓

Service

↓

API

↓

Backend
```

Компоненты никогда не делают запросы напрямую.

---

# 23. State Management

Использовать локальное состояние везде, где это возможно.

```text
useState
```

Использовать Context только для:

- Theme
- Auth
- Modal
- Toast

Не использовать глобальное состояние без необходимости.

---

# 24. TanStack Query

После подключения backend использовать:

```text
Queries

Mutations

Cache

Invalidation
```

Все запросы должны храниться внутри соответствующего Feature.

---

# 25. React Hook Form

Все формы проекта должны использовать:

```text
React Hook Form
```

Даже простые формы.

---

# 26. Validation

Использовать только:

```text
Zod
```

Пример

```tsx
const schema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
})
```

Никакой ручной проверки.

---

# 27. Error Handling

Каждая операция должна иметь:

- loading;
- success;
- error.

Никогда не игнорировать ошибки.

---

# 28. Async Rules

Любой асинхронный код обязан:

- обрабатывать ошибки;
- иметь loading;
- не блокировать интерфейс.

---

# 29. Forms

Каждая форма должна содержать:

- validation;
- disabled state;
- loading state;
- success state;
- error state.

---

# 30. Theme

Использовать

```text
next-themes
```

Поддерживать:

- Dark
- Light
- System

---

# 31. CSS Rules

Использовать только

```text
TailwindCSS
```

Запрещено:

- CSS Modules
- Styled Components
- Emotion
- Inline Styles

---

# 32. Tailwind

Использовать только utility classes.

Если классов становится слишком много —

создать новый компонент.

---

# 33. Icons

Использовать только

```text
Lucide React
```

Запрещается смешивать разные библиотеки.

---

# 34. Images

Все изображения использовать через

```tsx
next/image
```

Не использовать

```html
<img>
```

---

# 35. Fonts

Использовать только

```text
Inter
```

через

```text
next/font
```

---

# 36. Animations

Использовать только

```text
Framer Motion
```

или

```text
CSS Transition
```

Запрещено использовать сторонние библиотеки анимаций.

---

# 37. Performance

Использовать:

- lazy loading;
- dynamic imports;
- memo при необходимости;
- image optimization.

Не оптимизировать преждевременно.

---

# 38. Lazy Loading

Допускается использовать:

```tsx
dynamic(...)
```

для:

- Editor;
- AI;
- Charts;
- тяжелых компонентов.

---

# 39. Code Splitting

Каждая крупная страница должна загружаться отдельно.

Использовать возможности Next.js.

---

# 40. Accessibility

Каждый компонент обязан:

- иметь aria-label при необходимости;
- поддерживать клавиатуру;
- иметь focus state;
- иметь корректную семантику.

---

# 41. SEO

Использовать

```text
Metadata API
```

Каждая страница имеет:

- title;
- description;
- open graph.

---

# 42. Routing

Все ссылки использовать через

```tsx
<Link />
```

Не использовать

```html
<a>
```

для внутренней навигации.

---

# 43. Route Constants

Создать файл

```text
constants/routes.ts
```

Пример

```ts
export const ROUTES = {
    HOME: "/",
    CATALOG: "/catalog",
    PROFILE: "/profile",
}
```

Не писать строки маршрутов вручную по всему проекту.

---

# 44. Environment Variables

Использовать только

```text
.env.local
```

Все переменные должны иметь префикс

```text
NEXT_PUBLIC_
```

если используются на клиенте.

---

# 45. File Size Limits

Рекомендуемые размеры файлов.

| Тип | Максимум |
|------|----------|
| UI Component | 150 строк |
| Widget | 300 строк |
| Feature | 400 строк |
| Page | 250 строк |

Если файл становится больше —

разделить.

---

# 46. Import Rules

Порядок импортов

1. React
2. Next
3. External Libraries
4. Shared
5. Entities
6. Features
7. Widgets
8. Relative Imports

---

# 47. Absolute Imports

Использовать алиасы.

Пример

```tsx
import { Button } from "@/shared/ui"
```

Не использовать длинные относительные пути.

---

# 48. Barrel Exports

Использовать

```text
index.ts
```

для каждой папки компонентов.

---

# 49. Comments

Не писать очевидные комментарии.

Плохой пример

```ts
// создаем массив
const arr = []
```

Комментарии использовать только для объяснения сложной логики.

---

# 50. Logging

Во время разработки использовать

```ts
console.log()
```

Перед production удалить весь отладочный вывод.

---

---

# 51. Code Style

Во всем проекте использовать единый стиль кода.

Правила:

- использовать Prettier;
- использовать ESLint;
- использовать TypeScript Strict Mode;
- использовать одинарные кавычки только если этого требует конфигурация (иначе придерживаться Prettier);
- использовать автоматическое форматирование.

---

# 52. TypeScript Rules

Использовать строгую типизацию.

Обязательно:

- interfaces для сущностей;
- type для union и utility типов;
- исключить `any`.

Разрешено использовать:

```ts
unknown
```

вместо

```ts
any
```

---

# 53. Props Rules

Props должны быть минимальными.

Хорошо:

```tsx
<StoryCard story={story} />
```

Плохо:

```tsx
<StoryCard
    title={...}
    likes={...}
    views={...}
    comments={...}
    updatedAt={...}
    ...
/>
```

Если данных становится слишком много — передавать объект.

---

# 54. Component Responsibility

Каждый компонент отвечает только за одну задачу.

Например:

StoryCard

### Не должен:

- загружать данные;
- фильтровать;
- сортировать;
- изменять состояние приложения.

Он только отображает информацию.

---

# 55. Feature Responsibility

Feature отвечает за пользовательское действие.

Например:

Bookmarks Feature

может:

- добавить в закладки;
- удалить;
- обновить состояние.

Но не отвечает за отображение карточки.

---

# 56. Widget Responsibility

Widget объединяет несколько компонентов.

Например:

HeroBanner

состоит из:

- Title
- Description
- Buttons
- Image

Но не знает ничего о backend.

---

# 57. Entity Responsibility

Entity описывает бизнес-сущность.

Например:

Story

содержит:

- типы;
- модель;
- API;
- небольшие связанные компоненты.

---

# 58. Shared Responsibility

Shared используется всеми.

Например:

```text
Button

Card

Input

Avatar

Badge

Skeleton

Dialog
```

Никакой бизнес-логики.

---

# 59. Mock Strategy

До подключения backend весь frontend работает полностью.

Источник данных:

```text
data/

stories.ts

authors.ts

comments.ts

collections.ts
```

Замена mock на API должна происходить без изменения UI.

---

# 60. Loading Strategy

Использовать три состояния.

```text
Loading

↓

Success

↓

Error
```

Никогда не показывать пустой экран.

---

# 61. Empty Strategy

Если данных нет —

показывать:

- иллюстрацию;
- описание;
- кнопку действия.

Не оставлять пустое пространство.

---

# 62. Error Strategy

Все ошибки должны отображаться красиво.

Например

```text
Не удалось загрузить произведения.

[Попробовать снова]
```

Никогда не выводить stack trace.

---

# 63. Theme Strategy

Все цвета использовать только через CSS Variables.

Например

```css
background: var(--background);
```

или Tailwind Token.

Запрещено использовать HEX внутри компонентов.

---

# 64. Responsive Strategy

Разрабатывать Desktop First.

Затем:

- Laptop;
- Tablet;
- Mobile.

Каждый новый компонент обязан проверяться на всех разрешениях.

---

# 65. Performance Budget

Цель:

Lighthouse

```text
Performance > 95
```

---

Accessibility

```text
95+
```

---

Best Practices

```text
100
```

---

SEO

```text
100
```

---

# 66. Bundle Rules

Не подключать тяжелые библиотеки без необходимости.

Перед добавлением новой зависимости проверить:

- размер;
- поддержку;
- необходимость.

---

# 67. Dependency Rules

Перед установкой нового пакета Codex обязан:

1. Проверить, можно ли решить задачу стандартными средствами.
2. Проверить, нет ли уже аналогичной библиотеки.
3. Объяснить необходимость установки.

---

# 68. Reusability Rules

Если один и тот же JSX повторяется два раза —

создать компонент.

Если логика повторяется —

создать hook.

Если повторяются вычисления —

создать util.

---

# 69. File Naming Rules

Использовать:

```text
story-card.tsx

reader-toolbar.tsx

hero-banner.tsx
```

Не использовать:

```text
StoryCardComponent.tsx

NewStoryCard.tsx

Component1.tsx
```

---

# 70. Folder Naming Rules

Все папки писать в

```text
kebab-case
```

Например

```text
story-card

reading-mode

hero-banner
```

---

# 71. Import Rules

Запрещено делать циклические зависимости.

Структура импортов должна быть направлена сверху вниз.

```text
shared

↓

entities

↓

features

↓

widgets

↓

pages
```

Не наоборот.

---

# 72. Feature Isolation

Каждая feature должна работать независимо.

Удаление одной feature не должно ломать остальные части проекта.

---

# 73. UI Consistency

Все страницы должны выглядеть одинаково.

Одинаковые:

- кнопки;
- карточки;
- инпуты;
- spacing;
- радиусы;
- hover;
- loading.

---

# 74. Motion Consistency

Использовать только анимации, описанные в DESIGN_SYSTEM.md.

Не создавать собственные animation curves.

---

# 75. Technical Debt

Если появляется временное решение —

обязательно оставить:

```text
TODO:
```

с пояснением причины.

Не использовать TODO как способ закончить задачу быстрее.

---

---

# 76. Security Rules

Frontend не должен хранить чувствительные данные.

Запрещено:

- хранить JWT в LocalStorage;
- хранить пароли;
- хранить API Keys;
- хранить секретные переменные в клиентском коде.

Использовать:

- HttpOnly Cookie (после подключения backend);
- Environment Variables только для публичных данных.

---

# 77. Authentication Strategy

MVP

Использовать mock авторизацию.

После подключения backend:

```text
Login

↓

JWT

↓

Protected Routes

↓

Refresh Token
```

Frontend не должен знать внутреннюю реализацию авторизации.

---

# 78. Data Flow

Единый поток данных.

```text
Backend

↓

Service

↓

Feature

↓

Widget

↓

Component

↓

User
```

Запрещено пропускать уровни архитектуры.

---

# 79. Component Communication

Передача данных только через:

- Props;
- Context (если необходимо);
- React Query.

Не использовать глобальные переменные.

---

# 80. Business Logic

Бизнес-логика должна находиться только в:

```text
features/

services/

entities/
```

UI-компоненты не должны содержать бизнес-логику.

---

# 81. Routing Rules

Каждая страница должна иметь:

- собственный route;
- metadata;
- loading;
- error;
- not-found.

Использовать возможности App Router.

---

# 82. Metadata

Каждая страница должна экспортировать metadata.

Пример:

```ts
export const metadata = {
    title: "...",
    description: "...",
}
```

---

# 83. Loading Files

Использовать:

```text
loading.tsx
```

для каждой тяжелой страницы.

---

# 84. Error Files

Использовать:

```text
error.tsx
```

для обработки ошибок маршрута.

---

# 85. Not Found

Использовать

```text
not-found.tsx
```

для отсутствующих страниц.

---

# 86. Image Strategy

Все изображения должны:

- иметь alt;
- быть оптимизированы;
- использовать lazy loading;
- иметь корректное соотношение сторон.

Использовать только `next/image`.

---

# 87. Accessibility Rules

Каждый новый компонент обязан поддерживать:

- Tab Navigation;
- Screen Readers;
- Focus Ring;
- Keyboard Navigation.

Все интерактивные элементы должны быть доступны без мыши.

---

# 88. Testing Strategy

После завершения MVP рекомендуется добавить:

- Unit Tests;
- Component Tests;
- E2E Tests.

Приоритет:

1. Компоненты.
2. Основные пользовательские сценарии.
3. Авторизация.
4. Поиск.

---

# 89. Build Requirements

Перед каждым коммитом проект должен:

- успешно собираться;
- проходить TypeScript проверку;
- проходить ESLint;
- не иметь критических предупреждений.

---

# 90. Git Rules

Рекомендуемые ветки:

```text
main

develop

feature/*
```

Примеры:

```text
feature/home-page

feature/catalog

feature/reader

feature/auth
```

---

# 91. Commit Convention

Рекомендуемый формат:

```text
feat: add story cards

fix: catalog filters

refactor: simplify sidebar

style: improve hero spacing

docs: update frontend architecture
```

---

# 92. Pull Request Checklist

Перед слиянием убедиться, что:

- проект собирается;
- нет конфликтов;
- компоненты соответствуют Design System;
- код читаемый;
- отсутствует дублирование.

---

# 93. Frontend Definition of Done

Frontend считается завершенным только если:

- реализованы все страницы MVP;
- реализованы все компоненты;
- поддерживаются обе темы;
- полностью адаптивен;
- используется единая дизайн-система;
- отсутствуют критические ошибки;
- отсутствуют временные решения без пояснений.

---

# 94. Codex Frontend Rules

Перед созданием любого нового frontend-кода Codex обязан:

1. Прочитать `PROJECT.md`.
2. Прочитать `DESIGN_SYSTEM.md`.
3. Прочитать `COMPONENTS.md`.
4. Прочитать `PAGES.md`.
5. Прочитать `FRONTEND.md`.
6. Проверить существующие компоненты.
7. Проверить существующие маршруты.
8. Не нарушать структуру проекта.
9. Использовать только существующие дизайн-токены.
10. Предлагать рефакторинг, если видит архитектурную проблему.

---

# 95. Frontend Checklist

## Архитектура

- [ ] Используется App Router.
- [ ] Структура папок соответствует FRONTEND.md.
- [ ] Нет циклических зависимостей.
- [ ] Нет бизнес-логики в UI.

---

## UI

- [ ] Используются только готовые компоненты.
- [ ] Используются только Design Tokens.
- [ ] Поддерживаются обе темы.
- [ ] Все страницы адаптивны.

---

## Код

- [ ] Нет `any`.
- [ ] Нет inline styles.
- [ ] Нет дублирования.
- [ ] Все компоненты типизированы.

---

## Производительность

- [ ] Используется `next/image`.
- [ ] Используется lazy loading.
- [ ] Нет тяжелых библиотек без необходимости.
- [ ] Lighthouse соответствует целевым показателям.

---

## UX

- [ ] Есть Loading State.
- [ ] Есть Empty State.
- [ ] Есть Error State.
- [ ] Навигация последовательна.
- [ ] Все анимации соответствуют DESIGN_SYSTEM.md.

---

# 96. Non-negotiable Rules

Эти правила запрещено нарушать.

- Использовать только Next.js App Router.
- Использовать только TypeScript.
- Использовать только TailwindCSS.
- Использовать только shadcn/ui.
- Использовать только Lucide React.
- Использовать только Framer Motion.
- Не использовать CSS Modules.
- Не использовать Styled Components.
- Не использовать случайные цвета.
- Не использовать случайные размеры.
- Не хранить данные внутри UI-компонентов.
- Не выполнять запросы напрямую из компонентов.
- Не нарушать структуру проекта.

---

# 97. Final Goal

Frontend должен выглядеть как готовый коммерческий продукт.

Пользователь должен воспринимать интерфейс как современный сервис, а не как демонстрационный проект.

Каждый экран должен быть:

- быстрым;
- понятным;
- единообразным;
- визуально привлекательным;
- удобным для чтения;
- готовым к интеграции с backend.

---

# Конец файла FRONTEND.md