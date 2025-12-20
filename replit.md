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

### Email-уведомления (Yandex Cloud Postbox):
- **Сервис:** Yandex Cloud Postbox (совместим с AWS SES API)
- **Домен:** mp-webstudio.ru (DKIM настроен)
- **Email отправителя:** info@mp-webstudio.ru
- **SDK:** @aws-sdk/client-sesv2
- **Функция:** sendContractEmail в index-ydb.js

**DNS записи для доставляемости (добавить в Reg.ru):**
| Тип | Имя | Значение |
|-----|-----|----------|
| TXT | `@` | `v=spf1 include:_spf.yandex.net ~all` |
| TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:info@mp-webstudio.ru` |
| TXT | `mail._domainkey` | (DKIM - уже добавлен) |

### Для будущих проектов клиентов:
- Простые лендинги → Object Storage (статика)
- Сайты с формами → Cloud Functions
- Магазины → Cloud Run + Managed PostgreSQL

## SEO-оптимизация (декабрь 2024)

### Реализовано:
1. **Meta-теги:** title, description, keywords, author, robots
2. **Open Graph:** полная поддержка VK, Telegram, Facebook
3. **Twitter Cards:** summary_large_image
4. **JSON-LD структурированные данные:**
   - WebSite (с SearchAction)
   - Organization
   - LocalBusiness
   - Service (каталог услуг)
5. **sitemap.xml:** все страницы и демо-сайты
6. **robots.txt:** правила для Yandex и Google
7. **Canonical URL:** https://mp-webstudio.ru/

### Нужно сделать вручную:
1. **Создать og-image.png** (1200x630 px) — изображение для соцсетей
2. **Зарегистрировать в Яндекс.Вебмастер:**
   - https://webmaster.yandex.ru/
   - Добавить сайт, получить код верификации
   - Раскомментировать `<meta name="yandex-verification">` в index.html
3. **Зарегистрировать в Google Search Console:**
   - https://search.google.com/search-console/
   - Добавить сайт, получить код верификации
   - Раскомментировать `<meta name="google-site-verification">` в index.html
4. **Отправить sitemap:** в обоих сервисах указать https://mp-webstudio.ru/sitemap.xml

## Безопасность админки (декабрь 2024)

### Авторизация администратора:
Админ-панель `/admin` защищена авторизацией с JWT-подобными токенами.

**Переменные окружения (обязательно для Replit И Yandex Cloud Function):**
| Переменная | Описание |
|------------|----------|
| `ADMIN_EMAIL` | Email администратора |
| `ADMIN_PASSWORD` | Пароль администратора |
| `ADMIN_TOKEN_SECRET` | (опционально) Секретный ключ для подписи токенов |

**Как работает:**
1. Пользователь вводит email и пароль на странице `/admin`
2. Сервер проверяет credentials и выдаёт подписанный токен (24 часа)
3. Токен хранится в sessionStorage и проверяется при каждом входе
4. HMAC-SHA256 подпись защищает токен от подделки

**API endpoints:**
- `POST /api/admin-login` — авторизация (возвращает token)
- `POST /api/verify-admin` — проверка токена

**Для Yandex Cloud:** Добавить переменные ADMIN_EMAIL и ADMIN_PASSWORD в настройках Cloud Function.

## Последние изменения (декабрь 2024)

### Защита админки (20 декабря) - ОБНОВЛЕНО для продакшена:
- ✅ Форма входа в `/admin` с email/password
- ✅ JWT-подобные токены с HMAC-SHA256 подписью
- ✅ Constant-time сравнение (защита от timing attacks)
- ✅ Токены действительны 24 часа (автоматически истекают)
- ✅ Кнопка "Выйти" в панели управления
- ✅ **Новое:** Эндпоинты авторизации в Cloud Function (продакшен)
  - `POST /api/admin-login` → возвращает token
  - `POST /api/verify-admin` → проверяет token
  - Работает как на Replit, так и на Yandex Cloud
- ✅ **Инструкция развёртывания:** см. `DEPLOYMENT_ADMIN_AUTH.md`

### Улучшение процесса сборки для Yandex Cloud (19 декабря):
1. **Проблема:** Ошибка `EBUSY: resource busy or locked` при `npm run build` на Windows (особенно в OneDrive)
2. **Решение:** Обновлен скрипт сборки (`script/build.ts`):
   - Добавлена функция `waitForFilesUnlocked()` для ожидания освобождения файловых блокировок
   - Добавлены задержки между операциями удаления и сборки
   - Улучшена обработка асинхронных операций
   - Правильно устанавливаются переменные окружения для продакшена
3. **Результат:** Сборка теперь работает надёжнее на всех платформах

### Дополнительные счета для клиентов (Additional Invoices):
1. **Назначение:** Система для выставления дополнительных счётов за доп. работы/функции к уже выполненным проектам
2. **Где находится:** Админ-панель `/admin` (страница `client/src/pages/Admin.tsx`)
3. **API endpoints:**
   - `POST /api/additional-invoices` — создание доп счета
   - `GET /api/additional-invoices/order/:orderId` — получить все доп счета по заказу
   - `POST /api/robokassa/additional-invoice` — callback оплаты доп счета
4. **Как работает:**
   - Выбор заказа клиента по ID или ввод вручную
   - Описание дополнительной услуги/функции
   - Указание стоимости в рублях
   - Генерирование платёжной ссылки через Robokassa
   - Ссылка копируется в буфер обмена для отправки клиенту
5. **Процесс оплаты:**
   - При оплате доп счета → отправляется email "Платеж принят за [название функции]"
   - При финальной оплате основного заказа → генерируется Акт со ВСЕМИ работами (включая оплаченные доп функции)
6. **Типы данных:** `insertAdditionalInvoiceSchema`, `AdditionalInvoice` в `shared/schema.ts`

### Email с договором после оплаты:
1. Настроен Yandex Cloud Postbox для отправки email
2. Добавлена функция `sendContractEmail` в `yandex-cloud-function/index-ydb.js`
3. Исправлены ошибки:
   - "SESClient is not defined" → используется SESv2Client из @aws-sdk/client-sesv2
   - "message contains too long lines" → добавлена функция wrapBase64
4. DKIM подпись настроена (запись mail._domainkey.mp-webstudio.ru)
5. Email успешно отправляется после оплаты Robokassa

### Зависимости для Cloud Function (package.json):
```json
{
  "dependencies": {
    "@aws-sdk/client-sesv2": "^3.700.0",
    "@yandex-cloud/nodejs-sdk": "^2.7.0",
    "nodemailer": "^6.9.0",
    "pdfkit": "^0.15.0",
    "ydb-sdk": "^5.0.0"
  }
}
```

## Команды
```bash
npm run dev      # Запуск в режиме разработки
npm run build    # Сборка для продакшена
```
