# MP.WebStudio - Веб-студия с AI

## Overview

MP.WebStudio is a web studio website designed to attract clients by showcasing its services in AI-powered website development using Sberbank's GigaChat. It functions as a portfolio, service catalog, and client acquisition tool, featuring an AI chat widget with a knowledge base, a comprehensive order management system, Robokassa payment integration (50% upfront, 50% upon completion), an admin panel for order and Telegram notifications, a website cost calculator, and email notifications for contracts and acts of completion. The project leverages Yandex Cloud for backend functions and YDB for the database, ensuring scalability and cost-efficiency.

## User Preferences

I prefer clear, concise, and structured information. Please use simple language and avoid jargon where possible. I value iterative development and detailed explanations for complex features. Before making any major architectural changes or introducing new external dependencies, please ask for my approval. Do not modify the core logic of the Yandex Cloud Function without explicit instruction due to its critical role and size.

## System Architecture

The MP.WebStudio project is built with a modern web stack, emphasizing performance, scalability, and maintainability.

**UI/UX Decisions:**
- **Design:** Dark theme with `#0a0a0a` to `#0f172a` background colors, accented by Cyan (`#38bdf8`) and Purple (`#a855f7`).
- **Typography:** Uses Inter and Roboto fonts (Roboto for PDF generation).
- **Animations:** Leverages Framer Motion and Tailwind animations for a dynamic user experience, including an optimized canvas particle background.
- **Responsiveness:** Mobile-first, adaptive design using Tailwind CSS, ensuring compatibility across all devices with touch-friendly forms and buttons.

**Technical Implementations:**
- **Frontend:** Developed with React 18.3.1 and TypeScript, utilizing Tailwind CSS for styling, Framer Motion for animations, Shadcn UI for components, Vite for bundling, Wouter for routing, React Hook Form with Zod for form validation, and TanStack React Query for data fetching. Recharts is used for graphs in the admin panel.
- **Backend (Development):** An Express 4.21.2 server with TypeScript, PostgreSQL, Drizzle ORM, gRPC for GigaChat integration, Nodemailer for email, and PDFKit for document generation.
- **Backend (Production - Yandex Cloud):** A Node.js Cloud Function serves as the backend, integrating with YDB Serverless, Robokassa API, Telegram Bot API, and Yandex Mail Postbox.
- **AI Integration:** GigaChat from Sberbank is integrated via gRPC, enriching AI responses with contextual information from an internal Knowledge Base (`site-content.json`) stored in Yandex Object Storage.

**Feature Specifications:**
- **AI Chat Widget:** A floating chat widget powered by GigaChat, providing personalized responses based on the company's Knowledge Base.
- **Order Management System:** Handles the full lifecycle of orders, including creation, status tracking (pending, paid, completed), soft deletion, internal notes, and management of additional invoices.
- **Payment System:** Integrates Robokassa for two-stage payments (50% prepayment, 50% remaining), with robust callback handling, signature verification, and Telegram notifications.
- **Calculator:** An interactive tool for estimating website costs based on project type (Landing, Corporate, Shop) and selected services.
- **Notification System:** Sends Telegram notifications for critical events (orders, payments, invoices) and email notifications for contracts and acts of completion via Yandex Mail Postbox with DKIM signing.
- **Admin Panel:** Secure login (Email/Password with HMAC-SHA256 token), provides a comprehensive overview of orders with filtering, detail viewing, note editing, additional invoice creation, soft deletion, and data export.

**System Design Choices:**
- **Cloud-Native:** Primarily designed for Yandex Cloud, leveraging Cloud Functions for serverless backend execution, YDB Serverless for a managed database, and Object Storage for static files and the Knowledge Base. This choice prioritizes scalability, cost-efficiency (free tiers), and high availability.
- **Microservices-oriented (conceptual):** While the main backend is a single Cloud Function, the clear separation of concerns (e.g., dedicated API routes for different modules) allows for potential future decomposition.
- **Data Model:** Drizzle ORM is used with a PostgreSQL-compatible schema (YDB Serverless) defining tables for orders, additional invoices, and other entities, supporting soft deletes and detailed payment tracking.

## External Dependencies

-   **GigaChat (Sberbank):** AI service for the chat widget.
-   **Robokassa:** Payment gateway for processing online transactions.
-   **Telegram Bot API:** Used for sending real-time notifications about orders and payments.
-   **Yandex Mail Postbox:** For sending email notifications, contracts, and acts of completion, with DKIM signing.
-   **Yandex Cloud Functions:** Serverless computing platform for hosting the backend logic.
-   **Yandex Object Storage:** Stores static assets, including the `site-content.json` Knowledge Base.
-   **YDB Serverless:** Managed, scalable NoSQL/SQL database used for data persistence.
-   **PostgreSQL:** Used for local development database.