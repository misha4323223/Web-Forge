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

## External Dependencies

- **Hosting:** Yandex Object Storage (static site hosting).
- **DNS:** Reg.ru.
- **SSL Certificates:** Let's Encrypt via Yandex Certificate Manager.
- **Serverless Functions:** Yandex Cloud Functions (for API endpoints, e.g., contact form, GigaChat, calculator orders, admin auth).
- **Email Service:** Yandex Cloud Postbox (compatible with AWS SES API) for transactional emails, e.g., contract delivery.
- **AI Service:** GigaChat API (Sberbank) for the AI chat assistant.
- **Payment Gateway:** Robokassa (for generating payment links for additional invoices).
- **Libraries/SDKs:**
    - `@aws-sdk/client-sesv2` (for Yandex Cloud Postbox interaction).
    - `@yandex-cloud/nodejs-sdk`.
    - `nodemailer`.
    - `pdfkit`.
    - `ydb-sdk`.