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
│   │   ├── TechSection.tsx
│   │   ├── ProcessSection.tsx
│   │   ├── ContactSection.tsx
│   │   ├── FooterSection.tsx
│   │   ├── Navigation.tsx
│   │   └── ParticleBackground.tsx
│   ├── pages/          # Страницы
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

## Деплой
Смотри файл `DEPLOY.md` для инструкций по Яндекс.Облаку.

## Команды
```bash
npm run dev      # Запуск в режиме разработки
npm run build    # Сборка для продакшена
```
