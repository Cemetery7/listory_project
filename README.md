## 🚀 Демо

**Сайт:** https://---.vercel.app

**Demo аккаунт**


# 📚 Листория

> Современная российская платформа для публикации художественных произведений, фанфиков и оригинальных историй с AI-помощником для авторов.

![Status](https://img.shields.io/badge/status-MVP-success)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-336791)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748)
![License](https://img.shields.io/badge/license-MIT-green)

---

# О проекте

**Листория** — это современная литературная платформа, создаваемая как отечественная альтернатива существующим сервисам публикации произведений.

Проект ориентирован на авторов художественной литературы, фанфиков и оригинальных произведений.

Главная цель — предоставить удобный сервис публикации, чтения и написания произведений с использованием современных AI-инструментов.

---

# Возможности MVP

### Авторизация

- регистрация
- вход
- Demo-аккаунт
- JWT-аутентификация
- защищенные страницы

---

### Работа с произведениями

- создание произведения
- создание первой главы
- публикация
- просмотр произведения
- чтение главы
- отображение произведений на главной
- каталог произведений

---

### AI-помощник

Интеграция через **KodikRouter**.

Поддерживаются:

- ✨ генерация названия
- ✨ улучшение описания
- ✨ генерация тегов
- ✨ продолжение главы

Результаты AI не применяются автоматически — пользователь самостоятельно выбирает подходящий вариант.

---

### Безопасность

- JWT
- HttpOnly Cookies
- серверная валидация
- защита API
- ограничение количества AI-запросов
- cooldown между генерациями
- timeout AI-запросов
- безопасное хранение секретов

---

# Стек технологий

## Frontend

- Next.js 15
- React 19
- TypeScript
- TailwindCSS
- Framer Motion

---

## Backend

- Next.js API Routes
- Prisma ORM
- PostgreSQL
- JWT
- bcrypt

---

## AI

- KodikRouter
- Gemini 2.5 Flash

---

# Архитектура

```
Frontend (Next.js)

        │

        ▼

API Routes

        │

 ┌──────┴──────┐
 │             │
 ▼             ▼

PostgreSQL   KodikRouter

```

---

# Структура проекта

```
frontend/
    app/
    widgets/
    shared/
    entities/
    lib/
    public/

backend/

docs/

prisma/
```

---

# Локальный запуск

## 1. Клонировать проект

```bash
git clone https://github.com/Cemetery7/listory_project.git
```

---

## 2. Установить зависимости

```bash
pnpm install
```

---

## 3. Настроить переменные окружения

Создать:

```
.env
frontend/.env.local
```

Пример:

```env
DATABASE_URL=
JWT_SECRET=

KODIK_API_KEY=
KODIK_API_URL=
KODIK_MODEL=
```

---

## 4. Запустить PostgreSQL

```bash
docker compose up -d
```

---

## 5. Выполнить миграции

```bash
pnpm prisma:migrate
```

---

## 6. Запустить seed

```bash
pnpm prisma:seed
```

---

## 7. Запустить приложение

```bash
cd frontend

pnpm dev
```

---

# Production

Для production необходимо указать:

```env
DATABASE_URL

JWT_SECRET

AUTH_COOKIE_SECURE=true

KODIK_API_KEY

KODIK_API_URL

KODIK_MODEL
```

---

# AI

В проекте используется KodikRouter.

По умолчанию поддерживается Gemini 2.5 Flash.

AI применяется только по запросу пользователя.

Все операции имеют защиту от злоупотреблений.

---

# Документация

Полная документация находится в папке:

```
docs/
```

Основные документы:

- PROJECT.md
- DESIGN_SYSTEM.md
- COMPONENTS.md
- PAGES.md
- FRONTEND.md
- DATABASE.md
- BACKEND.md
- API.md

---

# Roadmap

## MVP ✅

- [x] Авторизация
- [x] Регистрация
- [x] Demo User
- [x] JWT
- [x] PostgreSQL
- [x] Prisma
- [x] Создание произведения
- [x] Первая глава
- [x] Каталог
- [x] Главная
- [x] AI-помощник

---

## После Hackathon

- [ ] комментарии
- [ ] оценки
- [ ] подписки
- [ ] поиск
- [ ] рекомендации
- [ ] загрузка изображений
- [ ] личные сообщения
- [ ] импорт произведений
- [ ] уведомления
- [ ] мобильная версия
- [ ] PWA
- [ ] полноценная система модерации

---

# Почему появился этот проект

Сегодня российским авторам художественных произведений особенно важно иметь стабильную и современную площадку для публикации своих работ.

Листория создается как удобная экосистема, объединяющая авторов, читателей и современные AI-инструменты, которые помогают писать быстрее, но не заменяют творческий процесс.

---

# Автор

**Денис Беренгилов**

GitHub:

https://github.com/Cemetery7

---

# Лицензия

MIT License
