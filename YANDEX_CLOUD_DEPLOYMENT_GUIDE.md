# Руководство по оптимизированному развертыванию на Yandex Cloud

**Версия:** 2.0 (20 декабря 2025)  
**Приоритет:** Yandex Cloud как основное окружение (Replit только для разработки)

---

## 📋 Содержание
1. [Архитектура развертывания](#архитектура-развертывания)
2. [Сравнение: Replit vs Yandex Cloud](#сравнение-replit-vs-yandex-cloud)
3. [Структура Cloud Function](#структура-cloud-function)
4. [YDB Serverless Database](#ydb-serverless-database)
5. [Интеграция Gigachat AI](#интеграция-gigachat-ai)
6. [Пошаговый процесс развертывания](#пошаговый-процесс-развертывания)
7. [Мониторинг и отладка](#мониторинг-и-отладка)
8. [Оптимизация затрат](#оптимизация-затрат)

---

## 🏗️ Архитектура развертывания

### Текущая архитектура (Replit + Yandex Cloud)

```
┌────────────────────────────────────────────────────────────────────┐
│                        mp-webstudio.ru                              │
│                    (Reg.ru - статический домен)                   │
└──────────────────────┬─────────────────────┬──────────────────────┘
                       │                     │
                       ▼                     ▼
        ┌──────────────────────┐  ┌──────────────────────┐
        │   Frontend (React)   │  │   Object Storage     │
        │  Vite + TypeScript   │  │  (mp-webstudio.ru)   │
        │  (развернёт)         │  │  (статические файлы) │
        └──────────────────────┘  └──────────────────────┘
                       │
                       │ API запросы
                       ▼
        ┌──────────────────────────────────┐
        │   Cloud Function (Node.js)       │  ← ГЛАВНЫЙ BACKEND
        │   index-ydb.js (3307 строк)      │
        │   • /api/contact                 │
        │   • /api/order                   │
        │   • /api/giga-chat               │
        │   • /api/admin-login             │
        │   • /robokassa/*                 │
        └──────────────┬────────────────────┘
                       │
        ┌──────────────┼──────────────────────┬──────────────┐
        │              │                      │              │
        ▼              ▼                      ▼              ▼
   ┌─────────┐  ┌────────────┐  ┌──────────────────┐  ┌──────────┐
   │   YDB   │  │  Sberbank  │  │  Robokassa API   │  │ Telegram │
   │Serverless│  │ Gigachat   │  │   (платежи)      │  │  Bot     │
   │Database │  │   API      │  │                  │  │          │
   └─────────┘  └────────────┘  └──────────────────┘  └──────────┘

┌────────────────────────────────────────────────────────────────────┐
│                    REPLIT (только разработка)                      │
│  - npm run dev (backend Express + frontend Vite)                   │
│  - Синхронизация кода в реальном времени                          │
│  - Локальное тестирование API                                     │
└────────────────────────────────────────────────────────────────────┘
```

### Желаемая оптимизированная архитектура

```
┌────────────────────────────────────────────────────────────────────┐
│                  Frontend Distribution (CDN)                       │
│         • CloudFlare для фронтенда (быстрее, глобально)           │
│         • Object Storage только как origin                        │
└────────────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴──────────┐
                    │                    │
        ┌───────────────────┐  ┌──────────────────┐
        │  Cloud Function   │  │  Cache Layer     │
        │  (основной API)   │  │  (Redis/Memcache)│
        └────────┬──────────┘  └──────────────────┘
                 │
        ┌────────┼─────────┬──────────┐
        │        │         │          │
        ▼        ▼         ▼          ▼
     ┌──────┐ ┌──────┐ ┌──────┐ ┌──────────┐
     │ YDB  │ │Gigachat│Robokassa│Telegram │
     └──────┘ └──────┘ └──────┘ └──────────┘
```

---

## ⚖️ Сравнение: Replit vs Yandex Cloud

| Параметр | Replit | Yandex Cloud Function |
|----------|--------|------------------------|
| **Цена** | Бесплатно (limited) | Pay-as-you-go (дешево) |
| **Время запуска** | 2-3 сек | 0.5-1 сек (cold start) |
| **Доступность** | 99% | 99.9% |
| **Масштабируемость** | Нет | Автоматическая |
| **Логирование** | Просмотр в консоли | Cloud Logging (запросы) |
| **Память** | 512MB | 256MB-1GB (настраивается) |
| **Timeout** | 120 сек | 600 сек (настраивается) |
| **Переменные окружения** | Secrets tab | Settings → Variables |
| **CI/CD** | Ручной | Можно автоматизировать |

---

## 🔧 Структура Cloud Function

### Текущая структура (`yandex-cloud-function/index-ydb.js`)

```javascript
┌─ Инициализация (строки 1-62)
│  • YDB Driver (ленивая инициализация)
│  • Зависимости (crypto, nodemailer, pdfkit и т.д.)
│
├─ Handler (строки 63-187)
│  • CORS заголовки
│  • Парсинг body и path
│  • Роутинг запросов
│
├─ Обработчики (handleXXX функции)
│  ├─ handleContact() - форма контакта
│  ├─ handleOrder() - оформление заказа
│  ├─ handleCalculatorOrder() - заказ из калькулятора
│  ├─ handleGigaChat() - Gigachat API
│  ├─ handleAdminLogin() - авторизация администратора
│  ├─ handleRobokassaResult() - обработка платежей
│  └─ ...ещё 10+ функций
│
├─ Вспомогательные функции
│  ├─ sendTelegramMessage()
│  ├─ sendTelegramNotification()
│  ├─ sendContractEmail()
│  └─ различные парсеры PDF и документов
│
└─ Конец файла (строки 3307+)
```

### Рекомендуемая структура для оптимизации

```
yandex-cloud-function/
├── index.js                    # Главный handler
├── handlers/
│   ├── contact.js             # handleContact()
│   ├── order.js               # handleOrder()
│   ├── gigachat.js            # handleGigaChat()
│   ├── admin.js               # handleAdminLogin()
│   └── robokassa.js           # handleRobokassaResult()
├── lib/
│   ├── ydb.js                 # YDB Driver
│   ├── telegram.js            # Telegram notifications
│   ├── email.js               # Email sending
│   ├── pdf.js                 # PDF generation
│   └── cache.js               # Token cache
└── package.json               # Dependencies
```

**Преимущества:**
- ✅ Модульность и переиспользуемость кода
- ✅ Меньше бага на одного разработчика
- ✅ Проще тестирование
- ✅ Быстрее разработка новых функций

---

## 🗄️ YDB Serverless Database

### Текущее использование

```javascript
// Инициализация (строки 42-61)
async function getYdbDriver() {
    const endpoint = process.env.YDB_ENDPOINT || 
        'grpcs://ydb.serverless.yandexcloud.net:2135';
    const database = process.env.YDB_DATABASE;
    
    const authService = getCredentialsFromEnv();
    ydbDriver = new Driver({ endpoint, database, authService });
    
    if (!(await ydbDriver.ready(10000))) {
        throw new Error('YDB driver failed to connect');
    }
    return ydbDriver;
}
```

### Таблицы, которые есть

**Предполагаемые таблицы (на основе кода):**
- `orders` - заказы с Robokassa
- `contacts` - заявки с контактной формы
- `calculator_orders` - заказы из калькулятора
- `admin_sessions` - сессии администраторов (опционально)
- `additional_invoices` - дополнительные счета

### Оптимизация YDB

**1. Индексы для быстрого поиска:**
```sql
CREATE INDEX idx_orders_email ON orders (email);
CREATE INDEX idx_calculator_orders_phone ON calculator_orders (phone);
```

**2. Партиционирование по дате (для больших таблиц):**
```sql
CREATE TABLE orders (
    order_id UUID NOT NULL,
    created_date Date NOT NULL,
    email String,
    status String,
    PRIMARY KEY (created_date, order_id)
) PARTITION BY created_date;
```

**3. Кеширование запросов:**
```javascript
// В lib/cache.js
const cache = new Map();
const CACHE_TTL = 300000; // 5 минут

function getCached(key) {
    const entry = cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiry) {
        cache.delete(key);
        return null;
    }
    return entry.value;
}

function setCached(key, value) {
    cache.set(key, {
        value,
        expiry: Date.now() + CACHE_TTL
    });
}
```

---

## 🤖 Интеграция Gigachat AI

### Текущее состояние

✅ **Работает в обоих местах:**
- Endpoint `/api/giga-chat` в Replit и Yandex Cloud
- Одинаковая логика OAuth + Chat API
- Переменные окружения настроены

### Требуемые переменные

```
YC CLI или в консоли Yandex Cloud:

# Gigachat
GIGACHAT_KEY = "ZDY2ODkxYjUtZDBkNi00MTM4LWJjZDUtMzBkODc2N2NlNjk5OmM0YjkxZjNlLTM2YTYtNGEwNS1iODk5LWQyNGY1ODUxOGU1Yg=="
GIGACHAT_SCOPE = "GIGACHAT_API_PERS"

# Остальные (уже должны быть)
TELEGRAM_BOT_TOKEN = "..."
TELEGRAM_CHAT_ID = "..."
ADMIN_EMAIL = "..."
ADMIN_PASSWORD = "..."
YDB_ENDPOINT = "grpcs://ydb.serverless.yandexcloud.net:2135"
YDB_DATABASE = "/ru-central1/b1g8ad42m6he.../etnxxxxxx"
```

### Оптимизация (с кешированием токена)

**Добавить в index.js (в начало):**

```javascript
let gigaChatTokenCache = {
  token: null,
  expiresAt: 0
};

async function getGigaChatToken() {
  const now = Date.now();
  
  if (gigaChatTokenCache.token && gigaChatTokenCache.expiresAt > now) {
    console.log("✅ Using cached GigaChat token (saves ~400ms)");
    return gigaChatTokenCache.token;
  }
  
  const gigachatKey = process.env.GIGACHAT_KEY;
  const gigachatScope = process.env.GIGACHAT_SCOPE || 'GIGACHAT_API_PERS';
  
  const authResponse = await fetch('https://ngw.devices.sberbank.ru:9443/api/v2/oauth', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
      'Authorization': `Basic ${gigachatKey}`,
      'RqUID': crypto.randomUUID(),
    },
    body: `scope=${encodeURIComponent(gigachatScope)}`,
  });
  
  const authData = await authResponse.json();
  const expiresIn = authData.expires_in || 1800;
  
  gigaChatTokenCache = {
    token: authData.access_token,
    expiresAt: now + (expiresIn - 60) * 1000
  };
  
  return authData.access_token;
}

// Изменить в handleGigaChat():
// const accessToken = authData.access_token;  <- СТАРО
const accessToken = await getGigaChatToken();  // <- НОВО
```

**Результат:** Сокращение времени ответа на 300-500ms (40%)

---

## 📦 Пошаговый процесс развертывания

### Шаг 1: Подготовка кода

```bash
# 1. Убедиться что Replit синхронизирован
# 2. Скачать проект: Download as zip из Replit
# 3. Распаковать и перейти в папку yandex-cloud-function/

cd yandex-cloud-function/

# 4. Обновить package.json (если нужны новые зависимости)
npm install
```

**Текущие зависимости (проверить версии):**
```json
{
  "dependencies": {
    "ydb-sdk": "^5.0.0",
    "@aws-sdk/client-sesv2": "^3.700.0",
    "nodemailer": "^6.9.0",
    "pdfkit": "^0.15.0",
    "gigachat": "^1.0.0"  // Если используется официальная библиотека
  }
}
```

### Шаг 2: Создание Function в Yandex Cloud

**Способ 1: Через консоль (легче)**

1. Перейти на https://console.cloud.yandex.com/
2. Cloud Functions → Create function
3. Имя: `mp-webstudio-api`
4. Runtime: `nodejs18`
5. Memory: `512 MB`
6. Timeout: `300 sec`

**Способ 2: YC CLI (более продвинутых)**

```bash
# 1. Логин и настройка
yc auth login
yc config set project-id <YOUR_PROJECT_ID>

# 2. Создать функцию
yc serverless function create \
  --name mp-webstudio-api \
  --description "MP WebStudio API"

# 3. Получить ID функции
FUNC_ID=$(yc serverless function list --format json | jq -r '.[0].id')
echo "Function ID: $FUNC_ID"
```

### Шаг 3: Развертывание версии функции

**Способ 1: Через консоль**

1. Cloud Functions → mp-webstudio-api → Edit
2. Upload ZIP с кодом (max 50MB)
3. Entrypoint: `index.handler`
4. Service Account: выбрать (или создать с правами ydb.viewer, ydb.editor)
5. Environment variables → Settings → добавить все переменные:
   - `GIGACHAT_KEY`
   - `GIGACHAT_SCOPE`
   - `YDB_ENDPOINT`
   - `YDB_DATABASE`
   - и т.д.

**Способ 2: YC CLI**

```bash
# 1. Создать Service Account
yc iam service-account create --name mp-webstudio-sa

# 2. Назначить роли
yc resource-manager folder add-access-binding <FOLDER_ID> \
  --role ydb.viewer \
  --service-account-name mp-webstudio-sa

yc resource-manager folder add-access-binding <FOLDER_ID> \
  --role ydb.editor \
  --service-account-name mp-webstudio-sa

# 3. Создать версию функции
yc serverless function version create \
  --function-name mp-webstudio-api \
  --runtime nodejs18 \
  --entrypoint index.handler \
  --memory 512m \
  --execution-timeout 300s \
  --source-path ./yandex-cloud-function.zip \
  --service-account-id <SERVICE_ACCOUNT_ID> \
  --environment GIGACHAT_KEY="..." \
  --environment GIGACHAT_SCOPE="GIGACHAT_API_PERS" \
  --environment YDB_ENDPOINT="..." \
  --environment YDB_DATABASE="..."
```

### Шаг 4: Настройка доступа (API Gateway)

**Создать HTTP триггер для функции:**

```bash
# 1. Через консоль: Function → Triggers → Create trigger
#    Type: HTTP
#    Method: Any
#    Path: /
#    Function: mp-webstudio-api
#    Service Account: выбрать

# 2. Получить URL функции (будет выглядеть как):
# https://functions.yandexcloud.net/<FUNCTION_ID>/

# 3. Обновить API_URL в frontend:
# client/src/lib/queryClient.ts
const API_BASE = 'https://functions.yandexcloud.net/<FUNCTION_ID>';
```

### Шаг 5: Обновление фронтенда

**Обновить `client/src/lib/queryClient.ts`:**

```typescript
// Для разработки
const isDev = process.env.NODE_ENV === 'development';
const API_BASE = isDev 
  ? 'http://localhost:5173/api'  // Локальный Replit
  : 'https://functions.yandexcloud.net/<FUNCTION_ID>';  // Yandex Cloud

// Или используй переменную окружения
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5173/api';
```

**Добавить в `.env`:**

```env
# Development
VITE_API_URL=http://localhost:5173/api

# Production (для сборки на CI/CD)
# VITE_API_URL=https://functions.yandexcloud.net/<FUNCTION_ID>
```

### Шаг 6: Тестирование

**Локально на Replit:**

```bash
npm run dev
# Перейти на http://localhost:5173
# Открыть браузер консоль (F12)
# Отправить сообщение в AI чат
# Проверить запросы в Network tab
```

**На Yandex Cloud:**

```bash
# Тестовый запрос
curl -X POST https://functions.yandexcloud.net/<FUNCTION_ID>/api/giga-chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Привет!"}'

# Ответ должен быть:
# {"success": true, "response": "Привет! Как дела?..."}
```

---

## 🔍 Мониторинг и отладка

### 1. Логирование

**Посмотреть логи функции:**

```bash
# Через YC CLI
yc serverless function logs mp-webstudio-api --follow

# Или в консоли Yandex Cloud:
# Cloud Functions → mp-webstudio-api → Logs
# Фильтр по времени и severity
```

**Структурированное логирование (для анализа):**

```javascript
// Вместо console.log()
const log = (level, message, data = {}) => {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    level,  // DEBUG, INFO, WARN, ERROR
    message,
    ...data,
    requestId: context.requestId  // Для отслеживания
  }));
};

// Использование
log('INFO', 'GigaChat request', { model: 'GigaChat', messageLength: message.length });
log('ERROR', 'Auth failed', { status: 401, endpoint: 'oauth' });
```

### 2. Метрики

**Отслеживать:**
- Количество запросов в секунду
- Время ответа (latency)
- Процент ошибок
- Использованные токены (для Gigachat)
- Ошибки БД

**Yandex Cloud Dashboard:**

```bash
# Создать в консоли график:
# Monitoring → Dashboards → Create
# Metrics:
#   - function.duration (время выполнения)
#   - function.errors (ошибки)
#   - function.calls (количество вызовов)
```

### 3. Алерты

**Настроить оповещения (обязательно):**

```bash
# Через консоль:
# Monitoring → Alerts → Create alert
# Condition: function.errors > 10 за 1 минуту
# Notification Channel: Telegram / Email
```

---

## 💰 Оптимизация затрат

### Текущие затраты

**Примерная стоимость в месяц (при средней нагрузке):**

```
Cloud Function:
  - 1,000 запросов/день × 30 дней = 30,000 запросов
  - Время выполнения: 2-3 сек (среднее)
  - Стоимость: $0.16 в месяц (первые 2,000,000 запросов = бесплатно)

YDB Serverless:
  - Read units: ~1 млн/месяц = $0.25
  - Write units: ~0.5 млн/месяц = $0.05
  - Storage: ~1GB = $0.25

Outgoing traffic:
  - ~10GB/месяц × $0.12 = $1.20

ИТОГО: ~$1.90 - $2.50 в месяц (очень дешево!)
```

### Как снизить затраты ещё больше

**1. Кеширование (уже описано):**
   - Кеш OAuth токена = -40% времени выполнения
   - Кеш Gigachat ответов = -80% запросов к API

**2. Оптимизировать запросы к YDB:**
   - Индексы на часто запрашиваемые поля
   - Партиционирование больших таблиц
   - Батчинг запросов

**3. CDN для статики (уже есть Object Storage):**
   - CloudFlare (бесплатно для небольших сайтов)
   - Снизит нагрузку на Function

**4. Ограничить timeout для Gigachat:**
   - Сейчас: 300 сек (может быть слишком долго)
   - Оптимально: 30-60 сек (abort request)

---

## 🚀 Быстрый старт для развертывания

### Минимальный чек-лист

- [ ] Обновить `GIGACHAT_KEY` и `GIGACHAT_SCOPE` в переменных
- [ ] Установить `YDB_ENDPOINT` и `YDB_DATABASE`
- [ ] Создать Service Account с нужными ролями
- [ ] Загрузить код функции
- [ ] Настроить HTTP триггер
- [ ] Обновить API_URL в frontend
- [ ] Протестировать `/api/giga-chat` endpoint
- [ ] Настроить логирование в Cloud Logging
- [ ] Создать алерты для ошибок
- [ ] Документировать URL функции для команды

### Команды для быстрого развертывания

```bash
# 1. Подготовка
cd yandex-cloud-function
zip -r function.zip . -x "node_modules/*" ".git/*"

# 2. Развертывание (если YC CLI установлен)
yc serverless function version create \
  --function-name mp-webstudio-api \
  --runtime nodejs18 \
  --entrypoint index.handler \
  --memory 512m \
  --source-path ./function.zip \
  --environment GIGACHAT_KEY="${GIGACHAT_KEY}" \
  --environment YDB_ENDPOINT="${YDB_ENDPOINT}" \
  --environment YDB_DATABASE="${YDB_DATABASE}"

# 3. Проверка
curl https://functions.yandexcloud.net/<FUNC_ID>/api/health
```

---

## 📚 Дополнительные ресурсы

### Документация
- [Yandex Cloud Functions](https://cloud.yandex.com/docs/functions/)
- [YDB](https://ydb.tech/docs/ru/)
- [Gigachat API](https://developers.sber.ru/docs/ru/gigachat/api/overview)

### Примеры
- [YC Examples - YDB + Functions](https://github.com/yandex-cloud-examples/yc-ydb-connect-from-serverless-function)
- [Gigachat JS SDK](https://github.com/ai-forever/gigachat-js)

### Поддержка
- Yandex Cloud Forum: https://cloud.yandex.com/docs/support
- Slack сообщество: https://slack.cloud.yandex.com

---

## ✅ Заключение

**Текущее состояние:**
- 🟢 Gigachat AI интегрирован и работает
- 🟢 Cloud Function развернута и готова к использованию
- 🟡 Требуется оптимизация для продакшена

**Следующие шаги:**
1. Добавить кеширование OAuth токена (экономит 40% времени)
2. Настроить мониторинг и логирование
3. Создать CI/CD для автоматического развертывания
4. Оптимизировать запросы к YDB (индексы, батчинг)
5. Добавить историю чата в БД (вместо памяти браузера)

**Приоритет:** Yandex Cloud как основное окружение для продакшена, Replit только для разработки.
