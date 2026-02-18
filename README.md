# Angular Monorepo

Nx-монорепозиторий с Angular-фронтендами и NestJS-бэкендами.

## Стек

- **Frontend:** Angular 21, TypeScript 5.9
- **Backend:** NestJS 11, WebSockets, Swagger
- **Build:** Nx 22.5, Webpack
- **Tests:** Jest 30

## Проекты

| Приложение | Тип | Порт | Описание |
|---|---|---|---|
| `auth-interceptor-app` | Angular | 4200 | HTTP-интерсептор с авторизацией |
| `chat-frontend` | Angular | 4201 | UI чата |
| `chat-backend` | NestJS | 3000 | WebSocket-сервер чата |
| `support-api` | NestJS | 3001 | REST API тикет-системы |

## Быстрый старт

```bash
npm install
```

Запуск всех приложений сразу:

```bash
npx nx run-many -t serve
```

Запуск одного приложения:

```bash
npx nx serve <app-name>
```

Сборка:

```bash
npx nx build <app-name>
```

Тесты:

```bash
npx nx test <app-name>
```

## Структура

```
apps/
  auth-interceptor-app/   # Angular — демо HTTP-интерсептора
  chat-frontend/          # Angular — фронтенд чата
  chat-backend/           # NestJS  — WebSocket-сервер чата
  support-api/            # NestJS  — API тикет-системы
```
