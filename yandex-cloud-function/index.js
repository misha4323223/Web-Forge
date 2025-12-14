/**
 * Yandex Cloud Function для WebStudio
 * 
 * Работает через API сайта для хранения заказов в PostgreSQL.
 * 
 * Переменные окружения:
 * - SITE_API_URL - URL API сайта (например https://mp-webstudio.ru)
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
const { SESClient, SendRawEmailCommand } = require('@aws-sdk/client-ses');

const SITE_API_URL = process.env.SITE_API_URL || 'https://mp-webstudio.ru';

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

        if (action === 'health' || path.includes('/health') || method === 'GET') {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ 
                    status: 'ok', 
                    timestamp: new Date().toISOString(),
                    siteApi: SITE_API_URL,
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
    // Прокси к API сайта
    try {
        const response = await fetch(`${SITE_API_URL}/api/contact`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        const result = await response.json();
        
        if (result.success) {
            await sendTelegramNotification(formatContactMessage(data));
        }
        
        return {
            statusCode: response.status,
            headers,
            body: JSON.stringify(result),
        };
    } catch (error) {
        console.error('Error proxying contact:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ success: false, message: 'API error' }),
        };
    }
}

async function handleOrder(data, headers) {
    // Прокси к API сайта для создания заказа
    try {
        const response = await fetch(`${SITE_API_URL}/api/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        const result = await response.json();
        
        console.log('Order created via API:', result);
        
        if (result.success) {
            await sendTelegramNotification(formatOrderMessage({
                id: result.orderId,
                clientName: data.clientName,
                clientEmail: data.clientEmail,
                clientPhone: data.clientPhone,
                projectType: data.projectType,
                projectDescription: data.projectDescription || '',
                amount: data.amount,
            }));
        }
        
        return {
            statusCode: response.status,
            headers,
            body: JSON.stringify(result),
        };
    } catch (error) {
        console.error('Error proxying order:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ success: false, message: 'API error' }),
        };
    }
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
        return { statusCode: 400, headers, body: 'missing params' };
    }

    const PASSWORD2 = process.env.ROBOKASSA_PASSWORD2;
    
    if (!PASSWORD2) {
        console.error('ROBOKASSA_PASSWORD2 not configured');
        return { statusCode: 500, headers, body: 'config error' };
    }

    const signatureString = `${OutSum}:${InvId}:${PASSWORD2}:shp_orderId=${shp_orderId}`;
    const calculatedSignature = crypto.createHash('md5').update(signatureString).digest('hex');
    
    console.log('Signature check:', { 
        expected: calculatedSignature.toLowerCase(), 
        received: SignatureValue.toLowerCase() 
    });

    if (calculatedSignature.toLowerCase() !== SignatureValue.toLowerCase()) {
        console.error('Invalid Robokassa signature');
        return { statusCode: 400, headers, body: 'bad sign' };
    }

    // Получаем заказ из базы данных через API
    let order = null;
    try {
        const response = await fetch(`${SITE_API_URL}/api/orders/${shp_orderId}`);
        if (response.ok) {
            order = await response.json();
            console.log('Order fetched from DB:', order);
        } else {
            console.log('Order not found in DB, status:', response.status);
        }
    } catch (error) {
        console.error('Error fetching order:', error);
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
            console.error('Failed to send contract email:', emailError.message);
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

(Данные клиента не найдены в базе)
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
        headers: { 'Location': `${siteUrl}/payment-success?orderId=${orderId}` },
        body: '',
    };
}

function handleRobokassaFail(query) {
    const siteUrl = process.env.SITE_URL || 'https://www.mp-webstudio.ru';
    const orderId = query.shp_orderId || '';
    
    return {
        statusCode: 302,
        headers: { 'Location': `${siteUrl}/payment-fail?orderId=${orderId}` },
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
    
    // Yandex Cloud Postbox через AWS SDK
    const postboxAccessKey = process.env.POSTBOX_ACCESS_KEY_ID;
    const postboxSecretKey = process.env.POSTBOX_SECRET_ACCESS_KEY;
    const postboxFromEmail = process.env.POSTBOX_FROM_EMAIL;
    
    if (postboxAccessKey && postboxSecretKey && postboxFromEmail) {
        console.log('Using Yandex Cloud Postbox (AWS SDK), from:', postboxFromEmail);
        
        const sesClient = new SESClient({
            region: 'ru-central1',
            endpoint: 'https://postbox.cloud.yandex.net',
            credentials: {
                accessKeyId: postboxAccessKey,
                secretAccessKey: postboxSecretKey,
            },
        });
        
        const boundary = '----=_Part_' + Date.now().toString(36);
        const pdfBase64 = pdfBuffer.toString('base64');
        
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
            Buffer.from(emailHtml).toString('base64'),
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
        
        console.log('Sending email via Yandex Postbox AWS SDK');
        
        try {
            const command = new SendRawEmailCommand({
                RawMessage: {
                    Data: Buffer.from(rawEmail),
                },
            });
            
            const response = await sesClient.send(command);
            console.log('Email sent via Yandex Cloud Postbox, MessageId:', response.MessageId);
            return;
        } catch (error) {
            console.error('Postbox error:', error.message);
            throw new Error(`Yandex Postbox error: ${error.message}`);
        }
    }
    
    // Fallback на SMTP (Яндекс Почта)
    const smtpEmail = process.env.SMTP_EMAIL;
    const smtpPassword = process.env.SMTP_PASSWORD;

    console.log('SMTP config:', { emailConfigured: !!smtpEmail, passwordConfigured: !!smtpPassword });

    if (!smtpEmail || !smtpPassword) {
        console.log('No email service configured, skipping email');
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
        console.error('Telegram error:', error);
    }
}
