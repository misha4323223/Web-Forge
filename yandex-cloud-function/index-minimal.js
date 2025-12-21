const https = require('https');

async function httpsRequest(urlString, options) {
    return new Promise((resolve, reject) => {
        const url = new URL(urlString);
        const startTime = Date.now();
        
        console.log(`[HTTPS] Starting request to ${url.hostname}`);
        
        const TIMEOUT_MS = 25000;
        const SOCKET_TIMEOUT_MS = 28000;
        
        let socketTimeoutId = null;
        let requestTimeoutId = null;
        let hasResponded = false;
        
        const cleanup = () => {
            if (requestTimeoutId) clearTimeout(requestTimeoutId);
            if (socketTimeoutId) clearTimeout(socketTimeoutId);
        };
        
        const elapsed = () => Math.round(Date.now() - startTime);
        
        requestTimeoutId = setTimeout(() => {
            cleanup();
            if (!hasResponded) {
                console.log(`[HTTPS] TIMEOUT: No response after ${elapsed()}ms`);
            }
            req.destroy();
            reject(new Error(`Request timeout after ${elapsed()}ms`));
        }, TIMEOUT_MS);
        
        const reqOptions = {
            method: options.method,
            headers: options.headers,
            rejectUnauthorized: false,
            timeout: SOCKET_TIMEOUT_MS,
        };
        
        const req = https.request(url, reqOptions, (res) => {
            hasResponded = true;
            console.log(`[HTTPS] Response received after ${elapsed()}ms, status: ${res.statusCode}`);
            
            socketTimeoutId = setTimeout(() => {
                cleanup();
                req.destroy();
                reject(new Error('Response timeout'));
            }, SOCKET_TIMEOUT_MS);
            
            let data = '';
            res.on('data', (chunk) => {
                console.log(`[HTTPS] Received ${chunk.length} bytes`);
                if (socketTimeoutId) clearTimeout(socketTimeoutId);
                socketTimeoutId = setTimeout(() => {
                    cleanup();
                    req.destroy();
                    reject(new Error('Data timeout'));
                }, SOCKET_TIMEOUT_MS);
                
                data += chunk;
            });
            res.on('end', () => {
                cleanup();
                console.log(`[HTTPS] Request completed after ${elapsed()}ms`);
                resolve({ statusCode: res.statusCode || 500, data });
            });
        });
        
        req.on('socket', (socket) => {
            console.log(`[HTTPS] Socket created`);
            socket.on('connect', () => {
                console.log(`[HTTPS] Socket connected after ${elapsed()}ms`);
            });
            socket.on('secureConnect', () => {
                console.log(`[HTTPS] TLS handshake complete after ${elapsed()}ms`);
            });
        });
        
        req.on('error', (err) => {
            cleanup();
            console.log(`[HTTPS] Error after ${elapsed()}ms: ${err.message}`);
            reject(err);
        });
        
        req.on('timeout', () => {
            cleanup();
            console.log(`[HTTPS] Socket timeout after ${elapsed()}ms`);
            req.destroy();
            reject(new Error('Socket timeout'));
        });
        
        if (options.body) {
            req.write(options.body);
        }
        console.log(`[HTTPS] Request sent (${options.method} ${url.pathname})`);
        req.end();
    });
}

module.exports.handler = async function (event, context) {
    console.log('[START]', new Date().toISOString());
    
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    }

    const action = (event.queryStringParameters || {}).action || '';
    
    if (action !== 'giga-chat') {
        return { 
            statusCode: 400, 
            headers, 
            body: JSON.stringify({ error: 'Only giga-chat action supported' })
        };
    }

    let body = {};
    if (event.body) {
        let rawBody = event.isBase64Encoded 
            ? Buffer.from(event.body, 'base64').toString('utf-8')
            : event.body;
        try {
            body = JSON.parse(rawBody);
        } catch (e) {
            return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON' }) };
        }
    }

    const message = body.message || '';
    
    try {
        console.log('[GIGACHAT] Processing message:', message.substring(0, 50));
        
        const GIGACHAT_KEY = process.env.GIGACHAT_KEY || '';
        const GIGACHAT_SCOPE = process.env.GIGACHAT_SCOPE || 'GIGACHAT_API_PERS';
        
        if (!GIGACHAT_KEY) {
            throw new Error('GIGACHAT_KEY not configured');
        }
        
        // OAuth
        console.log('[AUTH] Requesting token...');
        const authResponse = await httpsRequest('https://ngw.devices.sberbank.ru:9443/api/v2/oauth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${GIGACHAT_KEY}`,
                'RqUID': require('crypto').randomUUID(),
            },
            body: `scope=${GIGACHAT_SCOPE}`,
        });

        if (authResponse.statusCode !== 200) {
            throw new Error(`Auth failed: ${authResponse.statusCode}`);
        }

        const authData = JSON.parse(authResponse.data);
        const accessToken = authData.access_token;

        if (!accessToken) {
            throw new Error('No access token in auth response');
        }
        
        console.log('[AUTH] Token received');

        // Chat
        console.log('[CHAT] Sending message to GigaChat...');
        const chatResponse = await httpsRequest('https://gigachat.devices.sberbank.ru:9443/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                model: 'GigaChat',
                messages: [{ role: 'user', content: message }],
                temperature: 0.7,
                max_tokens: 1000,
            }),
        });

        if (chatResponse.statusCode !== 200) {
            throw new Error(`Chat API error: ${chatResponse.statusCode} - ${chatResponse.data.substring(0, 100)}`);
        }

        const chatData = JSON.parse(chatResponse.data);
        const assistantMessage = chatData.choices?.[0]?.message?.content || 'No response';
        
        console.log('[SUCCESS] Response received');

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                response: assistantMessage,
            }),
        };
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error('[ERROR]', errorMsg);
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                response: `Error: ${errorMsg}`,
            }),
        };
    }
};
