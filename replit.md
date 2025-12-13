# MP.WebStudio - Сайт веб-студии

## Концепция
Веб-студия Михаила Пимашина, где разработку ведёт **ИИ (Claude)**, а владелец студии — посредник между ИИ и клиентами. Подробнее: `Концепт.md`

## Обзор
Современный портфолио-сайт для веб-студии с кинетическими анимациями, матричным дизайном и неоновыми акцентами. Весь контент на русском языке.

## Документация проекта
- `Концепт.md` — концепция студии и распределение ролей
- `WORKFLOW_GUIDE.md` — регламент работы с клиентами
- `DEPLOY.md` — инструкции по деплою
- `design_guidelines.md` — дизайн-гайдлайны

## Технологии
- **Frontend:** React, TypeScript, Tailwind CSS, Framer Motion, Shadcn UI
- **Backend:** Express.js, TypeScript
- **Сборка:** Vite

## Структура проекта
```
client/
├── src/
│   ├── components/     # UI компоненты
│   │   ├── HeroSection.tsx
│   │   ├── AboutSection.tsx
│   │   ├── PortfolioSection.tsx
│   │   ├── ServicesSection.tsx
│   │   ├── TechnologiesSection.tsx
│   │   ├── ProcessSection.tsx
│   │   ├── ContactSection.tsx
│   │   ├── Footer.tsx
│   │   ├── Navigation.tsx
│   │   └── ParticleBackground.tsx
│   ├── pages/
│   │   ├── Home.tsx           # Главная страница
│   │   └── demo/              # Демо-концепты для портфолио
│   │       ├── FoodDelivery.tsx   # Лендинг доставки еды
│   │       ├── FitnessStudio.tsx  # Сайт фитнес-студии
│   │       └── CosmeticsShop.tsx  # Интернет-магазин косметики
│   └── lib/            # Утилиты
server/
├── routes.ts           # API эндпоинты
├── storage.ts          # In-memory хранилище
shared/
└── schema.ts           # Типы данных
```

## Дизайн
- Тёмная тема (#0a0a0a - #0f172a)
- Акценты: cyan (#38bdf8) и purple (#a855f7)
- Градиентный текст для заголовков
- Частицы на canvas с оптимизацией производительности

## API
- `POST /api/contact` - Отправка заявки с формы

## Деплой — Яндекс Cloud (АКТУАЛЬНО)

### Текущая конфигурация (декабрь 2024):
- **Домен:** `mp-webstudio.ru` (куплен на **Reg.ru**)
- **DNS-серверы:** `ns1.reg.ru`, `ns2.reg.ru`
- **Хостинг:** Яндекс Object Storage (статический сайт)
- **Бакет:** `mp-webstudio.ru`
- **Прямая ссылка:** http://mp-webstudio.ru.website.yandexcloud.net
- **SSL-сертификат:** Let's Encrypt через Yandex Certificate Manager (`mp-webstudio-cert`)
- **Cloud Function:** для обработки форм (API)

### DNS-записи в Reg.ru:
| Тип | Имя | Значение |
|-----|-----|----------|
| CNAME | `_acme-challenge` | `fpqqm86h9bt1ts8clt4e.cm.yandexcloud.net` |
| CNAME | `_acme-challenge.www` | `fpqqm86h9bt1ts8clt4e.cm.yandexcloud.net` |
| CNAME | `www` | `mp-webstudio.ru.website.yandexcloud.net` |

### Как обновлять сайт:
1. Скачай проект из Replit (Download as zip)
2. На ПК: `npm install && npm run build`
3. Загрузи файлы из `dist/public` в бакет (index.html + папка assets)
4. **Важно:** При каждой сборке имена файлов в assets меняются — нужно загружать всё заново

### Подробные инструкции:
- `DEPLOY.md` — полные инструкции по деплою
- `DEPLOY_SIMPLE.md` — упрощённая версия для Object Storage

### Для будущих проектов клиентов:
- Простые лендинги → Object Storage (статика)
- Сайты с формами → Cloud Functions
- Магазины → Cloud Run + Managed PostgreSQL

## Команды
```bash
npm run dev      # Запуск в режиме разработки
npm run build    # Сборка для продакшена
```
