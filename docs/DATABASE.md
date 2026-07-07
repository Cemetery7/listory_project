---
title: DATABASE
project: Листория
version: 1.0.0
status: active
purpose: Архитектура базы данных проекта
depends_on:
  - PROJECT.md
  - FRONTEND.md
---

# DATABASE.md

# Database Architecture

> Документ описывает структуру базы данных проекта «Листория».

База данных должна быть рассчитана не только на MVP, но и на дальнейшее масштабирование проекта.

---

# 1. Основная философия

При проектировании базы данных необходимо придерживаться следующих принципов:

- простота;
- расширяемость;
- нормализация;
- высокая производительность;
- понятные связи;
- отсутствие дублирования данных.

---

# 2. СУБД

Использовать

```text
PostgreSQL
```

Версия

```text
16+
```

---

# 3. ORM

ORM не используется.

Использовать

```text
sqlc
```

для генерации типизированного Go-кода.

---

# 4. Naming Convention

Все таблицы писать

```text
snake_case
```

Например

```text
users

stories

chapters

comments
```

---

Все поля также писать

```text
snake_case
```

Например

```text
created_at

updated_at

author_id
```

---

# 5. Primary Key

Во всех таблицах использовать

```text
UUID
```

Тип

```sql
uuid
```

Создание

```sql
gen_random_uuid()
```

---

# 6. Timestamp Rules

Практически каждая таблица должна содержать

```sql
created_at

updated_at
```

Тип

```sql
TIMESTAMPTZ
```

---

При необходимости

```sql
deleted_at
```

для Soft Delete.

---

# 7. Soft Delete

Использовать только там, где это действительно необходимо.

Например

Использовать

- users
- stories
- chapters
- comments

Не использовать

- likes
- bookmarks
- history

---

# 8. Foreign Keys

Все связи должны использовать Foreign Keys.

Запрещается хранить связанные данные без ограничений.

---

# 9. Индексы

Каждый внешний ключ обязан иметь индекс.

Например

```sql
author_id

story_id

chapter_id
```

---

# 10. Общая схема

Основные сущности проекта

```text
User

↓

Story

↓

Chapter

↓

Comment
```

Дополнительные

```text
Category

Genre

Tag

Collection

Bookmark

History

Like

Notification
```

---

# 11. Entity Relationship

```text
User

↓

Stories

↓

Chapters

↓

Comments

↓

Likes
```

---

Дополнительно

```text
Story

↓

Genres

↓

Tags

↓

Collections
```

---

# 12. Таблицы MVP

Для MVP необходимо создать следующие таблицы

```text
users

stories

chapters

categories

genres

tags

story_tags

story_genres

comments

likes

bookmarks

collections

collection_stories

reading_history
```

---

# 13. Таблица Users

Назначение

Хранение пользователей.

---

Поля

| Поле | Тип |
|------|-----|
| id | uuid |
| username | varchar |
| email | varchar |
| password_hash | varchar |
| avatar_url | text |
| bio | text |
| role | varchar |
| created_at | timestamptz |
| updated_at | timestamptz |
| deleted_at | timestamptz |

---

Уникальные поля

```text
username

email
```

---

Индексы

```text
username

email
```

---

# 14. Таблица Stories

Главная таблица проекта.

---

Поля

| Поле | Тип |
|------|-----|
| id | uuid |
| author_id | uuid |
| category_id | uuid |
| title | varchar |
| slug | varchar |
| description | text |
| cover_url | text |
| status | varchar |
| age_rating | varchar |
| language | varchar |
| published | boolean |
| views | bigint |
| likes | bigint |
| comments_count | bigint |
| chapters_count | integer |
| created_at | timestamptz |
| updated_at | timestamptz |
| deleted_at | timestamptz |

---

Индексы

```text
author_id

category_id

slug

published
```

---

Slug

Должен быть уникальным.

---

# 15. Таблица Chapters

Каждое произведение содержит главы.

---

Поля

| Поле | Тип |
|------|-----|
| id | uuid |
| story_id | uuid |
| title | varchar |
| chapter_number | integer |
| content | text |
| reading_time | integer |
| created_at | timestamptz |
| updated_at | timestamptz |
| deleted_at | timestamptz |

---

Индексы

```text
story_id

chapter_number
```

---

Ограничения

Для одного произведения номер главы должен быть уникальным.

---

# 16. Таблица Categories

Используется для основных категорий.

---

Поля

| Поле | Тип |
|------|-----|
| id | uuid |
| title | varchar |
| slug | varchar |
| description | text |

---

Slug уникален.

---

# 17. Таблица Genres

Используется для жанров.

---

Поля

| Поле | Тип |
|------|-----|
| id | uuid |
| title | varchar |
| slug | varchar |

---

Жанры не удаляются.

---

# 18. Таблица Tags

Используется для произвольных тегов.

---

Поля

| Поле | Тип |
|------|-----|
| id | uuid |
| title | varchar |
| slug | varchar |

---

Slug уникален.

---

# 19. Связующие таблицы

Используются отношения

```text
Many-to-Many
```

Таблицы

```text
story_tags

story_genres
```

---

---

# 20. Таблица StoryTags

Связующая таблица между произведениями и тегами.

---

Поля

| Поле | Тип |
|------|-----|
| story_id | uuid |
| tag_id | uuid |

---

Primary Key

```text
(story_id, tag_id)
```

---

Foreign Keys

```text
story_id -> stories.id

tag_id -> tags.id
```

---

# 21. Таблица StoryGenres

Связующая таблица между произведениями и жанрами.

---

Поля

| Поле | Тип |
|------|-----|
| story_id | uuid |
| genre_id | uuid |

---

Primary Key

```text
(story_id, genre_id)
```

---

Foreign Keys

```text
story_id -> stories.id

genre_id -> genres.id
```

---

# 22. Таблица Comments

Хранит комментарии пользователей.

---

Поля

| Поле | Тип |
|------|-----|
| id | uuid |
| story_id | uuid |
| chapter_id | uuid NULL |
| author_id | uuid |
| parent_id | uuid NULL |
| content | text |
| created_at | timestamptz |
| updated_at | timestamptz |
| deleted_at | timestamptz |

---

Описание

Если комментарий относится ко всему произведению —

```text
chapter_id = NULL
```

Если комментарий относится к главе —

```text
chapter_id содержит ID главы
```

---

parent_id используется для древовидных ответов.

---

Индексы

```text
story_id

chapter_id

author_id

parent_id
```

---

# 23. Таблица Likes

Используется для хранения лайков.

---

Поля

| Поле | Тип |
|------|-----|
| user_id | uuid |
| story_id | uuid |
| created_at | timestamptz |

---

Primary Key

```text
(user_id, story_id)
```

---

Один пользователь может поставить только один лайк.

---

# 24. Таблица Bookmarks

Закладки пользователя.

---

Поля

| Поле | Тип |
|------|-----|
| user_id | uuid |
| story_id | uuid |
| created_at | timestamptz |

---

Primary Key

```text
(user_id, story_id)
```

---

# 25. Таблица Collections

Подборки пользователя.

---

Поля

| Поле | Тип |
|------|-----|
| id | uuid |
| author_id | uuid |
| title | varchar |
| description | text |
| cover_url | text |
| public | boolean |
| created_at | timestamptz |
| updated_at | timestamptz |

---

Индексы

```text
author_id

public
```

---

# 26. Таблица CollectionStories

Связующая таблица.

---

Поля

| Поле | Тип |
|------|-----|
| collection_id | uuid |
| story_id | uuid |

---

Primary Key

```text
(collection_id, story_id)
```

---

# 27. Таблица ReadingHistory

История чтения пользователя.

---

Поля

| Поле | Тип |
|------|-----|
| user_id | uuid |
| story_id | uuid |
| chapter_id | uuid |
| progress | integer |
| last_read_at | timestamptz |

---

Описание

progress

Процент прочитанной главы.

```text
0..100
```

---

Primary Key

```text
(user_id, chapter_id)
```

---

# 28. Таблица Notifications

Уведомления пользователя.

---

Поля

| Поле | Тип |
|------|-----|
| id | uuid |
| user_id | uuid |
| type | varchar |
| title | varchar |
| body | text |
| read | boolean |
| created_at | timestamptz |

---

Индексы

```text
user_id

read
```

---

# 29. Таблица Drafts

Черновики произведений.

---

Поля

| Поле | Тип |
|------|-----|
| id | uuid |
| author_id | uuid |
| title | varchar |
| description | text |
| content | text |
| updated_at | timestamptz |

---

Используется только автором.

---

# 30. Таблица Fandoms

Фандомы.

---

Поля

| Поле | Тип |
|------|-----|
| id | uuid |
| title | varchar |
| slug | varchar |
| description | text |
| cover_url | text |

---

Slug уникален.

---

# 31. Таблица StoryFandoms

Позволяет одному произведению принадлежать нескольким фандомам.

---

Поля

| Поле | Тип |
|------|-----|
| story_id | uuid |
| fandom_id | uuid |

---

Primary Key

```text
(story_id, fandom_id)
```

---

# 32. Таблица StoryViews

Хранит просмотры произведений.

---

Поля

| Поле | Тип |
|------|-----|
| id | uuid |
| story_id | uuid |
| user_id | uuid NULL |
| ip_hash | varchar |
| viewed_at | timestamptz |

---

Описание

Для неавторизованных пользователей использовать

```text
ip_hash
```

В будущем можно заменить более надежной системой.

---

# 33. Таблица StoryRatings

Позволяет пользователю оценить произведение.

---

Поля

| Поле | Тип |
|------|-----|
| user_id | uuid |
| story_id | uuid |
| rating | smallint |
| created_at | timestamptz |

---

Допустимые значения

```text
1..5
```

---

# 34. Таблица StorySubscriptions

Подписка пользователя на произведение.

---

Поля

| Поле | Тип |
|------|-----|
| user_id | uuid |
| story_id | uuid |
| created_at | timestamptz |

---

Используется для уведомлений об обновлениях.

---

# 35. Таблица UserSubscriptions

Подписки на авторов.

---

Поля

| Поле | Тип |
|------|-----|
| follower_id | uuid |
| author_id | uuid |
| created_at | timestamptz |

---

Primary Key

```text
(follower_id, author_id)
```

---

---

# 36. Database Relationships

Основные связи проекта.

```text
User (1)

↓

Stories (N)

↓

Chapters (N)

↓

Comments (N)
```

---

```text
Story

↓

Tags (M:N)
```

---

```text
Story

↓

Genres (M:N)
```

---

```text
Story

↓

Fandoms (M:N)
```

---

```text
User

↓

Bookmarks (M:N)

↓

Stories
```

---

```text
User

↓

Collections (1:N)
```

---

```text
Collection

↓

Stories (M:N)
```

---

# 37. ER Diagram

```text
Users
│
├──────── Stories
│            │
│            ├──────── Chapters
│            │              │
│            │              └──── Comments
│            │
│            ├──────── StoryTags ───── Tags
│            │
│            ├──────── StoryGenres ─── Genres
│            │
│            ├──────── StoryFandoms ── Fandoms
│            │
│            ├──────── Likes
│            │
│            ├──────── Bookmarks
│            │
│            └──────── ReadingHistory
│
└──────── Collections
              │
              └──────── CollectionStories
```

---

# 38. Enum Values

Использовать ENUM либо отдельные типы PostgreSQL.

---

## Story Status

```text
draft

published

completed

archived
```

---

## User Role

```text
user

moderator

admin
```

---

## Age Rating

```text
0+

6+

12+

16+

18+
```

---

## Notification Type

```text
comment

like

follow

story_update

system
```

---

# 39. Constraints

Для всех таблиц использовать ограничения.

---

## Users

```text
username UNIQUE

email UNIQUE
```

---

## Stories

```text
slug UNIQUE
```

---

## Categories

```text
slug UNIQUE
```

---

## Genres

```text
slug UNIQUE
```

---

## Tags

```text
slug UNIQUE
```

---

## Fandoms

```text
slug UNIQUE
```

---

# 40. Delete Rules

При удалении пользователя

Не удалять произведения автоматически.

Автор становится

```text
Deleted User
```

или

```text
Anonymous
```

если потребуется в будущем.

---

При удалении произведения

Удаляются:

- главы;
- комментарии;
- лайки;
- закладки;
- история чтения.

---

# 41. Update Rules

При изменении:

Название произведения

↓

Slug не менять автоматически.

Изменение slug допускается только отдельным действием.

---

# 42. Search Strategy

Поиск должен работать по:

- title
- description
- author
- tags
- genres
- fandoms

---

Использовать

```sql
GIN
```

индексы.

---

Для полнотекстового поиска использовать

```sql
tsvector
```

---

# 43. Full Text Search

Создать поле

```sql
search_vector
```

Тип

```sql
tsvector
```

Обновлять автоматически через Trigger.

---

Поиск должен учитывать:

- title;
- description;
- tags.

---

# 44. Index Strategy

Создать индексы для:

```text
stories.slug

stories.author_id

stories.category_id

stories.created_at

stories.updated_at

stories.views

stories.likes

stories.published
```

---

Создать индексы для:

```text
comments.story_id

comments.chapter_id

comments.author_id
```

---

Создать индексы для:

```text
chapters.story_id
```

---

Создать индексы для:

```text
reading_history.user_id

reading_history.last_read_at
```

---

# 45. Pagination Strategy

Во всех запросах использовать

```sql
LIMIT

OFFSET
```

Для больших таблиц в будущем перейти на

```text
Cursor Pagination
```

---

# 46. Statistics

Не вычислять статистику каждый запрос.

Хранить счетчики в таблице stories.

Например

```text
views

likes

comments_count

chapters_count
```

Обновлять их после изменения данных.

---

# 47. Slug Strategy

Slug должен:

- быть уникальным;
- состоять только из латиницы;
- использовать "-";
- не изменяться автоматически.

Пример

```text
the-last-dawn
```

---

# 48. Image Storage

База данных хранит только ссылки.

Никогда не хранить изображения внутри PostgreSQL.

Например

```text
cover_url

avatar_url
```

Файлы будут храниться отдельно.

---

# 49. Password Storage

Пароли никогда не хранить открытым текстом.

Использовать

```text
bcrypt
```

или

```text
argon2id
```

Предпочтительно

```text
argon2id
```

---

# 50. Migration Rules

Все изменения базы данных должны происходить только через миграции.

Запрещено:

- менять таблицы вручную;
- создавать поля через pgAdmin;
- редактировать production-схему без миграции.

---

---

# 51. Migration Structure

Все миграции должны храниться в отдельной директории.

```text
backend/

migrations/

000001_init.up.sql
000001_init.down.sql

000002_users.up.sql
000002_users.down.sql

000003_stories.up.sql
000003_stories.down.sql
```

Каждая миграция должна иметь возможность отката.

---

# 52. SQL Style Guide

Все SQL-запросы должны быть:

- читаемыми;
- параметризованными;
- совместимыми с sqlc;
- безопасными.

---

Пример

```sql
SELECT
    id,
    title,
    author_id
FROM stories
WHERE id = $1;
```

Запрещается писать длинные запросы в одну строку.

---

# 53. sqlc Structure

Структура проекта.

```text
backend/

sql/

queries/

users.sql

stories.sql

chapters.sql

comments.sql

collections.sql

notifications.sql
```

---

Каждый файл отвечает только за одну сущность.

---

# 54. Query Rules

Запросы должны быть небольшими.

Лучше:

```text
GetStory

↓

GetStoryChapters

↓

GetStoryTags
```

чем один огромный JOIN на десять таблиц.

---

# 55. Transactions

Использовать транзакции при:

- создании произведения;
- публикации главы;
- создании подборки;
- удалении произведения;
- регистрации пользователя.

---

Любая операция, изменяющая несколько таблиц, должна быть атомарной.

---

# 56. Cascade Rules

Использовать `ON DELETE CASCADE` только там, где это безопасно.

Разрешено:

- chapters → story
- comments → chapter
- story_tags → story
- story_genres → story
- collection_stories → collection

Запрещено автоматически удалять пользователей.

---

# 57. Audit Strategy

В будущем предусмотреть возможность аудита.

Например:

```text
story_updated

chapter_published

user_banned

comment_deleted
```

Для MVP отдельная таблица не требуется.

---

# 58. Backup Strategy

Для production предусмотреть:

- ежедневный backup;
- хранение нескольких последних резервных копий;
- проверку восстановления.

MVP не требует автоматизации резервного копирования.

---

# 59. Seed Data

Для локальной разработки создать сиды.

Минимальный набор:

- 30 пользователей;
- 150 произведений;
- 500 глав;
- 3000 комментариев;
- 100 подборок;
- 1000 лайков.

Это позволит сразу видеть реалистичную работу интерфейса.

---

# 60. Performance Guidelines

Целевые показатели.

Поиск произведения по ID

```text
<10 ms
```

---

Получение страницы произведения

```text
<50 ms
```

---

Каталог

```text
<100 ms
```

---

Поиск

```text
<150 ms
```

---

# 61. Future Scaling

Структура должна позволять добавить без изменения существующих таблиц:

- достижения;
- бейджи;
- платные подписки;
- донаты;
- рейтинги авторов;
- AI-генерацию;
- рекомендации;
- переводы;
- совместное написание произведений.

---

# 62. Database Security

Запрещено:

- хранить пароли;
- хранить токены;
- хранить секретные ключи;
- хранить приватные данные в открытом виде.

Использовать только безопасные алгоритмы хранения.

---

# 63. Database Conventions

Все таблицы должны:

- иметь первичный ключ;
- использовать UUID;
- иметь понятные названия;
- иметь внешние ключи;
- иметь индексы;
- использовать snake_case.

---

# 64. Codex Database Rules

Перед изменением схемы базы данных Codex обязан:

1. Прочитать `PROJECT.md`.
2. Прочитать `DATABASE.md`.
3. Проверить существующие таблицы.
4. Проверить существующие связи.
5. Проверить необходимость новой таблицы.
6. Не дублировать сущности.
7. Создать миграцию.
8. Обновить SQL-запросы.
9. Не нарушить обратную совместимость.

---

# 65. Database Checklist

## Структура

- [ ] Все таблицы имеют UUID.
- [ ] Все таблицы используют snake_case.
- [ ] Все связи описаны Foreign Keys.
- [ ] Все внешние ключи индексированы.

---

## Производительность

- [ ] Есть индексы.
- [ ] Используется Full Text Search.
- [ ] Используется LIMIT.
- [ ] Нет лишних JOIN.

---

## Безопасность

- [ ] Пароли хранятся безопасно.
- [ ] Нет секретов в базе.
- [ ] Используются ограничения целостности.

---

## Масштабируемость

- [ ] Добавление новых функций не требует перепроектирования.
- [ ] Таблицы не содержат дублирующихся данных.
- [ ] Используются связующие таблицы для M:N отношений.

---

## Миграции

- [ ] Все изменения проходят через миграции.
- [ ] Есть возможность отката.
- [ ] Миграции упорядочены по версии.

---

# 66. Non-negotiable Rules

Эти правила запрещено нарушать.

- Использовать только PostgreSQL.
- Использовать только UUID в качестве первичных ключей.
- Использовать sqlc вместо ORM.
- Использовать snake_case.
- Использовать внешние ключи.
- Использовать индексы.
- Использовать миграции.
- Не хранить изображения в базе.
- Не хранить пароли в открытом виде.
- Не выполнять ручные изменения схемы.

---

# 67. Definition of Done

Архитектура базы данных считается завершённой только если:

- описаны все сущности MVP;
- описаны связи между таблицами;
- определены индексы;
- определены ограничения;
- определены правила миграций;
- определены правила масштабирования;
- структура совместима с Go + sqlc;
- готова к интеграции с Backend.

---

# Конец файла DATABASE.md