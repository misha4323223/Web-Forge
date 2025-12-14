# Настройка YDB Serverless (Бесплатно!)

## Бесплатные лимиты

| Ресурс | Лимит в месяц |
|--------|---------------|
| Операции | **1 000 000** |
| Хранение | **1 ГБ** |

Для WebStudio этого более чем достаточно!

---

## Шаг 1. Создание YDB базы данных

1. Откройте [console.cloud.yandex.ru](https://console.cloud.yandex.ru)
2. В левом меню найдите **"Managed Service for YDB"**
3. Нажмите **"Создать базу данных"**
4. Выберите:
   - **Тип**: `Serverless` (это бесплатный!)
   - **Имя**: `webstudio`
   - **Каталог**: ваш каталог
5. Нажмите **"Создать"**

Подождите 1-2 минуты, пока база создастся.

---

## Шаг 2. Получите параметры подключения

После создания базы откройте её и найдите:

1. **Эндпоинт**: `grpcs://ydb.serverless.yandexcloud.net:2135`
2. **Размещение базы данных**: `/ru-central1/b1gXXXXXXX/etnXXXXXXX`

Это нужно для переменных окружения.

---

## Шаг 3. Создайте таблицу orders

1. В консоли YDB откройте вашу базу
2. Перейдите на вкладку **"Навигация"**
3. Нажмите **"Новый SQL запрос"**
4. Выполните этот SQL:

```sql
CREATE TABLE orders (
    id Utf8 NOT NULL,
    client_name Utf8,
    client_email Utf8,
    client_phone Utf8,
    project_type Utf8,
    project_description Utf8,
    amount Utf8,
    status Utf8,
    paid_at Utf8,
    created_at Utf8,
    PRIMARY KEY (id)
);
```

5. Нажмите **"Выполнить"**

---

## Шаг 4. Создайте сервисный аккаунт

1. Перейдите в **IAM → Сервисные аккаунты**
2. Нажмите **"Создать сервисный аккаунт"**
3. Имя: `webstudio-function`
4. Добавьте роли:
   - `ydb.editor` — для работы с YDB
   - `serverless.functions.invoker` — для вызова функций
5. Создайте

---

## Шаг 5. Обновите Cloud Function

### 5.1. Подготовьте архив

Создайте папку с файлами:
```
function/
├── index.js          (скопируйте содержимое index-ydb.js)
├── package.json      (скопируйте содержимое package-ydb.json)
├── Roboto-Regular.ttf
└── Roboto-Bold.ttf
```

### 5.2. Установите зависимости локально

```bash
cd function
npm install
```

### 5.3. Создайте ZIP архив

```bash
zip -r function.zip .
```

### 5.4. Загрузите в Cloud Functions

1. Откройте вашу Cloud Function
2. Перейдите в **"Редактор"**
3. Загрузите `function.zip`
4. Укажите:
   - **Точка входа**: `index.handler`
   - **Сервисный аккаунт**: `webstudio-function`

---

## Шаг 6. Настройте переменные окружения

В настройках Cloud Function добавьте:

| Переменная | Значение |
|------------|----------|
| `YDB_ENDPOINT` | `grpcs://ydb.serverless.yandexcloud.net:2135` |
| `YDB_DATABASE` | `/ru-central1/b1gXXX/etnXXX` (ваш путь) |
| `ROBOKASSA_MERCHANT_LOGIN` | Логин магазина |
| `ROBOKASSA_PASSWORD1` | Пароль #1 |
| `ROBOKASSA_PASSWORD2` | Пароль #2 |
| `ROBOKASSA_TEST_MODE` | `true` или `false` |
| `TELEGRAM_BOT_TOKEN` | Токен бота |
| `TELEGRAM_CHAT_ID` | ID чата |
| `SITE_URL` | `https://www.mp-webstudio.ru` |
| `SMTP_EMAIL` | Ваш Яндекс email |
| `SMTP_PASSWORD` | Пароль приложения |

---

## Шаг 7. Проверьте работу

### Тест health-check:
```
GET https://ваша-функция.apigw.yandexcloud.net/?action=health
```

Должен вернуть:
```json
{
  "status": "ok",
  "database": "YDB Serverless"
}
```

### Тест создания заказа:
```bash
curl -X POST https://ваша-функция.apigw.yandexcloud.net/?action=orders \
  -H "Content-Type: application/json" \
  -d '{
    "clientName": "Тест",
    "clientEmail": "test@example.com",
    "clientPhone": "+79001234567",
    "projectType": "landing",
    "amount": "30000"
  }'
```

---

## Готово!

Теперь ваша функция:
- ✅ Хранит заказы в бесплатной YDB
- ✅ Генерирует PDF договор после оплаты
- ✅ Отправляет договор на email клиента
- ✅ Шлёт уведомления в Telegram

---

## Проверка заказов в YDB

Чтобы посмотреть все заказы:

1. Откройте YDB в консоли
2. Перейдите в **"Навигация"** → **"Новый SQL запрос"**
3. Выполните:

```sql
SELECT * FROM orders ORDER BY created_at DESC LIMIT 100;
```
