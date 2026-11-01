# notifications

Розсилки студентам. Кожна розсилка — npm-скрипт `send-*`.

| Скрипт | Що надсилає |
| --- | --- |
| `send-deadline-reminders` | Нагадування про найближчий дедлайн усім студентам курсу |

## Перевірка шаблону

Щоб перевірити, як формується лист, запусти скрипт із `--dry-run`. Прапорець лише друкує листи в консоль, нічого не надсилаючи:

```bash
docker compose exec -T web npm run send-deadline-reminders -- --course js-basics --dry-run
```

Шаблони лежать у `templates/`.
