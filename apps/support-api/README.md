# Support API

NestJS REST API для внутренней тикет-системы поддержки.

## Запуск

```bash
npx nx serve support-api
```

API: http://localhost:3001
Swagger: http://localhost:3001/api

## Что внутри

- CRUD-операции для тикетов
- Загрузка файлов/вложений (Multer)
- Валидация входных данных (class-validator)
- Swagger/OpenAPI документация
