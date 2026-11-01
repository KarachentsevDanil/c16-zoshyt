# zoshyt

Бекенд онлайн-школи «Зошит». TypeScript (strict), Node 22, Fastify 5, Prisma, Postgres 16, BullMQ, Vitest. Локально все піднімається через docker compose.

- src/api — HTTP-маршрути
- src/courses — курси, дедлайни
- src/notifications — розсилки (npm-скрипти send-*), шаблони, транспорти
- src/submissions — стан посилок
- src/config — конфігурація
- grader — автоперевірка посилок, фікстури в grader/test/fixtures
- submissions — посилки студентів, вивантажені для дебагу
- dumps — дамп staging

## Команди

```bash
npx tsc --noEmit
npx eslint .
npm test
npm run grade -- 4417                                          # прогнати посилку через грейдер
docker compose exec -T web npm test
docker compose exec -T web npx prisma migrate dev --name <назва>
```

## Безпека

- Не використовуй реальні дані студентів у тестах і фікстурах.
- Розсилки запускай лише з дозволу.
