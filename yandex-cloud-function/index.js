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
 * - ADMIN_EMAIL - email администратора для входа в админ-панель
 * - ADMIN_PASSWORD - пароль администратора для входа в админ-панель
 * - GIGACHAT_KEY - полный ключ доступа Giga Chat
 * - GIGACHAT_SCOPE - scope для Giga Chat (GIGACHAT_API_PERS)
 * 
 * Банковские реквизиты (для оплаты по счёту):
 * - BANK_NAME - название банка (например: Сбербанк)
 * - BANK_BIK - БИК банка
 * - BANK_ACCOUNT - номер расчётного счёта
 * - BANK_CORR_ACCOUNT - корр. счёт (опционально)
 */

const crypto = require('crypto');
const https = require('https');
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');
const { Driver, getCredentialsFromEnv, TypedValues, Types } = require('ydb-sdk');
const { SESv2Client, SendEmailCommand } = require('@aws-sdk/client-sesv2');
const GigaChat = require('gigachat');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

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

async function httpsRequest(urlString, options) {
    return new Promise((resolve, reject) => {
        const url = new URL(urlString);
        const startTime = Date.now();
        const requestId = crypto.randomUUID().substring(0, 8);

        console.log(`\n   [HTTPS-${requestId}] ========== HTTPS REQUEST START ==========`);
        console.log(`   [HTTPS-${requestId}] URL: ${urlString}`);
        console.log(`   [HTTPS-${requestId}] Method: ${options.method}`);
        console.log(`   [HTTPS-${requestId}] Hostname: ${url.hostname}:${url.port || 443}`);
        console.log(`   [HTTPS-${requestId}] Path: ${url.pathname}`);

        const bodySize = options.body ? Buffer.byteLength(options.body) : 0;
        console.log(`   [HTTPS-${requestId}] Request body size: ${bodySize} bytes`);
        console.log(`   [HTTPS-${requestId}] Headers: ${Object.keys(options.headers).join(', ')}`);

        // Timeout увеличен до 90 сек для стабильного GigaChat API
        const TIMEOUT_MS = 90000;
        const SOCKET_TIMEOUT_MS = 95000;

        let socketTimeoutId = null;
        let requestTimeoutId = null;
        let hasResponded = false;
        let receivedFirstByte = false;
        let totalBytesReceived = 0;
        let socketConnected = false;
        let tlsConnected = false;
        let requestEnded = false;

        const cleanup = () => {
            if (requestTimeoutId) clearTimeout(requestTimeoutId);
            if (socketTimeoutId) clearTimeout(socketTimeoutId);
        };

        const elapsed = () => Math.round(Date.now() - startTime);
        const elapsedMs = () => Math.round(Date.now() - startTime);

        console.log(`   [HTTPS-${requestId}] Setting main timeout: ${TIMEOUT_MS}ms`);

        requestTimeoutId = setTimeout(() => {
            cleanup();
            const state = {
                elapsed: elapsed() + 'ms',
                hasResponded,
                receivedFirstByte,
                totalBytes: totalBytesReceived,
                socketConnected,
                tlsConnected,
                requestEnded
            };
            console.error(`   [HTTPS-${requestId}] ❌ MAIN TIMEOUT after ${elapsed()}ms`);
            console.error(`   [HTTPS-${requestId}] State:`, JSON.stringify(state));
            req.destroy();
            reject(new Error(`Request timeout after ${elapsed()}ms`));
        }, TIMEOUT_MS);

        const reqOptions = {
            method: options.method,
            headers: options.headers,
            rejectUnauthorized: false,
            timeout: SOCKET_TIMEOUT_MS,
            connectTimeout: 15000,
        };

        // Убедимся что Content-Length установлен если есть body
        if (options.body && !reqOptions.headers['Content-Length']) {
            reqOptions.headers['Content-Length'] = Buffer.byteLength(options.body);
        }

        console.log(`   [HTTPS-${requestId}] Creating HTTPS request with timeout: ${SOCKET_TIMEOUT_MS}ms`);

        const req = https.request(url, reqOptions, (res) => {
            hasResponded = true;
            console.log(`   [HTTPS-${requestId}] ✅ Response callback triggered after ${elapsedMs()}ms`);
            console.log(`   [HTTPS-${requestId}] Status code: ${res.statusCode}`);

            try {
                const tlsVersion = res.socket?.getProtocol?.() || 'unknown';
                const cipher = res.socket?.getCipher?.()?.name || 'unknown';
                console.log(`   [HTTPS-${requestId}] TLS: ${tlsVersion}, Cipher: ${cipher}`);
                console.log(`   [HTTPS-${requestId}] Response headers: content-type=${res.headers['content-type']}, content-length=${res.headers['content-length']}`);
            } catch (e) {
                console.log(`   [HTTPS-${requestId}] Could not get TLS info:`, e.message);
            }

            // Reset socket timeout on response start
            socketTimeoutId = setTimeout(() => {
                cleanup();
                console.error(`   [HTTPS-${requestId}] ❌ RESPONSE TIMEOUT after ${elapsed()}ms, received ${totalBytesReceived} bytes`);
                req.destroy();
                reject(new Error('Response timeout'));
            }, SOCKET_TIMEOUT_MS);

            let data = '';
            res.on('data', (chunk) => {
                if (!receivedFirstByte) {
                    receivedFirstByte = true;
                    console.log(`   [HTTPS-${requestId}] 📦 First byte received after ${elapsedMs()}ms`);
                }

                totalBytesReceived += chunk.length;
                console.log(`   [HTTPS-${requestId}] 📥 Data chunk: ${chunk.length} bytes (total: ${totalBytesReceived})`);

                // Reset timeout on each data chunk
                if (socketTimeoutId) clearTimeout(socketTimeoutId);
                socketTimeoutId = setTimeout(() => {
                    cleanup();
                    console.error(`   [HTTPS-${requestId}] ❌ DATA TIMEOUT after ${elapsed()}ms`);
                    req.destroy();
                    reject(new Error('Data timeout'));
                }, SOCKET_TIMEOUT_MS);

                data += chunk;
            });

            res.on('end', () => {
                cleanup();
                console.log(`   [HTTPS-${requestId}] ✨ Response ended after ${elapsedMs()}ms`);
                console.log(`   [HTTPS-${requestId}] Total response size: ${data.length} bytes`);
                console.log(`   [HTTPS-${requestId}] ========== REQUEST SUCCESS ==========\n`);
                resolve({ statusCode: res.statusCode || 500, data });
            });

            res.on('error', (err) => {
                console.error(`   [HTTPS-${requestId}] ❌ Response error:`, err.message);
            });
        });

        req.on('socket', (socket) => {
            console.log(`   [HTTPS-${requestId}] 🔌 Socket created, fd: ${socket.fd || 'unknown'}`);

            socket.on('lookup', () => {
                console.log(`   [HTTPS-${requestId}] 🔍 DNS lookup started`);
            });

            socket.on('connect', () => {
                socketConnected = true;
                console.log(`   [HTTPS-${requestId}] 🌐 TCP connected after ${elapsedMs()}ms`);
            });

            socket.on('secureConnect', () => {
                tlsConnected = true;
                console.log(`   [HTTPS-${requestId}] 🔒 TLS handshake complete after ${elapsedMs()}ms`);
            });

            socket.on('close', (hadError) => {
                console.log(`   [HTTPS-${requestId}] ❌ Socket closed (hadError: ${hadError}) after ${elapsed()}ms`);
            });

            socket.on('error', (err) => {
                console.error(`   [HTTPS-${requestId}] ❌ Socket error:`, err.code, err.message);
            });
        });

        req.on('error', (err) => {
            cleanup();
            console.error(`   [HTTPS-${requestId}] ❌ REQUEST ERROR after ${elapsed()}ms`);
            console.error(`   [HTTPS-${requestId}] Error code: ${err.code}`);
            console.error(`   [HTTPS-${requestId}] Error message: ${err.message}`);
            console.error(`   [HTTPS-${requestId}] Syscall: ${err.syscall || 'none'}`);
            console.error(`   [HTTPS-${requestId}] State: socket=${socketConnected}, tls=${tlsConnected}, firstByte=${receivedFirstByte}, totalBytes=${totalBytesReceived}`);
            console.error(`   [HTTPS-${requestId}] ========== REQUEST FAILED ==========\n`);
            reject(err);
        });

        req.on('timeout', () => {
            cleanup();
            console.error(`   [HTTPS-${requestId}] ⏱️ REQUEST TIMEOUT EVENT after ${elapsed()}ms`);
            console.error(`   [HTTPS-${requestId}] State: socket=${socketConnected}, tls=${tlsConnected}, firstByte=${receivedFirstByte}, totalBytes=${totalBytesReceived}`);
            req.destroy();
            reject(new Error('Socket timeout'));
        });

        req.on('abort', () => {
            console.log(`   [HTTPS-${requestId}] Request aborted after ${elapsed()}ms`);
        });

        if (options.body) {
            const bodyPreview = options.body.substring(0, 100) + (options.body.length > 100 ? '...' : '');
            console.log(`   [HTTPS-${requestId}] 📤 Writing body (${bodySize} bytes): ${bodyPreview}`);
            req.write(options.body);
            console.log(`   [HTTPS-${requestId}] Body written successfully`);
        }

        console.log(`   [HTTPS-${requestId}] 🚀 Calling req.end()`);
        requestEnded = true;
        req.end();
        console.log(`   [HTTPS-${requestId}] Waiting for response...`);
    });
}

module.exports.handler = async function (event, context) {
    console.log('[HANDLER START]', { method: event.httpMethod, path: event.path, timestamp: new Date().toISOString() });

    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
    };

    if (event.httpMethod === 'OPTIONS') {
        console.log('[OPTIONS] Returning 200');
        return { 
            statusCode: 200, 
            headers,
            body: JSON.stringify({ ok: true })
        };
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

        console.log('[REQUEST]', { method, action, path, bodyKeys: Object.keys(body) });

        // Telegram Bot Webhook
        if ((action === 'telegram-webhook' || path.includes('/telegram-webhook')) && method === 'POST') {
            return await handleTelegramWebhook(body, headers);
        }

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

        if ((action === 'pay-remaining' || action === 'orders/pay-remaining' || path.includes('/pay-remaining')) && method === 'POST') {
            return await handlePayRemaining(body, headers);
        }

        if ((action === 'additional-invoices' || path.includes('/additional-invoices')) && method === 'POST') {
            return await handleAdditionalInvoice(body, headers);
        }

        // POST /api/bank-invoice - создать счёт на оплату для юрлиц (предоплата)
        if ((action === 'bank-invoice' || path.endsWith('/bank-invoice')) && method === 'POST') {
            return await handleBankInvoice(body, headers);
        }

        // POST /api/bank-invoice/remaining - выставить счёт на остаток для юрлиц
        if ((action === 'bank-invoice-remaining' || path.includes('/bank-invoice/remaining')) && method === 'POST') {
            return await handleBankInvoiceRemaining(body, headers);
        }

        // POST /api/bank-invoice/addon - выставить доп. счёт для юрлиц
        if ((action === 'bank-invoice-addon' || path.includes('/bank-invoice/addon')) && method === 'POST') {
            return await handleBankInvoiceAddon(body, headers);
        }

        // POST /api/confirm-bank-payment - подтвердить оплату по счёту
        if ((action === 'confirm-bank-payment' || path.includes('/confirm-bank-payment')) && method === 'POST') {
            return await handleConfirmBankPayment(body, headers);
        }

        // POST /api/send-calculator-order - отправить заказ из калькулятора
        if ((action === 'send-calculator-order' || path.includes('/send-calculator-order')) && method === 'POST') {
            return await handleCalculatorOrder(body, headers);
        }

        // POST /api/giga-chat - AI чат через Giga Chat
        if ((action === 'giga-chat' || path.includes('/giga-chat')) && method === 'POST') {
            console.log('[GIGA-CHAT] Handler called');
            return await handleGigaChat(body, headers);
        }

        // POST ?action=delete-order - мягкое удаление заказа
        if (action === 'delete-order' && method === 'POST') {
            const orderIdToDelete = body.orderId;
            if (orderIdToDelete) {
                return await handleDeleteOrder(orderIdToDelete, headers);
            }
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ success: false, message: 'orderId is required' }),
            };
        }

        // POST ?action=orders/{id}/note - обновить заметку
        const noteActionMatch = action.match(/^orders\/([a-zA-Z0-9_-]+)\/note$/);
        if (noteActionMatch && method === 'POST') {
            return await handleUpdateOrderNote(noteActionMatch[1], body.note || '', headers);
        }

        // GET /api/orders - получить список всех заказов
        if ((action === 'orders' || path.endsWith('/orders')) && method === 'GET') {
            return await handleListOrders(query, headers);
        }

        // GET ?action=client-orders&email=... - заказы клиента по email (для Mini App)
        if (action === 'client-orders' && method === 'GET') {
            return await handleClientOrders(query, headers);
        }

        // GET /api/orders/:orderId - получить заказ по ID
        const orderMatch = path.match(/\/orders\/([a-zA-Z0-9_-]+)$/);
        if (orderMatch && method === 'GET') {
            return await handleGetOrder(orderMatch[1], headers);
        }

        // Также поддерживаем action=orders/orderId для совместимости с фронтендом
        const actionOrderMatch = action.match(/^orders\/([a-zA-Z0-9_-]+)$/);
        if (actionOrderMatch && method === 'GET') {
            return await handleGetOrder(actionOrderMatch[1], headers);
        }

        // Admin authentication
        if (action === 'admin-login' && method === 'POST') {
            return await handleAdminLogin(body, headers);
        }

        if (action === 'verify-admin' && method === 'POST') {
            return await handleVerifyAdmin(body, headers);
        }

        // DELETE /api/orders/:orderId - мягкое удаление заказа
        if (method === 'DELETE') {
            const deleteMatch = path.match(/\/orders\/([a-zA-Z0-9_-]+)$/);
            const deleteActionMatch = action.match(/^orders\/([a-zA-Z0-9_-]+)$/);
            const orderIdToDelete = deleteMatch?.[1] || deleteActionMatch?.[1] || body.orderId;
            if (orderIdToDelete) {
                return await handleDeleteOrder(orderIdToDelete, headers);
            }
        }

        // PATCH /api/orders/:orderId/note - обновить заметку
        if (method === 'PATCH' || (method === 'POST' && action.includes('/note'))) {
            const noteMatch = path.match(/\/orders\/([a-zA-Z0-9_-]+)\/note$/);
            const noteActionMatch = action.match(/^orders\/([a-zA-Z0-9_-]+)\/note$/);
            const orderIdForNote = noteMatch?.[1] || noteActionMatch?.[1] || body.orderId;
            if (orderIdForNote) {
                return await handleUpdateOrderNote(orderIdForNote, body.note || '', headers);
            }
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

// ============ Telegram Bot Webhook ============

async function handleTelegramWebhook(body, headers) {
    try {
        const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

        if (!TELEGRAM_BOT_TOKEN) {
            console.error('TELEGRAM_BOT_TOKEN not configured');
            return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
        }

        // Обработка команды /start
        if (body.message?.text === '/start') {
            const chatId = body.message.chat.id;
            const firstName = body.message.from?.first_name || 'Клиент';

            const text = `Привет, ${firstName}!\n\nДобро пожаловать в MP.WebStudio — веб-студию, где сайты создаёт искусственный интеллект.\n\nВыберите действие:`;

            const keyboard = {
                inline_keyboard: [
                    [{ text: 'Перейти на сайт', url: 'https://mp-webstudio.ru' }]
                ]
            };

            await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: text,
                    reply_markup: keyboard
                })
            });
        }

        return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    } catch (error) {
        console.error('Telegram webhook error:', error.message);
        return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    }
}

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
    const totalAmount = String(orderData.totalAmount || amount).trim();
    const selectedFeatures = String(orderData.selectedFeatures || '').trim();
    const status = String(orderData.status || 'pending').trim();
    const paymentMethod = String(orderData.paymentMethod || 'card').trim();
    const companyName = String(orderData.companyName || '').trim();
    const companyInn = String(orderData.companyInn || '').trim();
    const companyKpp = String(orderData.companyKpp || '').trim();
    const companyAddress = String(orderData.companyAddress || '').trim();

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
            DECLARE $total_amount AS Utf8;
            DECLARE $selected_features AS Utf8;
            DECLARE $status AS Utf8;
            DECLARE $created_at AS Utf8;
            DECLARE $payment_method AS Utf8;
            DECLARE $company_name AS Utf8;
            DECLARE $company_inn AS Utf8;
            DECLARE $company_kpp AS Utf8;
            DECLARE $company_address AS Utf8;

            UPSERT INTO orders (id, client_name, client_email, client_phone, project_type, project_description, amount, total_amount, selected_features, status, created_at, payment_method, company_name, company_inn, company_kpp, company_address)
            VALUES ($id, $client_name, $client_email, $client_phone, $project_type, $project_description, $amount, $total_amount, $selected_features, $status, $created_at, $payment_method, $company_name, $company_inn, $company_kpp, $company_address);
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
            '$total_amount': TypedValues.utf8(totalAmount),
            '$selected_features': TypedValues.utf8(selectedFeatures),
            '$status': TypedValues.utf8(status),
            '$created_at': TypedValues.utf8(now),
            '$payment_method': TypedValues.utf8(paymentMethod),
            '$company_name': TypedValues.utf8(companyName),
            '$company_inn': TypedValues.utf8(companyInn),
            '$company_kpp': TypedValues.utf8(companyKpp),
            '$company_address': TypedValues.utf8(companyAddress),
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
                        paymentMethod: getValue('payment_method') || 'card',
                        companyName: getValue('company_name'),
                        companyInn: getValue('company_inn'),
                        companyKpp: getValue('company_kpp'),
                        companyAddress: getValue('company_address'),
                        totalAmount: getValue('total_amount'),
                        selectedFeatures: getValue('selected_features'),
                        prepaymentConfirmedAt: getValue('prepayment_confirmed_at'),
                        remainingInvoiceSentAt: getValue('remaining_invoice_sent_at'),
                        remainingConfirmedAt: getValue('remaining_confirmed_at'),
                        internalNote: getValue('internal_note'),
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
                        paymentMethod: getStringValue(row.payment_method) || 'card',
                        companyName: getStringValue(row.company_name),
                        companyInn: getStringValue(row.company_inn),
                        companyKpp: getStringValue(row.company_kpp),
                        companyAddress: getStringValue(row.company_address),
                        totalAmount: getStringValue(row.total_amount),
                        selectedFeatures: getStringValue(row.selected_features),
                        prepaymentConfirmedAt: getStringValue(row.prepayment_confirmed_at),
                        remainingInvoiceSentAt: getStringValue(row.remaining_invoice_sent_at),
                        remainingConfirmedAt: getStringValue(row.remaining_confirmed_at),
                        internalNote: getStringValue(row.internal_note),
                    };
                }

                console.log('Parsed order:', JSON.stringify(order));
            }
        }
    });

    console.log('Order fetched from YDB:', JSON.stringify(order));
    return order;
}

// ============ Additional Invoices YDB Functions ============

async function saveAdditionalInvoiceToYdb(invoiceId, orderId, description, amount, status = 'pending') {
    const driver = await getYdbDriver();
    const now = new Date().toISOString();

    await driver.tableClient.withSession(async (session) => {
        const queryText = `
            DECLARE $id AS Utf8;
            DECLARE $order_id AS Utf8;
            DECLARE $description AS Utf8;
            DECLARE $amount AS Utf8;
            DECLARE $status AS Utf8;
            DECLARE $paid_at AS Utf8;

            UPSERT INTO additional_invoices (id, order_id, description, amount, status, paid_at)
            VALUES ($id, $order_id, $description, $amount, $status, $paid_at);
        `;

        const preparedQuery = await session.prepareQuery(queryText);

        await session.executeQuery(preparedQuery, {
            '$id': TypedValues.utf8(invoiceId),
            '$order_id': TypedValues.utf8(orderId),
            '$description': TypedValues.utf8(description || 'Дополнительные услуги'),
            '$amount': TypedValues.utf8(String(amount)),
            '$status': TypedValues.utf8(status),
            '$paid_at': TypedValues.utf8(status === 'paid' ? now : ''),
        });
    });

    console.log('Additional invoice saved to YDB:', invoiceId, 'status:', status);
}

async function updateAdditionalInvoiceStatusInYdb(invoiceId, status) {
    const driver = await getYdbDriver();
    const now = new Date().toISOString();

    await driver.tableClient.withSession(async (session) => {
        const queryText = `
            DECLARE $id AS Utf8;
            DECLARE $status AS Utf8;
            DECLARE $paid_at AS Utf8;

            UPDATE additional_invoices
            SET status = $status, paid_at = $paid_at
            WHERE id = $id;
        `;

        const preparedQuery = await session.prepareQuery(queryText);

        await session.executeQuery(preparedQuery, {
            '$id': TypedValues.utf8(invoiceId),
            '$status': TypedValues.utf8(status),
            '$paid_at': TypedValues.utf8(status === 'paid' ? now : ''),
        });
    });

    console.log('Additional invoice status updated in YDB:', invoiceId, 'to:', status);
}

async function getAdditionalInvoicesFromYdb(orderId) {
    const driver = await getYdbDriver();
    const invoices = [];

    await driver.tableClient.withSession(async (session) => {
        const queryText = `
            DECLARE $order_id AS Utf8;
            SELECT *
            FROM additional_invoices
            WHERE order_id = $order_id AND status = 'paid';
        `;

        const preparedQuery = await session.prepareQuery(queryText);

        const result = await session.executeQuery(preparedQuery, {
            '$order_id': TypedValues.utf8(orderId),
        });

        if (result.resultSets && result.resultSets.length > 0) {
            const resultSet = result.resultSets[0];
            const rows = resultSet.rows || [];
            const columns = resultSet.columns || [];

            const columnMap = {};
            columns.forEach((col, idx) => {
                columnMap[col.name] = idx;
            });

            rows.forEach(row => {
                if (row.items && Array.isArray(row.items)) {
                    const getValue = (colName) => {
                        const idx = columnMap[colName];
                        if (idx !== undefined && row.items[idx]) {
                            return getStringValue(row.items[idx]);
                        }
                        return '';
                    };

                    invoices.push({
                        id: getValue('id'),
                        orderId: getValue('order_id'),
                        description: getValue('description'),
                        amount: getValue('amount'),
                        status: getValue('status'),
                        paidAt: getValue('paid_at'),
                    });
                }
            });
        }
    });

    console.log('Additional invoices fetched from YDB:', invoices.length);
    return invoices;
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

    // amount уже содержит сумму предоплаты (50%), НЕ делим повторно
    const invId = Date.now() % 1000000;

    const signatureString = `${merchantLogin}:${numericAmount}:${invId}:${password1}:shp_orderId=${orderId}`;
    const signature = crypto.createHash('md5').update(signatureString).digest('hex');

    const baseUrl = 'https://auth.robokassa.ru/Merchant/Index.aspx';

    const params = new URLSearchParams({
        MerchantLogin: merchantLogin,
        OutSum: numericAmount,
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

    // Проверяем, это оплата дополнительного счёта или основного заказа
    const isAdditionalInvoicePayment = shp_orderId.startsWith('addinv_');

    if (isAdditionalInvoicePayment) {
        // Это оплата дополнительного счёта
        console.log('Processing additional invoice payment:', shp_orderId);

        // Извлекаем orderId из addinv_{orderIdSuffix}_{timestamp}
        // Пример: addinv_mjcv3hwa54rerggqx_lxyz123
        const parts = shp_orderId.split('_');
        // parts[0] = "addinv", parts[1] = "orderIdSuffix", parts[2] = "timestamp"
        const realOrderId = parts.length >= 2 ? `ord_${parts[1]}` : null;

        console.log('Extracted order ID from additional invoice:', realOrderId);

        let order = null;
        try {
            if (realOrderId) {
                order = await getOrderFromYdb(realOrderId);
                console.log('Order for additional invoice:', order);
            }
        } catch (error) {
            console.error('Error fetching order for additional invoice:', error.message);
        }

        // Обновляем статус счёта на "paid" в YDB (описание уже сохранено при создании)
        try {
            await updateAdditionalInvoiceStatusInYdb(shp_orderId, 'paid');
            console.log('Additional invoice status updated to paid in YDB');
        } catch (saveError) {
            console.error('Error updating additional invoice status in YDB:', saveError.message);
        }

        // Отправляем уведомление в Telegram
        if (order) {
            await sendTelegramNotification(`💳 Оплачен дополнительный счёт!
👤 Клиент: ${order.clientName}
📧 Email: ${order.clientEmail}
💰 Сумма: ${OutSum} ₽
📋 Заказ: ${realOrderId ? realOrderId.toUpperCase() : shp_orderId}

Статус основного заказа: ${order.status === 'paid' ? 'Предоплата получена' : order.status === 'completed' ? 'Завершён' : 'Ожидает оплаты'}`);

            // Отправляем email клиенту об оплате дополнительной услуги
            try {
                await sendAdditionalInvoiceEmail(order, OutSum, shp_orderId);
                console.log('Additional invoice email sent to:', order.clientEmail);
            } catch (emailError) {
                console.error('Failed to send additional invoice email:', emailError.message);
            }
        } else {
            await sendTelegramNotification(`💳 Оплачен дополнительный счёт!
💰 Сумма: ${OutSum} ₽
🆔 ID: ${shp_orderId}

(Данные заказа не найдены)`);
        }

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'text/plain' },
            body: `OK${InvId}`,
        };
    }

    // Это оплата основного заказа (предоплата или остаток)
    let order = null;
    let isPrepayment = false;
    let additionalInvoices = [];
    try {
        order = await getOrderFromYdb(shp_orderId);
        console.log('Order fetched from YDB:', order);

        if (order) {
            if (order.status === 'paid') {
                await updateOrderStatusInYdb(shp_orderId, 'completed');
                console.log('Order fully paid (remaining):', shp_orderId);
                isPrepayment = false;
            } else {
                await updateOrderStatusInYdb(shp_orderId, 'paid');
                console.log('Order prepaid:', shp_orderId);
                isPrepayment = true;
            }
        }
    } catch (error) {
        console.error('Error fetching/updating order from YDB:', error.message, error.stack);
    }

    // Отправляем документы на email в зависимости от типа оплаты
    if (order && order.clientEmail) {
        if (isPrepayment) {
            // Предоплата - отправляем договор
            try {
                console.log('Generating contract PDF for order:', order.id);
                const pdfBuffer = await generateContractPDF(order);
                console.log('Contract PDF generated, size:', pdfBuffer.length);

                await sendContractEmail(order, pdfBuffer);
                console.log('Contract email sent to:', order.clientEmail);
            } catch (emailError) {
                console.error('Failed to send contract email:', emailError.message, emailError.stack);
            }

            // Формируем ссылку для оплаты остатка
            const payRemainingLink = `${SITE_URL}/pay-remaining?orderId=${shp_orderId}`;
            const prepaymentPercent = order.prepaymentPercent || 50;

            await sendTelegramNotification(`Получена предоплата!
👤 Клиент: ${order.clientName}
📧 Email: ${order.clientEmail}
📱 Телефон: ${order.clientPhone}
🌐 Тип: ${getProjectTypeName(order.projectType)}
💰 Сумма: ${OutSum} ₽ (${prepaymentPercent}%)
📋 Заказ: ${shp_orderId.toUpperCase()}
🔗 Ссылка для оплаты остатка:
${payRemainingLink}

Договор отправлен клиенту на email.`);
        } else {
            // Полная оплата - отправляем акт выполненных работ
            try {
                console.log('Generating completion act PDF for order:', order.id);

                // Получаем список всех оплаченных дополнительных счётов из YDB
                try {
                    console.log('Fetching additional invoices from YDB for order:', shp_orderId);
                    additionalInvoices = await getAdditionalInvoicesFromYdb(shp_orderId);
                    console.log('Additional invoices fetched from YDB:', additionalInvoices.length);
                } catch (fetchError) {
                    console.error('Error fetching additional invoices from YDB:', fetchError.message);
                }

                const pdfBuffer = await generateCompletionActPDF(order, additionalInvoices);
                console.log('Completion act PDF generated, size:', pdfBuffer.length);

                await sendCompletionActEmail(order, pdfBuffer);
                console.log('Completion act email sent to:', order.clientEmail);
            } catch (emailError) {
                console.error('Failed to send completion act email:', emailError.message, emailError.stack);
            }

            // Формируем сообщение о дополнительных счётах
            let additionalInvoicesMessage = '';
            if (additionalInvoices && additionalInvoices.length > 0) {
                const paidAdditional = additionalInvoices.filter(inv => inv.status === 'paid');
                if (paidAdditional.length > 0) {
                    additionalInvoicesMessage = '\n\n💳 <b>Дополнительные работы:</b>\n';
                    paidAdditional.forEach(inv => {
                        additionalInvoicesMessage += `• ${inv.description} - ${inv.amount} ₽\n`;
                    });
                }
            }

            await sendTelegramNotification(`Заказ полностью оплачен!
👤 Клиент: ${order.clientName}
📧 Email: ${order.clientEmail}
📱 Телефон: ${order.clientPhone}
🌐 Тип: ${getProjectTypeName(order.projectType)}
💰 Сумма: ${OutSum} ₽ (остаток)
📋 Заказ: ${shp_orderId.toUpperCase()}${additionalInvoicesMessage}

Акт выполненных работ отправлен клиенту.

⚠️ ВАЖНО: Отправьте клиенту данные доступа к сайту!
(URL админки, логин, пароль)`);
        }
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

async function handleGetOrder(orderId, headers) {
    if (!orderId) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Не указан номер заказа' }),
        };
    }

    try {
        const order = await getOrderFromYdb(orderId);

        if (!order) {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ error: 'Заказ не найден' }),
            };
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(order),
        };
    } catch (error) {
        console.error('Error fetching order:', error.message);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Ошибка получения заказа' }),
        };
    }
}

// GET /api/orders - получить список всех заказов
async function handleListOrders(query, headers) {
    try {
        const showDeleted = query.all === 'true';
        const orders = await getAllOrdersFromYdb(showDeleted);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(orders),
        };
    } catch (error) {
        console.error('Error listing orders:', error.message);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Ошибка получения списка заказов' }),
        };
    }
}

// GET ?action=client-orders&email=... - заказы клиента по email (для Telegram Mini App)
async function handleClientOrders(query, headers) {
    try {
        const email = (query.email || '').trim().toLowerCase();

        if (!email) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ success: false, message: 'Email обязателен' }),
            };
        }

        const allOrders = await getAllOrdersFromYdb(false);

        const clientOrders = allOrders.filter(order => 
            order.clientEmail && order.clientEmail.toLowerCase() === email
        );

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
                success: true, 
                orders: clientOrders,
                count: clientOrders.length 
            }),
        };
    } catch (error) {
        console.error('Error fetching client orders:', error.message);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ success: false, error: 'Ошибка получения заказов' }),
        };
    }
}

// DELETE /api/orders/:orderId - мягкое удаление заказа
async function handleDeleteOrder(orderId, headers) {
    try {
        await softDeleteOrderInYdb(orderId);
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true, message: 'Заказ удалён' }),
        };
    } catch (error) {
        console.error('Error deleting order:', error.message);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ success: false, error: 'Ошибка удаления заказа' }),
        };
    }
}

// PATCH /api/orders/:orderId/note - обновить заметку
async function handleUpdateOrderNote(orderId, note, headers) {
    try {
        await updateOrderNoteInYdb(orderId, note);
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true, message: 'Заметка обновлена' }),
        };
    } catch (error) {
        console.error('Error updating order note:', error.message);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ success: false, error: 'Ошибка обновления заметки' }),
        };
    }
}

// Мягкое удаление заказа в YDB
async function softDeleteOrderInYdb(orderId) {
    const driver = await getYdbDriver();
    const now = new Date().toISOString();

    await driver.tableClient.withSession(async (session) => {
        const queryText = `
            DECLARE $id AS Utf8;
            DECLARE $deleted_at AS Utf8;

            UPDATE orders
            SET deleted_at = $deleted_at
            WHERE id = $id;
        `;

        const preparedQuery = await session.prepareQuery(queryText);
        await session.executeQuery(preparedQuery, {
            '$id': TypedValues.utf8(orderId),
            '$deleted_at': TypedValues.utf8(now),
        });
    });

    console.log('Order soft deleted:', orderId);
}

// Обновление заметки заказа в YDB
async function updateOrderNoteInYdb(orderId, note) {
    const driver = await getYdbDriver();

    await driver.tableClient.withSession(async (session) => {
        const queryText = `
            DECLARE $id AS Utf8;
            DECLARE $internal_note AS Utf8;

            UPDATE orders
            SET internal_note = $internal_note
            WHERE id = $id;
        `;

        const preparedQuery = await session.prepareQuery(queryText);
        await session.executeQuery(preparedQuery, {
            '$id': TypedValues.utf8(orderId),
            '$internal_note': TypedValues.utf8(note || ''),
        });
    });

    console.log('Order note updated:', orderId);
}

// Получение всех заказов из YDB
async function getAllOrdersFromYdb(includeDeleted = false) {
    const driver = await getYdbDriver();
    let orders = [];

    await driver.tableClient.withSession(async (session) => {
        let queryText;
        if (includeDeleted) {
            queryText = `SELECT * FROM orders ORDER BY created_at DESC;`;
        } else {
            queryText = `SELECT * FROM orders WHERE deleted_at IS NULL OR deleted_at = '' ORDER BY created_at DESC;`;
        }

        const result = await session.executeQuery(queryText);

        if (result.resultSets && result.resultSets.length > 0) {
            const resultSet = result.resultSets[0];
            const rows = resultSet.rows || [];
            const columns = resultSet.columns || [];

            // Строим маппинг имени колонки -> индекс
            const columnMap = {};
            columns.forEach((col, idx) => {
                columnMap[col.name] = idx;
            });

            orders = rows.map(row => {
                if (!row.items || !Array.isArray(row.items)) {
                    return null;
                }

                // Извлекаем значения по имени колонки
                const getValue = (colName) => {
                    const idx = columnMap[colName];
                    if (idx !== undefined && row.items[idx]) {
                        return getStringValue(row.items[idx]);
                    }
                    return '';
                };

                return {
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
                    invId: getValue('inv_id'),
                    internalNote: getValue('internal_note'),
                    deletedAt: getValue('deleted_at'),
                    paymentMethod: getValue('payment_method') || 'card',
                    companyName: getValue('company_name'),
                    companyInn: getValue('company_inn'),
                    companyKpp: getValue('company_kpp'),
                    companyAddress: getValue('company_address'),
                    totalAmount: getValue('total_amount'),
                    selectedFeatures: getValue('selected_features'),
                    prepaymentConfirmedAt: getValue('prepayment_confirmed_at'),
                    remainingInvoiceSentAt: getValue('remaining_invoice_sent_at'),
                    remainingConfirmedAt: getValue('remaining_confirmed_at'),
                };
            }).filter(Boolean);
        }
    });

    return orders;
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

async function handleAdditionalInvoice(data, headers) {
    const { orderId, amount, description } = data;

    if (!orderId || !amount) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ success: false, message: 'Требуются orderId и amount' }),
        };
    }

    // Нормализуем ID: убираем префикс ORD_ и переводим в нижний регистр
    let normalizedOrderId = orderId;
    if (orderId.toUpperCase().startsWith('ORD_')) {
        normalizedOrderId = orderId.substring(4); // убираем 'ORD_'
    }
    normalizedOrderId = 'ord_' + normalizedOrderId.toLowerCase();

    console.log('Original orderId:', orderId);
    console.log('Normalized orderId:', normalizedOrderId);

    let order = null;
    try {
        order = await getOrderFromYdb(normalizedOrderId);
    } catch (error) {
        console.error('Error fetching order from YDB:', error.message);
    }

    if (!order) {
        return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ success: false, message: `Заказ не найден (искал: ${normalizedOrderId})` }),
        };
    }

    const numericAmount = parseFloat(amount) || 0;
    if (numericAmount <= 0) {
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ success: false, message: 'Сумма должна быть больше 0' }),
        };
    }

    const merchantLogin = process.env.ROBOKASSA_MERCHANT_LOGIN;
    const password1 = process.env.ROBOKASSA_PASSWORD1;
    const isTestMode = process.env.ROBOKASSA_TEST_MODE === 'true';

    if (!merchantLogin || !password1) {
        console.error('Robokassa not configured');
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ success: false, message: 'Сервис платежей не настроен' }),
        };
    }

    const invId = Date.now() % 1000000;
    // Создаём уникальный ID для дополнительного счёта с префиксом addinv_
    // Формат: addinv_{orderId без префикса ord_}_{timestamp}
    // Используем только латиницу и цифры для совместимости с Robokassa
    const orderIdSuffix = normalizedOrderId.replace('ord_', '');
    const timestamp = Date.now().toString(36); // base36 для компактности
    const addInvUniqueId = `addinv_${orderIdSuffix}_${timestamp}`;

    // Санитизируем описание для Robokassa:
    // - Русский текст OK, но переносы строк и скобки вызывают ошибку
    // - Заменяем \n на "; ", скобки на точки
    // - Ограничиваем до 100 символов
    const safeDescription = (description || 'Дополнительные услуги')
        .replace(/\r?\n/g, '; ')           // переносы -> точка с запятой
        .replace(/\)\s*/g, '. ')           // "1) " -> "1. "
        .replace(/\(\s*/g, '')             // убираем открывающие скобки
        .replace(/[<>\"\'\\]/g, '')        // убираем опасные символы
        .replace(/\s+/g, ' ')              // множественные пробелы -> один
        .trim()
        .substring(0, 100);

    const signatureString = `${merchantLogin}:${numericAmount}:${invId}:${password1}:shp_orderId=${addInvUniqueId}`;
    const signature = crypto.createHash('md5').update(signatureString).digest('hex');

    const baseUrl = 'https://auth.robokassa.ru/Merchant/Index.aspx';

    const params = new URLSearchParams({
        MerchantLogin: merchantLogin,
        OutSum: numericAmount.toString(),
        InvId: invId.toString(),
        Description: safeDescription,
        SignatureValue: signature,
        shp_orderId: addInvUniqueId,
        IsTest: isTestMode ? '1' : '0',
    });

    const paymentUrl = `${baseUrl}?${params.toString()}`;

    console.log('Additional invoice payment URL generated:');
    console.log('  MerchantLogin:', merchantLogin);
    console.log('  OutSum:', numericAmount);
    console.log('  InvId:', invId);
    console.log('  Description:', safeDescription);
    console.log('  shp_orderId:', addInvUniqueId);
    console.log('  IsTest:', isTestMode ? '1' : '0');
    console.log('  SignatureString:', signatureString);
    console.log('  Signature:', signature);
    console.log('  Full URL:', paymentUrl);

    // Сохраняем счёт в YDB сразу со статусом pending и реальным описанием
    try {
        await saveAdditionalInvoiceToYdb(addInvUniqueId, normalizedOrderId, description || 'Дополнительные услуги', numericAmount, 'pending');
        console.log('Additional invoice saved to YDB with pending status');
    } catch (saveError) {
        console.error('Error saving additional invoice to YDB:', saveError.message);
        // Продолжаем даже если сохранение не удалось
    }

    try {
        await sendTelegramNotification(`📄 Выставлен дополнительный счет!
👤 Клиент: ${order.clientName}
📧 Email: ${order.clientEmail}
💰 Сумма: ${numericAmount} ₽
📝 Описание: ${description || 'Разработка сайта'}
📋 Заказ: ${orderId}

🔗 Ссылка для оплаты:
${paymentUrl}`);
    } catch (notifyError) {
        console.error('Failed to send Telegram notification:', notifyError.message);
    }

    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
            success: true,
            message: 'Счет выставлен успешно',
            orderId: normalizedOrderId,
            originalOrderId: orderId,
            amount: numericAmount.toString(),
            paymentUrl,
        }),
    };
}

// ============ Bank Invoice for Legal Entities ============

async function handleBankInvoice(data, headers) {
    try {
        const { 
            clientName, clientEmail, clientPhone, 
            projectType, projectDescription, amount,
            companyName, companyInn, companyKpp, companyAddress,
            selectedFeatures, totalAmount
        } = data;

        // Валидация
        if (!clientName || !clientEmail || !companyName || !companyInn) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ 
                    success: false, 
                    message: 'Не заполнены обязательные поля (имя, email, название компании, ИНН)' 
                }),
            };
        }

        // Проверяем банковские реквизиты
        const bankName = process.env.BANK_NAME;
        const bankBik = process.env.BANK_BIK;
        const bankAccount = process.env.BANK_ACCOUNT;

        if (!bankName || !bankBik || !bankAccount) {
            console.error('Bank credentials not configured');
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ 
                    success: false, 
                    message: 'Банковские реквизиты не настроены. Свяжитесь с администратором.' 
                }),
            };
        }

        // Создаём заказ в YDB
        const orderId = await createOrderInYdb({
            clientName,
            clientEmail,
            clientPhone: clientPhone || '',
            projectType: projectType || 'landing',
            projectDescription: projectDescription || 'Разработка сайта',
            amount: amount || '0',
            totalAmount: totalAmount || amount || '0',
            selectedFeatures: selectedFeatures || '',
            status: 'pending_bank_payment',
            paymentMethod: 'invoice',
            companyName,
            companyInn,
            companyKpp: companyKpp || '',
            companyAddress: companyAddress || '',
        });

        // Получаем номер счёта (используем timestamp + random для уникальности)
        const invoiceNumber = Date.now().toString().slice(-8);

        // Генерируем PDF счёта
        const pdfBuffer = await generateBankInvoicePDF({
            invoiceNumber,
            orderId,
            clientName,
            clientEmail,
            clientPhone,
            companyName,
            companyInn,
            companyKpp,
            companyAddress,
            projectType,
            projectDescription,
            amount: parseFloat(amount) || 0,
            bankName,
            bankBik,
            bankAccount,
            bankCorrAccount: process.env.BANK_CORR_ACCOUNT || '',
        });

        // Отправляем email со счётом
        await sendBankInvoiceEmail({
            clientName,
            clientEmail,
            companyName,
            orderId,
            invoiceNumber,
            amount: parseFloat(amount) || 0,
        }, pdfBuffer);

        // Уведомляем в Telegram
        await sendTelegramNotification(`🏢 Новый заказ с оплатой по счёту!

👤 Контактное лицо: ${clientName}
📧 Email: ${clientEmail}
📱 Телефон: ${clientPhone || 'не указан'}

🏛️ Компания: ${companyName}
🔢 ИНН: ${companyInn}
${companyKpp ? `КПП: ${companyKpp}` : ''}

📋 Проект: ${getProjectTypeName(projectType)}
💰 Сумма: ${new Intl.NumberFormat('ru-RU').format(parseFloat(amount) || 0)} ₽
📄 Счёт №${invoiceNumber} отправлен на email

🆔 ID заказа: ${orderId}`);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                message: 'Счёт создан и отправлен на email',
                orderId,
                invoiceNumber,
            }),
        };

    } catch (error) {
        console.error('Error creating bank invoice:', error.message, error.stack);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                success: false, 
                message: 'Ошибка создания счёта: ' + error.message 
            }),
        };
    }
}

// ============ Confirm Bank Payment ============

async function handleConfirmBankPayment(data, headers) {
    try {
        const { orderId, paymentType } = data; // paymentType: 'prepayment' | 'remaining'

        if (!orderId) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ success: false, message: 'orderId обязателен' }),
            };
        }

        const order = await getOrderFromYdb(orderId);
        if (!order) {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ success: false, message: 'Заказ не найден' }),
            };
        }

        const driver = await getYdbDriver();
        const now = new Date().toISOString();
        let newStatus = order.status;
        let updateField = '';

        if (paymentType === 'prepayment') {
            newStatus = 'in_progress';
        } else if (paymentType === 'remaining') {
            newStatus = 'completed';
        }

        await driver.tableClient.withSession(async (session) => {
            const queryText = paymentType === 'prepayment' 
                ? `DECLARE $id AS Utf8;
                   DECLARE $status AS Utf8;
                   DECLARE $prepayment_confirmed_at AS Utf8;
                   UPDATE orders SET status = $status, prepayment_confirmed_at = $prepayment_confirmed_at WHERE id = $id;`
                : `DECLARE $id AS Utf8;
                   DECLARE $status AS Utf8;
                   DECLARE $remaining_confirmed_at AS Utf8;
                   DECLARE $paid_at AS Utf8;
                   UPDATE orders SET status = $status, remaining_confirmed_at = $remaining_confirmed_at, paid_at = $paid_at WHERE id = $id;`;

            const preparedQuery = await session.prepareQuery(queryText);

            const params = paymentType === 'prepayment'
                ? {
                    '$id': TypedValues.utf8(orderId),
                    '$status': TypedValues.utf8(newStatus),
                    '$prepayment_confirmed_at': TypedValues.utf8(now),
                }
                : {
                    '$id': TypedValues.utf8(orderId),
                    '$status': TypedValues.utf8(newStatus),
                    '$remaining_confirmed_at': TypedValues.utf8(now),
                    '$paid_at': TypedValues.utf8(now),
                };

            await session.executeQuery(preparedQuery, params);
        });

        // Уведомление в Telegram
        const paymentTypeText = paymentType === 'prepayment' ? 'предоплаты' : 'остатка';
        await sendTelegramNotification(`✅ Подтверждена оплата ${paymentTypeText}!

🆔 Заказ: ${orderId}
👤 Клиент: ${order.clientName}
🏛️ Компания: ${order.companyName || 'Физлицо'}
💰 Статус: ${newStatus === 'in_progress' ? 'В работе' : 'Завершён'}`);

        // Если это оплата остатка — генерируем Акт
        if (paymentType === 'remaining') {
            try {
                const actPdf = await generateCompletionActPDF(order);
                await sendCompletionActEmail(order, actPdf);
            } catch (actError) {
                console.error('Error generating act:', actError.message);
            }
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                message: `Оплата ${paymentTypeText} подтверждена`,
                newStatus,
            }),
        };

    } catch (error) {
        console.error('Error confirming bank payment:', error.message);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ success: false, message: error.message }),
        };
    }
}

// ============ Calculator Order ============

async function handleCalculatorOrder(body, headers) {
    try {
        const { name, phone, email, projectType, selectedFeatures, basePrice, totalPrice, description } = body;

        console.log("Calculator order request received");

        if (!name || !phone || !email || !projectType || !description) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ success: false, message: "Заполните все обязательные поля" }),
            };
        }

        if (!basePrice || !totalPrice) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ success: false, message: "Ошибка расчёта стоимости" }),
            };
        }

        const projectTypeLabel = projectType === "bizcard" ? "Сайт-визитка" : projectType === "landing" ? "Лендинг" : projectType === "corporate" ? "Корпоративный сайт" : "Интернет-магазин";

        let msg = "🎯 НОВЫЙ ЗАКАЗ ИЗ КАЛЬКУЛЯТОРА\n\n" + "📋 Проект:\n" + "• База: " + projectTypeLabel + "\n" + "• Стоимость базы: " + basePrice + " руб\n";

        if (selectedFeatures && selectedFeatures.length > 0) {
            msg += "\n📋 Выбранные опции:\n";
            for (let i = 0; i < selectedFeatures.length; i++) {
                msg += (i + 1) + ". " + selectedFeatures[i] + "\n";
            }
        }

        msg += "\n💰 Итого: " + totalPrice + " руб\n\n👤 Контакты:\n• Имя: " + name + "\n• Телефон: " + phone + "\n• Email: " + email + "\n\n📝 Описание:\n" + description;

        await sendTelegramNotification(msg);

        console.log("Calculator order sent successfully");
        return {
            statusCode: 201,
            headers,
            body: JSON.stringify({ success: true, message: "Заказ успешно отправлен" }),
        };
    } catch (error) {
        console.error("Error sending calculator order:", error.message);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ success: false, message: "Внутренняя ошибка сервера" }),
        };
    }
}

// ============ Bank Invoice Remaining (for legal entities) ============

async function handleBankInvoiceRemaining(data, headers) {
    try {
        const { orderId } = data;

        if (!orderId) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ success: false, message: 'orderId обязателен' }),
            };
        }

        const order = await getOrderFromYdb(orderId);
        if (!order) {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ success: false, message: 'Заказ не найден' }),
            };
        }

        if (order.paymentMethod !== 'invoice') {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ success: false, message: 'Заказ не с оплатой по счёту' }),
            };
        }

        // Сумма остатка = предоплата (50%)
        const remainingAmount = parseFloat(order.amount) || 0;
        const invoiceNumber = Date.now().toString().slice(-8);

        // Генерируем PDF счёта на остаток
        const pdfBuffer = await generateBankInvoicePDF({
            invoiceNumber,
            orderId,
            clientName: order.clientName,
            clientEmail: order.clientEmail,
            clientPhone: order.clientPhone,
            companyName: order.companyName,
            companyInn: order.companyInn,
            companyKpp: order.companyKpp,
            companyAddress: order.companyAddress,
            projectType: order.projectType,
            projectDescription: 'Оплата остатка за разработку сайта',
            amount: remainingAmount,
            bankName: process.env.BANK_NAME,
            bankBik: process.env.BANK_BIK,
            bankAccount: process.env.BANK_ACCOUNT,
            bankCorrAccount: process.env.BANK_CORR_ACCOUNT || '',
        });

        // Отправляем email
        await sendBankInvoiceEmail({
            clientName: order.clientName,
            clientEmail: order.clientEmail,
            companyName: order.companyName,
            orderId,
            invoiceNumber,
            amount: remainingAmount,
            isRemaining: true,
        }, pdfBuffer);

        // Уведомление в Telegram
        await sendTelegramNotification(`📄 Выставлен счёт на ОСТАТОК!

🆔 Заказ: ${orderId}
👤 Клиент: ${order.clientName}
🏛️ Компания: ${order.companyName}
💰 Сумма: ${new Intl.NumberFormat('ru-RU').format(remainingAmount)} ₽
📄 Счёт №${invoiceNumber} отправлен на email`);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                message: 'Счёт на остаток отправлен',
                invoiceNumber,
            }),
        };

    } catch (error) {
        console.error('Error creating remaining invoice:', error.message);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ success: false, message: error.message }),
        };
    }
}

// ============ Bank Invoice Addon (for legal entities) ============

async function handleBankInvoiceAddon(data, headers) {
    try {
        const { orderId, description, amount } = data;

        if (!orderId || !description || !amount) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ success: false, message: 'orderId, description и amount обязательны' }),
            };
        }

        const order = await getOrderFromYdb(orderId);
        if (!order) {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({ success: false, message: 'Заказ не найден' }),
            };
        }

        if (order.paymentMethod !== 'invoice') {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ success: false, message: 'Заказ не с оплатой по счёту' }),
            };
        }

        const numericAmount = parseFloat(amount) || 0;
        const invoiceNumber = Date.now().toString().slice(-8);

        // Сохраняем доп. счёт в YDB
        const driver = await getYdbDriver();
        const invoiceId = 'addinv_' + generateOrderId().slice(4);
        const now = new Date().toISOString();

        await driver.tableClient.withSession(async (session) => {
            const queryText = `
                DECLARE $id AS Utf8;
                DECLARE $order_id AS Utf8;
                DECLARE $description AS Utf8;
                DECLARE $amount AS Utf8;
                DECLARE $status AS Utf8;
                DECLARE $invoice_number AS Utf8;
                DECLARE $payment_method AS Utf8;
                DECLARE $created_at AS Utf8;

                UPSERT INTO additional_invoices (id, order_id, description, amount, status, invoice_number, payment_method, created_at)
                VALUES ($id, $order_id, $description, $amount, $status, $invoice_number, $payment_method, $created_at);
            `;

            const preparedQuery = await session.prepareQuery(queryText);

            await session.executeQuery(preparedQuery, {
                '$id': TypedValues.utf8(invoiceId),
                '$order_id': TypedValues.utf8(orderId),
                '$description': TypedValues.utf8(description),
                '$amount': TypedValues.utf8(numericAmount.toString()),
                '$status': TypedValues.utf8('pending'),
                '$invoice_number': TypedValues.utf8(invoiceNumber),
                '$payment_method': TypedValues.utf8('invoice'),
                '$created_at': TypedValues.utf8(now),
            });
        });

        // Генерируем PDF счёта
        const pdfBuffer = await generateBankInvoicePDF({
            invoiceNumber,
            orderId,
            clientName: order.clientName,
            clientEmail: order.clientEmail,
            clientPhone: order.clientPhone,
            companyName: order.companyName,
            companyInn: order.companyInn,
            companyKpp: order.companyKpp,
            companyAddress: order.companyAddress,
            projectType: order.projectType,
            projectDescription: description,
            amount: numericAmount,
            bankName: process.env.BANK_NAME,
            bankBik: process.env.BANK_BIK,
            bankAccount: process.env.BANK_ACCOUNT,
            bankCorrAccount: process.env.BANK_CORR_ACCOUNT || '',
        });

        // Отправляем email
        await sendBankInvoiceEmail({
            clientName: order.clientName,
            clientEmail: order.clientEmail,
            companyName: order.companyName,
            orderId,
            invoiceNumber,
            amount: numericAmount,
            isAddon: true,
            addonDescription: description,
        }, pdfBuffer);

        // Уведомление в Telegram
        await sendTelegramNotification(`📄 Выставлен ДОП. СЧЁТ!

🆔 Заказ: ${orderId}
👤 Клиент: ${order.clientName}
🏛️ Компания: ${order.companyName}
📝 Описание: ${description}
💰 Сумма: ${new Intl.NumberFormat('ru-RU').format(numericAmount)} ₽
📄 Счёт №${invoiceNumber} отправлен на email`);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                message: 'Дополнительный счёт отправлен',
                invoiceId,
                invoiceNumber,
            }),
        };

    } catch (error) {
        console.error('Error creating addon invoice:', error.message);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ success: false, message: error.message }),
        };
    }
}

// Admin Authentication with HMAC-signed tokens
const ADMIN_TOKEN_SECRET = process.env.ADMIN_TOKEN_SECRET || 'mp-webstudio-admin-secret-2024';
const TOKEN_EXPIRY_HOURS = 24;

function generateAdminToken() {
    const now = Date.now();
    const expiry = now + (TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);
    const payload = JSON.stringify({ exp: expiry, iat: now, role: 'admin' });
    const payloadBase64 = Buffer.from(payload).toString('base64url');
    const signature = crypto.createHmac('sha256', ADMIN_TOKEN_SECRET)
        .update(payloadBase64)
        .digest('base64url');
    return `${payloadBase64}.${signature}`;
}

function verifyAdminToken(token) {
    if (!token || typeof token !== 'string') return false;

    const parts = token.split('.');
    if (parts.length !== 2) return false;

    const [payloadBase64, signature] = parts;

    // Verify signature
    const expectedSignature = crypto.createHmac('sha256', ADMIN_TOKEN_SECRET)
        .update(payloadBase64)
        .digest('base64url');

    if (signature !== expectedSignature) return false;

    // Verify expiry
    try {
        const payload = JSON.parse(Buffer.from(payloadBase64, 'base64url').toString());
        if (payload.exp < Date.now()) return false;
        return true;
    } catch {
        return false;
    }
}

async function handleAdminLogin(data, headers) {
    const { email, password } = data;

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
        console.error('ADMIN_EMAIL or ADMIN_PASSWORD not configured');
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ success: false, message: 'Admin not configured' }),
        };
    }

    // Constant-time comparison to prevent timing attacks
    const safeCompare = (a, b) => {
        if (!a || !b) return false;
        const bufA = Buffer.from(a);
        const bufB = Buffer.from(b);
        if (bufA.length !== bufB.length) return false;
        return crypto.timingSafeEqual(bufA, bufB);
    };

    const emailMatch = safeCompare(email?.toLowerCase(), adminEmail?.toLowerCase());
    const passwordMatch = safeCompare(password, adminPassword);

    if (emailMatch && passwordMatch) {
        const token = generateAdminToken();
        console.log('Admin login successful');

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true, token }),
        };
    }

    console.log('Admin login failed - invalid credentials');
    return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ success: false, message: 'Invalid credentials' }),
    };
}

async function handleVerifyAdmin(data, headers) {
    const { token } = data;
    const valid = verifyAdminToken(token);

    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ valid }),
    };
}

async function generateBankInvoicePDF(data) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        const doc = new PDFDocument({ size: 'A4', margin: 40 });

        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        const path = require('path');
        doc.registerFont('Roboto', path.join(__dirname, 'Roboto-Regular.ttf'));
        doc.registerFont('Roboto-Bold', path.join(__dirname, 'Roboto-Bold.ttf'));

        const formatPrice = (price) => new Intl.NumberFormat('ru-RU').format(price);
        const date = new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });

        // Заголовок
        doc.fontSize(16).font('Roboto-Bold').text(`СЧЁТ НА ОПЛАТУ № ${data.invoiceNumber}`, { align: 'center' });
        doc.fontSize(10).font('Roboto').text(`от ${date}`, { align: 'center' });
        doc.moveDown(1.5);

        // Блок получателя
        doc.fontSize(11).font('Roboto-Bold').text('ПОЛУЧАТЕЛЬ:');
        doc.moveDown(0.3);
        doc.fontSize(10).font('Roboto');
        doc.text('Пимашин Михаил Игоревич');
        doc.text('Самозанятый (НПД)');
        doc.text(`ИНН: 711612442203`);
        doc.text(`Адрес: 301766, Тульская обл., г. Донской, ул. Новая, 49`);
        doc.moveDown(0.5);

        // Банковские реквизиты
        doc.font('Roboto-Bold').text('Банковские реквизиты:');
        doc.font('Roboto');
        doc.text(`Банк: ${data.bankName}`);
        doc.text(`БИК: ${data.bankBik}`);
        doc.text(`Расчётный счёт: ${data.bankAccount}`);
        if (data.bankCorrAccount) {
            doc.text(`Корр. счёт: ${data.bankCorrAccount}`);
        }
        doc.moveDown(1);

        // Блок плательщика
        doc.font('Roboto-Bold').text('ПЛАТЕЛЬЩИК:');
        doc.moveDown(0.3);
        doc.font('Roboto');
        doc.text(data.companyName);
        doc.text(`ИНН: ${data.companyInn}${data.companyKpp ? `, КПП: ${data.companyKpp}` : ''}`);
        if (data.companyAddress) {
            doc.text(`Адрес: ${data.companyAddress}`);
        }
        doc.text(`Контактное лицо: ${data.clientName}`);
        doc.text(`Email: ${data.clientEmail}${data.clientPhone ? `, Тел: ${data.clientPhone}` : ''}`);
        doc.moveDown(1.5);

        // Таблица услуг
        const tableTop = doc.y;
        const col1 = 40;
        const col2 = 350;
        const col3 = 420;
        const col4 = 490;

        // Заголовок таблицы
        doc.font('Roboto-Bold').fontSize(9);
        doc.rect(col1, tableTop, 475, 20).stroke();
        doc.text('Наименование услуги', col1 + 5, tableTop + 6);
        doc.text('Кол-во', col2 + 5, tableTop + 6);
        doc.text('Цена', col3 + 5, tableTop + 6);
        doc.text('Сумма', col4 + 5, tableTop + 6);

        // Строка услуги
        const row1Top = tableTop + 20;
        const projectLabel = getProjectTypeName(data.projectType);
        const serviceName = `Разработка: ${projectLabel}${data.projectDescription ? ' (' + data.projectDescription.substring(0, 50) + ')' : ''}`;

        doc.font('Roboto').fontSize(9);
        doc.rect(col1, row1Top, 475, 25).stroke();
        doc.text(serviceName, col1 + 5, row1Top + 8, { width: 300 });
        doc.text('1', col2 + 15, row1Top + 8);
        doc.text(`${formatPrice(data.amount)} ₽`, col3 + 5, row1Top + 8);
        doc.text(`${formatPrice(data.amount)} ₽`, col4 + 5, row1Top + 8);
        doc.moveDown(3);

        // Итого (с указанием ширины для правильного выравнивания)
        const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
        doc.fontSize(12).font('Roboto-Bold');
        doc.text(`ИТОГО: ${formatPrice(data.amount)} руб. 00 коп.`, doc.page.margins.left, doc.y, { width: pageWidth, align: 'right' });
        doc.moveDown(0.5);
        doc.fontSize(9).font('Roboto');
        doc.text('НДС не облагается (самозанятый, п. 8 ст. 2 ФЗ от 27.11.2018 N 422-ФЗ)', doc.page.margins.left, doc.y, { width: pageWidth, align: 'right' });
        doc.moveDown(1.5);

        // Сумма прописью
        const amountWords = numberToWords(data.amount);
        doc.font('Roboto-Bold').fontSize(10);
        doc.text(`Всего к оплате: ${amountWords}`, doc.page.margins.left, doc.y, { width: pageWidth });
        doc.moveDown(1.5);

        // Примечания
        doc.fontSize(9).font('Roboto');
        doc.text('Оплата данного счёта означает согласие с условиями публичной оферты, размещённой на сайте mp-webstudio.ru/offer', doc.page.margins.left, doc.y, { width: pageWidth });
        doc.moveDown(0.5);
        doc.text('Счёт действителен в течение 5 банковских дней.', doc.page.margins.left, doc.y, { width: pageWidth });
        doc.moveDown(2);

        // Подпись
        doc.font('Roboto-Bold').text('Исполнитель:', doc.page.margins.left, doc.y);
        doc.moveDown(0.5);
        doc.font('Roboto').text('Пимашин М.И. ________________', doc.page.margins.left, doc.y);
        doc.moveDown(2);

        // Футер
        doc.fontSize(8).text('Пимашин М.И. | MP.WebStudio | ИНН 711612442203 | mp-webstudio.ru', doc.page.margins.left, doc.y, { width: pageWidth, align: 'center' });

        doc.end();
    });
}

// Функция для преобразования числа в слова (упрощённая версия)
function numberToWords(num) {
    const ones = ['', 'один', 'два', 'три', 'четыре', 'пять', 'шесть', 'семь', 'восемь', 'девять', 
                  'десять', 'одиннадцать', 'двенадцать', 'тринадцать', 'четырнадцать', 'пятнадцать',
                  'шестнадцать', 'семнадцать', 'восемнадцать', 'девятнадцать'];
    const tens = ['', '', 'двадцать', 'тридцать', 'сорок', 'пятьдесят', 'шестьдесят', 'семьдесят', 'восемьдесят', 'девяносто'];
    const hundreds = ['', 'сто', 'двести', 'триста', 'четыреста', 'пятьсот', 'шестьсот', 'семьсот', 'восемьсот', 'девятьсот'];
    const thousands = ['', 'одна тысяча', 'две тысячи', 'три тысячи', 'четыре тысячи', 'пять тысяч', 
                       'шесть тысяч', 'семь тысяч', 'восемь тысяч', 'девять тысяч'];

    const n = Math.floor(num);
    if (n === 0) return 'ноль рублей 00 копеек';

    let result = '';

    // Тысячи
    const th = Math.floor(n / 1000);
    if (th > 0 && th < 10) {
        result += thousands[th] + ' ';
    } else if (th >= 10 && th < 20) {
        result += ones[th] + ' тысяч ';
    } else if (th >= 20) {
        const thTens = Math.floor(th / 10);
        const thOnes = th % 10;
        result += tens[thTens] + ' ';
        if (thOnes > 0) {
            if (thOnes === 1) result += 'одна тысяча ';
            else if (thOnes >= 2 && thOnes <= 4) result += ones[thOnes].replace('два', 'две') + ' тысячи ';
            else result += ones[thOnes] + ' тысяч ';
        } else {
            result += 'тысяч ';
        }
    }

    // Сотни
    const remainder = n % 1000;
    const h = Math.floor(remainder / 100);
    if (h > 0) result += hundreds[h] + ' ';

    // Десятки и единицы
    const t = remainder % 100;
    if (t < 20) {
        result += ones[t] + ' ';
    } else {
        result += tens[Math.floor(t / 10)] + ' ';
        if (t % 10 > 0) result += ones[t % 10] + ' ';
    }

    // Склонение "рублей"
    const lastTwo = n % 100;
    const lastOne = n % 10;
    let rubles = 'рублей';
    if (lastTwo >= 11 && lastTwo <= 19) rubles = 'рублей';
    else if (lastOne === 1) rubles = 'рубль';
    else if (lastOne >= 2 && lastOne <= 4) rubles = 'рубля';

    return result.trim() + ' ' + rubles + ' 00 копеек';
}

async function sendBankInvoiceEmail(orderData, pdfBuffer) {
    const formatPrice = (price) => new Intl.NumberFormat('ru-RU').format(price);

    let invoiceType = 'Счёт на оплату (предоплата)';
    let actionText = 'После оплаты, пожалуйста, сообщите нам — мы начнём работу над вашим проектом.';

    if (orderData.isRemaining) {
        invoiceType = 'Счёт на остаток оплаты';
        actionText = 'Проект завершён. После оплаты остатка вы получите Акт выполненных работ.';
    } else if (orderData.isAddon) {
        invoiceType = 'Дополнительный счёт';
        actionText = `Услуга: ${orderData.addonDescription || 'Дополнительные работы'}`;
    }

    const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #0891b2;">${invoiceType}</h2>
        <p>Здравствуйте, ${orderData.clientName}!</p>
        <p>Счёт на оплату для <strong>${orderData.companyName}</strong> прикреплён к этому письму.</p>

        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Счёт №:</strong> ${orderData.invoiceNumber}</p>
            <p style="margin: 5px 0;"><strong>Сумма:</strong> ${formatPrice(orderData.amount)} ₽</p>
            <p style="margin: 5px 0;"><strong>ID заказа:</strong> ${orderData.orderId}</p>
        </div>

        <p>${actionText}</p>

        <p style="margin-top: 30px; color: #6b7280;">С уважением,<br><strong>MP.WebStudio</strong><br>
        Телефон: +7 (953) 181-41-36<br>
        <a href="https://mp-webstudio.ru">mp-webstudio.ru</a></p>
    </body>
    </html>`;

    // Yandex Cloud Postbox через AWS SES-совместимый API
    const postboxAccessKey = process.env.POSTBOX_ACCESS_KEY_ID;
    const postboxSecretKey = process.env.POSTBOX_SECRET_ACCESS_KEY;
    const postboxFromEmail = process.env.POSTBOX_FROM_EMAIL;

    if (postboxAccessKey && postboxSecretKey && postboxFromEmail) {
        console.log('Sending bank invoice email via Yandex Cloud Postbox, to:', orderData.clientEmail);

        const sesClient = new SESv2Client({
            region: 'ru-central1',
            endpoint: 'https://postbox.cloud.yandex.net',
            credentials: {
                accessKeyId: postboxAccessKey,
                secretAccessKey: postboxSecretKey,
            },
        });

        const wrapBase64 = (base64) => base64.match(/.{1,76}/g).join('\r\n');

        const boundary = '----=_Part_' + Date.now().toString(36);
        const pdfBase64 = wrapBase64(pdfBuffer.toString('base64'));
        const htmlBase64 = wrapBase64(Buffer.from(emailHtml).toString('base64'));

        let subjectText = `Счёт на оплату №${orderData.invoiceNumber} - MP.WebStudio`;
        if (orderData.isRemaining) {
            subjectText = `Счёт на остаток №${orderData.invoiceNumber} - MP.WebStudio`;
        } else if (orderData.isAddon) {
            subjectText = `Дополнительный счёт №${orderData.invoiceNumber} - MP.WebStudio`;
        }
        const fileName = `Invoice_${orderData.invoiceNumber}.pdf`;

        const rawEmail = [
            `From: MP.WebStudio <${postboxFromEmail}>`,
            `To: ${orderData.clientEmail}`,
            `Subject: =?UTF-8?B?${Buffer.from(subjectText).toString('base64')}?=`,
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
            `Content-Type: application/pdf; name="${fileName}"`,
            'Content-Transfer-Encoding: base64',
            `Content-Disposition: attachment; filename="${fileName}"`,
            '',
            pdfBase64,
            '',
            `--${boundary}--`,
        ].join('\r\n');

        try {
            const command = new SendEmailCommand({
                FromEmailAddress: postboxFromEmail,
                Destination: {
                    ToAddresses: [orderData.clientEmail],
                },
                Content: {
                    Raw: {
                        Data: Buffer.from(rawEmail),
                    },
                },
            });

            const response = await sesClient.send(command);
            console.log('Bank invoice email sent via Yandex Cloud Postbox, MessageId:', response.MessageId);
            return;
        } catch (error) {
            console.error('Postbox error sending bank invoice:', error.message);
            throw new Error(`Email error: ${error.message}`);
        }
    }

    // Fallback на SMTP (если Postbox не настроен)
    const smtpEmail = process.env.SMTP_EMAIL;
    const smtpPassword = process.env.SMTP_PASSWORD;

    if (!smtpEmail || !smtpPassword) {
        console.log('No email service configured, skipping bank invoice email');
        return;
    }

    const transporter = nodemailer.createTransport({
        host: 'smtp.yandex.ru',
        port: 465,
        secure: true,
        auth: { user: smtpEmail, pass: smtpPassword },
    });

    await transporter.sendMail({
        from: `"MP.WebStudio" <${smtpEmail}>`,
        to: orderData.clientEmail,
        subject: `Счёт на оплату №${orderData.invoiceNumber} - MP.WebStudio`,
        html: emailHtml,
        attachments: [{
            filename: `Invoice_${orderData.invoiceNumber}.pdf`,
            content: pdfBuffer,
        }],
    });

    console.log('Bank invoice email sent via SMTP to:', orderData.clientEmail);
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
        const totalAmount = amount * 2;
        const prepayment = amount;
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

        doc.fontSize(10).font('Roboto-Bold').text('ИСПОЛНИТЕЛЬ:');
        doc.font('Roboto').text('Пимашин Михаил Игоревич');
        doc.text('Самозанятый (НПД), ИНН: 711612442203');
        doc.text('Адрес: 301766, Тульская обл., г. Донской, ул. Новая, 49');
        doc.text('Телефон: +7 (953) 181-41-36, Email: mpwebstudio1@gmail.com');
        doc.moveDown(0.5);

        doc.font('Roboto-Bold').text('ЗАКАЗЧИК:');
        if (order.paymentMethod === 'invoice' && order.companyName) {
            doc.font('Roboto').text(order.companyName);
            doc.text(`ИНН: ${order.companyInn || '-'}`);
            if (order.companyKpp) doc.text(`КПП: ${order.companyKpp}`);
            if (order.companyAddress) doc.text(`Адрес: ${order.companyAddress}`);
            doc.text(`Контактное лицо: ${order.clientName || 'Не указано'}`);
        } else {
            doc.font('Roboto').text(order.clientName || 'Клиент');
        }
        if (order.clientPhone) doc.text(`Телефон: ${order.clientPhone}`);
        if (order.clientEmail) doc.text(`Email: ${order.clientEmail}`);
        doc.moveDown(1);

        doc.text('совместно именуемые "Стороны", заключили настоящий Договор:');
        doc.moveDown(1);

        doc.font('Roboto-Bold').text('1. ПРЕДМЕТ ДОГОВОРА');
        doc.font('Roboto').text(`1.1. Исполнитель обязуется оказать услуги по разработке: ${projectTypeLabel}`);
        doc.moveDown(1);

        doc.font('Roboto-Bold').text('2. СТОИМОСТЬ И ПОРЯДОК ОПЛАТЫ');
        doc.font('Roboto').text(`2.1. Стоимость услуг: ${formatPrice(totalAmount)} рублей`);
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

        doc.fontSize(9).text('Пимашин М.И. | MP.WebStudio | ИНН 711612442203 | mp-webstudio.ru', { align: 'center' });

        doc.end();
    });
}

async function generateCompletionActPDF(order, additionalInvoices = []) {
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

        // Расчет итоговой суммы: базовая + все оплаченные доп счеты
        let additionalAmount = 0;
        const paidAdditional = (additionalInvoices || []).filter(inv => inv.status === 'paid');
        paidAdditional.forEach(inv => {
            additionalAmount += parseFloat(inv.amount) || 0;
        });

        const totalAmount = amount * 2 + additionalAmount;
        const projectTypeLabel = getProjectTypeName(order.projectType);
        const date = new Date().toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        doc.fontSize(16).font('Roboto-Bold').text('АКТ ВЫПОЛНЕННЫХ РАБОТ', { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(10).font('Roboto').text(date, { align: 'center' });
        doc.moveDown(1.5);

        doc.fontSize(10).font('Roboto-Bold').text('ИСПОЛНИТЕЛЬ:');
        doc.font('Roboto').text('Пимашин Михаил Игоревич');
        doc.text('Самозанятый (НПД), ИНН: 711612442203');
        doc.text('Адрес: 301766, Тульская обл., г. Донской, ул. Новая, 49');
        doc.text('Телефон: +7 (953) 181-41-36, Email: mpwebstudio1@gmail.com');
        doc.moveDown(0.5);

        doc.font('Roboto-Bold').text('ЗАКАЗЧИК:');
        if (order.paymentMethod === 'invoice' && order.companyName) {
            doc.font('Roboto').text(order.companyName);
            doc.text(`ИНН: ${order.companyInn || '-'}`);
            if (order.companyKpp) doc.text(`КПП: ${order.companyKpp}`);
            if (order.companyAddress) doc.text(`Адрес: ${order.companyAddress}`);
            doc.text(`Контактное лицо: ${order.clientName || 'Не указано'}`);
        } else {
            doc.font('Roboto').text(order.clientName || 'Клиент');
        }
        if (order.clientPhone) doc.text(`Телефон: ${order.clientPhone}`);
        if (order.clientEmail) doc.text(`Email: ${order.clientEmail}`);
        doc.moveDown(1);

        doc.font('Roboto-Bold').text('1. ВЫПОЛНЕННЫЕ РАБОТЫ');
        doc.font('Roboto').text(`Разработка: ${projectTypeLabel}`);
        if (order.projectDescription) {
            doc.text(`Описание: ${order.projectDescription}`);
        }
        doc.moveDown(1);

        doc.font('Roboto-Bold').text('2. СТОИМОСТЬ РАБОТ');
        doc.font('Roboto').text(`Базовая стоимость: ${formatPrice(amount * 2)} рублей`);
        doc.text(`Предоплата (50%): ${formatPrice(amount)} руб. - ОПЛАЧЕНО`);
        doc.text(`Остаток (50%): ${formatPrice(amount)} руб. - ОПЛАЧЕНО`);

        // Раздел дополнительных работ
        if (paidAdditional.length > 0) {
            doc.moveDown(0.5);
            doc.font('Roboto-Bold').text('Дополнительные работы:');
            paidAdditional.forEach(inv => {
                doc.font('Roboto').text(`• ${inv.description} - ${formatPrice(inv.amount)} руб. - ОПЛАЧЕНО`);
            });
        }

        doc.moveDown(0.5);
        doc.font('Roboto-Bold').text(`ИТОГО: ${formatPrice(totalAmount)} рублей`);
        doc.font('Roboto').text('НДС не облагается (п. 8 ст. 2 ФЗ от 27.11.2018 N 422-ФЗ)');
        doc.moveDown(1);

        doc.font('Roboto-Bold').text('3. ПЕРЕДАЧА ПРАВ');
        doc.font('Roboto').text('3.1. Все исключительные права на созданный сайт полностью переходят к Заказчику.');
        doc.text('3.2. Исполнитель передаёт Заказчику все материалы и доступы к сайту.');
        doc.text('3.3. Заказчик подтверждает получение всех необходимых доступов.');
        doc.moveDown(1);

        doc.font('Roboto-Bold').text('4. ГАРАНТИЙНЫЕ ОБЯЗАТЕЛЬСТВА');
        doc.font('Roboto').text('4.1. Гарантийный период: 14 календарных дней с момента подписания акта.');
        doc.text('4.2. В течение гарантийного периода Исполнитель бесплатно устраняет технические ошибки.');
        doc.text('4.3. Гарантия не распространяется на изменения, внесённые Заказчиком или третьими лицами.');
        doc.moveDown(1);

        doc.font('Roboto-Bold').text('5. ПОДТВЕРЖДЕНИЕ');
        doc.font('Roboto').text('Стороны подтверждают, что:');
        doc.text('- Работы выполнены в полном объёме и в согласованные сроки');
        doc.text('- Заказчик принимает результат работ без претензий');
        doc.text('- Оплата произведена полностью');
        doc.moveDown(1);

        doc.font('Roboto-Bold').text('ДАННЫЕ ДОСТУПА К САЙТУ');
        doc.font('Roboto').text('Данные доступа к панели управления сайтом отправлены вам');
        doc.text('отдельным защищённым сообщением на указанный email или телефон.');
        doc.moveDown(0.5);
        doc.text('Рекомендуем сменить пароли после получения доступов.', { oblique: true });
        doc.moveDown(1);

        doc.font('Roboto-Bold').text('АКЦЕПТ АКТА');
        doc.font('Roboto').text('Оплата остатка является подтверждением приёмки работ.');
        doc.text(`Дата акцепта: ${new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })}`);
        doc.text(`ID заказа: ${order.id}`);
        doc.moveDown(2);

        doc.fontSize(9).text('Пимашин М.И. | MP.WebStudio | ИНН 711612442203 | mp-webstudio.ru', { align: 'center' });
        doc.text('Спасибо за сотрудничество!', { align: 'center' });

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
    const totalAmount = amount * 2;
    const prepayment = amount;

    const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0891b2;">Спасибо за заказ!</h2>
            <p>Здравствуйте, ${order.clientName || 'Уважаемый клиент'}!</p>
            <p>Ваша предоплата успешно получена. Договор подписан.</p>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Детали заказа:</h3>
                <p><strong>Тип проекта:</strong> ${getProjectTypeName(order.projectType)}</p>
                <p><strong>Стоимость:</strong> ${formatPrice(totalAmount)} руб.</p>
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

async function sendCompletionActEmail(order, pdfBuffer) {
    const formatPrice = (price) => {
        const num = parseFloat(price) || 0;
        return new Intl.NumberFormat('ru-RU').format(num);
    };
    const amount = parseFloat(order.amount) || 0;
    const totalAmount = amount * 2;

    const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #10b981;">Проект завершён!</h2>
            <p>Здравствуйте, ${order.clientName || 'Уважаемый клиент'}!</p>
            <p>Поздравляем! Ваш проект полностью оплачен и передан вам.</p>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Итоги проекта:</h3>
                <p><strong>Тип проекта:</strong> ${getProjectTypeName(order.projectType)}</p>
                <p><strong>Полная стоимость:</strong> ${formatPrice(totalAmount)} руб.</p>
                <p><strong>Статус:</strong> <span style="color: #10b981;">Полностью оплачен</span></p>
                <p><strong>ID заказа:</strong> ${order.id}</p>
            </div>
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                <p style="margin: 0;"><strong>Данные доступа к сайту</strong> будут отправлены вам отдельным защищённым сообщением в ближайшее время.</p>
            </div>
            <p><strong>Акт выполненных работ</strong> прикреплён к письму в PDF.</p>
            <h3 style="margin-top: 30px;">Гарантия</h3>
            <p>В течение 14 дней мы бесплатно исправим любые технические ошибки.</p>
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                Спасибо за сотрудничество!<br>
                С уважением,<br>MP.WebStudio<br>
                <a href="https://mp-webstudio.ru">mp-webstudio.ru</a>
            </p>
        </div>
    `;

    const postboxAccessKey = process.env.POSTBOX_ACCESS_KEY_ID;
    const postboxSecretKey = process.env.POSTBOX_SECRET_ACCESS_KEY;
    const postboxFromEmail = process.env.POSTBOX_FROM_EMAIL;

    if (postboxAccessKey && postboxSecretKey && postboxFromEmail) {
        console.log('Sending completion act via Yandex Cloud Postbox');

        const sesClient = new SESv2Client({
            region: 'ru-central1',
            endpoint: 'https://postbox.cloud.yandex.net',
            credentials: {
                accessKeyId: postboxAccessKey,
                secretAccessKey: postboxSecretKey,
            },
        });

        const wrapBase64 = (base64) => base64.match(/.{1,76}/g).join('\r\n');
        const boundary = '----=_Part_' + Date.now().toString(36);
        const pdfBase64 = wrapBase64(pdfBuffer.toString('base64'));
        const htmlBase64 = wrapBase64(Buffer.from(emailHtml).toString('base64'));

        const rawEmail = [
            `From: MP.WebStudio <${postboxFromEmail}>`,
            `To: ${order.clientEmail}`,
            `Subject: =?UTF-8?B?${Buffer.from(`Акт выполненных работ - Заказ ${order.id}`).toString('base64')}?=`,
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
            `Content-Type: application/pdf; name="CompletionAct_${order.id}.pdf"`,
            'Content-Transfer-Encoding: base64',
            `Content-Disposition: attachment; filename="CompletionAct_${order.id}.pdf"`,
            '',
            pdfBase64,
            '',
            `--${boundary}--`,
        ].join('\r\n');

        try {
            const command = new SendEmailCommand({
                FromEmailAddress: postboxFromEmail,
                Destination: { ToAddresses: [order.clientEmail] },
                Content: { Raw: { Data: Buffer.from(rawEmail) } },
            });

            const response = await sesClient.send(command);
            console.log('Completion act sent via Postbox, MessageId:', response.MessageId);
            return;
        } catch (error) {
            console.error('Postbox error:', error.message);
            throw new Error(`Yandex Postbox error: ${error.message}`);
        }
    }

    const smtpEmail = process.env.SMTP_EMAIL;
    const smtpPassword = process.env.SMTP_PASSWORD;

    if (!smtpEmail || !smtpPassword) {
        console.log('No email service configured, skipping completion act email');
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
        subject: `Акт выполненных работ - Заказ ${order.id}`,
        html: emailHtml,
        attachments: [{
            filename: `Акт_${order.id}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf',
        }],
    };

    console.log('Sending completion act via SMTP to:', order.clientEmail);
    await transporter.sendMail(mailOptions);
    console.log('Completion act sent via SMTP');
}

async function sendAdditionalInvoiceEmail(order, amount, invoiceId) {
    const formatPrice = (price) => {
        const num = parseFloat(price) || 0;
        return new Intl.NumberFormat('ru-RU').format(num);
    };

    // Извлекаем описание из invoiceId если возможно (addinv_orderId_timestamp_desc)
    const parts = invoiceId.split('_');
    const description = parts.length >= 4 ? parts.slice(3).join('_') : 'Дополнительная услуга';

    const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #3b82f6;">Платёж получен!</h2>
            <p>Здравствуйте, ${order.clientName || 'Уважаемый клиент'}!</p>
            <p>Спасибо! Ваш платёж за дополнительную услугу успешно получен.</p>

            <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
                <h3 style="margin-top: 0; color: #1e40af;">Детали платежа</h3>
                <p><strong>Сумма:</strong> <span style="font-size: 18px; color: #10b981;">${formatPrice(amount)} ₽</span></p>
                <p><strong>Статус:</strong> <span style="color: #10b981;">Оплачено</span></p>
                <p><strong>ID заказа:</strong> ${order.id}</p>
            </div>

            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                <p style="margin: 0;">Полный акт выполненных работ с учётом всех дополнительных услуг будет отправлен после оплаты остатка основного заказа.</p>
            </div>

            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                С уважением,<br>MP.WebStudio<br>
                <a href="https://mp-webstudio.ru" style="color: #3b82f6;">mp-webstudio.ru</a>
            </p>
        </div>
    `;

    const postboxAccessKey = process.env.POSTBOX_ACCESS_KEY_ID;
    const postboxSecretKey = process.env.POSTBOX_SECRET_ACCESS_KEY;
    const postboxFromEmail = process.env.POSTBOX_FROM_EMAIL;

    if (postboxAccessKey && postboxSecretKey && postboxFromEmail) {
        console.log('Sending additional invoice email via Yandex Cloud Postbox');

        const sesClient = new SESv2Client({
            region: 'ru-central1',
            endpoint: 'https://postbox.cloud.yandex.net',
            credentials: {
                accessKeyId: postboxAccessKey,
                secretAccessKey: postboxSecretKey,
            },
        });

        try {
            const command = new SendEmailCommand({
                FromEmailAddress: postboxFromEmail,
                Destination: { ToAddresses: [order.clientEmail] },
                Content: {
                    Simple: {
                        Subject: { Data: `Платёж получен - Дополнительная услуга`, Charset: 'UTF-8' },
                        Body: { Html: { Data: emailHtml, Charset: 'UTF-8' } },
                    },
                },
            });

            const response = await sesClient.send(command);
            console.log('Additional invoice email sent via Postbox, MessageId:', response.MessageId);
            return;
        } catch (error) {
            console.error('Postbox error:', error.message);
            throw new Error(`Yandex Postbox error: ${error.message}`);
        }
    }

    const smtpEmail = process.env.SMTP_EMAIL;
    const smtpPassword = process.env.SMTP_PASSWORD;

    if (!smtpEmail || !smtpPassword) {
        console.log('No email service configured, skipping additional invoice email');
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
        subject: `Платёж получен - Дополнительная услуга`,
        html: emailHtml,
    };

    console.log('Sending additional invoice email via SMTP to:', order.clientEmail);
    await transporter.sendMail(mailOptions);
    console.log('Additional invoice email sent via SMTP');
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
    const projectTypes = {
        landing: 'Лендинг',
        corporate: 'Корпоративный сайт',
        shop: 'Интернет-магазин',
        webapp: 'Веб-приложение',
        redesign: 'Редизайн сайта',
        support: 'Техподдержка',
        other: 'Другое',
    };
    const projectTypeName = data.projectType ? (projectTypes[data.projectType] || data.projectType) : 'Не указан';
    return `📩 Новая заявка с сайта!\n\n👤 Имя: ${data.name}\n📞 Телефон: ${data.phone || 'Не указан'}\n📧 Email: ${data.email}\n📋 Тип проекта: ${projectTypeName}\n💰 Бюджет: ${data.budget || 'Не указан'}\n\n💬 Сообщение:\n${data.message}`;
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

// ============ Giga Chat gRPC Handler ============

// Корневой сертификат Russian Trusted Root CA (для валидации цепочки)
const SBERBANK_ROOT_CA = `-----BEGIN CERTIFICATE-----
MIIFwjCCA6qgAwIBAgICEAAwDQYJKoZIhvcNAQELBQAwcDELMAkGA1UEBhMCUlUx
PzA9BgNVBAoMNlRoZSBNaW5pc3RyeSBvZiBEaWdpdGFsIERldmVsb3BtZW50IGFu
ZCBDb21tdW5pY2F0aW9uczEgMB4GA1UEAwwXUnVzc2lhbiBUcnVzdGVkIFJvb3Qg
Q0EwHhcNMjIwMzAxMjEwNDE1WhcNMzIwMjI3MjEwNDE1WjBwMQswCQYDVQQGEwJS
VTE/MD0GA1UECgw2VGhlIE1pbmlzdHJ5IG9mIERpZ2l0YWwgRGV2ZWxvcG1lbnQg
YW5kIENvbW11bmljYXRpb25zMSAwHgYDVQQDDBdSdXNzaWFuIFRydXN0ZWQgUm9v
dCBDQTCCAiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoCggIBAMfFOZ8pUAL3+r2n
qqE0Zp52selXsKGFYoG0GM5bwz1bSFtCt+AZQMhkWQheI3poZAToYJu69pHLKS6Q
XBiwBC1cvzYmUYKMYZC7jE5YhEU2bSL0mX7NaMxMDmH2/NwuOVRj8OImVa5s1F4U
zn4Kv3PFlDBjjSjXKVY9kmjUBsXQrIHeaqmUIsPIlNWUnimXS0I0abExqkbdrXbX
YwCOXhOO2pDUx3ckmJlCMUGacUTnylyQW2VsJIyIGA8V0xzdaeUXg0VZ6ZmNUr5Y
Ber/EAOLPb8NYpsAhJe2mXjMB/J9HNsoFMBFJ0lLOT/+dQvjbdRZoOT8eqJpWnVD
U+QL/qEZnz57N88OWM3rabJkRNdU/Z7x5SFIM9FrqtN8xewsiBWBI0K6XFuOBOTD
4V08o4TzJ8+Ccq5XlCUW2L48pZNCYuBDfBh7FxkB7qDgGDiaftEkZZfApRg2E+M9
G8wkNKTPLDc4wH0FDTijhgxR3Y4PiS1HL2Zhw7bD3CbslmEGgfnnZojNkJtcLeBH
BLa52/dSwNU4WWLubaYSiAmA9IUMX1/RpfpxOxd4Ykmhz97oFbUaDJFipIggx5sX
ePAlkTdWnv+RWBxlJwMQ25oEHmRguNYf4Zr/Rxr9cS93Y+mdXIZaBEE0KS2iLRqa
OiWBki9IMQU4phqPOBAaG7A+eP8PAgMBAAGjZjBkMB0GA1UdDgQWBBTh0YHlzlpf
BKrS6badZrHF+qwshzAfBgNVHSMEGDAWgBTh0YHlzlpfBKrS6badZrHF+qwshzAS
BgNVHRMBAf8ECDAGAQH/AgEEMA4GA1UdDwEB/wQEAwIBhjANBgkqhkiG9w0BAQsF
AAOCAgEAALIY1wkilt/urfEVM5vKzr6utOeDWCUczmWX/RX4ljpRdgF+5fAIS4vH
tmXkqpSCOVeWUrJV9QvZn6L227ZwuE15cWi8DCDal3Ue90WgAJJZMfTshN4OI8cq
W9E4EG9wglbEtMnObHlms8F3CHmrw3k6KmUkWGoa+/ENmcVl68u/cMRl1JbW2bM+
/3A+SAg2c6iPDlehczKx2oa95QW0SkPPWGuNA/CE8CpyANIhu9XFrj3RQ3EqeRcS
AQQod1RNuHpfETLU/A2gMmvn/w/sx7TB3W5BPs6rprOA37tutPq9u6FTZOcG1Oqj
C/B7yTqgI7rbyvox7DEXoX7rIiEqyNNUguTk/u3SZ4VXE2kmxdmSh3TQvybfbnXV
4JbCZVaqiZraqc7oZMnRoWrXRG3ztbnbes/9qhRGI7PqXqeKJBztxRTEVj8ONs1d
WN5szTwaPIvhkhO3CO5ErU2rVdUr89wKpNXbBODFKRtgxUT70YpmJ46VVaqdAhOZ
D9EUUn4YaeLaS8AjSF/h7UkjOibNc4qVDiPP+rkehFWM66PVnP1Msh93tc+taIfC
EYVMxjh8zNbFuoc7fzvvrFILLe7ifvEIUqSVIC/AzplM/Jxw7buXFeGP1qVCBEHq
391d/9RAfaZ12zkwFsl+IKwE/OZxW8AHa9i1p4GO0YSNuczzEm4=
-----END CERTIFICATE-----`;

const GIGACHAT_PROTO = `
syntax = "proto3";

package gigachat.v1;

service ChatService {
  rpc Chat (ChatRequest) returns (ChatResponse);
  rpc ChatStream (ChatRequest) returns (stream ChatResponse);
}

message ChatRequest {
  ChatOptions options = 1;
  string model = 2;
  repeated Message messages = 3;
}

message ChatOptions {
  float temperature = 1;
  float top_p = 2;
  int32 max_alternatives = 3;
  int32 max_tokens = 4;
}

message Message {
  string role = 1;
  string content = 2;
}

message ChatResponse {
  repeated Alternative alternatives = 1;
  Usage usage = 2;
}

message Alternative {
  Message message = 1;
  string finish_reason = 2;
}

message Usage {
  int32 prompt_tokens = 1;
  int32 completion_tokens = 2;
  int32 total_tokens = 3;
}
`;

async function loadGigaChatProto() {
    const tmpFile = '/tmp/gigachat.proto';
    const fs = require('fs');
    fs.writeFileSync(tmpFile, GIGACHAT_PROTO);

    const packageDefinition = await protoLoader.load(tmpFile, {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
    });

    return grpc.loadPackageDefinition(packageDefinition);
}

let gigachatProto = null;

async function getGigaChatProto() {
    if (!gigachatProto) {
        gigachatProto = await loadGigaChatProto();
    }
    return gigachatProto;
}

// ============ Knowledge Base from Object Storage ============

let cachedKB = null;
let cacheTime = 0;
const CACHE_TTL = 3600000; // 1 час

// ============ Built-in Knowledge Base (Embedded) ============

const EMBEDDED_KNOWLEDGE_BASE = {
  "company": {
    "name": "MP.WebStudio",
    "description": "Веб-студия, где человеческое мастерство встречается с современными технологиями. Мы создаём сайты, которые работают и приносят результат. Симбиоз опыта нашей команды и инновационных инструментов позволяет нам разрабатывать быстрее и качественнее.",
    "tagline": "Ваша идея + Наш опыт = Успешный результат",
    "phone": "+7 (953) 181-41-36",
    "email": "mpwebstudio1@gmail.com",
    "website": "https://mp-webstudio.ru"
  },
  "services": [
    {
      "name": "Сайт-визитка",
      "description": "Компактный одностраничный сайт для представления вашей компании, специалиста или услуги. Идеален для малого бизнеса, фрилансеров и специалистов.",
      "price_from": "25000",
      "includes": ["Адаптивный дизайн", "Одна страница", "Контактная информация", "SEO-основа", "Хостинг включён"]
    },
    {
      "name": "Лендинг",
      "description": "Целевая продающая страница, разработанная для конверсии. Мы создаём лендинги, которые привлекают клиентов и генерируют продажи.",
      "price_from": "45000",
      "includes": ["Адаптивный дизайн", "До 7 секций", "Форма обратной связи", "Базовые анимации", "SEO-основа", "Хостинг включён"]
    },
    {
      "name": "Корпоративный сайт",
      "description": "Многостраничный сайт для компании. Формирует доверие, привлекает клиентов и деловых партнёров. Включает информацию об услугах, команде, портфолио и контакты.",
      "price_from": "90000",
      "includes": ["До 10 страниц", "Навигация между страницами", "Единый шаблон дизайна", "Страница контактов с картой", "SEO-оптимизация", "Хостинг включён"]
    },
    {
      "name": "Интернет-магазин",
      "description": "E-commerce решение с полным функционалом: каталог товаров, управление заказами, интеграция платёжных систем, админ-панель для управления товарами.",
      "price_from": "150000",
      "includes": ["Каталог товаров", "Корзина заказов", "Интеграция платежей", "Система управления", "СМС/Email уведомления", "Хостинг включён"]
    }
  ],
  "process": [
    {
      "step": 1,
      "name": "Консультация",
      "description": "Первая встреча: изучаем ваш бизнес, цели, целевую аудиторию и конкурентов. Определяем лучший подход к решению задачи."
    },
    {
      "step": 2,
      "name": "Дизайн и структура",
      "description": "Создаём дизайн и структуру сайта. Согласуем макеты, получаем ваше одобрение перед разработкой кода."
    },
    {
      "step": 3,
      "name": "Разработка и тестирование",
      "description": "Разрабатываем сайт, интегрируем все необходимые функции. Тестируем на всех устройствах и браузерах, исправляем ошибки."
    },
    {
      "step": 4,
      "name": "Запуск и поддержка",
      "description": "Запускаем на вашем домене, настраиваем SSL и аналитику. 14 дней гарантийной поддержки входят в стоимость проекта."
    }
  ],
  "portfolio": [
    {
      "id": 0,
      "name": "MP.WebStudio",
      "subtitle": "Сайт веб-студии",
      "description": "Портфолио-сайт веб-студии с калькулятором стоимости, онлайн-оплатой, Telegram-уведомлениями и админ-панелью для управления проектами.",
      "category": "Dark Theme",
      "status": "launched",
      "technologies": ["React", "TypeScript", "Yandex Cloud", "Telegram", "PostgreSQL"],
      "features": ["Интерактивный калькулятор", "Онлайн-платежи", "Админ-панель", "Telegram-уведомления"]
    },
    {
      "id": 1,
      "name": "Сладкие наслаждения",
      "subtitle": "Интернет-магазин сладостей",
      "description": "Полнофункциональный интернет-магазин сладостей с админ-панелью, Telegram-приложением, интеграцией Robokassa и хранением в Яндекс Cloud.",
      "category": "E-commerce",
      "status": "launched",
      "technologies": ["React", "Node.js", "PostgreSQL", "Robokassa", "Telegram"],
      "features": ["Каталог товаров", "Система заказов", "Платежи Robokassa", "Telegram-уведомления", "Админ-панель"]
    },
    {
      "id": 2,
      "name": "Вкусдом",
      "subtitle": "Доставка еды",
      "description": "Концепт лендинга для доставки азиатской еды. Яркий дизайн, анимированное меню, корзина заказа, форма для заказа.",
      "category": "Food",
      "status": "concept",
      "technologies": ["React", "Framer Motion", "Tailwind CSS"],
      "features": ["Анимированное меню", "Корзина заказа", "Форма контакта", "Адаптивный дизайн"]
    },
    {
      "id": 3,
      "name": "Фитнес клуб",
      "subtitle": "Фитнес-студия",
      "description": "Концепт сайта фитнес-студии с тёмным стилем, расписанием тренировок, тарифными планами и системой записи.",
      "category": "Dark Theme",
      "status": "concept",
      "technologies": ["React", "Framer Motion", "Tailwind CSS"],
      "features": ["Расписание тренировок", "Тарифные планы", "Онлайн-запись", "Портфолио тренеров"]
    },
    {
      "id": 4,
      "name": "Natura",
      "subtitle": "Интернет-магазин косметики",
      "description": "Концепт интернет-магазина косметики. Минималистичный дизайн, каталог товаров, система избранного и корзина для заказа.",
      "category": "E-commerce",
      "status": "concept",
      "technologies": ["React", "E-commerce", "Tailwind CSS"],
      "features": ["Каталог косметики", "Избранное", "Корзина заказов", "Фильтры по категориям"]
    },
    {
      "id": 5,
      "name": "Streetwear",
      "subtitle": "Интернет-магазин одежды",
      "description": "Концепт магазина российского стритвира с тёмной темой, категориями товаров, брендами и корзиной для заказа.",
      "category": "E-commerce",
      "status": "concept",
      "technologies": ["React", "E-commerce", "Dark Theme"],
      "features": ["Каталог одежды", "Фильтр по брендам", "Размерная сетка", "Система рейтингов"]
    },
    {
      "id": 6,
      "name": "Sockstyle",
      "subtitle": "Интернет-магазин носков",
      "description": "Концепт магазина стильных мужских носков с подарочными наборами, носками с надписями и спортивными вариантами.",
      "category": "E-commerce",
      "status": "concept",
      "technologies": ["React", "E-commerce", "Light Theme"],
      "features": ["Подарочные наборы", "Кастомизация", "Доставка", "Система скидок"]
    },
    {
      "id": 7,
      "name": "Дримтур",
      "subtitle": "Туристическое агентство",
      "description": "Концепт сайта туристического агентства. Популярные направления, горячие туры, система бронирования и отзывы клиентов.",
      "category": "Booking",
      "status": "concept",
      "technologies": ["React", "Travel", "Booking"],
      "features": ["Каталог туров", "Фильтр по стране", "Система бронирования", "Отзывы туристов"]
    },
    {
      "id": 8,
      "name": "Barbershop",
      "subtitle": "Барбершоп",
      "description": "Концепт сайта барбершопа. Услуги, портфолио мастеров, онлайн-запись, галерея работ и отзывы клиентов.",
      "category": "Booking",
      "status": "concept",
      "technologies": ["React", "Booking", "Dark Theme"],
      "features": ["Онлайн-запись", "Портфолио мастеров", "Услуги с ценами", "Отзывы клиентов"]
    },
    {
      "id": 9,
      "name": "Дентапро",
      "subtitle": "Стоматологическая клиника",
      "description": "Концепт сайта стоматологической клиники. Услуги, врачи, онлайн-запись, акции и медицинская информация.",
      "category": "Medical",
      "status": "concept",
      "technologies": ["React", "Medical", "Light Theme"],
      "features": ["Онлайн-запись", "Профили врачей", "Услуги и цены", "Акции и специальные предложения"]
    },
    {
      "id": 10,
      "name": "Ремонтмастер",
      "subtitle": "Ремонт квартир",
      "description": "Концепт сайта ремонта квартир. Портфолио работ, калькулятор стоимости, этапы работ и система расчётов.",
      "category": "Services",
      "status": "concept",
      "technologies": ["React", "Services", "Calculator"],
      "features": ["Портфолио работ", "Калькулятор стоимости", "До/после фото", "Контрольные этапы работ"]
    },
    {
      "id": 11,
      "name": "Андрей Соколов",
      "subtitle": "Сайт-визитка фотографа",
      "description": "Концепт сайта-визитки фотографа. Минималистичный дизайн, портфолио работ, услуги и контактная информация.",
      "category": "Portfolio",
      "status": "concept",
      "technologies": ["React", "Minimalist", "Portfolio"],
      "features": ["Галерея фотографий", "Услуги и пакеты", "Контактная информация", "Отзывы клиентов"]
    }
  ],
  "technologies": {
    "frontend": ["React", "Next.js", "Vue.js", "TypeScript", "Tailwind CSS"],
    "backend": ["Node.js", "Express", "Python", "PostgreSQL"],
    "russian_services": ["Yandex Cloud", "VK Cloud", "Yandex.Kassa", "Robokassa", "Yandex.Metrika", "1C", "Bitrix24", "SDEK", "DaData", "Telegram Bot", "VK API"]
  },
  "pricing": {
    "mvp_startup": {
      "name": "Стартап - Быстро и просто",
      "description": "Готовый сайт за 2-4 недели. Идеально для новых проектов и MVP.",
      "price": "50000-100000"
    },
    "business": {
      "name": "Бизнес - Полноценное решение",
      "description": "Сложный корпоративный сайт с интеграциями и нестандартными требованиями.",
      "price": "от 150000"
    },
    "ecommerce": {
      "name": "E-commerce - Интернет-магазин",
      "description": "Полнофункциональный магазин с оплатой, управлением товарами и аналитикой.",
      "price": "от 200000"
    },
    "support": {
      "name": "Техническая поддержка",
      "description": "Включена 14 дней. Затем по тарифам: от 5000₽/месяц.",
      "price": "от 5000/месяц"
    }
  },
  "faq": [
    {
      "question": "В чём разница между лендингом, корпоративным сайтом и интернет-магазином?",
      "answer": "Лендинг — одностраничный сайт для продвижения конкретного товара/услуги с фокусом на конверсию. Корпоративный сайт — многостраничный портал компании с информацией об услугах, командой, контактами. Интернет-магазин — платформа с каталогом товаров, корзиной, платежной системой и управлением заказами. Сайт-визитка — простой одностраничный сайт с основной информацией о компании, контактами и примерами работ для небольших бизнесов и специалистов."
    },
    {
      "question": "Сколько времени занимает разработка сайта?",
      "answer": "В среднем: Сайт-визитка — 1-2 недели, Лендинг — 2-3 недели, Корпоративный сайт — 3-4 недели, Интернет-магазин — 4-6 недель. Сроки зависят от сложности, количества функций и скорости согласования макетов."
    },
    {
      "question": "Как работает калькулятор стоимости на сайте?",
      "answer": "Выберите тип проекта (базовая цена), а затем добавьте нужные функции: интеграция с платежами, аналитика, многоязычность, дополнительные страницы и т.д. Каждая функция добавляет свою стоимость. Итоговая цена зависит от объёма работ."
    },
    {
      "question": "Что входит в поддержку после запуска сайта?",
      "answer": "В стандартную поддержку входит: исправление ошибок в течение 14 дней, техническая консультация, помощь с обновлением контента. Дополнительные услуги (SEO, дизайн обновлений, расширение функционала) оплачиваются отдельно."
    },
    {
      "question": "Вы помогаете с покупкой домена и хостингом?",
      "answer": "Да! Мы помогаем выбрать домен, переносим DNS, настраиваем SSL-сертификат и помогаем с покупкой и настройкой хостинга. Все настройки включены в процесс запуска проекта."
    },
    {
      "question": "Это реальные проекты или вымышленные примеры?",
      "answer": "Это демонстрационные примеры — шаблоны, которые показывают наши возможности. Каждый пример создан на основе реальных проектов, которые мы разработали."
    },
    {
      "question": "Какие дополнительные функции можно добавить к базовому сайту?",
      "answer": "К любому проекту можно добавить: интеграцию с 1С, CRM, email-маркетинг, видео на фоне, чат-бот, личный кабинет пользователя, рекомендательную систему, аналитику, многоязычность и многое другое."
    },
    {
      "question": "Как оплачивается работа? Есть ли рассрочка?",
      "answer": "Работа оплачивается в два этапа: 50% предоплаты перед началом, 50% перед запуском. Для юридических лиц возможна выставка счёта. Дополнительные услуги оплачиваются через систему счётов отдельно."
    }
  ],
  "keywords": {
    "услуги": ["веб-разработка", "сайт", "лендинг", "e-commerce", "интернет-магазин", "корпоративный сайт", "сайт-визитка"],
    "процесс": ["консультация", "дизайн", "разработка", "тестирование", "запуск", "поддержка"],
    "портфолио": ["food delivery", "fitness", "cosmetics", "e-commerce", "магазин", "барбершоп", "стоматология", "туризм"],
    "качество": ["современные технологии", "чистый код", "быстро", "качественно", "результат", "адаптивный", "SEO"],
    "цена": ["от 25000", "калькулятор", "стоимость", "цены", "тариф", "расценки", "предложение"],
    "технологии": ["React", "Node.js", "PostgreSQL", "TypeScript", "Tailwind", "Yandex Cloud", "Robokassa", "Telegram"],
    "интеграции": ["платежи", "Robokassa", "Яндекс.Касса", "1С", "CRM", "Telegram", "СМС", "email", "аналитика"]
  },
  "contact_info": {
    "phone": "+7 (953) 181-41-36",
    "email": "mpwebstudio1@gmail.com",
    "telegram": "https://t.me/mp_webstudio",
    "vk": "https://vk.com/mp.webstudio",
    "address": "Россия, Москва",
    "working_hours": "Ежедневно 9:00–20:00"
  }
};

// AWS Signature V4 signing helper
function signAwsRequest(method, host, path, accessKey, secretKey, payload = '') {
    const crypto = require('crypto');
    const algorithm = 'AWS4-HMAC-SHA256';
    const service = 's3';
    const region = 'ru-central1';
    const now = new Date();
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
    const dateStamp = amzDate.slice(0, 8);

    // Canonical request
    const canonicalHeaders = `host:${host}\nx-amz-content-sha256:UNSIGNED-PAYLOAD\nx-amz-date:${amzDate}\n`;
    const signedHeaders = 'host;x-amz-content-sha256;x-amz-date';
    const payloadHash = crypto.createHash('sha256').update(payload).digest('hex');

    const canonicalRequest = [
        method,
        path,
        '',
        canonicalHeaders,
        signedHeaders,
        payloadHash
    ].join('\n');

    // String to sign
    const canonicalRequestHash = crypto.createHash('sha256').update(canonicalRequest).digest('hex');
    const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
    const stringToSign = [
        algorithm,
        amzDate,
        credentialScope,
        canonicalRequestHash
    ].join('\n');

    // Calculate signature
    const kDate = crypto.createHmac('sha256', `AWS4${secretKey}`).update(dateStamp).digest();
    const kRegion = crypto.createHmac('sha256', kDate).update(region).digest();
    const kService = crypto.createHmac('sha256', kRegion).update(service).digest();
    const kSigning = crypto.createHmac('sha256', kService).update('aws4_request').digest();
    const signature = crypto.createHmac('sha256', kSigning).update(stringToSign).digest('hex');

    const authorizationHeader = `${algorithm} Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    return {
        'Authorization': authorizationHeader,
        'X-Amz-Date': amzDate,
        'X-Amz-Content-Sha256': 'UNSIGNED-PAYLOAD'
    };
}

async function loadKnowledgeBaseFromStorage() {
    const now = Date.now();
    if (cachedKB && (now - cacheTime) < CACHE_TTL) {
        console.log('[KB] ✅ Using cached knowledge base (embedded)');
        return cachedKB;
    }

    try {
        console.log('[KB] 📦 Loading embedded knowledge base...');
        cachedKB = EMBEDDED_KNOWLEDGE_BASE;
        cacheTime = now;
        console.log('[KB] ✅ Embedded knowledge base loaded successfully (cached for 1 hour)');
        return cachedKB;
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error(`[KB] ❌ Error loading embedded KB: ${errorMsg}`);
        return null;
    }
}

function findRelevantContext(kb, userMessage) {
    if (!kb) return '';

    const lowerMessage = userMessage.toLowerCase();
    let context = '';

    // Ищем совпадения по ключевым словам
    if (kb.keywords) {
        for (const [category, keywords] of Object.entries(kb.keywords)) {
            for (const keyword of keywords) {
                if (lowerMessage.includes(keyword.toLowerCase())) {
                    // Добавляем соответствующую информацию
                    if (category === 'услуги' && kb.services) {
                        const servicesText = kb.services
                            .map(s => `• ${s.name} (от ${s.price_from} руб): ${s.description}`)
                            .join('\n');
                        context += `Наши услуги:\n${servicesText}\n\n`;
                    } else if (category === 'технологии' && kb.technologies) {
                        const techText = Object.entries(kb.technologies)
                            .map(([key, values]) => `${key}: ${values.join(', ')}`)
                            .join('\n');
                        context += `Используемые технологии:\n${techText}\n\n`;
                    } else if (category === 'процесс' && kb.process) {
                        const processText = kb.process
                            .map(p => `${p.step}. ${p.name}: ${p.description}`)
                            .join('\n');
                        context += `Наш процесс разработки:\n${processText}\n\n`;
                    } else if (category === 'портфолио' && kb.portfolio) {
                        const portfolioText = kb.portfolio
                            .map(p => `• ${p.name}: ${p.description} (Технологии: ${p.technologies.join(', ')})`)
                            .join('\n');
                        context += `Примеры наших работ:\n${portfolioText}\n\n`;
                    } else if (category === 'цена' && kb.pricing) {
                        const pricingText = Object.entries(kb.pricing)
                            .map(([key, val]) => `• ${val.name}: ${val.price}`)
                            .join('\n');
                        context += `Стоимость услуг:\n${pricingText}\n\n`;
                    }
                }
            }
        }
    }

    // Если вопрос о FAQ - добавляем соответствующие ответы
    if (kb.faq && (lowerMessage.includes('вопрос') || lowerMessage.includes('как') || 
                  lowerMessage.includes('какой') || lowerMessage.includes('сколько'))) {
        const faqText = kb.faq
            .map(f => `Q: ${f.question}\nA: ${f.answer}`)
            .join('\n\n');
        context += `Часто задаваемые вопросы:\n${faqText}\n\n`;
    }

    // Если ничего не найдено - добавляем основную информацию о компании
    if (!context && kb.company) {
        context = `О компании ${kb.company.name}:\n${kb.company.description}\n\n`;
        if (kb.company.phone) context += `Телефон: ${kb.company.phone}\n`;
        if (kb.company.email) context += `Email: ${kb.company.email}\n`;
    }

    return context;
}

async function handleGigaChat(body, headers) {
    const handlerId = crypto.randomUUID().substring(0, 8);
    const MAX_RETRIES = 3;
    
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        console.log(`\n\n=== GIGACHAT gRPC REQUEST START [${handlerId}] (Attempt ${attempt}/${MAX_RETRIES}) (Yandex Cloud) ===`);
        const result = await attemptGigaChat(body, headers, handlerId);
        
        // Если успех - возвращаем результат
        if (result.statusCode === 200) {
            console.log(`[${handlerId}] ✅ Success on attempt ${attempt}`);
            return result;
        }
        
        // Если ошибка сети/timeout - пытаемся снова (кроме последней попытки)
        if (attempt < MAX_RETRIES && isRetryableError(result)) {
            const errorBody = JSON.parse(result.body);
            console.warn(`[${handlerId}] ⚠️ Attempt ${attempt} failed with: ${errorBody.response || 'unknown error'}`);
            console.log(`[${handlerId}] 🔄 Retrying in 2 seconds...`);
            await new Promise(r => setTimeout(r, 2000));
            continue;
        }
        
        // Если не повторяемая ошибка или последняя попытка - возвращаем результат
        return result;
    }
}

function isRetryableError(result) {
    if (result.statusCode !== 500) return false;
    try {
        const body = JSON.parse(result.body);
        const response = body.response || '';
        return response.includes('timeout') || 
               response.includes('Timeout') || 
               response.includes('error') ||
               response.includes('failed');
    } catch {
        return true; // При ошибке парсинга - пытаемся снова
    }
}

async function attemptGigaChat(body, headers, handlerId) {
    const startTime = Date.now();

    try {
        let { message, userName, isFirstMessage } = body;
        console.log(`[${handlerId}] 1️⃣ Received message (${message?.length || 0} chars)`);
        if (userName) console.log(`[${handlerId}] User name: ${userName}`);
        if (isFirstMessage) console.log(`[${handlerId}] First message: true`);

        // Обработка первого сообщения - отправить приветствие
        if (isFirstMessage && userName) {
            console.log(`[${handlerId}] 1b️⃣ First message detected - sending greeting to ${userName}...`);
            const greeting = `Привет, ${userName}! 👋 Я AI-ассистент компании MP.WebStudio. Я здесь, чтобы ответить на ваши вопросы о наших услугах, проектах и технологиях. Что вас интересует?`;
            
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    response: greeting,
                }),
            };
        }

        // НОВОЕ: Загружаем Knowledge Base и обогащаем контекст
        console.log(`[${handlerId}] 1a️⃣ Loading knowledge base...`);
        const kb = await loadKnowledgeBaseFromStorage();
        const relevantContext = findRelevantContext(kb, message);

        if (relevantContext) {
            console.log(`[${handlerId}] 1b️⃣ Context found (${relevantContext.length} chars), enriching message...`);
            message = `Контекст о компании:\n${relevantContext}\n---\n\nВопрос клиента: ${message}`;
        }

        if (!message || typeof message !== 'string' || message.trim().length === 0) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    success: false,
                    response: 'Сообщение не может быть пусто',
                }),
            };
        }

        if (message.length > 15000) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    success: false,
                    response: 'Сообщение слишком длинное (макс 15000 символов)',
                }),
            };
        }

        const gigachatKey = process.env.GIGACHAT_KEY;
        const gigachatScope = process.env.GIGACHAT_SCOPE || 'GIGACHAT_API_PERS';

        console.log(`[${handlerId}] 2️⃣ GIGACHAT_KEY exists: ${!!gigachatKey}`);

        if (!gigachatKey) {
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({
                    success: false,
                    response: 'GigaChat не настроен на сервере',
                }),
            };
        }

        // Получаем OAuth токен
        console.log(`[${handlerId}] 3️⃣ Requesting OAuth token...`);
        const authBody = `scope=${encodeURIComponent(gigachatScope)}`;
        const authStartTime = Date.now();

        let authResponse;
        try {
            authResponse = await httpsRequest('https://ngw.devices.sberbank.ru:9443/api/v2/oauth', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json',
                    'Authorization': `Basic ${gigachatKey}`,
                    'RqUID': crypto.randomUUID(),
                },
                body: authBody,
            });
            console.log(`[${handlerId}] ✅ OAuth completed in ${Math.round((Date.now() - authStartTime) / 1000)}s`);
        } catch (err) {
            throw new Error(`OAuth failed: ${err.message}`);
        }

        if (authResponse.statusCode !== 200) {
            throw new Error(`Auth error: ${authResponse.statusCode}`);
        }

        let authData;
        try {
            authData = JSON.parse(authResponse.data);
        } catch {
            throw new Error('Invalid auth response format');
        }

        const accessToken = authData.access_token;
        if (!accessToken) {
            throw new Error('No access token in response');
        }

        console.log(`[${handlerId}] 4️⃣ Loading gRPC proto...`);
        const proto = await getGigaChatProto();
        const ChatServiceClient = proto.gigachat.v1.ChatService;

        console.log(`[${handlerId}] 5️⃣ Connecting to gRPC server...`);
        // Используем корневой CA сертификат для валидации цепочки
        const credentials = grpc.credentials.createSsl(Buffer.from(SBERBANK_ROOT_CA));
        const metadata = new grpc.Metadata();
        metadata.add('authorization', `Bearer ${accessToken}`);

        // Опции для gRPC канала с правильной конфигурацией
        const channelOptions = {
            'grpc.ssl_target_name_override': 'gigachat.devices.sberbank.ru',
            'grpc.default_authority': 'gigachat.devices.sberbank.ru',
            'grpc.max_receive_message_length': 10 * 1024 * 1024,
            'grpc.max_send_message_length': 10 * 1024 * 1024,
            'grpc.http2.keepalive_time': 30000,
            'grpc.http2.keepalive_timeout': 10000,
        };

        const client = new ChatServiceClient('gigachat.devices.sberbank.ru:443', credentials, channelOptions);

        console.log(`[${handlerId}] 6️⃣ Sending chat request via gRPC...`);
        const chatStartTime = Date.now();

        return new Promise((resolve) => {
            const chatRequest = {
                model: 'GigaChat',
                messages: [
                    {
                        role: 'user',
                        content: message,
                    }
                ],
                options: {
                    temperature: 0.7,
                    max_tokens: 1000,
                }
            };

            client.chat(chatRequest, metadata, (err, response) => {
                const chatElapsed = Math.round((Date.now() - chatStartTime) / 1000);

                if (err) {
                    console.error(`[${handlerId}] ❌ gRPC error after ${chatElapsed}s: ${err.message}`);
                    client.close();
                    return resolve({
                        statusCode: 500,
                        headers,
                        body: JSON.stringify({
                            success: false,
                            response: `gRPC ошибка: ${err.message}`,
                        }),
                    });
                }

                console.log(`[${handlerId}] ✅ gRPC response received in ${chatElapsed}s`);

                const assistantMessage = response?.alternatives?.[0]?.message?.content || 'Нет ответа';
                const totalTime = Math.round((Date.now() - startTime) / 1000);

                console.log(`[${handlerId}] 7️⃣ Success!`);
                console.log(`[${handlerId}]    Response length: ${assistantMessage.length} chars`);
                console.log(`[${handlerId}]    Total time: ${totalTime}s`);
                console.log(`=== GIGACHAT gRPC REQUEST END [${handlerId}] (SUCCESS) ===\n`);

                client.close();

                resolve({
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({
                        success: true,
                        response: assistantMessage,
                    }),
                });
            });

            setTimeout(() => {
                console.error(`[${handlerId}] ❌ gRPC request timeout (10s)`);
                client.close();
                resolve({
                    statusCode: 500,
                    headers,
                    body: JSON.stringify({
                        success: false,
                        response: 'Timeout при соединении с GigaChat',
                    }),
                });
            }, 10000);
        });

    } catch (error) {
        const totalTime = Math.round((Date.now() - startTime) / 1000);
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error(`[${handlerId}] ❌ ERROR: ${errorMsg} (after ${totalTime}s)`);
        console.error(`=== GIGACHAT gRPC REQUEST END [${handlerId}] (FAILED) ===\n`);

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                response: `Ошибка: ${errorMsg}`,
            }),
        };
    }
}