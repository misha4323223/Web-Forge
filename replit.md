# MP.WebStudio - Сайт веб-студии

## Overview
MP.WebStudio is a modern portfolio website for a web development studio, featuring kinetic animations, matrix design, and neon accents. The studio's unique selling proposition is AI-driven development (specifically using Claude), with the owner acting as an intermediary between the AI and clients. The project aims to provide a sophisticated online presence, showcase diverse portfolio concepts, and streamline client interaction through integrated forms and an AI chat assistant. The entire content of the website is in Russian.

## User Preferences
I want to interact with the agent in a clear and concise manner. I prefer detailed explanations for complex changes and architectural decisions. Before making any major changes or adding new features, please ask for confirmation. Do not make changes to files related to `DEPLOY.md` or `design_guidelines.md` without explicit instructions.

## System Architecture

### UI/UX Decisions
- **Design Theme:** Dark theme (`#0a0a0a` - `#0f172a`) with vibrant accents: cyan (`#38bdf8`) and purple (`#a855f7`).
- **Typography:** Gradient text for headings.
- **Animations:** Kinetic animations, matrix design elements, neon accents.
- **Background:** Particle background implemented on canvas for performance optimization.
- **AI Chat Widget:** Floating, gradient cyan-blue button with a glow effect, opening a 640x600px modal. User messages are right-aligned, AI messages left-aligned, with a loading animation.

### Technical Implementations
- **Frontend:** React, TypeScript, Tailwind CSS, Framer Motion, Shadcn UI.
- **Backend:** Express.js, TypeScript.
- **Build Tool:** Vite.
- **Project Structure:**
    - `client/`: Frontend source code, including UI components (`HeroSection`, `PortfolioSection`, etc.), pages (`Home`, `demo/`), and utilities.
    - `server/`: Backend, including API endpoints and an in-memory storage.
    - `shared/`: Shared TypeScript schemas for data types.
- **Admin Panel:** Protected `/admin` panel using JWT-like tokens with HMAC-SHA256 signing for administrator authentication, valid for 24 hours. Includes constant-time comparison for security.
- **GigaChat Integration:**
    - Frontend: `ChatWidget.tsx` for the AI chat interface.
    - Backend: `/api/giga-chat` endpoint to interact with the GigaChat API (Sberbank). Handles OAuth token requests and chat completion requests with specific headers and body formats. Includes detailed diagnostic logging for troubleshooting.
    - Yandex Cloud Function: Full-featured implementation with gRPC support, proper SSL certificate validation, and comprehensive logging for debugging.
    
#### GigaChat on Yandex Cloud Function - Implementation Details

**Architecture Flow:**
```
Frontend (ChatWidget.tsx)
    ↓
  POST /api/giga-chat
    ↓
Yandex Cloud Function (index.js)
    ↓
[Step 1] OAuth Authentication to ngw.devices.sberbank.ru:9443
    • Sends GIGACHAT_KEY (Basic auth) + RqUID header
    • Gets access_token for current session (valid ~30 min)
    ↓
[Step 2] gRPC Connection to gigachat.devices.sberbank.ru:443
    • Creates secure SSL connection using SBERBANK_ROOT_CA certificate
    • Validates entire certificate chain: Server → Sub CA → Root CA
    • Includes Bearer token in gRPC metadata
    ↓
[Step 3] gRPC Chat Request
    • Sends ChatRequest (model, messages, options)
    • Receives ChatResponse with alternatives and usage stats
    ↓
[Step 4] Response to Frontend
    • Returns AI response as JSON
```

**Key Technical Components:**

1. **SSL Certificate Management:**
   - Uses Russian Trusted Root CA certificate (embedded in code)
   - Validates complete certificate chain for `gigachat.devices.sberbank.ru`
   - Root certificate expires: Feb 27, 2032
   - Located in `yandex-cloud-function/index.js` as `SBERBANK_ROOT_CA` constant

2. **gRPC Configuration:**
   - Proto definition embedded in code (const `GIGACHAT_PROTO`)
   - Channel options: message size limits (10MB), keepalive settings
   - Metadata headers: Authorization Bearer token
   - Timeout: 10 seconds for gRPC chat request

3. **OAuth Token Handling:**
   - Base endpoint: `https://ngw.devices.sberbank.ru:9443/api/v2/oauth`
   - Scope: `GIGACHAT_API_PERS` (default)
   - Token lifetime: ~30 minutes per session
   - Fresh token obtained for every chat request

4. **Error Handling & Logging:**
   - Detailed HTTPS request logging (DNS, TCP, TLS handshake, data chunks)
   - gRPC-specific error messages and diagnostics
   - Request IDs for tracing across logs
   - Graceful timeout handling (45s main, 50s socket level)

**Environment Variables (Required):**
```
GIGACHAT_KEY        - Full GigaChat API key from Sberbank
GIGACHAT_SCOPE      - OAuth scope (default: GIGACHAT_API_PERS)
```

**How Certificate Validation Works:**
The `SBERBANK_ROOT_CA` constant contains the root certificate in PEM format. During gRPC connection:
1. Server presents its certificate chain
2. gRPC validates against the root CA we provide
3. Confirms CN matches `gigachat.devices.sberbank.ru`
4. Establishes secure TLS 1.3 connection
5. Sends gRPC request with Bearer token

**Deployment Steps:**
1. Copy `yandex-cloud-function/index.js` to Yandex Cloud Function editor
2. Set environment variables: `GIGACHAT_KEY`, `GIGACHAT_SCOPE`
3. Install dependencies (npm auto-install on deploy)
4. Create new function version
5. Deploy and test

**Testing the Integration:**
- Frontend makes POST to `/api/giga-chat` with message
- Logs show: OAuth → gRPC proto load → gRPC connection → Chat request → Response
- Response includes AI text or error message

- **Calculator Order Flow:** Integrated calculator with a modal "Send Order" form. It displays selected options and contacts fields. The `/api/send-calculator-order` endpoint processes the order, validates fields, and sends formatted notifications to Telegram.
- **Additional Invoices System:** Admin panel functionality to create additional invoices for extra work. Generates Robokassa payment links and handles payment callbacks.
- **Email with Contract:** Uses Yandex Cloud Postbox for sending emails, specifically `sendContractEmail` function, with DKIM signing and handling for long lines in messages.

### Feature Specifications
- **Core Sections:** Hero, About, Portfolio, Services, Technologies, Process, Contact, Footer, Navigation.
- **Portfolio Demos:** Examples like Food Delivery, Fitness Studio, Cosmetics Shop.
- **Contact Form:** `POST /api/contact` endpoint for submitting inquiries.
- **SEO Optimization:**
    - Comprehensive meta-tags (title, description, keywords, author, robots).
    - Full Open Graph support (VK, Telegram, Facebook).
    - Twitter Cards (summary_large_image).
    - JSON-LD structured data (WebSite, Organization, LocalBusiness, Service).
    - `sitemap.xml` and `robots.txt` generated.
    - Canonical URL: `https://mp-webstudio.ru/`.

### System Design Choices
- **Modularity:** Clear separation of client, server, and shared concerns.
- **Scalability:** Designed with Yandex Cloud deployment in mind, leveraging Object Storage for static sites, Cloud Functions for APIs, and Cloud Run/Managed PostgreSQL for future, more complex projects.
- **Security:** Admin panel authorization with robust token management.
- **Performance:** Particle background optimization, efficient build processes.

## Knowledge Base Integration (GigaChat RAG)

### Overview
The AI Chat Widget now automatically enriches GigaChat responses with company knowledge from a JSON knowledge base stored in Yandex Object Storage. The system:
- Loads `site-content.json` from Object Storage bucket (`www.mp-webstudio.ru`)
- Caches KB for 1 hour to reduce API calls
- Searches for relevant context based on user keywords
- Injects context into GigaChat prompts before sending

### How It Works
1. **User asks a question** in the Chat Widget
2. **Cloud Function receives the message**
3. **Loads site-content.json** from Object Storage (with 1-hour caching)
4. **Searches for relevant context** using keyword matching:
   - Keywords about "услуги" → adds services info
   - Keywords about "технологии" → adds tech stack info
   - Keywords about "процесс" → adds development process
   - Keywords about "портфолио" → adds portfolio examples
   - Keywords about "цена" → adds pricing info
   - Questions with "как", "сколько" → adds FAQ answers
5. **Enriches the message** with context: `Контекст о компании:\n[RELEVANT_INFO]\n---\n\nВопрос клиента: [USER_MESSAGE]`
6. **Sends to GigaChat** with full context
7. **Returns AI response** enriched with company knowledge

### Files Involved
- **Frontend:** `client/src/components/ChatWidget.tsx` (no changes needed, works as-is)
- **Backend:** `yandex-cloud-function/index.js`
  - New function: `loadKnowledgeBaseFromStorage()` - loads KB from Object Storage with caching
  - New function: `findRelevantContext(kb, userMessage)` - searches for relevant content
  - Modified: `handleGigaChat()` - enriches message before sending to GigaChat
- **Knowledge Base:** `site-content.json` (stores all company information)

### Configuration

**Environment Variables (in Yandex Cloud Function):**
```
YC_ACCESS_KEY      - Access Key ID for Object Storage (from Service Account)
YC_SECRET_KEY      - Secret Access Key for Object Storage (from Service Account)
YC_BUCKET_NAME     - Object Storage bucket name (default: www.mp-webstudio.ru)
```

### Setup Instructions

**Step 1: Get Object Storage Credentials**
1. Go to Yandex Cloud Console → Service Accounts
2. Create new Service Account or use existing with `storage.editor` role
3. Create Static Access Key (get Access Key ID + Secret Access Key)

**Step 2: Upload Knowledge Base to Object Storage**
1. In Yandex Cloud Console → Object Storage
2. Select bucket `www.mp-webstudio.ru`
3. Upload `site-content.json` file (from repo root) to bucket root
4. Or create folder `knowledge-base/` and upload there (then update `keyPath` in code)

**Step 3: Set Environment Variables in Cloud Function**
1. Go to Yandex Cloud Function editor
2. Add environment variables:
   - `YC_ACCESS_KEY` = your-access-key-id
   - `YC_SECRET_KEY` = your-secret-key
   - `YC_BUCKET_NAME` = www.mp-webstudio.ru

**Step 4: Deploy**
1. Copy updated `yandex-cloud-function/index.js` to Cloud Function editor
2. Create new function version
3. Test in Chat Widget

### Testing the Integration

**Test 1: Ask about services**
- User: "Какие услуги вы предоставляете?"
- Expected: AI mentions all 4 services with prices

**Test 2: Ask about portfolio**
- User: "Покажите примеры ваших работ"
- Expected: AI lists Food Delivery, Fitness Studio, Cosmetics Shop

**Test 3: Ask about process**
- User: "Как проходит разработка?"
- Expected: AI describes 4-step process

**Test 4: Ask about pricing**
- User: "Сколько стоит разработка сайта?"
- Expected: AI provides pricing tiers

**Test 5: FAQ questions**
- User: "Как долго разработка?" or "Какие платежные системы?"
- Expected: AI finds and answers from FAQ section

### Knowledge Base Structure (site-content.json)

The JSON file contains:
- `company` - Company info, phone, email
- `services[]` - Service descriptions with pricing
- `process[]` - 4-step development process
- `portfolio[]` - Portfolio projects with tech stack
- `technologies` - Frontend, backend, databases, AI/ML, deployment tech
- `pricing` - Service tiers and pricing
- `faq[]` - Common questions and answers
- `keywords` - Keyword mapping for smart context search

**To update knowledge base:**
1. Edit `site-content.json` locally
2. Upload new version to Object Storage
3. Cache invalidates after 1 hour automatically

### Logging and Debugging

Look for these log patterns in Cloud Function logs:
```
[KB] Loading knowledge base from Object Storage...
[KB] Using cached knowledge base                    (if cache hit)
[KB] ✅ Knowledge base loaded successfully
[HANDLER_ID] 1a️⃣ Loading knowledge base...
[HANDLER_ID] 1b️⃣ Context found (XXXX chars), enriching message...
```

### Cost Optimization

- KB is cached for 1 hour → only 1 Object Storage read per hour
- No embedding costs (uses keyword matching)
- No extra API calls to AI (context injected into single GigaChat request)
- Cost = same as before + minimal Object Storage reads

## External Dependencies

- **Hosting:** Yandex Object Storage (static site hosting + knowledge base storage).
- **DNS:** Reg.ru.
- **SSL Certificates:** Let's Encrypt via Yandex Certificate Manager.
- **Serverless Functions:** Yandex Cloud Functions (for API endpoints, e.g., contact form, GigaChat, calculator orders, admin auth).
- **Email Service:** Yandex Cloud Postbox (compatible with AWS SES API) for transactional emails, e.g., contract delivery.
- **AI Service:** GigaChat API (Sberbank) for the AI chat assistant with RAG.
- **Payment Gateway:** Robokassa (for generating payment links for additional invoices).
- **Libraries/SDKs:**
    - `@aws-sdk/client-sesv2` (for Yandex Cloud Postbox interaction).
    - `@yandex-cloud/nodejs-sdk`.
    - `nodemailer`.
    - `pdfkit`.
    - `ydb-sdk`.
    - `aws-sdk` (for Object Storage S3-compatible API).