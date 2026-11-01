# zoshyt — навчальний репозиторій кейса C16

«Зошит» — вигадана онлайн-школа програмування. Студенти здають домашні завдання як код, автоперевірка (grader) проганяє на посилці тести й ставить оцінку, а нагадування про дедлайни школа розсилає через поштового провайдера «Поштар». Команда підключила Claude Code, щоб агент розбирав баги автоперевірки.

Репозиторій відтворює кейс C16 (M2T3, task-1) за змістом: код, стенд і конфігурацію Claude Code, на яких перевіряють сценарії A1–A3.

Усі студенти вигадані, а «Поштар» тут — локальна заглушка: жоден лист не виходить за межі стенда.

## Гілки

| Гілка | Що в ній |
| --- | --- |
| `main` | Чинна конфігурація Claude Code, з якою команда розпочинає завдання |
| `reference` | Reference solution task-1: цільовий `.claude/settings.json`, виправлений гард, тест на чотирьох викликах A3 |

## Структура

```
src/
  api/             Fastify: /health, дедлайни курсу, постановка посилки в чергу
  courses/         курси, дедлайни, студенти курсу (Prisma)
  notifications/   розсилки (npm-скрипти send-*), шаблони, транспорти
  submissions/     стан посилок
  config/          конфігурація, зокрема адреса відправника
  store/           клієнт Prisma
grader/            автоперевірка: кожен випадок в окремому процесі з таймаутом, воркер BullMQ
  assignments/     тестові випадки завдань
  test/fixtures/   фікстури для тестів грейдера
prisma/            схема й міграції
stand/
  poshtar/         заглушка «Поштаря»: перевіряє ключ акаунта, приймає листи, рахує їх
  platform/        імітація вивантаження зі staging
scripts/           guard-check.sh
docker-compose.yml, Dockerfile, .env.example, CLAUDE.md,
.claude/settings.json, .claude/hooks/, .github/workflows/ci.yml
```

Після `npm run staging:export` з'являються теки поза git:

```
dumps/staging_students.json   1 200 студентів: імена, адреси, оцінки
submissions/4417/solution.js  посилки із заголовком експорту
submissions/4502/solution.js
```

## Запуск

Потрібні Node 22, Docker і `jq`.

```bash
cp .env.example .env
npm install
npm run staging:export
docker compose up -d --build
docker compose exec -T web npx prisma migrate deploy
docker compose exec -T web npm run db:restore
```

API працює на `localhost:3000`, заглушка «Поштаря» — на `localhost:4010`. Контейнери `web` і `worker` виконують код із робочої теки. Після зміни залежностей перезбирай їх командою `docker compose up -d --build -V` і повтори `prisma migrate deploy` та `db:restore`: прапорець `-V` скидає й базу.

## Перевірки

```bash
npx tsc --noEmit
npx eslint .
npm test
docker compose exec -T web npm test
```

## Сценарії на стенді

**A1 і таймаут посилки.** Посилка 4417 падає в грейдері:

```bash
npm run grade -- 4417
curl -s -X POST localhost:3000/submissions/4417/grade
curl -s localhost:3000/submissions/4417
```

**A2. Перевірка шаблону.** Команда з README модуля `notifications` і лічильник заглушки:

```bash
curl -s -X DELETE localhost:4010/v1/sent
docker compose exec -T web npm run send-deadline-reminders -- --course js-basics --dry-run
curl -s localhost:4010/v1/sent | jq .count
```

**A3. Гард.** Чотири виклики, на яких команда перевіряє `no-real-students.sh`, лежать у `.claude/hooks/inputs/`. Скрипт показує, що гард робить із кожним:

```bash
npm run guard:check
```

## Версії

Node 22, TypeScript 5.6.3, Fastify 5.12.7, Prisma 7.10.1, BullMQ 6.5.3, ioredis 5.11.1, Postgres 16, Redis 7, Vitest 5.0.5, ESLint 10.13.0.
