// ============ СКОПИРУЙ ТОЛЬКО ЭТУ ЧАСТЬ В ОБЛАЧНУЮ ФУНКЦИЮ ============

// 1. В начале файла (после остальных require) добавь эту строку:
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');

// 2. Замени ВСЮ функцию loadKnowledgeBaseFromStorage() на эту:

let cachedKB = null;
let cacheTime = 0;
const CACHE_TTL = 3600000; // 1 час

async function loadKnowledgeBaseFromStorage() {
    const now = Date.now();
    if (cachedKB && (now - cacheTime) < CACHE_TTL) {
        console.log('[KB] Using cached knowledge base');
        return cachedKB;
    }

    try {
        console.log('[KB] Loading knowledge base from Object Storage...');
        
        const accessKey = process.env.YC_ACCESS_KEY;
        const secretKey = process.env.YC_SECRET_KEY;
        
        if (!accessKey || !secretKey) {
            console.log('[KB] No credentials provided, skipping KB load');
            return null;
        }

        const s3Client = new S3Client({
            region: 'ru-central1',
            endpoint: 'https://storage.yandexcloud.net',
            credentials: {
                accessKeyId: accessKey,
                secretAccessKey: secretKey,
            },
            forcePathStyle: true,
        });

        const bucketName = process.env.YC_BUCKET_NAME || 'www.mp-webstudio.ru';
        const keyPath = 'site-content.json';

        const command = new GetObjectCommand({
            Bucket: bucketName,
            Key: keyPath,
        });

        const response = await s3Client.send(command);
        const dataBuffer = await response.Body.transformToByteArray();
        const dataString = new TextDecoder().decode(dataBuffer);

        const kbData = JSON.parse(dataString);
        cachedKB = kbData;
        cacheTime = now;

        console.log('[KB] ✅ Knowledge base loaded successfully');
        return kbData;
    } catch (error) {
        console.error('[KB] ❌ Error loading KB:', error.message);
        return null;
    }
}

// Функция findRelevantContext остается БЕЗ ИЗМЕНЕНИЙ! Не трогай её!

// ============ КОНЕЦ ============
