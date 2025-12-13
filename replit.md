# WebStudio - Сайт веб-студии

## Обзор
Современный портфолио-сайт для веб-студии с кинетическими анимациями, матричным дизайном и неоновыми акцентами. Весь контент на русском языке.

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

## Деплой — Яндекс Cloud
**Целевая платформа:** Яндекс Cloud Run (Serverless Containers)

Подробные инструкции: `DEPLOY.md`

**Архитектура на проде:**
- Контейнер с приложением → Cloud Run
- Статика раздаётся из контейнера (или можно вынести в Object Storage + CDN)
- Домен + SSL через Яндекс Cloud

**Для будущих проектов клиентов:**
- Простые лендинги → Object Storage (статика)
- Сайты с формами → Cloud Functions
- Магазины → Cloud Run + Managed PostgreSQL

## Команды
```bash
npm run dev      # Запуск в режиме разработки
npm run build    # Сборка для продакшена
```
