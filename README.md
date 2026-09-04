# Финансы — Telegram Mini App

Простое приложение для учёта личных доходов/расходов внутри Telegram, с уведомлением
от бота при превышении дневного лимита трат.

## Стек
- Next.js 14 (App Router) + Tailwind CSS
- Supabase (Postgres) как база данных
- Telegram Web Apps API (`@twa-dev/sdk`)
- Хостинг на Vercel

## Структура таблиц (Supabase)
См. файл `supabase-schema.sql` — выполни его в SQL Editor Supabase.

- **app_users** — telegram_id, chat_id, daily_limit
- **categories** — категории пользователя (в т.ч. кастомные)
- **transactions** — доходы/расходы, привязаны к user_id и category_id

## Переменные окружения
Скопируй `.env.local.example` в `.env.local` (для локальной разработки) и/или задай
те же переменные в настройках проекта на Vercel:

- `SUPABASE_URL` — URL проекта Supabase
- `SUPABASE_SERVICE_ROLE_KEY` — service_role ключ (Project Settings -> API)
- `TELEGRAM_BOT_TOKEN` — токен бота от @BotFather

Все три переменные используются только на сервере (в API-роутах), в браузер не попадают.

## Как это работает
1. При открытии Mini App фронтенд получает `initData` от Telegram (`@twa-dev/sdk`).
2. Каждый запрос к `/api/*` отправляет `initData`, сервер проверяет подпись
   (HMAC с TELEGRAM_BOT_TOKEN) — это подтверждает, что запрос реально от Telegram.
3. При первом входе создаётся запись в `app_users` + 7 базовых категорий.
4. При добавлении расхода (`POST /api/transactions`) сервер считает сумму расходов
   за сегодня и, если она больше `daily_limit`, отправляет сообщение через
   `https://api.telegram.org/bot<TOKEN>/sendMessage` в чат пользователя.

## Локальный запуск (по желанию)
Не обязателен — можно сразу деплоить на Vercel. Но если решишь запускать локально,
понадобится Node.js и команда `npm install && npm run dev`.
