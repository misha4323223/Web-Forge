/**
 * Yandex Cloud Function для WebStudio
 * 
 * Версия с YDB Serverless (бесплатно!)
 * 
 * Переменные окружения:
 * - YDB_ENDPOINT - endpoint YDB (например: grpcs://ydb.serverless.yandexcloud.net:2135)
 * - YDB_DATABASE - путь к базе (например: /ru-central1/b1gxxxxxx/etnxxxxxx)
 * - ROBOKASSA_MERCHANT_LOGIN - логин магазина в Robokassa
 * - ROBOKASSA_PASSWORD1 - пароль #1 для формирования подписи
 * - ROBOKASSA_PASSWORD2 - пароль #2 для проверки подписи
 * - ROBOKASSA_TEST_MODE - "true" для тестового режима
 * - TELEGRAM_BOT_TOKEN - токен бота Telegram
 * - TELEGRAM_CHAT_ID - ID чата для уведомлений
 * - SITE_URL - URL сайта для редиректов
 * - SMTP_EMAIL - email для отправки писем (Яндекс)
 * - SMTP_PASSWORD - пароль приложения Яндекс
 */

const crypto = require('crypto');
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');
const { Driver, getCredentialsFromEnv, TypedValues, Types } = require('ydb-sdk');
const { SESv2Client, SendEmailCommand } = require('@aws-sdk/client-sesv2');

const SITE_URL = process.env.SITE_URL || 'https://www.mp-webstudio.ru';

// YDB Driver (инициализируется один раз)
let ydbDriver = null;

async function getYdbDriver() {
    if (!ydbDriver) {
        const endpoint = process.env.YDB_ENDPOINT || 'grpcs://ydb.serverless.yandexcloud.net:2135';
        const database = process.env.YDB_DATABASE;
        
        if (!database) {
            throw new Error('YDB_DATABASE not configured');
        }
        
        const authService = getCredentialsFromEnv();
        ydbDriver = new Driver({ endpoint, database, authService });
        
        const timeout = 10000;
        if (!(await ydbDriver.ready(timeout))) {
            throw new Error('YDB driver failed to connect');
        }
        console.log('YDB driver connected to:', database);
    }
    return ydbDriver;
}

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

    const query = event.queryStringParameters || {};
    const path = event.path || event.url || '';
    const action = query.action || '';
    const method = event.httpMethod;
    
    try {
        let body = {};
        if (event.body) {
            let rawBody = event.isBase64Encoded 
                ? Buffer.from(event.body, 'base64').toString('utf-8')
                : event.body;
            
            try {
                body = JSON.parse(rawBody);
            } catch (e) {
                if (typeof rawBody === 'string' && rawBody.length > 0) {
                    const params = new URLSearchParams(rawBody);
                    body = Object.fromEntries(params);
                }
            }
        }
        
        console.log('Incoming request:', { method, action, path });

        if ((action === 'contact' || path.includes('/contact')) && method === 'POST') {
            return await handleContact(body, headers);
        }
        
        if ((action === 'orders' || path.includes('/order')) && method === 'POST') {
            return await handleOrder(body, headers);
        }

        if ((action === 'robokassa/result' || path.includes('/robokassa/result')) && method === 'POST') {
            return await handleRobokassaResult({ ...body, ...query }, headers);
        }

        if (action === 'robokassa/success' || path.includes('/robokassa/success')) {
            return handleRobokassaSuccess(query);
        }

        if (action === 'robokassa/fail' || path.includes('/robokassa/fail')) {
            return handleRobokassaFail(query);
        }

        if ((action === 'pay-remaining' || path.includes('/pay-remaining')) && method === 'POST') {
            return await handlePayRemaining(body, headers);
        }

        if (action === 'health' || path.includes('/health') || method === 'GET') {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ 
                    status: 'ok', 
                    timestamp: new Date().toISOString(),
                    database: 'YDB Serverless',
                }),
            };
        }

        return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ success: false, message: 'Endpoint not found' }),
        };

    } catch (error) {
        console.error('Handler error:', error.message, error.stack);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ success: false, message: 'Internal server error', error: error.message }),
        };
    }
};

// ============ YDB Operations ============

async function createOrderInYdb(orderData) {
    const driver = await getYdbDriver();
    const orderId = generateOrderId();
    const now = new Date().toISOString();
    
    // Валидация входных данных
    const clientName = String(orderData.clientName || '').trim();
    const clientEmail = String(orderData.clientEmail || '').trim();
    const clientPhone = String(orderData.clientPhone || '').trim();
    const projectType = String(orderData.projectType || '').trim();
    const projectDescription = String(orderData.projectDescription || '').trim();
    const amount = String(orderData.amount || '0').trim();
    
    if (!clientName || !clientEmail) {
        throw new Error('clientName and clientEmail are required');
    }
    
    await driver.tableClient.withSession(async (session) => {
        const queryText = `
            DECLARE $id AS Utf8;
            DECLARE $client_name AS Utf8;
            DECLARE $client_email AS Utf8;
            DECLARE $client_phone AS Utf8;
            DECLARE $project_type AS Utf8;
            DECLARE $project_description AS Utf8;
            DECLARE $amount AS Utf8;
            DECLARE $status AS Utf8;
            DECLARE $created_at AS Utf8;
            
            UPSERT INTO orders (id, client_name, client_email, client_phone, project_type, project_description, amount, status, created_at)
            VALUES ($id, $client_name, $client_email, $client_phone, $project_type, $project_description, $amount, $status, $created_at);
        `;
        
        const preparedQuery = await session.prepareQuery(queryText);
        
        await session.executeQuery(preparedQuery, {
            '$id': TypedValues.utf8(orderId),
            '$client_name': TypedValues.utf8(clientName),
            '$client_email': TypedValues.utf8(clientEmail),
            '$client_phone': TypedValues.utf8(clientPhone),
            '$project_type': TypedValues.utf8(projectType),
            '$project_description': TypedValues.utf8(projectDescription),
            '$amount': TypedValues.utf8(amount),
            '$status': TypedValues.utf8('pending'),
            '$created_at': TypedValues.utf8(now),
        });
    });
    
    console.log('Order created in YDB:', orderId);
    return orderId;
}

async function getOrderFromYdb(orderId) {
    const driver = await getYdbDriver();
    let order = null;
    
    await driver.tableClient.withSession(async (session) => {
        const queryText = `
            DECLARE $id AS Utf8;
            SELECT *
            FROM orders
            WHERE id = $id;
        `;
        
        const preparedQuery = await session.prepareQuery(queryText);
        
        const result = await session.executeQuery(preparedQuery, {
            '$id': TypedValues.utf8(orderId),
        });
        
        console.log('YDB raw result:', JSON.stringify(result, null, 2));
        
        if (result.resultSets && result.resultSets.length > 0) {
            const resultSet = result.resultSets[0];
            const rows = resultSet.rows || [];
            const columns = resultSet.columns || [];
            
            console.log('YDB rows count:', rows.length);
            console.log('YDB columns:', JSON.stringify(columns.map(c => c.name)));
            
            if (rows.length > 0) {
                const row = rows[0];
                console.log('YDB row structure:', JSON.stringify(row, null, 2));
                
                // Строим маппинг имени колонки -> индекс
                const columnMap = {};
                columns.forEach((col, idx) => {
                    columnMap[col.name] = idx;
                });
                console.log('Column mapping:', JSON.stringify(columnMap));
                
                // YDB SDK возвращает данные как массив items
                if (row.items && Array.isArray(row.items)) {
                    // Логируем каждый элемент для отладки
                    row.items.forEach((item, idx) => {
                        const colName = columns[idx] ? columns[idx].name : `unknown_${idx}`;
                        const value = getStringValue(item);
                        console.log(`  Column [${idx}] ${colName}: ${JSON.stringify(item)} -> "${value}"`);
                    });
                    
                    // Извлекаем значения по имени колонки
                    const getValue = (colName) => {
                        const idx = columnMap[colName];
                        if (idx !== undefined && row.items[idx]) {
                            return getStringValue(row.items[idx]);
                        }
                        return '';
                    };
                    
                    order = {
                        id: getValue('id'),
                        clientName: getValue('client_name'),
                        clientEmail: getValue('client_email'),
                        clientPhone: getValue('client_phone'),
                        projectType: getValue('project_type'),
                        projectDescription: getValue('project_description'),
                        amount: getValue('amount'),
                        status: getValue('status'),
                        createdAt: getValue('created_at'),
                        paidAt: getValue('paid_at'),
                    };
                } else {
                    // Формат с именованными полями (на всякий случай)
                    order = {
                        id: getStringValue(row.id),
                        clientName: getStringValue(row.client_name),
                        clientEmail: getStringValue(row.client_email),
                        clientPhone: getStringValue(row.client_phone),
                        projectType: getStringValue(row.project_type),
                        projectDescription: getStringValue(row.project_description),
                        amount: getStringValue(row.amount),
                        status: getStringValue(row.status),
                        createdAt: getStringValue(row.created_at),
                        paidAt: getStringValue(row.paid_at),
                    };
                }
                
                console.log('Parsed order:', JSON.stringify(order));
            }
        }
    });
    
    console.log('Order fetched from YDB:', JSON.stringify(order));
    return order;
}

function getStringValue(field) {
    if (field === null || field === undefined) return '';
    if (typeof field === 'string') return field;
    if (typeof field === 'number') return String(field);
    if (typeof field === 'boolean') return String(field);
    
    // YDB SDK возвращает специальные объекты с геттерами
    // Нормализуем через JSON для получения обычного объекта
    let normalizedField;
    try {
        normalizedField = JSON.parse(JSON.stringify(field));
    } catch (e) {
        normalizedField = field;
    }
    
    // Проверяем null значение
    if (normalizedField.nullFlagValue !== undefined) return '';
    
    // Прямое textValue (основной формат YDB для UTF8)
    if (normalizedField.textValue !== undefined && normalizedField.textValue !== null) {
        return String(normalizedField.textValue);
    }
    
    // UTF8 значение
    if (normalizedField.utf8Value !== undefined && normalizedField.utf8Value !== null) {
        return String(normalizedField.utf8Value);
    }
    
    // stringValue
    if (normalizedField.stringValue !== undefined && normalizedField.stringValue !== null) {
        return String(normalizedField.stringValue);
    }
    
    // int32Value / int64Value / uint64Value
    if (normalizedField.int32Value !== undefined) return String(normalizedField.int32Value);
    if (normalizedField.int64Value !== undefined) return String(normalizedField.int64Value);
    if (normalizedField.uint64Value !== undefined) return String(normalizedField.uint64Value);
    
    // doubleValue / floatValue
    if (normalizedField.doubleValue !== undefined) return String(normalizedField.doubleValue);
    if (normalizedField.floatValue !== undefined) return String(normalizedField.floatValue);
    
    // Вложенный value (для опциональных типов)
    if (normalizedField.value !== undefined && normalizedField.value !== null) {
        return getStringValue(normalizedField.value);
    }
    
    // bytesValue
    if (normalizedField.bytesValue !== undefined) {
        if (Buffer.isBuffer(normalizedField.bytesValue)) {
            return normalizedField.bytesValue.toString('utf-8');
        }
        if (typeof normalizedField.bytesValue === 'string') {
            try {
                return Buffer.from(normalizedField.bytesValue, 'base64').toString('utf-8');
            } catch (e) {
                return normalizedField.bytesValue;
            }
        }
        return String(normalizedField.bytesValue);
    }
    
    // text
    if (normalizedField.text !== undefined) return String(normalizedField.text);
    
    // Если это Buffer напрямую
    if (Buffer.isBuffer(field)) return field.toString('utf-8');
    
    // Попробуем взять первый не-null ключ со значением
    const keys = Object.keys(normalizedField);
    for (const key of keys) {
        if (key.endsWith('Value') && normalizedField[key] !== undefined && normalizedField[key] !== null) {
            return String(normalizedField[key]);
        }
    }
    
    // Для отладки
    console.log('Unknown field format, keys:', keys, 'value:', JSON.stringify(normalizedField));
    return '';
}

async function updateOrderStatusInYdb(orderId, status) {
    const driver = await getYdbDriver();
    const now = new Date().toISOString();
    
    await driver.tableClient.withSession(async (session) => {
        const queryText = `
            DECLARE $id AS Utf8;
            DECLARE $status AS Utf8;
            DECLARE $paid_at AS Utf8;
            
            UPDATE orders
            SET status = $status, paid_at = $paid_at
            WHERE id = $id;
        `;
        
        const preparedQuery = await session.prepareQuery(queryText);
        
        await session.executeQuery(preparedQuery, {
            '$id': TypedValues.utf8(orderId),
            '$status': TypedValues.utf8(status),
            '$paid_at': TypedValues.utf8(now),
        });
    });
    
    console.log('Order status updated in YDB:', orderId, '->', status);
}

function generateOrderId() {
    return 'ord_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// ============ Handlers ============

async function handleContact(data, headers) {
    try {
        await sendTelegramNotification(formatContactMessage(data));
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true, message: 'Заявка отправлена' }),
        };
    } catch (error) {
        console.error('Error handling contact:', error.message);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ success: false, message: 'Ошибка отправки' }),
        };
    }
}

async function handleOrder(data, headers) {
    try {
        // Валидация
        if (!data.clientName || !data.clientEmail) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ success: false, message: 'Имя и email обязательны' }),
            };
        }
        
        const orderId = await createOrderInYdb(data);
        
        await sendTelegramNotification(formatOrderMessage({
            id: orderId,
            clientName: data.clientName,
            clientEmail: data.clientEmail,
            clientPhone: data.clientPhone,
            projectType: data.projectType,
            projectDescription: data.projectDescription || '',
            amount: data.amount,
        }));
        
        // Генерируем ссылку на оплату Robokassa
        const paymentUrl = generateRobokassaUrl(orderId, data.amount);
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
                success: true, 
                orderId: orderId,
                paymentUrl: paymentUrl,
                message: 'Заказ создан' 
            }),
        };
    } catch (error) {
        console.error('Error creating order:', error.message, error.stack);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ success: false, message: 'Ошибка создания заказа', error: error.message }),
        };
    }
}

function generateRobokassaUrl(orderId, amount) {
    const merchantLogin = process.env.ROBOKASSA_MERCHANT_LOGIN;
    const password1 = process.env.ROBOKASSA_PASSWORD1;
    const isTestMode = process.env.ROBOKASSA_TEST_MODE === 'true';
    
    if (!merchantLogin || !password1) {
        console.error('Robokassa not configured');
        return null;
    }
    
    const numericAmount = parseFloat(amount) || 0;
    if (numericAmount <= 0) {
        console.error('Invalid amount:', amount);
        return null;
    }
    
    const prepayment = Math.round(numericAmount / 2);
    const invId = Date.now() % 1000000;
    
    const signatureString = `${merchantLogin}:${prepayment}:${invId}:${password1}:shp_orderId=${orderId}`;
    const signature = crypto.createHash('md5').update(signatureString).digest('hex');
    
    const baseUrl = 'https://auth.robokassa.ru/Merchant/Index.aspx';
    
    const params = new URLSearchParams({
        MerchantLogin: merchantLogin,
        OutSum: prepayment,
        InvId: invId,
        Description: `Предоплата за разработку сайта`,
        SignatureValue: signature,
        shp_orderId: orderId,
        IsTest: isTestMode ? '1' : '0',
    });
    
    return `${baseUrl}?${params.toString()}`;
}

async function handleRobokassaResult(data, headers) {
    console.log('Robokassa result - full data:', JSON.stringify(data));
    
    const OutSum = data.OutSum;
    const InvId = data.InvId;
    const SignatureValue = data.SignatureValue;
    const shp_orderId = data.shp_orderId;

    console.log('Robokassa result callback:', { OutSum, InvId, shp_orderId });

    if (!OutSum || !InvId || !SignatureValue) {
        console.error('Missing required Robokassa parameters');
        return { statusCode: 400, headers: { 'Content-Type': 'text/plain' }, body: 'missing params' };
    }

    const PASSWORD2 = process.env.ROBOKASSA_PASSWORD2;
    
    if (!PASSWORD2) {
        console.error('ROBOKASSA_PASSWORD2 not configured');
        return { statusCode: 500, headers: { 'Content-Type': 'text/plain' }, body: 'config error' };
    }

    const signatureString = `${OutSum}:${InvId}:${PASSWORD2}:shp_orderId=${shp_orderId}`;
    const calculatedSignature = crypto.createHash('md5').update(signatureString).digest('hex');
    
    console.log('Signature check:', { 
        expected: calculatedSignature.toLowerCase(), 
        received: SignatureValue.toLowerCase() 
    });

    if (calculatedSignature.toLowerCase() !== SignatureValue.toLowerCase()) {
        console.error('Invalid Robokassa signature');
        return { statusCode: 400, headers: { 'Content-Type': 'text/plain' }, body: 'bad sign' };
    }

    // Получаем заказ из YDB
    let order = null;
    try {
        order = await getOrderFromYdb(shp_orderId);
        console.log('Order fetched from YDB:', order);
        
        if (order) {
            if (order.status === 'paid') {
                await updateOrderStatusInYdb(shp_orderId, 'completed');
                console.log('Order fully paid (remaining):', shp_orderId);
            } else {
                await updateOrderStatusInYdb(shp_orderId, 'paid');
                console.log('Order prepaid:', shp_orderId);
            }
        }
    } catch (error) {
        console.error('Error fetching/updating order from YDB:', error.message, error.stack);
    }

    // Если заказ найден, отправляем договор на email
    if (order && order.clientEmail) {
        try {
            console.log('Generating PDF for order:', order.id);
            const pdfBuffer = await generateContractPDF(order);
            console.log('PDF generated, size:', pdfBuffer.length);
            
            await sendContractEmail(order, pdfBuffer);
            console.log('Contract email sent to:', order.clientEmail);
        } catch (emailError) {
            console.error('Failed to send contract email:', emailError.message, emailError.stack);
        }
        
        await sendTelegramNotification(`
Оплата получена! Договор подписан!

Заказ: ${shp_orderId}
Сумма: ${OutSum} руб.
Клиент: ${order.clientName}
Email: ${order.clientEmail}
Телефон: ${order.clientPhone}
Тип: ${getProjectTypeName(order.projectType)}

Договор отправлен клиенту на email.
        `);
    } else {
        await sendTelegramNotification(`
Оплата получена!

Заказ: ${shp_orderId}
Сумма: ${OutSum} руб.

(Данные клиента не найдены в базе YDB)
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
    const orderId = query.shp_orderId || '';
    
    return {
        statusCode: 302,
        headers: { 'Location': `${SITE_URL}/payment-success?orderId=${orderId}` },
        body: '',
    };
}

function handleRobokassaFail(query) {
    const orderId = query.shp_orderId || '';
    
    return {
        statusCode: 302,
        headers: { 'Location': `${SITE_URL}/payment-fail?orderId=${orderId}` },
        body: '',
    };
}

async function handlePayRemaining(data, headers) {
    const { orderId } = data;
    
    if (!orderId) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ success: false, message: 'Не указан номер заказа' }),
        };
    }

    let order = null;
    try {
        order = await getOrderFromYdb(orderId);
    } catch (error) {
        console.error('Error fetching order from YDB:', error.message);
    }

    if (!order) {
        return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ success: false, message: 'Заказ не найден' }),
        };
    }

    if (order.status === 'completed') {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ success: false, message: 'Заказ уже полностью оплачен' }),
        };
    }

    if (order.status !== 'paid') {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ success: false, message: 'Предоплата по заказу не подтверждена' }),
        };
    }

    const paymentUrl = generateRemainingPaymentUrl(orderId, order.amount);
    
    if (!paymentUrl) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ success: false, message: 'Ошибка формирования ссылки на оплату' }),
        };
    }

    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
            success: true,
            message: 'Ссылка на оплату сформирована',
            orderId: order.id,
            amount: order.amount,
            paymentUrl,
        }),
    };
}

function generateRemainingPaymentUrl(orderId, amount) {
    const merchantLogin = process.env.ROBOKASSA_MERCHANT_LOGIN;
    const password1 = process.env.ROBOKASSA_PASSWORD1;
    const isTestMode = process.env.ROBOKASSA_TEST_MODE === 'true';
    
    if (!merchantLogin || !password1) {
        console.error('Robokassa not configured');
        return null;
    }
    
    const numericAmount = parseFloat(amount) || 0;
    if (numericAmount <= 0) {
        console.error('Invalid amount:', amount);
        return null;
    }
    
    const invId = Date.now() % 1000000;
    
    const signatureString = `${merchantLogin}:${numericAmount}:${invId}:${password1}:shp_orderId=${orderId}`;
    const signature = crypto.createHash('md5').update(signatureString).digest('hex');
    
    const baseUrl = 'https://auth.robokassa.ru/Merchant/Index.aspx';
    
    const params = new URLSearchParams({
        MerchantLogin: merchantLogin,
        OutSum: numericAmount.toString(),
        InvId: invId.toString(),
        Description: 'Оплата остатка за разработку сайта',
        SignatureValue: signature,
        shp_orderId: orderId,
        IsTest: isTestMode ? '1' : '0',
    });
    
    return `${baseUrl}?${params.toString()}`;
}

// ============ PDF Generation ============

async function generateContractPDF(order) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        
        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        const path = require('path');
        doc.registerFont('Roboto', path.join(__dirname, 'Roboto-Regular.ttf'));
        doc.registerFont('Roboto-Bold', path.join(__dirname, 'Roboto-Bold.ttf'));

        const formatPrice = (price) => {
            const num = parseFloat(price) || 0;
            return new Intl.NumberFormat('ru-RU').format(num);
        };
        const amount = parseFloat(order.amount) || 0;
        const prepayment = Math.round(amount / 2);
        const projectTypeLabel = getProjectTypeName(order.projectType);
        const date = new Date().toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        doc.fontSize(16).font('Roboto-Bold').text('ДОГОВОР ОКАЗАНИЯ УСЛУГ', { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(10).font('Roboto').text(date, { align: 'center' });
        doc.moveDown(1.5);

        doc.fontSize(10).font('Roboto-Bold').text('ИСПОЛНИТЕЛЬ: ', { continued: true });
        doc.font('Roboto').text('MP.WebStudio, самозанятый, действующий на основании справки о постановке на учет в качестве плательщика НПД');
        doc.moveDown(0.5);

        doc.font('Roboto-Bold').text('ЗАКАЗЧИК: ', { continued: true });
        doc.font('Roboto').text(order.clientName || 'Клиент');
        if (order.clientPhone) doc.text(`Телефон: ${order.clientPhone}`);
        if (order.clientEmail) doc.text(`Email: ${order.clientEmail}`);
        doc.moveDown(1);

        doc.text('совместно именуемые "Стороны", заключили настоящий Договор:');
        doc.moveDown(1);

        doc.font('Roboto-Bold').text('1. ПРЕДМЕТ ДОГОВОРА');
        doc.font('Roboto').text(`1.1. Исполнитель обязуется оказать услуги по разработке: ${projectTypeLabel}`);
        doc.moveDown(1);

        doc.font('Roboto-Bold').text('2. СТОИМОСТЬ И ПОРЯДОК ОПЛАТЫ');
        doc.font('Roboto').text(`2.1. Стоимость услуг: ${formatPrice(amount)} рублей`);
        doc.text('2.2. НДС не облагается (п. 8 ст. 2 ФЗ от 27.11.2018 N 422-ФЗ)');
        doc.text(`2.3. Предоплата 50%: ${formatPrice(prepayment)} руб. - ОПЛАЧЕНО`);
        doc.text(`2.4. Остаток 50%: ${formatPrice(prepayment)} руб. - после подписания Акта`);
        doc.moveDown(1);

        doc.font('Roboto-Bold').text('3. СРОКИ ВЫПОЛНЕНИЯ');
        doc.font('Roboto').text('3.1. Срок: от 5 до 20 рабочих дней с момента получения предоплаты и материалов');
        doc.text('3.2. Этапы: Создание первой версии -> Правки (до 3 итераций) -> Запуск');
        doc.moveDown(1);

        doc.font('Roboto-Bold').text('4. ГАРАНТИИ');
        doc.font('Roboto').text('4.1. Гарантийный срок: 14 календарных дней');
        doc.text('4.2. Бесплатное устранение технических ошибок в течение гарантийного срока');
        doc.moveDown(1);

        doc.font('Roboto-Bold').text('5. ИНТЕЛЛЕКТУАЛЬНАЯ СОБСТВЕННОСТЬ');
        doc.font('Roboto').text('5.1. Все права на сайт переходят к Заказчику после полной оплаты');
        doc.text('5.2. Исполнитель вправе использовать результат в портфолио');
        doc.moveDown(1);

        doc.font('Roboto-Bold').text('АКЦЕПТ ОФЕРТЫ');
        doc.font('Roboto').text('Оплата предоплаты является акцептом настоящего договора.');
        doc.text(`Дата акцепта: ${new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })}`);
        doc.text(`ID заказа: ${order.id}`);
        doc.moveDown(2);

        doc.fontSize(9).text('MP.WebStudio | https://mp-webstudio.ru', { align: 'center' });

        doc.end();
    });
}

// ============ Email Sending ============

async function sendContractEmail(order, pdfBuffer) {
    const formatPrice = (price) => {
        const num = parseFloat(price) || 0;
        return new Intl.NumberFormat('ru-RU').format(num);
    };
    const amount = parseFloat(order.amount) || 0;
    const prepayment = Math.round(amount / 2);
    
    const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0891b2;">Спасибо за заказ!</h2>
            <p>Здравствуйте, ${order.clientName || 'Уважаемый клиент'}!</p>
            <p>Ваша предоплата успешно получена. Договор подписан.</p>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Детали заказа:</h3>
                <p><strong>Тип проекта:</strong> ${getProjectTypeName(order.projectType)}</p>
                <p><strong>Стоимость:</strong> ${formatPrice(amount)} руб.</p>
                <p><strong>Предоплата:</strong> ${formatPrice(prepayment)} руб.</p>
                <p><strong>ID заказа:</strong> ${order.id}</p>
            </div>
            <p>Договор прикреплён к письму в PDF.</p>
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                С уважением,<br>MP.WebStudio<br>
                <a href="https://mp-webstudio.ru">mp-webstudio.ru</a>
            </p>
        </div>
    `;
    
    // Yandex Cloud Postbox через AWS SES-совместимый API
    const postboxAccessKey = process.env.POSTBOX_ACCESS_KEY_ID;
    const postboxSecretKey = process.env.POSTBOX_SECRET_ACCESS_KEY;
    const postboxFromEmail = process.env.POSTBOX_FROM_EMAIL;
    
    if (postboxAccessKey && postboxSecretKey && postboxFromEmail) {
        console.log('Using Yandex Cloud Postbox (AWS SESv2), from:', postboxFromEmail);
        
        // Создаём SESv2 клиент для Yandex Cloud Postbox
        const sesClient = new SESv2Client({
            region: 'ru-central1',
            endpoint: 'https://postbox.cloud.yandex.net',
            credentials: {
                accessKeyId: postboxAccessKey,
                secretAccessKey: postboxSecretKey,
            },
        });
        
        // Функция для разбиения base64 на строки по 76 символов (RFC 2045)
        const wrapBase64 = (base64) => base64.match(/.{1,76}/g).join('\r\n');
        
        // Формируем raw email с вложением
        const boundary = '----=_Part_' + Date.now().toString(36);
        const pdfBase64 = wrapBase64(pdfBuffer.toString('base64'));
        const htmlBase64 = wrapBase64(Buffer.from(emailHtml).toString('base64'));
        
        const rawEmail = [
            `From: MP.WebStudio <${postboxFromEmail}>`,
            `To: ${order.clientEmail}`,
            `Subject: =?UTF-8?B?${Buffer.from(`Договор на разработку сайта - Заказ ${order.id}`).toString('base64')}?=`,
            'MIME-Version: 1.0',
            `Content-Type: multipart/mixed; boundary="${boundary}"`,
            '',
            `--${boundary}`,
            'Content-Type: text/html; charset=UTF-8',
            'Content-Transfer-Encoding: base64',
            '',
            htmlBase64,
            '',
            `--${boundary}`,
            `Content-Type: application/pdf; name="Contract_${order.id}.pdf"`,
            'Content-Transfer-Encoding: base64',
            `Content-Disposition: attachment; filename="Contract_${order.id}.pdf"`,
            '',
            pdfBase64,
            '',
            `--${boundary}--`,
        ].join('\r\n');
        
        console.log('Sending email via Yandex Postbox AWS SESv2');
        
        try {
            const command = new SendEmailCommand({
                FromEmailAddress: postboxFromEmail,
                Destination: {
                    ToAddresses: [order.clientEmail],
                },
                Content: {
                    Raw: {
                        Data: Buffer.from(rawEmail),
                    },
                },
            });
            
            const response = await sesClient.send(command);
            console.log('Email sent via Yandex Cloud Postbox, MessageId:', response.MessageId);
            return;
        } catch (error) {
            console.error('Postbox error:', error.message);
            console.error('Postbox error details:', JSON.stringify(error, null, 2));
            throw new Error(`Yandex Postbox error: ${error.message}`);
        }
    }
    
    // Fallback на SMTP (Яндекс Почта)
    const smtpEmail = process.env.SMTP_EMAIL;
    const smtpPassword = process.env.SMTP_PASSWORD;

    console.log('SMTP config:', { emailConfigured: !!smtpEmail, passwordConfigured: !!smtpPassword });

    if (!smtpEmail || !smtpPassword) {
        console.log('No email service configured (POSTBOX_API_KEY or SMTP), skipping email');
        return;
    }

    const transporter = nodemailer.createTransport({
        host: 'smtp.yandex.ru',
        port: 465,
        secure: true,
        auth: { user: smtpEmail, pass: smtpPassword },
    });

    const mailOptions = {
        from: `"MP.WebStudio" <${smtpEmail}>`,
        to: order.clientEmail,
        subject: `Договор на разработку сайта - Заказ ${order.id}`,
        html: emailHtml,
        attachments: [{
            filename: `Договор_${order.id}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf',
        }],
    };

    console.log('Sending email via SMTP to:', order.clientEmail);
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully via SMTP');
}

// ============ Helpers ============

function getProjectTypeName(type) {
    const types = {
        landing: 'Лендинг',
        corporate: 'Корпоративный сайт',
        shop: 'Интернет-магазин',
    };
    return types[type] || type || 'Веб-разработка';
}

function formatContactMessage(data) {
    return `Новая заявка с сайта\n\nИмя: ${data.name}\nEmail: ${data.email}\nТелефон: ${data.phone || 'не указан'}\n\nСообщение:\n${data.message}`;
}

function formatOrderMessage(order) {
    return `Новый заказ!\n\nID: ${order.id}\nКлиент: ${order.clientName}\nEmail: ${order.clientEmail}\nТелефон: ${order.clientPhone}\nТип: ${getProjectTypeName(order.projectType)}\nСумма: ${order.amount} руб.`;
}

async function sendTelegramNotification(message) {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
        console.log('Telegram not configured');
        return;
    }

    try {
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text: message }),
        });
        console.log('Telegram notification sent');
    } catch (error) {
        console.error('Telegram error:', error.message);
    }
}
