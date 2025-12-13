/**
 * Yandex Cloud Function для обработки форм WebStudio
 * 
 * Обрабатывает:
 * - POST /contact - заявки с формы контактов
 * - POST /order - создание заказов
 * 
 * Для работы нужны переменные окружения:
 * - TELEGRAM_BOT_TOKEN - токен бота Telegram (опционально)
 * - TELEGRAM_CHAT_ID - ID чата для уведомлений (опционально)
 */

module.exports.handler = async function (event, context) {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Обработка preflight запросов (CORS)
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: '',
        };
    }

    // Определяем путь
    const path = event.path || event.url || '';
    
    try {
        // Парсим тело запроса
        let body = {};
        if (event.body) {
            try {
                body = JSON.parse(event.isBase64Encoded 
                    ? Buffer.from(event.body, 'base64').toString('utf-8')
                    : event.body
                );
            } catch (e) {
                body = {};
            }
        }

        // Маршрутизация
        if (path.includes('/contact') && event.httpMethod === 'POST') {
            return await handleContact(body, headers);
        }
        
        if (path.includes('/order') && event.httpMethod === 'POST') {
            return await handleOrder(body, headers);
        }

        // Тестовый эндпоинт
        if (path.includes('/health') || event.httpMethod === 'GET') {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }),
            };
        }

        return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ success: false, message: 'Endpoint not found' }),
        };

    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ success: false, message: 'Internal server error' }),
        };
    }
};

async function handleContact(data, headers) {
    // Валидация
    const errors = [];
    
    if (!data.name || data.name.length < 2) {
        errors.push('Имя должно содержать минимум 2 символа');
    }
    if (!data.email || !isValidEmail(data.email)) {
        errors.push('Введите корректный email');
    }
    if (!data.message || data.message.length < 10) {
        errors.push('Сообщение должно содержать минимум 10 символов');
    }

    if (errors.length > 0) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ success: false, message: 'Ошибка валидации', errors }),
        };
    }

    // Логируем заявку
    console.log('New contact request:', {
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        projectType: data.projectType || '',
        budget: data.budget || '',
        message: data.message.substring(0, 100),
        timestamp: new Date().toISOString(),
    });

    // Отправляем в Telegram (если настроено)
    await sendTelegramNotification(formatContactMessage(data));

    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
            success: true,
            message: 'Заявка успешно отправлена',
            id: generateId(),
        }),
    };
}

async function handleOrder(data, headers) {
    // Валидация
    const errors = [];
    
    if (!data.clientName || data.clientName.length < 2) {
        errors.push('Имя должно содержать минимум 2 символа');
    }
    if (!data.clientEmail || !isValidEmail(data.clientEmail)) {
        errors.push('Введите корректный email');
    }
    if (!data.clientPhone || data.clientPhone.length < 10) {
        errors.push('Введите корректный телефон');
    }
    if (!data.projectType) {
        errors.push('Выберите тип проекта');
    }

    if (errors.length > 0) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ success: false, message: 'Ошибка валидации', errors }),
        };
    }

    const orderId = generateId();

    // Логируем заказ
    console.log('New order:', {
        id: orderId,
        clientName: data.clientName,
        projectType: data.projectType,
        amount: data.amount,
        timestamp: new Date().toISOString(),
    });

    // Отправляем в Telegram
    await sendTelegramNotification(formatOrderMessage(data, orderId));

    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
            success: true,
            message: 'Заказ создан',
            orderId,
        }),
    };
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function generateId() {
    return 'ws_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

function formatContactMessage(data) {
    return `🔔 *Новая заявка с сайта*

👤 *Имя:* ${escapeMarkdown(data.name)}
📧 *Email:* ${escapeMarkdown(data.email)}
📱 *Телефон:* ${escapeMarkdown(data.phone || 'не указан')}
📋 *Тип проекта:* ${escapeMarkdown(data.projectType || 'не указан')}
💰 *Бюджет:* ${escapeMarkdown(data.budget || 'не указан')}

📝 *Сообщение:*
${escapeMarkdown(data.message)}

🕐 ${new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })}`;
}

function formatOrderMessage(data, orderId) {
    return `💳 *Новый заказ*

🆔 *ID:* \`${orderId}\`
👤 *Клиент:* ${escapeMarkdown(data.clientName)}
📧 *Email:* ${escapeMarkdown(data.clientEmail)}
📱 *Телефон:* ${escapeMarkdown(data.clientPhone)}
📋 *Тип проекта:* ${escapeMarkdown(data.projectType)}
💰 *Сумма:* ${escapeMarkdown(data.amount)} ₽

📝 *Описание:*
${escapeMarkdown(data.projectDescription || '')}

🕐 ${new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })}`;
}

function escapeMarkdown(text) {
    if (!text) return '';
    return String(text).replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
}

async function sendTelegramNotification(message) {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
        console.log('Telegram not configured, skipping notification');
        return;
    }

    try {
        const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'MarkdownV2',
            }),
        });

        if (!response.ok) {
            console.error('Telegram error:', await response.text());
        }
    } catch (error) {
        console.error('Failed to send Telegram notification:', error);
    }
}
