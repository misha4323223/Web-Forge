/**
 * Yandex Cloud Function для WebStudio
 * 
 * Обрабатывает:
 * - POST /contact - заявки с формы контактов
 * - POST /order - создание заказов с оплатой через Robokassa
 * - POST /robokassa/result - callback от Robokassa
 * - GET /robokassa/success - успешная оплата
 * - GET /robokassa/fail - неуспешная оплата
 * 
 * Переменные окружения:
 * - ROBOKASSA_MERCHANT_LOGIN - логин магазина в Robokassa
 * - ROBOKASSA_PASSWORD1 - пароль #1 для формирования подписи
 * - ROBOKASSA_PASSWORD2 - пароль #2 для проверки подписи
 * - ROBOKASSA_TEST_MODE - "true" для тестового режима
 * - TELEGRAM_BOT_TOKEN - токен бота Telegram (опционально)
 * - TELEGRAM_CHAT_ID - ID чата для уведомлений (опционально)
 * - SITE_URL - URL сайта для редиректов (например: https://www.mp-webstudio.ru)
 */

const crypto = require('crypto');

const orders = new Map();
let orderCounter = 1;

module.exports.handler = async function (event, context) {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    const path = event.path || event.url || '';
    const method = event.httpMethod;
    
    try {
        let body = {};
        if (event.body) {
            try {
                body = JSON.parse(event.isBase64Encoded 
                    ? Buffer.from(event.body, 'base64').toString('utf-8')
                    : event.body
                );
            } catch (e) {
                if (typeof event.body === 'string') {
                    const params = new URLSearchParams(event.body);
                    body = Object.fromEntries(params);
                }
            }
        }

        const query = event.queryStringParameters || {};

        if (path.includes('/contact') && method === 'POST') {
            return await handleContact(body, headers);
        }
        
        if (path.includes('/order') && method === 'POST') {
            return await handleOrder(body, headers);
        }

        if (path.includes('/robokassa/result') && method === 'POST') {
            return await handleRobokassaResult({ ...body, ...query }, headers);
        }

        if (path.includes('/robokassa/success')) {
            return handleRobokassaSuccess(query);
        }

        if (path.includes('/robokassa/fail')) {
            return handleRobokassaFail(query);
        }

        if (path.includes('/health') || method === 'GET') {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ 
                    status: 'ok', 
                    timestamp: new Date().toISOString(),
                    robokassa: process.env.ROBOKASSA_MERCHANT_LOGIN ? 'configured' : 'not configured'
                }),
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

    console.log('New contact request:', {
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        projectType: data.projectType || '',
        budget: data.budget || '',
        message: data.message.substring(0, 100),
        timestamp: new Date().toISOString(),
    });

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
    const invId = orderCounter++;
    
    const order = {
        id: orderId,
        invId,
        clientName: data.clientName,
        clientEmail: data.clientEmail,
        clientPhone: data.clientPhone,
        projectType: data.projectType,
        projectDescription: data.projectDescription || '',
        amount: data.amount || '60000',
        status: 'pending',
        createdAt: new Date().toISOString(),
    };

    orders.set(orderId, order);

    console.log('New order created:', order);

    await sendTelegramNotification(formatOrderMessage(order));

    const MERCHANT_LOGIN = process.env.ROBOKASSA_MERCHANT_LOGIN;
    const PASSWORD1 = process.env.ROBOKASSA_PASSWORD1;
    const IS_TEST = process.env.ROBOKASSA_TEST_MODE === 'true';

    if (!MERCHANT_LOGIN || !PASSWORD1) {
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                message: 'Заказ создан (оплата не настроена)',
                orderId,
            }),
        };
    }

    const sum = parseFloat(order.amount).toFixed(2);
    const description = encodeURIComponent(`Заказ сайта: ${getProjectTypeName(order.projectType)}`);
    
    const signatureString = `${MERCHANT_LOGIN}:${sum}:${invId}:${PASSWORD1}:shp_orderId=${orderId}`;
    const signature = crypto.createHash('md5').update(signatureString).digest('hex');

    const baseUrl = 'https://auth.robokassa.ru/Merchant/Index.aspx';
    const paymentUrl = `${baseUrl}?MerchantLogin=${MERCHANT_LOGIN}&OutSum=${sum}&InvId=${invId}&Description=${description}&SignatureValue=${signature}&IsTest=${IS_TEST ? 1 : 0}&shp_orderId=${orderId}`;

    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
            success: true,
            message: 'Заказ создан',
            orderId,
            paymentUrl,
        }),
    };
}

async function handleRobokassaResult(data, headers) {
    const OutSum = data.OutSum;
    const InvId = data.InvId;
    const SignatureValue = data.SignatureValue;
    const shp_orderId = data.shp_orderId;

    console.log('Robokassa result callback:', { OutSum, InvId, shp_orderId });

    const PASSWORD2 = process.env.ROBOKASSA_PASSWORD2;
    
    if (!PASSWORD2) {
        console.error('ROBOKASSA_PASSWORD2 not configured');
        return { statusCode: 500, headers, body: 'config error' };
    }

    const signatureString = `${OutSum}:${InvId}:${PASSWORD2}:shp_orderId=${shp_orderId}`;
    const calculatedSignature = crypto.createHash('md5').update(signatureString).digest('hex');

    if (calculatedSignature.toLowerCase() !== SignatureValue.toLowerCase()) {
        console.error('Invalid Robokassa signature');
        return { statusCode: 400, headers, body: 'bad sign' };
    }

    const order = orders.get(shp_orderId);
    if (order) {
        order.status = 'paid';
        order.paidAt = new Date().toISOString();
        orders.set(shp_orderId, order);
        
        await sendTelegramNotification(`
Оплата получена!

Заказ: ${shp_orderId}
Сумма: ${OutSum} руб.
Клиент: ${order.clientName}
Email: ${order.clientEmail}
        `);
    }

    console.log('Order paid successfully:', shp_orderId);

    return {
        statusCode: 200,
        headers: { 'Content-Type': 'text/plain' },
        body: `OK${InvId}`,
    };
}

function handleRobokassaSuccess(query) {
    const siteUrl = process.env.SITE_URL || 'https://www.mp-webstudio.ru';
    const orderId = query.shp_orderId || '';
    
    return {
        statusCode: 302,
        headers: {
            'Location': `${siteUrl}/payment-success?orderId=${orderId}`,
        },
        body: '',
    };
}

function handleRobokassaFail(query) {
    const siteUrl = process.env.SITE_URL || 'https://www.mp-webstudio.ru';
    const orderId = query.shp_orderId || '';
    
    return {
        statusCode: 302,
        headers: {
            'Location': `${siteUrl}/payment-fail?orderId=${orderId}`,
        },
        body: '',
    };
}

function getProjectTypeName(type) {
    const types = {
        landing: 'Лендинг',
        corporate: 'Корпоративный сайт',
        shop: 'Интернет-магазин',
    };
    return types[type] || type;
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function generateId() {
    return 'ws_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

function formatContactMessage(data) {
    return `Новая заявка с сайта

Имя: ${data.name}
Email: ${data.email}
Телефон: ${data.phone || 'не указан'}
Тип проекта: ${data.projectType || 'не указан'}
Бюджет: ${data.budget || 'не указан'}

Сообщение:
${data.message}

${new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })}`;
}

function formatOrderMessage(order) {
    return `Новый заказ!

ID: ${order.id}
Клиент: ${order.clientName}
Email: ${order.clientEmail}
Телефон: ${order.clientPhone}
Тип: ${getProjectTypeName(order.projectType)}
Сумма: ${order.amount} руб.

Описание:
${order.projectDescription || 'не указано'}

${new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })}`;
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
            }),
        });

        if (!response.ok) {
            console.error('Telegram error:', await response.text());
        }
    } catch (error) {
        console.error('Failed to send Telegram notification:', error);
    }
}
