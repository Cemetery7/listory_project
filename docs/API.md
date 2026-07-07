---
title: API
project: Листория
version: 1.0.0
status: active
purpose: Спецификация REST API проекта
depends_on:
  - PROJECT.md
  - DATABASE.md
  - BACKEND.md
---

# API.md

# REST API Specification

> Документ описывает публичное REST API проекта «Листория».

API должно быть:

- стабильным;
- предсказуемым;
- расширяемым;
- независимым от Frontend;
- пригодным для Web, Mobile и Desktop клиентов.

---

# Scope

Этот документ применяется ко всем новым endpoint.

Изменение существующих endpoint допускается только при сохранении обратной совместимости.

Несовместимые изменения требуют новой версии API.

---

# 1. API Philosophy

REST API является единственным способом взаимодействия клиента с сервером.

Backend не должен содержать отдельную реализацию для:

- Web;
- Mobile;
- Desktop.

Все клиенты используют одинаковое API.

---

# 2. Base URL

Development

```text
http://localhost:8080/api/v1
```

---

Production

```text
https://api.listoria.ru/api/v1
```

---

# 3. Versioning

Каждая версия API должна иметь собственный префикс.

Пример

```text
/api/v1

/api/v2
```

---

Запрещено изменять контракт существующей версии.

---

# 4. Content Type

Все запросы используют

```http
Content-Type: application/json
```

Все ответы также используют

```http
application/json
```

---

# 5. Character Encoding

Использовать

```text
UTF-8
```

для всех запросов и ответов.

---

# 6. Authentication

Авторизация осуществляется через JWT.

Production

```text
HttpOnly Cookie
```

Development

Допускается

```http
Authorization: Bearer <token>
```

для удобства тестирования.

---

# 7. Authorization

Права доступа проверяются сервером.

Клиент не должен принимать решения о доступности операций.

---

# 8. HTTP Methods

Использовать только стандартные методы.

```http
GET
POST
PATCH
DELETE
```

---

Не использовать:

```http
PUT
```

если обновляется только часть объекта.

---

# 9. URL Rules

Использовать существительные.

Хорошо

```text
/stories

/comments

/users
```

Плохо

```text
/getStories

/createStory

/deleteUser
```

---

# 10. Resource Naming

Все ресурсы использовать во множественном числе.

Например

```text
stories

users

chapters

collections
```

---

# 11. Response Format

Любой успешный ответ должен иметь единый формат.

```json
{
  "data": {}
}
```

---

Для списка

```json
{
  "data": []
}
```

---

# 12. Pagination Response

Для коллекций использовать

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 325,
    "pages": 17
  }
}
```

---

# 13. Error Response

Все ошибки должны иметь одинаковый формат.

```json
{
  "error": {
    "code": "story_not_found",
    "message": "Story not found"
  }
}
```

---

Дополнительные поля допускаются.

Например

```json
{
  "error": {
    "code": "validation_error",
    "message": "Validation failed",
    "fields": {
      "title": "required"
    }
  }
}
```

---

# 14. Success Codes

Использовать

```http
200 OK

201 Created

204 No Content
```

---

# 15. Client Errors

Использовать

```http
400 Bad Request

401 Unauthorized

403 Forbidden

404 Not Found

409 Conflict

422 Unprocessable Entity
```

---

# 16. Server Errors

Использовать

```http
500 Internal Server Error

503 Service Unavailable
```

---

# 17. Request ID

Каждый ответ должен содержать

```http
X-Request-ID
```

для упрощения поиска в логах.

---

# 18. Time Format

Использовать

```text
RFC3339
```

Пример

```text
2026-07-04T14:25:31Z
```

---

# 19. UUID Format

Все идентификаторы передаются как

```text
UUID
```

Пример

```text
4fcb6414-7d31-4b1d-a2c7-7fb77b2d5d3d
```

---

# 20. Pagination Parameters

Все endpoint, возвращающие список, обязаны поддерживать:

```text
page

limit
```

По умолчанию

```text
page=1

limit=20
```

Максимальный limit

```text
100
```

---

# 21. Sorting

Использовать параметр

```text
sort
```

Например

```text
sort=newest

sort=popular

sort=updated
```

---

# 22. Filtering

Использовать query-параметры.

Пример

```text
?category=fantasy

?status=completed

?author=uuid
```

---

# 23. Search

Использовать параметр

```text
q
```

Например

```text
GET /stories?q=dragon
```

---

---

# 24. Includes

Для расширения ответа использовать параметр

```text
include
```

Пример

```http
GET /stories/{id}?include=author,tags,chapters
```

---

# 25. Field Selection

При необходимости клиент может запрашивать только нужные поля.

Использовать

```text
fields
```

Пример

```http
GET /stories?fields=id,title,cover_url
```

---

# 26. Rate Limit Headers

Если используется Rate Limiter, сервер должен возвращать

```http
X-RateLimit-Limit

X-RateLimit-Remaining

Retry-After
```

---

# 27. Auth API

## Register

```http
POST /auth/register
```

---

Request

```json
{
    "username": "Denis",
    "email": "denis@mail.com",
    "password": "password123"
}
```

---

Response

```json
{
    "data": {
        "id": "uuid",
        "username": "Denis"
    }
}
```

---

Status

```text
201 Created
```

---

# 28. Login

```http
POST /auth/login
```

---

Request

```json
{
    "email": "denis@mail.com",
    "password": "password123"
}
```

---

Response

```json
{
    "data": {
        "user": {},
        "access_token": "...",
        "refresh_token": "..."
    }
}
```

---

Production

Токены должны передаваться через HttpOnly Cookie.

---

# 29. Refresh Token

```http
POST /auth/refresh
```

---

Response

```json
{
    "data": {
        "access_token": "..."
    }
}
```

---

# 30. Logout

```http
POST /auth/logout
```

---

Response

```http
204 No Content
```

---

# 31. Current User

```http
GET /users/me
```

---

Response

```json
{
    "data": {
        "id": "...",
        "username": "...",
        "avatar_url": "..."
    }
}
```

---

# 32. Stories API

Получение списка произведений

```http
GET /stories
```

---

Поддерживает

- pagination
- filtering
- sorting
- search

---

# 33. Get Story

```http
GET /stories/{storyId}
```

---

Response

```json
{
    "data": {
        "id": "...",
        "title": "...",
        "description": "...",
        "author": {},
        "tags": [],
        "genres": [],
        "statistics": {}
    }
}
```

---

# 34. Create Story

```http
POST /stories
```

---

Request

```json
{
    "title": "...",
    "description": "...",
    "category_id": "...",
    "genre_ids": [],
    "tag_ids": []
}
```

---

Response

```json
{
    "data": {
        "id": "..."
    }
}
```

---

Status

```text
201 Created
```

---

# 35. Update Story

```http
PATCH /stories/{storyId}
```

---

Обновляются только переданные поля.

---

# 36. Delete Story

```http
DELETE /stories/{storyId}
```

---

Response

```http
204 No Content
```

---

# 37. Publish Story

```http
POST /stories/{storyId}/publish
```

---

Используется только автором.

---

# 38. Archive Story

```http
POST /stories/{storyId}/archive
```

---

Произведение становится недоступным для каталога.

---

# 39. Chapters API

Получить главы

```http
GET /stories/{storyId}/chapters
```

---

Получить одну главу

```http
GET /chapters/{chapterId}
```

---

Создать главу

```http
POST /stories/{storyId}/chapters
```

---

Обновить

```http
PATCH /chapters/{chapterId}
```

---

Удалить

```http
DELETE /chapters/{chapterId}
```

---

# 40. Publish Chapter

```http
POST /chapters/{chapterId}/publish
```

---

# 41. Comments API

Получить комментарии

```http
GET /stories/{storyId}/comments
```

или

```http
GET /chapters/{chapterId}/comments
```

---

Создать комментарий

```http
POST /comments
```

---

Request

```json
{
    "story_id": "...",
    "chapter_id": "...",
    "parent_id": "...",
    "content": "..."
}
```

---

Обновить комментарий

```http
PATCH /comments/{commentId}
```

---

Удалить

```http
DELETE /comments/{commentId}
```

---

# 42. Likes API

Поставить лайк

```http
POST /stories/{storyId}/like
```

---

Убрать лайк

```http
DELETE /stories/{storyId}/like
```

---

# 43. Bookmarks API

Добавить в библиотеку

```http
POST /stories/{storyId}/bookmark
```

---

Удалить

```http
DELETE /stories/{storyId}/bookmark
```

---

Получить библиотеку

```http
GET /users/me/bookmarks
```

---

---

# 44. Collections API

Получить список подборок

```http
GET /collections
```

---

Получить подборку

```http
GET /collections/{collectionId}
```

---

Создать подборку

```http
POST /collections
```

---

Request

```json
{
    "title": "Лучшее фэнтези",
    "description": "Любимые истории"
}
```

---

Response

```json
{
    "data": {
        "id": "uuid"
    }
}
```

---

Обновить подборку

```http
PATCH /collections/{collectionId}
```

---

Удалить подборку

```http
DELETE /collections/{collectionId}
```

---

Добавить произведение

```http
POST /collections/{collectionId}/stories
```

---

Request

```json
{
    "story_id": "uuid"
}
```

---

Удалить произведение

```http
DELETE /collections/{collectionId}/stories/{storyId}
```

---

# 45. User API

Получить профиль пользователя

```http
GET /users/{username}
```

---

Получить произведения пользователя

```http
GET /users/{username}/stories
```

---

Получить подборки пользователя

```http
GET /users/{username}/collections
```

---

Обновить профиль

```http
PATCH /users/me
```

---

Request

```json
{
    "username": "...",
    "bio": "...",
    "avatar_url": "..."
}
```

---

# 46. Reading History API

Получить историю чтения

```http
GET /users/me/history
```

---

Обновить прогресс чтения

```http
POST /history
```

---

Request

```json
{
    "chapter_id": "...",
    "progress": 76
}
```

---

Удалить историю

```http
DELETE /users/me/history
```

---

# 47. Notifications API

Получить уведомления

```http
GET /users/me/notifications
```

---

Отметить как прочитанное

```http
PATCH /notifications/{notificationId}
```

---

Отметить все как прочитанные

```http
POST /notifications/read-all
```

---

Удалить уведомление

```http
DELETE /notifications/{notificationId}
```

---

# 48. Search API

Поиск

```http
GET /search
```

---

Параметры

```text
q

page

limit

type
```

---

type

```text
stories

users

collections

tags

all
```

---

Response

```json
{
    "data": {
        "stories": [],
        "users": [],
        "collections": []
    }
}
```

---

# 49. Categories API

Получить категории

```http
GET /categories
```

---

Получить категорию

```http
GET /categories/{slug}
```

---

Получить произведения категории

```http
GET /categories/{slug}/stories
```

---

# 50. Genres API

Получить жанры

```http
GET /genres
```

---

Получить произведения жанра

```http
GET /genres/{slug}/stories
```

---

# 51. Tags API

Получить популярные теги

```http
GET /tags
```

---

Получить произведения тега

```http
GET /tags/{slug}/stories
```

---

# 52. Fandoms API

Получить список фандомов

```http
GET /fandoms
```

---

Получить конкретный фандом

```http
GET /fandoms/{slug}
```

---

Получить произведения фандома

```http
GET /fandoms/{slug}/stories
```

---

# 53. Upload API

Загрузка изображения

```http
POST /uploads/image
```

---

Поддерживаемые форматы

```text
jpg

jpeg

png

webp
```

---

Максимальный размер

```text
10 MB
```

---

Response

```json
{
    "data": {
        "url": "https://..."
    }
}
```

---

# 54. AI API

Получить краткое содержание

```http
POST /ai/summary
```

---

Request

```json
{
    "story_id": "uuid"
}
```

---

Получить рекомендации тегов

```http
POST /ai/tags
```

---

Улучшить описание

```http
POST /ai/improve-description
```

---

Сгенерировать промпт для обложки

```http
POST /ai/cover-prompt
```

---

Все AI endpoint должны иметь Rate Limit.

---

# 55. Admin API

Все endpoint администратора начинаются с

```text
/admin
```

---

Примеры

```http
GET /admin/users

GET /admin/stories

GET /admin/comments
```

---

Удалить пользователя

```http
DELETE /admin/users/{userId}
```

---

Заблокировать пользователя

```http
POST /admin/users/{userId}/ban
```

---

Разблокировать

```http
POST /admin/users/{userId}/unban
```

---

---

# 56. Request Validation

Каждый входящий запрос обязан проходить валидацию.

Проверять:

- обязательные поля;
- длину строк;
- UUID;
- email;
- URL;
- числовые диапазоны.

Некорректный запрос должен завершаться ошибкой

```http
422 Unprocessable Entity
```

---

# 57. Validation Error Response

Единый формат.

```json
{
  "error": {
    "code": "validation_error",
    "message": "Validation failed",
    "fields": {
      "title": "must not be empty",
      "email": "invalid email"
    }
  }
}
```

---

# 58. Authorization Errors

Неавторизованный пользователь

```http
401 Unauthorized
```

```json
{
  "error": {
    "code": "unauthorized",
    "message": "Authentication required"
  }
}
```

---

Недостаточно прав

```http
403 Forbidden
```

```json
{
  "error": {
    "code": "forbidden",
    "message": "Access denied"
  }
}
```

---

# 59. Not Found

Если ресурс отсутствует

```http
404 Not Found
```

Ответ

```json
{
  "error": {
    "code": "story_not_found",
    "message": "Story not found"
  }
}
```

---

# 60. Conflict

Использовать

```http
409 Conflict
```

Например

- email уже существует;
- username уже занят;
- произведение уже находится в подборке.

---

# 61. Internal Error

Любая внутренняя ошибка

```http
500 Internal Server Error
```

Ответ

```json
{
  "error": {
    "code": "internal_error",
    "message": "Internal server error"
  }
}
```

Никогда не возвращать пользователю текст ошибки PostgreSQL.

---

# 62. File Upload Rules

При загрузке файлов проверять:

- MIME Type;
- размер;
- расширение;
- содержимое файла.

Недопустимые файлы должны отклоняться.

---

# 63. API Security

Каждый защищённый endpoint обязан:

- проверять JWT;
- проверять срок действия токена;
- проверять права пользователя.

---

# 64. Idempotency

Следующие операции должны быть идемпотентными:

- удаление лайка;
- добавление лайка;
- добавление закладки;
- удаление закладки.

Повторный вызов не должен приводить к ошибке.

---

# 65. Response Time Targets

Получение произведения

```text
<50 ms
```

---

Получение главы

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

AI

```text
<10 секунд
```

---

# 66. API Stability

После публикации API запрещается:

- удалять поля;
- менять типы полей;
- менять URL endpoint;
- менять формат ответа.

Все несовместимые изменения выполняются только через новую версию API.

---

# 67. Deprecation Policy

Если endpoint устарел:

- пометить как Deprecated;
- сохранить поддержку до следующей версии API;
- предоставить замену.

---

# 68. OpenAPI Compatibility

Все endpoint должны быть совместимы с OpenAPI 3.1.

В будущем должна существовать возможность автоматически сгенерировать:

- Swagger UI;
- OpenAPI Schema;
- SDK.

Без изменения backend.

---

# 69. API Documentation Rules

Каждый endpoint должен иметь:

- описание;
- request;
- response;
- список ошибок;
- требования авторизации;
- примеры использования.

---

# 70. Naming Rules

Все JSON-поля использовать только в

```text
snake_case
```

Например

```json
{
  "avatar_url": "...",
  "created_at": "...",
  "updated_at": "..."
}
```

Не использовать

```text
camelCase
```

или

```text
PascalCase
```

в JSON API.

---

# 71. Nullable Fields

Если поле может отсутствовать —

возвращать

```json
null
```

Не использовать пустые строки вместо отсутствующего значения.

---

# 72. Boolean Fields

Использовать только

```json
true
```

или

```json
false
```

Не использовать:

```text
0

1

yes

no
```

---

# 73. Date Fields

Все даты возвращать в UTC.

Формат

```text
RFC3339
```

Пример

```text
2026-07-04T15:48:00Z
```

---

# 74. UUID Fields

Все идентификаторы передаются строкой.

Пример

```json
{
  "id": "4fcb6414-7d31-4b1d-a2c7-7fb77b2d5d3d"
}
```

---

# 75. API Logging

Все запросы должны логироваться.

Минимальный набор:

- Request ID;
- HTTP Method;
- Path;
- Status Code;
- Duration;
- User ID (если авторизован).

---

---

# 76. API Metrics

Backend должен собирать метрики использования API.

Минимальный набор:

- количество запросов;
- количество ошибок;
- среднее время ответа;
- количество авторизованных пользователей;
- количество AI-запросов;
- количество загрузок файлов.

Эти данные используются только для мониторинга.

---

# 77. API Rate Limits

Рекомендуемые ограничения.

Гость

```text
60 запросов / минута
```

---

Авторизованный пользователь

```text
300 запросов / минута
```

---

AI Endpoint

```text
10 запросов / минуту
```

---

Upload Endpoint

```text
20 запросов / минуту
```

---

Администратор

Без ограничений.

---

# 78. API Cache Headers

Для редко изменяемых данных рекомендуется использовать

```http
Cache-Control
```

Например

```http
GET /categories

GET /genres

GET /tags
```

---

Для персонализированных данных кэширование запрещено.

---

# 79. Compression

Backend обязан поддерживать

```text
gzip
```

В будущем допускается добавить

```text
brotli
```

---

# 80. Localization

API должно быть независимо от языка интерфейса.

Все внутренние коды ошибок возвращаются на английском языке.

Локализация сообщений производится Frontend.

Например

```json
{
  "error": {
    "code": "story_not_found",
    "message": "Story not found"
  }
}
```

Frontend самостоятельно отображает сообщение пользователю на нужном языке.

---

# 81. Public API

В будущем API должно позволять создать:

- мобильное приложение;
- desktop-приложение;
- публичный SDK;
- внешние интеграции.

Поэтому API не должно зависеть от Web UI.

---

# 82. Future Extensions

Архитектура API должна позволять добавить:

- рекомендации;
- достижения;
- платные подписки;
- донаты;
- команды авторов;
- совместное редактирование;
- AI Assistant;
- WebSocket;
- Push Notifications.

Без изменения существующего контракта.

---

# 83. WebSocket (Future)

В будущем допускается добавить

```text
/ws
```

для:

- уведомлений;
- онлайн-статуса;
- совместного редактирования;
- чата.

В MVP WebSocket не используется.

---

# 84. GraphQL

GraphQL не используется.

Причины:

- REST проще поддерживать;
- REST полностью покрывает задачи MVP;
- проще кэширование;
- проще документация;
- проще OpenAPI.

---

# 85. Codex API Rules

Перед созданием нового endpoint Codex обязан:

1. Прочитать `PROJECT.md`.
2. Прочитать `DATABASE.md`.
3. Прочитать `BACKEND.md`.
4. Прочитать `API.md`.
5. Проверить существующие endpoint.
6. Не создавать дублирующие маршруты.
7. Использовать единый формат Request и Response.
8. Использовать DTO.
9. Соблюдать REST.
10. Обновить документацию при добавлении нового endpoint.

---

# 86. API Checklist

## Архитектура

- [ ] Endpoint соответствует REST.
- [ ] Используется правильный HTTP Method.
- [ ] Используется версия API.
- [ ] Endpoint не дублирует существующий.

---

## Request

- [ ] Есть DTO.
- [ ] Есть валидация.
- [ ] Есть авторизация (если требуется).

---

## Response

- [ ] Используется единый формат.
- [ ] Используются корректные HTTP Status.
- [ ] Используются единые Error Codes.

---

## Безопасность

- [ ] Проверяются права доступа.
- [ ] Нет утечки внутренних ошибок.
- [ ] Нет лишних данных в ответе.

---

## Производительность

- [ ] Нет лишних SQL-запросов.
- [ ] Используются индексы.
- [ ] При необходимости используется Redis.

---

## Документация

- [ ] Endpoint описан.
- [ ] Приведены примеры Request.
- [ ] Приведены примеры Response.
- [ ] Указаны возможные ошибки.

---

# 87. Non-negotiable Rules

Следующие правила запрещено нарушать.

- Использовать только REST.
- Использовать только JSON.
- Использовать только snake_case.
- Использовать UUID.
- Использовать единую структуру ответов.
- Использовать единый формат ошибок.
- Использовать DTO.
- Использовать версионирование API.
- Не нарушать обратную совместимость.
- Не возвращать внутренние ошибки сервера.

---

# 88. Definition of Done

API считается завершённым только если:

- описаны все endpoint MVP;
- описаны Request и Response;
- описаны ошибки;
- определены правила авторизации;
- определены правила пагинации;
- определены правила фильтрации;
- API совместимо с OpenAPI;
- документация соответствует Backend и Database.

---

# 89. Final Goal

API должно выглядеть как современный коммерческий REST API.

Основные принципы:

1. Простота.
2. Предсказуемость.
3. Масштабируемость.
4. Совместимость.
5. Стабильность.
6. Независимость от клиента.

Любой новый endpoint должен соответствовать этим принципам.

---

# Конец файла API.md