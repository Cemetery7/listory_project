---
title: BACKEND
project: Листория
version: 1.0.0
status: active
purpose: Архитектура серверной части проекта
depends_on:
  - PROJECT.md
  - DATABASE.md
  - FRONTEND.md
---

# BACKEND.md

# Backend Architecture

> Этот документ является основным руководством по разработке серверной части проекта «Листория».

Backend должен быть простым, масштабируемым и предсказуемым. Любое архитектурное решение должно быть обосновано и легко поддерживаться в течение многих лет.

---

# 1. Backend Philosophy

Backend строится по следующим принципам:

- простота;
- читаемость;
- модульность;
- масштабируемость;
- минимальное количество магии;
- максимальная предсказуемость.

Если существует два решения одинаковой сложности — выбирать более простое.

---

# 2. Основные принципы

Во всём backend соблюдать:

- KISS
- SOLID
- DRY
- Composition over Inheritance
- Explicit over Implicit
- Dependency Inversion

---

# 3. Tech Stack

## Язык

```text
Go 1.25+
```

---

## HTTP Router

```text
chi
```

---

## Database

```text
PostgreSQL 16+
```

---

## Database Driver

```text
pgx/v5
```

---

## SQL Generator

```text
sqlc
```

---

## Cache

```text
Redis
```

---

## Authentication

```text
JWT
```

---

## Validation

```text
go-playground/validator
```

---

## Logging

```text
zap
```

---

## Configuration

```text
viper
```

или

```text
envconfig
```

(выбрать один подход и использовать его во всём проекте)

---

## Migrations

```text
golang-migrate
```

---

## Local File Storage

```text
MinIO
```

---

## Production Storage

```text
Amazon S3
```

или совместимое S3 API.

---

## AI

Поддерживать возможность подключения:

- OpenAI
- Kodik AI
- любого OpenAI-compatible API

через единый Gateway.

---

# 4. Почему именно Chi

Используется:

```text
github.com/go-chi/chi/v5
```

Причины:

- построен поверх net/http;
- минималистичный;
- быстрый;
- понятный;
- легко тестируется;
- огромное количество готовых middleware;
- хорошо подходит для Clean Architecture.

---

Почему не Gin

Gin значительно быстрее начать использовать.

Однако:

- больше собственной магии;
- собственный Context;
- выше связанность;
- сложнее заменить отдельные части.

Для долгоживущего проекта предпочтительнее Chi.

---

# 5. Почему sqlc

ORM не используется.

Причины:

- полный контроль SQL;
- отсутствие скрытых запросов;
- высокая производительность;
- строгая типизация;
- отсутствие неожиданного поведения.

Все запросы должны быть явно написаны разработчиком.

---

# 6. Почему pgx

Используется

```text
pgx/v5
```

Причины:

- лучшая интеграция с PostgreSQL;
- высокая производительность;
- современные возможности PostgreSQL;
- отсутствие лишнего слоя абстракции.

---

# 7. Почему UUID

Все первичные ключи используют UUID.

Причины:

- безопаснее при публичных API;
- проще горизонтальное масштабирование;
- невозможно угадать следующий ID;
- удобно объединять данные между сервисами.

---

# 8. Общая архитектура

Backend использует упрощённую Clean Architecture.

```text
HTTP

↓

Handler

↓

Service

↓

Repository

↓

PostgreSQL
```

Каждый слой отвечает только за свою область ответственности.

---

# 9. Dependency Rule

Направление зависимостей всегда только вниз.

```text
Handler

↓

Service

↓

Repository

↓

Database
```

Repository никогда не знает о Handler.

Service никогда не знает о HTTP.

---

# 10. Структура проекта

```text
backend/

cmd/

internal/

pkg/

configs/

migrations/

sql/

scripts/

docker/

tests/
```

---

# 11. Полная структура

```text
backend/

cmd/
    server/

internal/

    auth/

    story/

    chapter/

    comment/

    collection/

    notification/

    user/

    ai/

    search/

pkg/

configs/

migrations/

sql/

docker/

scripts/

tests/
```

---

# 12. Cmd

Папка

```text
cmd/
```

содержит только точки входа.

Например

```text
cmd/server
```

Никакой бизнес-логики.

---

# 13. Internal

Вся бизнес-логика располагается внутри

```text
internal/
```

Она не должна импортироваться внешними проектами.

---

# 14. Module Structure

Каждый модуль имеет одинаковую структуру.

Например

```text
story/

handler.go

service.go

repository.go

dto.go

routes.go

validator.go

errors.go
```

Дополнительно при необходимости

```text
mapper.go

converter.go

cache.go
```

---

# 15. Handler

Handler отвечает только за HTTP.

Он:

- читает Request;
- вызывает Service;
- возвращает Response.

Handler не должен:

- работать с SQL;
- содержать бизнес-логику;
- выполнять вычисления;
- обращаться к Redis.

---

# 16. Service

Service содержит бизнес-логику.

Именно здесь принимаются все решения.

Например:

- можно ли публиковать произведение;
- можно ли удалить комментарий;
- можно ли создать подборку.

Service ничего не знает о HTTP.

---

---

# 17. Repository

Repository отвечает исключительно за работу с данными.

Repository:

- выполняет SQL-запросы;
- использует sqlc;
- ничего не знает о HTTP;
- ничего не знает о JWT;
- ничего не знает о бизнес-логике.

---

## Repository не должен

- проверять права доступа;
- валидировать входные данные;
- изменять бизнес-правила;
- работать с JSON Response.

---

# 18. DTO

Каждый Handler использует DTO.

Запрещается использовать структуры базы данных напрямую.

Структура

```text
dto/

create_story_request.go

story_response.go

update_story_request.go
```

---

DTO разделяются на:

- Request DTO;
- Response DTO.

---

# 19. Domain Models

Каждая сущность имеет собственную модель.

Например

```text
Story

User

Comment

Collection
```

Эти модели используются внутри Service.

---

# 20. Validation

Валидация производится до вызова Service.

Использовать

```text
go-playground/validator
```

---

Пример

```go
type CreateStoryRequest struct {
    Title string `validate:"required,min=3,max=200"`
}
```

---

Никогда не выполнять ручную валидацию строк.

---

# 21. Mapper

Mapper отвечает за преобразование.

Например

```text
DTO

↓

Domain

↓

DTO
```

Service не должен заниматься преобразованием структур.

---

# 22. HTTP Server

Использовать стандартный

```go
net/http
```

через Chi.

---

Создание сервера должно происходить только в

```text
cmd/server
```

---

# 23. Router

Все маршруты должны регистрироваться централизованно.

Структура

```text
internal/

router/

router.go
```

---

Каждый модуль экспортирует функцию

```go
RegisterRoutes(...)
```

---

Главный Router только объединяет маршруты.

---

# 24. API Versioning

Все API должны использовать версионирование.

Пример

```text
/api/v1
```

В будущем

```text
/api/v2
```

---

# 25. Route Structure

Пример

```text
GET     /api/v1/stories

GET     /api/v1/stories/{id}

POST    /api/v1/stories

PATCH   /api/v1/stories/{id}

DELETE  /api/v1/stories/{id}
```

---

Использовать REST.

---

# 26. Middleware

Использовать следующие middleware.

Обязательные

- Recover
- Request ID
- Logger
- Real IP
- Timeout
- Compression
- CORS

---

Дополнительные

- Authentication
- Authorization
- Rate Limiter

---

# 27. Recover Middleware

Любая паника должна быть перехвачена.

Пользователь никогда не должен видеть stack trace.

Ответ

```json
{
  "error": "internal server error"
}
```

---

# 28. Logger Middleware

Логировать каждый запрос.

Минимальный набор

- Method
- Path
- Status
- Duration
- Request ID

---

Запрещено логировать:

- пароль;
- JWT;
- cookies;
- refresh token.

---

# 29. Request ID

Каждый запрос получает уникальный ID.

Он используется:

- в логах;
- в ошибках;
- при отладке.

---

# 30. Timeout

Все запросы должны иметь ограничение по времени.

Для MVP

```text
30 секунд
```

---

# 31. Authentication

Использовать JWT.

После авторизации пользователь получает:

- Access Token;
- Refresh Token.

---

Access Token

Короткоживущий.

---

Refresh Token

Долгоживущий.

---

# 32. Token Storage

Production

Использовать

```text
HttpOnly Cookie
```

Не использовать LocalStorage.

---

# 33. Authorization

Права доступа проверяются в Service.

Не в Handler.

---

Пример

```text
User

↓

Service

↓

Can Edit Story?
```

---

# 34. Roles

Использовать роли.

```text
User

Moderator

Admin
```

---

Все проверки выполнять централизованно.

---

# 35. Password Hashing

Использовать

```text
argon2id
```

Допускается

```text
bcrypt
```

если потребуется совместимость.

---

Пароль никогда не сохраняется открытым текстом.

---

# 36. Configuration

Все настройки проекта должны храниться в одном месте.

Структура

```text
configs/

config.go

config.yaml
```

или

```text
.env
```

---

Все значения должны считываться при запуске приложения.

---

# 37. Environment Variables

Использовать:

```text
APP_ENV

HTTP_PORT

DATABASE_URL

REDIS_URL

JWT_SECRET

MINIO_ENDPOINT

OPENAI_API_KEY
```

---

Никогда не хардкодить значения.

---

# 38. Logging

Использовать

```text
zap
```

Уровни

```text
DEBUG

INFO

WARN

ERROR

FATAL
```

---

Production

```text
JSON
```

Development

```text
Console
```

---

# 39. Error Handling

Все ошибки должны быть типизированы.

Например

```go
ErrStoryNotFound

ErrUnauthorized

ErrValidation

ErrForbidden
```

---

Запрещено возвращать пользователю внутренние ошибки PostgreSQL.

---

# 40. Error Response

Единый формат ответа.

```json
{
  "error": {
    "code": "story_not_found",
    "message": "Story not found"
  }
}
```

---

---

# 41. Transactions

Все операции, изменяющие несколько сущностей, должны выполняться внутри транзакции.

Использовать:

```text
BEGIN

↓

Operations

↓

COMMIT
```

или

```text
ROLLBACK
```

при любой ошибке.

---

## Использовать транзакции для

- регистрации пользователя;
- создания произведения;
- публикации главы;
- удаления произведения;
- создания подборки;
- изменения нескольких связанных сущностей.

---

Запрещается выполнять подобные операции без транзакции.

---

# 42. Pagination

Все списки обязаны поддерживать пагинацию.

Параметры

```text
limit

offset
```

Максимальный limit

```text
100
```

По умолчанию

```text
20
```

---

В будущем допускается переход на Cursor Pagination.

---

# 43. Filtering

Фильтрация должна происходить на стороне базы данных.

Примеры

```text
category

genre

tag

author

status

rating

language
```

Не загружать все записи в память для фильтрации.

---

# 44. Sorting

Поддерживаемые варианты сортировки

```text
newest

oldest

popular

most_liked

most_viewed

updated
```

Любая новая сортировка должна добавляться централизованно.

---

# 45. Search

Поиск строится на PostgreSQL Full Text Search.

Использовать

```sql
tsvector

tsquery
```

Поиск должен учитывать:

- название;
- описание;
- автора;
- теги.

---

# 46. Cache

Использовать Redis.

Кэшировать:

- популярные произведения;
- главную страницу;
- популярные теги;
- категории;
- рекомендации.

Не кэшировать данные пользователя без необходимости.

---

# 47. Cache Strategy

Стратегия

```text
Cache Aside
```

Схема

```text
Request

↓

Redis

↓

Database

↓

Redis

↓

Response
```

---

# 48. Cache Keys

Использовать единый формат.

Пример

```text
story:{id}

user:{id}

homepage

popular

catalog:page:1

tags:popular
```

---

# 49. Background Jobs

Некоторые задачи не должны выполняться внутри HTTP-запроса.

Примеры

- пересчет статистики;
- генерация AI Summary;
- отправка уведомлений;
- очистка старых данных;
- генерация рекомендаций.

---

# 50. Job Queue

Для MVP допускается использовать обычные goroutine.

После роста проекта перейти на полноценную очередь задач.

Возможные варианты

```text
Asynq

RabbitMQ

NATS
```

---

# 51. AI Gateway

Все обращения к AI должны проходить через единый слой.

```text
HTTP

↓

AI Service

↓

AI Gateway

↓

Provider
```

Provider может быть:

- OpenAI;
- Kodik AI;
- любой OpenAI-compatible API.

---

# 52. AI Provider Interface

Каждый AI-провайдер обязан реализовывать одинаковый интерфейс.

Например

```go
GenerateSummary()

GenerateTags()

ImproveDescription()

GenerateCoverPrompt()
```

Service не должен знать, какой провайдер используется.

---

# 53. File Storage

Backend не хранит файлы.

Backend хранит только ссылки.

Файлы загружаются в:

Development

```text
MinIO
```

Production

```text
S3
```

---

# 54. Upload Flow

```text
Client

↓

Backend

↓

MinIO / S3

↓

URL

↓

PostgreSQL
```

---

# 55. Image Validation

Перед загрузкой проверять:

- MIME Type;
- размер файла;
- максимальное разрешение;
- наличие изображения.

Запрещено принимать произвольные файлы.

---

# 56. Rate Limiting

Использовать Rate Limiter для:

- авторизации;
- регистрации;
- AI;
- поиска;
- загрузки файлов.

---

# 57. CORS

Разрешать только доверенные Origin.

Development

```text
localhost
```

Production

только список разрешённых доменов.

Запрещается использовать

```text
*
```

в production.

---

# 58. Health Check

Создать endpoint

```text
GET /health
```

Возвращает

```json
{
  "status": "ok"
}
```

Дополнительно можно создать

```text
GET /ready

GET /live
```

---

# 59. Metrics

Подготовить backend к интеграции с Prometheus.

Минимальные метрики

- количество запросов;
- время ответа;
- количество ошибок;
- активные соединения.

---

# 60. Observability

Backend должен позволять быстро ответить на вопросы:

- Почему запрос медленный?
- Почему произошла ошибка?
- Почему пользователь получил 500?
- Какой запрос вызвал проблему?

Для этого использовать:

- Request ID;
- структурированные логи;
- метрики.

---

---

# 61. Testing Strategy

Backend должен быть спроектирован так, чтобы его можно было тестировать без изменения архитектуры.

Использовать три уровня тестирования:

- Unit Tests
- Integration Tests
- End-to-End Tests

---

## Unit Tests

Тестируются:

- Services
- Validators
- Utils
- Mappers

Не тестировать SQL.

Использовать моки Repository.

---

## Integration Tests

Тестируются:

- Repository
- SQL Queries
- Migrations
- PostgreSQL

Использовать настоящую базу данных.

---

## End-to-End Tests

Проверять пользовательские сценарии.

Например:

```text
Регистрация

↓

Авторизация

↓

Создание произведения

↓

Создание главы

↓

Чтение

↓

Комментарий
```

---

# 62. Testcontainers

Для Integration Tests использовать

```text
Testcontainers
```

Поднимать:

- PostgreSQL
- Redis
- MinIO

Тесты не должны зависеть от локального окружения.

---

# 63. Docker

Каждый сервис запускается в контейнере.

Минимальный набор:

```text
Backend

PostgreSQL

Redis

MinIO
```

---

# 64. Docker Compose

Локальная разработка должна запускаться одной командой.

```bash
docker compose up
```

После запуска должны быть доступны:

- Backend API
- PostgreSQL
- Redis
- MinIO

---

# 65. Build Strategy

Production-сборка должна быть многоэтапной.

```text
Builder

↓

Binary

↓

Minimal Runtime Image
```

Использовать небольшой финальный Docker Image.

---

# 66. Graceful Shutdown

Backend обязан корректно завершать работу.

При остановке:

- прекратить принимать новые запросы;
- завершить активные запросы;
- закрыть соединения с PostgreSQL;
- закрыть Redis;
- завершить фоновые задачи.

---

# 67. Configuration Strategy

Конфигурация разделяется по окружениям.

```text
Development

Testing

Production
```

Изменение окружения не должно требовать изменения кода.

---

# 68. Production Requirements

Production Backend должен поддерживать:

- Health Checks;
- Graceful Shutdown;
- Structured Logging;
- Metrics;
- Docker;
- Environment Variables;
- Migrations;
- Automatic Restart.

---

# 69. Security Guidelines

Backend обязан защищаться от:

- SQL Injection;
- XSS;
- CSRF (если используется Cookie);
- Brute Force;
- Path Traversal;
- Upload Abuse.

Использовать параметризованные SQL-запросы.

---

# 70. Request Validation Flow

```text
HTTP Request

↓

Decode DTO

↓

Validate

↓

Handler

↓

Service

↓

Repository

↓

Response
```

При ошибке валидации Service не вызывается.

---

# 71. Response Strategy

Все успешные ответы должны иметь единый формат.

Пример:

```json
{
  "data": {
    "...": "..."
  }
}
```

Для списков:

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 250
  }
}
```

---

# 72. Error Codes

Использовать понятные коды ошибок.

Примеры:

```text
validation_error

story_not_found

chapter_not_found

user_not_found

unauthorized

forbidden

internal_error
```

Не использовать текст ошибки как код.

---

# 73. HTTP Status Codes

Использовать только стандартные HTTP-коды.

```text
200 OK

201 Created

204 No Content

400 Bad Request

401 Unauthorized

403 Forbidden

404 Not Found

409 Conflict

422 Unprocessable Entity

500 Internal Server Error
```

---

# 74. Repository Interfaces

Каждый Repository должен иметь интерфейс.

Пример:

```go
type StoryRepository interface {
    Create(...)
    Update(...)
    Delete(...)
    GetByID(...)
    List(...)
}
```

Service зависит от интерфейса, а не от реализации.

---

# 75. Service Interfaces

Крупные сервисы также должны иметь интерфейсы.

Это упрощает:

- тестирование;
- замену реализации;
- мокирование.

---

# 76. Dependency Injection

Использовать явное Dependency Injection.

Пример:

```text
main

↓

NewServer()

↓

NewStoryService()

↓

NewStoryRepository()
```

Не использовать глобальные переменные.

Не использовать Service Locator.

---

# 77. Project Modules

Основные backend-модули:

```text
Auth

Users

Stories

Chapters

Comments

Collections

Bookmarks

Notifications

Search

AI

Uploads

Admin
```

Каждый модуль должен быть максимально независимым.

---

# 78. Scalability

Архитектура должна позволять в будущем:

- выделить AI в отдельный сервис;
- выделить Search;
- добавить очереди задач;
- масштабировать Backend горизонтально.

Без переписывания существующей логики.

---

# 79. Architecture Decisions

Все важные архитектурные изменения должны фиксироваться в:

```text
ARCHITECTURE_DECISIONS.md
```

Изменение технологии должно сопровождаться новой ADR-записью.

---

# 80. Documentation

Каждый новый backend-модуль обязан:

- иметь понятную структуру;
- соответствовать документации;
- не нарушать существующую архитектуру;
- сопровождаться обновлением документации при необходимости.

---

---

# 81. Deployment Strategy

Backend должен одинаково работать:

- локально;
- в staging;
- в production.

Все различия должны определяться только конфигурацией.

Запрещается изменять код при смене окружения.

---

# 82. CI/CD

Рекомендуемый pipeline:

```text
Push

↓

Run Tests

↓

Go Vet

↓

Staticcheck

↓

Build

↓

Docker Build

↓

Deploy

↓

Run Migrations

↓

Health Check
```

Если любой этап завершился ошибкой — деплой останавливается.

---

# 83. Production Logging

Production использует только структурированные JSON-логи.

Каждая запись должна содержать:

- timestamp;
- level;
- request_id;
- service;
- message.

При наличии ошибки дополнительно:

- stack trace (только в логах);
- error code.

---

# 84. Monitoring

Backend должен быть готов к подключению:

- Prometheus;
- Grafana;
- Loki;
- Tempo/OpenTelemetry (в будущем).

Минимальный набор метрик:

- RPS;
- latency;
- error rate;
- database connections;
- redis connections.

---

# 85. Database Connections

Использовать пул соединений.

Настройки должны конфигурироваться через Environment Variables.

Например:

```text
MaxOpenConnections

MaxIdleConnections

ConnectionLifetime
```

Не открывать новое соединение на каждый запрос.

---

# 86. Redis Usage

Redis использовать только как:

- Cache;
- Session Store (если потребуется);
- Rate Limiter;
- Queue Backend (в будущем).

Запрещается хранить бизнес-данные только в Redis.

Redis является временным хранилищем.

---

# 87. API Stability

После выхода публичной версии API запрещается:

- менять формат ответов;
- удалять поля;
- менять смысл существующих endpoint.

Для несовместимых изменений использовать новую версию API.

Например:

```text
/api/v2
```

---

# 88. Version Compatibility

Backend должен поддерживать:

- обратную совместимость внутри одной версии API;
- безопасные миграции данных;
- постепенный переход клиентов.

---

# 89. Architecture Principles

Любое новое решение должно соответствовать следующим вопросам.

Можно ли это протестировать?

Можно ли заменить реализацию?

Не нарушает ли это Dependency Rule?

Не создаёт ли это сильную связанность?

Не усложняет ли это проект без необходимости?

Если хотя бы на один вопрос ответ отрицательный — решение необходимо пересмотреть.

---

# 90. Performance Targets

Целевые показатели MVP.

Авторизация

```text
<100 ms
```

---

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

Создание комментария

```text
<100 ms
```

---

# 91. Code Review Rules

Перед объединением изменений необходимо проверить:

- читаемость кода;
- отсутствие дублирования;
- соответствие архитектуре;
- наличие обработки ошибок;
- корректность логирования;
- соответствие документации.

---

# 92. Backend Checklist

## Архитектура

- [ ] Соблюдается Clean Architecture.
- [ ] Handler не содержит бизнес-логики.
- [ ] Service не знает о HTTP.
- [ ] Repository не знает о бизнес-логике.

---

## Безопасность

- [ ] Используется Argon2id/Bcrypt.
- [ ] Нет SQL Injection.
- [ ] Нет хранения секретов в коде.
- [ ] Используются безопасные Cookie (Production).

---

## Производительность

- [ ] Используются индексы.
- [ ] Используется Redis.
- [ ] Нет лишних SQL-запросов.
- [ ] Нет N+1 проблем.

---

## Код

- [ ] Нет глобального состояния.
- [ ] Нет циклических зависимостей.
- [ ] Все ошибки обработаны.
- [ ] Все зависимости внедряются явно.

---

## Документация

- [ ] Документация обновлена.
- [ ] Добавлены ADR при необходимости.
- [ ] Новые endpoint описаны в API.md.

---

# 93. Non-negotiable Rules

Следующие правила запрещено нарушать.

- Использовать только Go.
- Использовать Chi Router.
- Использовать PostgreSQL.
- Использовать pgx.
- Использовать sqlc.
- Использовать Redis только как кэш/временное хранилище.
- Использовать миграции.
- Использовать Dependency Injection.
- Использовать DTO.
- Использовать единый формат ошибок.
- Использовать структурированные логи.
- Не писать SQL внутри Handler.
- Не писать SQL внутри Service.
- Не обращаться к базе напрямую из HTTP-слоя.
- Не нарушать Dependency Rule.

---

# 94. Definition of Done

Backend считается завершённым только если:

- реализованы все модули MVP;
- все endpoint соответствуют API.md;
- используются миграции;
- используется sqlc;
- используется pgx;
- реализованы все middleware;
- поддерживаются JWT;
- реализованы Health Check и Graceful Shutdown;
- проект собирается без предупреждений;
- отсутствуют критические ошибки линтера;
- архитектура соответствует настоящему документу.

---

# 95. Final Goal

Backend должен выглядеть как серверная часть современного коммерческого продукта.

Приоритеты проекта:

1. Простота.
2. Надёжность.
3. Производительность.
4. Масштабируемость.
5. Предсказуемость.
6. Поддерживаемость.

Любое решение должно улучшать хотя бы один из этих пунктов и не ухудшать остальные.

---

# Конец файла BACKEND.md