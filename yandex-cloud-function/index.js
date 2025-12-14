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
 * - TELEGRAM_BOT_TOKEN - токен бота Telegram
 * - TELEGRAM_CHAT_ID - ID чата для уведомлений
 * - SITE_URL - URL сайта для редиректов
 * - SMTP_EMAIL - email для отправки писем (Яндекс)
 * - SMTP_PASSWORD - пароль приложения Яндекс
 */

const crypto = require('crypto');
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');

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
        
        console.log('Incoming request:', { 
            method, 
            action, 
            path,
            bodyKeys: Object.keys(body),
            queryKeys: Object.keys(query)
        });

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

        if (action === 'health' || path.includes('/health') || method === 'GET') {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ 
                    status: 'ok', 
                    timestamp: new Date().toISOString(),
                    robokassa: process.env.ROBOKASSA_MERCHANT_LOGIN ? 'configured' : 'not configured',
                    smtp: process.env.SMTP_EMAIL ? 'configured' : 'not configured',
                    telegram: process.env.TELEGRAM_BOT_TOKEN ? 'configured' : 'not configured',
                    action: action || 'none'
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
    
    // Передаём все данные клиента через shp_ параметры
    // Они вернутся в callback от Robokassa
    const shpParams = [
        `shp_clientEmail=${encodeURIComponent(order.clientEmail)}`,
        `shp_clientName=${encodeURIComponent(order.clientName)}`,
        `shp_clientPhone=${encodeURIComponent(order.clientPhone)}`,
        `shp_orderId=${orderId}`,
        `shp_projectType=${order.projectType}`
    ].sort().join(':'); // Robokassa требует сортировку по алфавиту
    
    const signatureString = `${MERCHANT_LOGIN}:${sum}:${invId}:${PASSWORD1}:${shpParams}`;
    const signature = crypto.createHash('md5').update(signatureString).digest('hex');

    const baseUrl = 'https://auth.robokassa.ru/Merchant/Index.aspx';
    const paymentUrl = `${baseUrl}?MerchantLogin=${MERCHANT_LOGIN}&OutSum=${sum}&InvId=${invId}&Description=${description}&SignatureValue=${signature}&IsTest=${IS_TEST ? 1 : 0}&shp_clientEmail=${encodeURIComponent(order.clientEmail)}&shp_clientName=${encodeURIComponent(order.clientName)}&shp_clientPhone=${encodeURIComponent(order.clientPhone)}&shp_orderId=${orderId}&shp_projectType=${order.projectType}`;

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
    console.log('Robokassa result - full data:', JSON.stringify(data));
    
    const OutSum = data.OutSum;
    const InvId = data.InvId;
    const SignatureValue = data.SignatureValue;
    
    // Получаем данные клиента из shp_ параметров
    const shp_orderId = data.shp_orderId;
    const shp_clientName = decodeURIComponent(data.shp_clientName || '');
    const shp_clientEmail = decodeURIComponent(data.shp_clientEmail || '');
    const shp_clientPhone = decodeURIComponent(data.shp_clientPhone || '');
    const shp_projectType = data.shp_projectType || '';

    console.log('Robokassa result callback:', { 
        OutSum, 
        InvId, 
        shp_orderId, 
        shp_clientName,
        shp_clientEmail,
        shp_projectType,
        SignatureValue: SignatureValue ? 'present' : 'missing' 
    });

    if (!OutSum || !InvId || !SignatureValue) {
        console.error('Missing required Robokassa parameters:', { OutSum, InvId, SignatureValue: !!SignatureValue });
        return { statusCode: 400, headers, body: 'missing params' };
    }

    const PASSWORD2 = process.env.ROBOKASSA_PASSWORD2;
    
    if (!PASSWORD2) {
        console.error('ROBOKASSA_PASSWORD2 not configured');
        return { statusCode: 500, headers, body: 'config error' };
    }

    // Проверяем подпись с учетом всех shp_ параметров (в алфавитном порядке!)
    const shpParams = [
        `shp_clientEmail=${encodeURIComponent(shp_clientEmail)}`,
        `shp_clientName=${encodeURIComponent(shp_clientName)}`,
        `shp_clientPhone=${encodeURIComponent(shp_clientPhone)}`,
        `shp_orderId=${shp_orderId}`,
        `shp_projectType=${shp_projectType}`
    ].sort().join(':');
    
    const signatureString = `${OutSum}:${InvId}:${PASSWORD2}:${shpParams}`;
    const calculatedSignature = crypto.createHash('md5').update(signatureString).digest('hex');
    
    console.log('Signature check:', { 
        expected: calculatedSignature.toLowerCase(), 
        received: SignatureValue.toLowerCase(),
        signatureString: signatureString
    });

    if (calculatedSignature.toLowerCase() !== SignatureValue.toLowerCase()) {
        console.error('Invalid Robokassa signature');
        return { statusCode: 400, headers, body: 'bad sign' };
    }

    // Теперь у нас есть все данные клиента из shp_ параметров!
    const order = {
        id: shp_orderId,
        clientName: shp_clientName,
        clientEmail: shp_clientEmail,
        clientPhone: shp_clientPhone,
        projectType: shp_projectType,
        amount: OutSum,
        status: 'paid',
        paidAt: new Date().toISOString()
    };

    console.log('Order reconstructed from shp params:', order);

    // Генерируем PDF и отправляем на email
    if (order.clientEmail) {
        try {
            console.log('Generating PDF for order:', order.id);
            const pdfBuffer = await generateContractPDF(order);
            console.log('PDF generated, size:', pdfBuffer.length);
            
            await sendContractEmail(order, pdfBuffer);
            console.log('Contract email sent to:', order.clientEmail);
        } catch (emailError) {
            console.error('Failed to send contract email:', emailError.message, emailError.stack);
        }
    } else {
        console.log('No client email, skipping contract email');
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

        const formatPrice = (price) => new Intl.NumberFormat('ru-RU').format(price);
        const amount = parseFloat(order.amount);
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
        doc.font('Roboto').text(order.clientName);
        doc.text(`Телефон: ${order.clientPhone}`);
        doc.text(`Email: ${order.clientEmail}`);
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
    const smtpEmail = process.env.SMTP_EMAIL;
    const smtpPassword = process.env.SMTP_PASSWORD;

    console.log('SMTP config check:', { 
        emailConfigured: !!smtpEmail, 
        passwordConfigured: !!smtpPassword 
    });

    if (!smtpEmail || !smtpPassword) {
        console.log('SMTP not configured, skipping email');
        return;
    }

    console.log('Creating SMTP transport...');
    const transporter = nodemailer.createTransport({
        host: 'smtp.yandex.ru',
        port: 465,
        secure: true,
        auth: {
            user: smtpEmail,
            pass: smtpPassword,
        },
    });

    const formatPrice = (price) => new Intl.NumberFormat('ru-RU').format(price);
    const amount = parseFloat(order.amount);
    const prepayment = Math.round(amount / 2);

    const mailOptions = {
        from: `"MP.WebStudio" <${smtpEmail}>`,
        to: order.clientEmail,
        subject: `Договор на разработку сайта - Заказ ${order.id}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #0891b2;">Спасибо за заказ!</h2>
                
                <p>Здравствуйте, ${order.clientName}!</p>
                
                <p>Ваша предоплата успешно получена. Договор на оказание услуг подписан (акцептован оплатой).</p>
                
                <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0;">Детали заказа:</h3>
                    <p><strong>Тип проекта:</strong> ${getProjectTypeName(order.projectType)}</p>
                    <p><strong>Стоимость:</strong> ${formatPrice(amount)} руб.</p>
                    <p><strong>Предоплата (оплачено):</strong> ${formatPrice(prepayment)} руб.</p>
                    <p><strong>Остаток к оплате:</strong> ${formatPrice(prepayment)} руб.</p>
                    <p><strong>ID заказа:</strong> ${order.id}</p>
                </div>
                
                <p>Договор прикреплён к этому письму в формате PDF.</p>
                
                <h3>Что дальше?</h3>
                <ol>
                    <li>Мы свяжемся с вами в течение 24 часов для уточнения деталей</li>
                    <li>Вы предоставите материалы (логотип, тексты, фото)</li>
                    <li>Мы приступим к разработке</li>
                </ol>
                
                <p>Если у вас есть вопросы, ответьте на это письмо.</p>
                
                <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                    С уважением,<br>
                    MP.WebStudio<br>
                    <a href="https://mp-webstudio.ru">mp-webstudio.ru</a>
                </p>
            </div>
        `,
        attachments: [
            {
                filename: `Договор_${order.id}.pdf`,
                content: pdfBuffer,
                contentType: 'application/pdf',
            },
        ],
    };

    console.log('Sending email to:', order.clientEmail);
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
}

// ============ Helpers ============

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
        } else {
            console.log('Telegram notification sent');
        }
    } catch (error) {
        console.error('Failed to send Telegram notification:', error);
    }
}
